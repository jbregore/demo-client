import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import {
  Stack,
  Typography,
  Button,
} from '@mui/material';
// icons
import { Icon } from '@iconify/react';
// utils
import downloadCsv from 'download-csv';
import { capitalCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import moment from 'moment';
import { Backdrop, ModalCard, StyledModal } from './styles/commonModalStyles';
import { format } from 'date-fns';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import useQueryString from '../../../../hooks/table/useQueryString';
import useDateRange from '../../../../hooks/common-reports/useDateRange';
import BaseTableV2 from '../../../table/BaseTableV2';


OtherDiscountsReports.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

const initialFilters = {
  from: '',
  to: ''
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

export default function OtherDiscountsReports({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [discountReports, setDiscountReports] = useState([]);
  const [discountReportsMeta, setDiscountReportsMeta] = useState([]);
  const [discountReportsLoading, setDiscountReportsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
 

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    {
      label: 'Type',
      column: 'type',
    },
    {
      label: 'Discount Amount',
      render: (data) => (
        <>
        {fCurrency('P', roundUpAmount(data.amount))}
        </>
      )
    },
    {
        label: 'Txn Number',
        column: 'txn_number',
      },
      {
        label: 'PO Number',
        column: 'po_number',
      },
    {
      label: 'Discount',
      render: (data) => <>
       {data.po_number ? 'Line Item' : 'Transaction'}
      </>
    },
    {
      label: 'Date',
      render: (data) => <>{moment.utc(data.discount_date).format('YYYY-MM-DD')}</>
    }
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

  const fetchDiscounts = async() => {
    setIsRefetching(false);
    setDiscountReportsLoading(true);

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
      const discountReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/discounts/${storeCode}?${objectToString(
          initialParams
        )}`
      );
      if (discountReportsData?.data?.data) {
        setDiscountReports(discountReportsData?.data?.data);
        setDiscountReportsMeta(discountReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setDiscountReportsLoading(false);
  }

  const refetch = async () => {
    setDiscountReportsLoading(true);

    try {
      const discountReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/discounts/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (discountReportsData?.data?.data) {
        setDiscountReports(discountReportsData?.data?.data);
        setDiscountReportsMeta(discountReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setDiscountReportsLoading(false);
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

    discountReports.forEach((specs) => {
      formattedData.push({
        type: specs.type,
        amount: specs.amount,
        txnNumber: specs.txn_number,
        poNumber: specs.po_number ?? '',
        discount: specs.po_number ? 'Line Item' : 'Transaction',
        date: moment.utc(specs.discount_date).format('YYYY-MM-DD')
      });
    });

    const columns = {
      type: 'Type',
      amount: 'Amount',
      txnNumber: 'Txn Number',
      poNumber: 'PO Number',
      discount: 'Discount',
      date: 'Date'
    };

    let filename = currentDate;
    if (filters.from && filters.to) {
      if (filters.from !== filters.to) {
        filename = `(${filters.from}-${filters.to})`;
      }
    }

    downloadCsv(formattedData, columns, `${filename}_OTHER DISCOUNTS REPORTS`);

    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();
    const storedData = JSON.parse(localStorage.getItem('userData'));

    addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'Sales Report',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has downloaded a CSV report for Senior Citizen or PWD reports.`,
      'Download CSV SC/PWD Report',
      `${
        posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
    );
  };

  useEffect(() => {
    fetchDiscounts()
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
        <Stack direction="row" justifyContent="space-between" px={2}>
          <Typography variant="h6">Other Discounts Reports</Typography>
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
            data={discountReports || []}
            columns={columns}
            isLoading={discountReportsLoading}
            total={discountReportsMeta?.totalRecords}
            limitChoices={[1, 5, 10, 20]}
            withSearch
            searchLabel="Search txn number"
            onSearchCb={(keyword) => {
              setIsRefetching(true);
              setQueryData({
                page: '',
                pageSize: '',
                search: keyword
              });
            }}
            onClearSearch={() => {
              fetchDiscounts();
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
              fetchDiscounts();
              clearQueries();
            }}
          />
        </Scrollbar>
      </ModalCard>
    </StyledModal>
  );
}
