import React, { useEffect, useState } from 'react';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import axios from 'axios';
import BaseTableV2 from '../../../table/BaseTableV2';
import { capitalCase } from 'text-case';
import { format } from 'date-fns';
import moment from 'moment';
import useQueryString from '../../../../hooks/table/useQueryString';
import useDateRange from '../../../../hooks/common-reports/useDateRange';

const initialFilters = {
  from: '',
  to: ''
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

function padTransactionId(transactionId) {
  const paddedLength = 16;
  const paddedString = '0000000000000000';

  const transactionIdString = String(transactionId);

  const zerosToPad = paddedLength - transactionIdString.length;

  const paddedTransactionId =
    zerosToPad > 0 ? paddedString.substr(0, zerosToPad) + transactionIdString : transactionIdString;

  return paddedTransactionId;
}

const ActivityLogsTable = () => {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [activity, setActivity] = useState([]);
  const [activityMeta, setActivityMeta] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    { label: 'Txn Number', render: (data) => <>{padTransactionId(data.transactionId)}</> },
    { label: 'User', render: (data) => <>{capitalCase(`${data.firstname} ${data.lastname}`)}</> },
    { label: 'Activity', render: (data) => <>{data.activity}</> },
    { label: 'Description', render: (data) => <>{data.description}</> },
    { label: 'Action', render: (data) => <>{capitalCase(data.action)}</> },
    {
      label: 'Date',
      render: (data) => <>{moment.utc(data.activityDate).format('MM/DD/YYYY LT')}</>
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

  const fetchActivity = async () => {
    setIsRefetching(false);
    setActivityLoading(true);

    const storeCode = settings?.unitConfiguration?.storeCode;

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
      const activityData = await axios.get(
        `${process.env.REACT_APP_API_URL}/activity/filtered/${storeCode}?${objectToString(
          initialParams
        )}`
      );
      if (activityData?.data?.data) {
        setActivity(activityData?.data?.data);
        setActivityMeta(activityData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }

    setActivityLoading(false);
  };

  const refetch = async () => {
    setActivityLoading(true);

    const storeCode = settings?.unitConfiguration?.storeCode;

    try {
      const activityData = await axios.get(
        `${process.env.REACT_APP_API_URL}/activity/filtered/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (activityData?.data?.data) {
        setActivity(activityData?.data?.data);
        setActivityMeta(activityData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }

    setActivityLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchActivity()
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
        data={activity || []}
        columns={columns}
        isLoading={activityLoading}
        total={activityMeta?.totalRecords}
        limitChoices={[5, 10, 20]}
        withSearch
        searchLabel="Search action"
        onSearchCb={(keyword) => {
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: '',
            search: keyword
          });
        }}
        onClearSearch={() => {
          fetchActivity();
          clearQueries();
        }}
        withFilters
        initialFilters={initialFilters}
        filterOptions={tableFilters}
        filters={filters}
        setFilters={setFilters}
        onFilterCb={(filters) => {
          adjustDateFilter(filters)
        }}
        onResetFilterCb={() => {
          fetchActivity();
          clearQueries();
        }}
      />
    </>
  );
};

export default ActivityLogsTable;
