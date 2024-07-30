import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { format } from 'date-fns';
// material
import { styled } from '@mui/material/styles';
import { Button, Card, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
// utils
import downloadCsv from 'download-csv';
import { capitalCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import moment from 'moment';
import useQueryString from '../../../../hooks/table/useQueryString';
import BaseTableV2 from '../../../table/BaseTableV2';
import useDateRange from '../../../../hooks/common-reports/useDateRange';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 1000
}));

ReturnExchangeTxn.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

const initialFilters = {
  sortBy: 'siNumber',
  sortOrder: 'desc',
  from: '',
  to: ''
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

export default function ReturnExchangeTxn({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [returnExchangeReports, setReturnExchangeReports] = useState([]);
  const [returnExchangeReportsMeta, setReturnExchangeReportsMeta] = useState([]);
  const [returnExchangeReportsLoading, setReturnExchangeReportsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    siNumber: 'desc'
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    {
      label: 'Return SI Number',
      render: (data) => (
        <>
          <Typography variant="subtitle2" noWrap>
            {data.returnSiNumber}
          </Typography>
        </>
      ),
      enableSort: true,
      sortOrder: sortState.siNumber,
      sortBy: 'siNumber'
    },
    {
      label: 'Return Amount',
      render: (data) => <>{fCurrency('', roundUpAmount(data.returnAmount))}</>
    },
    {
      label: 'Returned By',
      render: (data) => <>{data.returnedBy}</>
    },
    {
      label: 'Return Date',
      render: (data) => <>{moment.utc(data.returnDate).format('MM/DD/YYYY LT')}</>
    },
    {
      label: 'Exchange SI Number',
      render: (data) => <>{data.exchangeSiNumber}</>
    },
    {
      label: 'Exchange Amount',
      render: (data) => <>{data.exchangeAmount === "-" ? "0.00" : data.exchangeAmount}</>
    },
    {
      label: 'Exchange Date',
      render: (data) => (
        <>
          {data.exchangeDate !== '-' ? moment.utc(data.exchangeDate).format('MM/DD/YYYY LT') : '-'}
        </>
      )
    },
    {
      label: 'Remarks',
      column: 'remarks'
    },
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
    }
  ];

  const fetchExchange = async () => {
    setIsRefetching(false);
    setReturnExchangeReportsLoading(true);

    const fromDate = currentDate;
    const toDate =  currentDate;

    const initialParams = {
      from: fromDate,
      to: toDate
    };

    setFilters({
      ...initialFilters,
      from: fromDate,
      to: toDate
    });

    setQueryData({
      ...queryData,
      from: fromDate,
      to: toDate
    })

    try {
      const returnExchangeReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/return-exchange/${storeCode}?${objectToString(
          initialParams
        )}`
      );
      if (returnExchangeReportsData?.data?.data) {
        setReturnExchangeReports(returnExchangeReportsData?.data?.data);
        setReturnExchangeReportsMeta(returnExchangeReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setReturnExchangeReportsLoading(false);
  };

  const refetch = async () => {
    setReturnExchangeReportsLoading(true);

    try {
      const returnExchangeReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/return-exchange/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (returnExchangeReportsData?.data?.data) {
        setReturnExchangeReports(returnExchangeReportsData?.data?.data);
        setReturnExchangeReportsMeta(returnExchangeReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setReturnExchangeReportsLoading(false);
    setIsRefetching(false);
  };

  const roundUpAmount = (num) => {
    // num = Math.round(num * 100) / 100;
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const handlePrintCsv = () => {
    const formattedData = [];

    returnExchangeReports.forEach((order) => {
      formattedData.push({
        returnSiNumber: order.returnSiNumber,
        returnAmount: order.returnAmount,
        returnedBy: order.returnedBy,
        returnDate: moment.utc(order.returnDate).format('MM/DD/YYYY LT'),
        exchangeSiNumber: order.exchangeSiNumber,
        exchangeAmount: order.exchangeAmount,
        exchangeDate: order.exchangeDate !== '-' ? moment.utc(order.exchangeDate).format('MM/DD/YYYY LT') : '-',
      });
    });

    const columns = {
      returnSiNumber: 'Return SI Number',
      returnAmount: 'Return Amount',
      returnedBy: 'Returned By',
      returnDate: 'Return Date',
      exchangeSiNumber: 'Exchange SI Number',
      exchangeAmount: 'Exchange Amount',
      exchangeDate: 'Exchange Date'
    };

    let filename = currentDate;
    if (filters.from && filters.to) {
      if (filters.from !== filters.to) {
        filename = `(${filters.from}-${filters.to})`;
      }
    }

    downloadCsv(formattedData, columns, `${filename}_RETURN-AND-EXCHANGE-TXN`);

    const storedData = JSON.parse(localStorage.getItem('userData'));

    addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'Sales Report',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has downloaded a CSV report for return & exchange transaction.`,
      'Download CSV Return & Exchange Transaction',
      currentDate
    );
  };

  useEffect(() => {
    fetchExchange()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h6">Return & Exchange Transaction</Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="fa-solid:file-csv" />}
            onClick={handlePrintCsv}
          >
            Download CSV
          </Button>
        </Stack>
        <Scrollbar>
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
            data={returnExchangeReports || []}
            columns={columns}
            setSortState={setSortState}
            isLoading={returnExchangeReportsLoading}
            total={returnExchangeReportsMeta?.totalRecords}
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
              fetchExchange();
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
              adjustDateFilter(filters)
            }}
            onResetFilterCb={() => {
              fetchExchange();
              clearQueries();
            }}
          />
        </Scrollbar>
      </ModalCard>
    </StyledModal>
  );
}
