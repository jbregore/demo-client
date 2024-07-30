import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import moment from 'moment';
// material
import { Stack, TableRow, TableCell, Container, Typography, Snackbar, Alert } from '@mui/material';
// utils
import { capitalCase } from 'text-case';
import { fCurrency } from '../utils/formatNumber';
// components
import Page from '../components/Page';
import Label from '../components/Label';
import { SupervisorAuthorization } from '../components/_dashboard/reports';
import AuthorizationLayout from '../components/AuthorizationLayout';
// functions
// import addUserActivityLog from '../functions/common/addUserActivityLog';
import { PendingOnlinePayment } from '../components/_dashboard/transactions';
// import useNetwork from '../functions/common/useNetwork';
import { Endpoints } from '../enum/Endpoints';
import { MallAccrEnum, SettingsCategoryEnum } from '../enum/Settings';
import useTableQueries from '../hooks/table/useTableQueries';
import useQueryString from '../hooks/table/useQueryString';
import BaseTableV2 from '../components/table/BaseTableV2';
import MenuAction from '../components/table/MenuAction';
import closeCirlceOutline from '@iconify/icons-eva/close-circle-fill';
import refundFill from '@iconify/icons-ic/outline-restore-page';
import uploadOutline from '@iconify/icons-eva/upload-outline';
import useDateRange from '../hooks/common-reports/useDateRange';

