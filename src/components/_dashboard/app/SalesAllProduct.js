import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
// material
import { Stack, TableCell, TableRow, Typography } from '@mui/material';
import BaseTableV2 from '../../table/BaseTableV2';
import useTableQueries from '../../../hooks/table/useTableQueries';
import useQueryString from '../../../hooks/table/useQueryString';
import styled from '@emotion/styled';
import { fCurrency, sum } from '../../../utils/formatNumber';
import useDateRange from '../../../hooks/common-reports/useDateRange';

const initialFilters = {
  sortBy: 'totalAmount',
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

const StyledCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: theme.palette.primary.lighter,
  fontWeight: '700'
}));

export default function SalesAllProduct() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings.unitConfiguration.storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    totalAmount: 'desc'
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    { label: 'SKU', column: 'productCode' },
    { label: 'Name', column: 'productName' },
    { label: 'Total Orders', column: 'countOrders' },
    {
      label: 'Total Sales',
      column: 'totalAmount',
      enableSort: true,
      sortOrder: sortState.totalAmount,
      sortBy: 'totalAmount'
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

  const fetchOrders = async () => {
    setIsRefetching(false);
    setOrdersLoading(true);

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
      const ordersData = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales/products/${storeCode}?${objectToString(initialParams)}`
      );
      if (ordersData?.data?.data) {
        setOrders(ordersData?.data?.data);
        setOrdersMeta(ordersData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setOrdersLoading(false);
  };

  const refetch = async () => {
    setOrdersLoading(true);
    try {
      const ordersData = await axios.get(
        `${process.env.REACT_APP_API_URL}/sales/products/${storeCode}?${objectToString(queryData)}`
      );
      if (ordersData?.data?.data) {
        setOrders(ordersData?.data?.data);
        setOrdersMeta(ordersData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setOrdersLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);


  const ComputedRow = () => {
    return (
      <TableRow>
        <StyledCell colSpan={2}>PRODUCTS: {orders?.length}</StyledCell>
        <StyledCell>TOTAL ORDERS: {sum(orders, 'countOrders')} </StyledCell>
        <StyledCell>TOTAL SALES: {fCurrency('P', sum(orders, 'totalAmount'))}</StyledCell>
      </TableRow>
    );
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" px={2} mb={5}>
        <Typography variant="h4">Products Sales</Typography>
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
        data={orders || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={ordersLoading}
        total={ordersMeta?.totalRecords}
        limitChoices={[ 5, 10, 20]}
        withSearch
        searchLabel="Search sku"
        onSearchCb={(keyword) => {
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: '',
            search: keyword
          });
        }}
        onClearSearch={() => {
          fetchOrders();
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
          fetchOrders();
          clearQueries();
        }}
        extraTableRows={<ComputedRow />}
      />
    </>
  );
}
