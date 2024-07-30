import { useState, useEffect } from 'react';
import axios from 'axios';
// material
import { Stack, Typography } from '@mui/material';
// utils
import { upperCase } from 'text-case';
import { fCurrency } from '../../../utils/formatNumber';
import BaseTableV2 from '../../table/BaseTableV2';
import useTableQueries from '../../../hooks/table/useTableQueries';
import useQueryString from '../../../hooks/table/useQueryString';
import { format } from 'date-fns';
import moment from 'moment';
import useDateRange from '../../../hooks/common-reports/useDateRange';

const initialFilters = {
  sortBy: 'paymentDate',
  sortOrder: 'desc',
  from: '',
  to: ''
};

const initialQueries = {
  page: '1',
  pageSize: '5',
  search: ''
};

export default function SalesPaymentReport() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings.unitConfiguration.storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const [payments, setPayments] = useState([]);
  const [paymentsMeta, setPaymentsMeta] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    paymentDate: 'desc'
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    { label: 'SI Number', column: 'siNumber' },
    { label: 'Total', render: (data) => <>{fCurrency('P', roundUpAmount(data.total))}</> },
    { label: 'Currency', render: (data) => <>{upperCase(data.currency)}</> },
    { label: 'Status', render: (data) => <>{upperCase(data.paymentStatus)}</> },
    {
      label: 'Method',
      render: (data) => <>{upperCase(data.paymentMethod.map((item) => item).join(', '))}</>
    },
    {
      label: 'Date',
      render: (data) => <>{moment(data.dateCreated).utc().format('MM/DD/YYYY hh:mm A')}</>,
      enableSort: true,
      sortOrder: sortState.paymentDate,
      sortBy: 'paymentDate'
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

  const fetchPayments = async () => {
    setIsRefetching(false);
    setPaymentsLoading(true);

    const fromDate = currentDate;
    const toDate = currentDate;

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
      const paymentsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales/payment-reports/${storeCode}?${objectToString(
          initialParams
        )}`
      );
      if (paymentsData?.data?.data) {
        setPayments(paymentsData?.data?.data);
        setPaymentsMeta(paymentsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setPaymentsLoading(false);
  };

  const refetch = async () => {
    setPaymentsLoading(true);
    try {
      const paymentsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales/payment-reports/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (paymentsData?.data?.data) {
        setPayments(paymentsData?.data?.data);
        setPaymentsMeta(paymentsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setPaymentsLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} mb={5}>
        <Typography variant="h4">Payments Records</Typography>
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
        data={payments || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={paymentsLoading}
        total={paymentsMeta?.totalRecords}
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
          fetchPayments();
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
          fetchPayments();
          clearQueries();
        }}
      />
    </>
  );
}