const initialFilters = {
  sortBy: 'paymentDate',
  sortOrder: 'desc',
  from: '',
  to: '',
  status: 'All'
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

export default function Transactions() {
  const { apiKey, deviceId } = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
  const { user } =
    localStorage.getItem('userData') !== null && JSON.parse(localStorage.getItem('userData'));
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode, mallAccr } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const storedData = JSON.parse(localStorage.getItem('userData'));

  const [isForbidden, setIsForbidden] = useState(user.role === 'cashier');
  const [pendingPaymentOpen, setPendingPaymentOpen] = useState(false);

  const [totalAmount, setTotalAmount] = useState(0);

  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');
  const [activeRow, setActiveRow] = useState({});

  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);
  // const [updateID, setUpdateID] = useState(null);

  //table
  const [transactions, setTransactions] = useState([]);
  const [transactionsMeta, setTransactionsMeta] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    paymentDate: 'desc'
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(
    queryData,
    setQueryData,
    filters,
    setFilters,
    setIsRefetching
  );

  const updateOrderStatus = async (action, specsData) => {
    setIsError(false);

    try {
      const { remarks } = JSON.parse(localStorage.getItem('supervisor')) || '{}';
      const posDate = localStorage.getItem('transactionDate').split(' ')[0];
      const transactionDate = `${posDate} ${moment().format('HH:mm:ss')}`;

      const umbraSystemsPayload = {
        apiKey,
        deviceId
      };

      // Data for updating/inserting to db
      const data = {
        remarks,
        action,
        txnNumber: specsData.txnNumber,
        siNumber: specsData.siNumber,
        cashierId: storedData.user.employeeId,
        firstName: storedData.user.firstname,
        lastName: storedData.user.lastname,
        storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
        refundSiNumber: `${specsData.siNumber}-1`,
        returnSiNumber: `${specsData.siNumber}-1`,
        amount: specsData.total * (action === 'void' ? 1 : -1),
        transactionDate,
        umbraSystemsPayload
      };

      // Update/Insert everythin in one transaction
      const updateRes = await axios.patch(`${Endpoints.TRANSACTION}/status`, data);
      const { cart: origCart, cashier: origCashier } = updateRes.data.data;

      const receiptData = {
        cart: origCart,
        cashier: origCashier
      };

      // Print receipt after updating/posting to db
      if (action !== 'return') {
        await axios.post(
          `${Endpoints.TRANSACTION}/${action}/receipt`,
          {
            apiData: receiptData,
            settings
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'auth-token': storedData.token
            },
            withCredentials: true
          }
        );

        if (mallAccr === MallAccrEnum.SM) {
          const smCart = {
            ...updateRes?.data?.data?.cart,
            siNumber:
              updateRes?.data?.data?.cart?.newSiNumber ?? updateRes?.data?.data?.cart?.siNumber
          };

          await axios.post(`${Endpoints.ACCREDITATION}/sm/save-transaction-details`, {
            originalTxnNumber: updateRes?.data?.data?.cart?.txnNumber,
            transactionType: action,
            siNumber: smCart.siNumber,
            transactionDate: posDate,
            cart: smCart,
            settings: settings
          });

          await axios.post(`${Endpoints.ACCREDITATION}/sm/save-transaction`, {
            originalTxnNumber: updateRes?.data?.data?.cart?.txnNumber,
            transactionType: action,
            siNumber: smCart.siNumber,
            transactionDate: posDate,
            cart: smCart,
            settings: settings
          });
        }

        if (mallAccr === MallAccrEnum.Araneta) {
          await axios.post(`${Endpoints.ACCREDITATION}/araneta`, {
            cart: origCart,
            settings,
            posDate: localStorage.getItem('transactionDate'),
            action
          });
        }
      } else {
        const returnData = {
          cart: origCart,
          cashier: origCashier,
          settings,
          orig: {
            txnNumber: specsData.txnNumber,
            siNumber: specsData.siNumber
          }
        };
        await axios.post(`${Endpoints.TRANSACTION}/return/receipt`, returnData, {
          headers: {
            'Content-Type': 'application/json',
            'auth-token': storedData.token
          },
          withCredentials: true
        });

        if (mallAccr === MallAccrEnum.Araneta) {
          const aranetaCart = {
            ...origCart,
            siNumber: origCart.newSiNumber,
            txnNumber: origCart.newTxnNumber,
            origSiNumber: origCart.siNumber,
            origTxnNumber: origCart.txnNumber
          }

          await axios.post(`${Endpoints.ACCREDITATION}/araneta`, {
            cart: aranetaCart,
            settings,
            posDate: localStorage.getItem('transactionDate'),
            action: 'return'
          });
        }
      }
    } catch (err) {
      console.log(err);
      setIsError(true);
      setErrorMessage(err.response?.data?.message || `Something went wrong on ${action}ing order.`);
    } finally {
      // setUpdateID(specsData.id);
      setToAccessFunction('');
      setActiveRow({});
      setApproveFunction('');
      setSupervisorAccessModal(false);
    }

    refetch();
  };

  const checkValidVoid = (specsDate) => {
    let posDate = new Date(localStorage.getItem('transactionDate'));
    specsDate = new Date(specsDate);

    posDate = `${posDate.getFullYear()}-${posDate.getMonth()}-${posDate.getDate()}`;
    specsDate = `${specsDate.getFullYear()}-${specsDate.getMonth()}-${specsDate.getDate()}`;

    return posDate === specsDate;
  };

  const handleSupervisorAccess = (toAccess, row) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
    setActiveRow(row);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
    setErrorMessage('');
  };

  //table
  const choices = (data) => {
    let choicesArray = [];
    const date = moment(data.paymentDate).utc().format('MM/DD/YYYY hh:mm a');

    if (data.status === 'paid' && checkValidVoid(date)) {
      choicesArray.push({
        name: 'Void',
        function: (record) => {
          if (user.role === 'cashier') {
            handleSupervisorAccess('void', record);
            return;
          }

          updateOrderStatus('void', record);
        },
        icon: closeCirlceOutline
      });
    }

    if (data.status === 'paid') {
      choicesArray.push({
        name: 'Refund',
        function: (record) => {
          if (user.role === 'cashier') {
            handleSupervisorAccess('refund', record);
            return;
          }

          updateOrderStatus('refund', record);
        },
        icon: refundFill
      });
    }

    if (data.status === 'paid' && !checkValidVoid(date)) {
      choicesArray.push({
        name: 'Return',
        function: (record) => {
          if (user.role === 'cashier') {
            handleSupervisorAccess('return', record);
            return;
          }

          updateOrderStatus('return', record);
        },
        icon: uploadOutline
      });
    }

    return choicesArray;
  };

  const columns = [
    {
      label: 'Name',
      render: (data) => (
        <>
          <Typography variant="subtitle2" noWrap>
            {capitalCase(`${data.firstName} ${data.lastName}`)}
          </Typography>
        </>
      )
    },
    {
      label: 'SI Number',
      column: 'siNumber'
    },
    {
      label: 'Amount',
      render: (data) => <>{fCurrency('P', data.total)}</>
    },
    {
      label: 'Status',
      render: (data) => (
        <>
          <Label
            variant="ghost"
            color={
              {
                paid: 'success',
                void: 'error',
                cancelled: 'warning',
                pending: 'default',
                return: 'secondary',
                refund: 'error'
              }[data.status]
            }
          >
            {capitalCase(data.status)}
          </Label>
        </>
      )
    },
    {
      label: 'Date',
      render: (data) => <>{moment.utc(data.paymentDate).format('MM/DD/YYYY LT')}</>,
      enableSort: true,
      sortOrder: sortState.paymentDate,
      sortBy: 'paymentDate'
    },
    {
      label: 'Sales Person',
      column: 'employeeId'
    },
    ...(user.role === 'cashier' ? [{
      label: '',
      render: (data) => (
        <>{choices(data).length > 0 && <MenuAction choices={choices(data)} record={data} />}</>
      )
    }] : [])
  ];

  const tableFilters = [
    {
      name: 'from',
      label: 'From',
      type: 'date',
      placeholder: 'From',
      value: filters.from
    },
    {
      name: 'to',
      label: 'To',
      type: 'date',
      placeholder: 'To',
      value: filters.to
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        {
          value: 'All',
          label: 'All'
        },
        {
          value: 'paid',
          label: 'Paid'
        },
        {
          value: 'void',
          label: 'Void'
        },
        {
          value: 'return',
          label: 'Return'
        },
        {
          value: 'refund',
          label: 'Refund'
        }
      ],
      optionsUsingId: true,
      type: 'select',
      placeholder: 'Status',
      value: filters.status
    }
  ];

  const fetchTransactions = async () => {
    setIsRefetching(false);
    setTransactionsLoading(true);

    const fromDate = currentDate;
    const toDate = currentDate;

    const initialParams = {
      from: fromDate,
      to: toDate,
      status: 'All'
    };

    setFilters({
      ...initialFilters,
      from: fromDate,
      to: toDate,
      status: 'All'
    });

    setQueryData({
      ...queryData,
      from: fromDate,
      to: toDate
    });

    try {
      const transactionsData = await axios.get(
        `${Endpoints.TRANSACTION}/filtered/${storeCode}?${objectToString(initialParams)}`
      );
      if (transactionsData?.data?.data) {
        setTransactions(transactionsData?.data?.data);
        setTransactionsMeta(transactionsData?.data?.meta);
        setTotalAmount(transactionsData?.data?.totalAmount);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setTransactionsLoading(false);
  };

  const refetch = async () => {
    setTransactionsLoading(true);

    try {
      const transactionsData = await axios.get(
        `${Endpoints.TRANSACTION}/filtered/${storeCode}?${objectToString(queryData)}`
      );
      if (transactionsData?.data?.data) {
        setTransactions(transactionsData?.data?.data);
        setTransactionsMeta(transactionsData?.data?.meta);
        setTotalAmount(transactionsData?.data?.totalAmount);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setTransactionsLoading(false);
    setIsRefetching(false);
  };

  const ComputedRow = () => {
    return (
      <TableRow>
        <TableCell colSpan={6} align="right">
          <Typography sx={{ fontWeight: 600 }}>
            Total Amount: {fCurrency('P', totalAmount)}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  useEffect(() => {
    if (approveFunction === 'void' || approveFunction === 'refund') {
      updateOrderStatus(approveFunction, activeRow);
    } else if (approveFunction === 'return') {
      updateOrderStatus(approveFunction, activeRow);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  return (
    <Page title="Transactions">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Transactions
          </Typography>
        </Stack>

        <BaseTableV2
          pageChangeCb={(page) => {
            setIsRefetching(true);
            setQueryData({
              ...queryData,
              page: page + 1
            });
          }}
          rowsChangeCb={(size) => {
            setIsRefetching(true);
            setQueryData({
              ...queryData,
              page: '',
              pageSize: size
            });
          }}
          data={transactions || []}
          columns={columns}
          setSortState={setSortState}
          isLoading={transactionsLoading}
          total={transactionsMeta?.totalRecords}
          limitChoices={[5, 10, 20]}
          withSearch
          searchLabel="Search si number"
          onSearchCb={(keyword) => {
            setIsRefetching(true);
            setQueryData({
              page: '',
              pageSize: '',
              search: keyword
            });
          }}
          onClearSearch={() => {
            fetchTransactions();
            clearQueries();
          }}
          withFilters
          initialFilters={initialFilters}
          filterOptions={tableFilters}
          filters={filters}
          setFilters={setFilters}
          onSortCb={(sortObject) => {
            setIsRefetching(true);
            setQueryData({
              page: '',
              pageSize: '',
              search: '',
              sortBy: sortObject.sortBy,
              sortOrder: sortObject.sortOrder
            });
          }}
          onFilterCb={(filters) => {
            adjustDateFilter(filters);
          }}
          onResetFilterCb={() => {
            fetchTransactions();
            clearQueries();
          }}
          extraTableRows={<ComputedRow />}
        />
      </Container>
      <SupervisorAuthorization
        open={supervisorAccessModal}
        setOpen={setSupervisorAccessModal}
        toAccessFunction={toAccessFunction}
        setApproveFunction={setApproveFunction}
      />
      <AuthorizationLayout open={isForbidden} setOpen={setIsForbidden} />
      <PendingOnlinePayment open={pendingPaymentOpen} setOpen={setPendingPaymentOpen} />
      <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Page>
  );
}
