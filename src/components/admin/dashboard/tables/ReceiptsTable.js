import React, { useEffect, useState } from 'react';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import { format } from 'date-fns';
import axios from 'axios';
import BaseTableV2 from '../../../table/BaseTableV2';
import { capitalCase } from 'text-case';
import useQueryString from '../../../../hooks/table/useQueryString';
import MenuAction from '../../../table/MenuAction';
import viewFill from '@iconify/icons-ant-design/eye-outline';
import useReceiptsModal from '../../../../hooks/receipts/useReceiptsModal';
import moment from 'moment';
import useDateRange from '../../../../hooks/common-reports/useDateRange';

const initialFilters = {
  sortBy: 'transactionDate',
  sortOrder: 'desc',
  from: '',
  to: ''
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

const ReceiptsTable = () => {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings?.unitConfiguration?.storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [receipts, setReceipts] = useState([]);
  const [receiptsMeta, setReceiptsMeta] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    transactionDate: 'desc'
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const { handleShowPreview, getPreview } = useReceiptsModal();

  const choices = [
    {
      name: 'Show Preview',
      function: (record) => {
        handleShowPreview(record.type, record);
      },
      icon: viewFill
    }
  ];

  const columns = [
    {
      label: 'User',
      render: (data) => (
        <>
          {capitalCase(
            `${
              data.type !== 'initial cash' && data.type !== 'cash takeout'
                ? data.data.cashier.firstname
                : data.data.cashReport.cashierFirstName
            } ${
              data.type !== 'initial cash' && data.type !== 'cash takeout'
                ? data.data.cashier.lastname
                : data.data.cashReport.cashierLastName
            }`
          )}
        </>
      )
    },
    {
      label: 'Order ID',
      render: (data) => <>{data.data?.cart?.confirmOrders[0]?.orderId || ''}</>
    },
    {
      label: 'SI Number',
      render: (data) => <>{
        ['return', 'refund'].includes(data?.type) ? 
        `${data.data?.cart?.siNumber}-1` :
        data.data?.cart?.siNumber || ''
      
      }</>
    },
    {
      label: 'Txn Number',
      render: (data) => <>{data.txnNumber}</>
    },
    {
      label: 'Type',
      render: (data) => <>{capitalCase(`${data.type} receipt`)}</>
    },
    {
      label: 'Real-Time Date',
      render: (data) => <>
         {moment(data.createdAt).utc().format('MM/DD/YYYY hh:mm A')}
      </>
    },
    {
      label: 'Transaction Date',
      render: (data) => <>{moment.utc(data.transactionDate).format('MMM DD yyyy')}</>,
      enableSort: true,
      sortOrder: sortState.transactionDate,
      sortBy: 'transactionDate'
    },
    {
      label: '',
      render: (data) => (
        <>
          <MenuAction choices={choices} record={data} />
        </>
      )
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

  const fetchReceipts = async () => {
    setIsRefetching(false);
    setReceiptsLoading(true);

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
      const receiptsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/preview/all/${storeCode}?${objectToString(initialParams)}`
      );
      if (receiptsData?.data?.data) {
        setReceipts(receiptsData?.data?.data);
        setReceiptsMeta(receiptsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setReceiptsLoading(false);
  };

  const refetch = async () => {
    setReceiptsLoading(true);

    try {
      const receiptsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/preview/all/${storeCode}?${objectToString(queryData)}`
      );
      if (receiptsData?.data?.data) {
        setReceipts(receiptsData?.data?.data);
        setReceiptsMeta(receiptsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setReceiptsLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchReceipts();
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
        data={receipts || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={receiptsLoading}
        total={receiptsMeta?.totalRecords}
        limitChoices={[1, 5, 10, 20]}
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
          fetchReceipts();
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
          fetchReceipts();
          clearQueries();
        }}
      />

      {getPreview()}
    </>
  );
};

export default ReceiptsTable;
