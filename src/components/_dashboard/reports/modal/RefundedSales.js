import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { format } from 'date-fns';
// material
import { Stack, Typography, Button } from '@mui/material';
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
import BaseTableV2 from '../../../table/BaseTableV2';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import moment from 'moment';
import useQueryString from '../../../../hooks/table/useQueryString';
import { Backdrop, ModalCard, StyledModal } from './styles/commonModalStyles';
import useDateRange from '../../../../hooks/common-reports/useDateRange';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

RefundedSales.propTypes = {
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

export default function RefundedSales({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [voidReports, setVoidReports] = useState([]);
  const [voidReportsMeta, setVoidReportsMeta] = useState([]);
  const [voidReportsLoading, setVoidReportsLoading] = useState(true);
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
      label: 'SI Number',
      column: 'siNumber',
      render: (data) => (
        <>
          <Typography variant="subtitle2" noWrap>
            {data.siNumber}
          </Typography>
        </>
      ),
      enableSort: true,
      sortOrder: sortState.siNumber,
      sortBy: 'siNumber'
    },
    {
      label: 'Product Code',
      column: 'productCode'
    },
    {
      label: 'Amount',
      render: (data) => <>{fCurrency('P', roundUpAmount(data.price))}</>
    },
    {
      label: 'Refunded By',
      render: (data) => <>{data.cashierId}</>
    },
    {
      label: 'Date',
      render: (data) => <>{moment.utc(data.specsDate).format('MM/DD/YYYY LT')}</>
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

  const fetchRefunded = async() => {
    setIsRefetching(false);
    setVoidReportsLoading(true);

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
      const voidReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/refunded-sales/${storeCode}?${objectToString(
          initialParams
        )}`
      );
      if (voidReportsData?.data?.data) {
        setVoidReports(voidReportsData?.data?.data);
        setVoidReportsMeta(voidReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setVoidReportsLoading(false);
  }

  const refetch = async () => {
    setVoidReportsLoading(true);

    try {
      const voidReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/refunded-sales/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (voidReportsData?.data?.data) {
        setVoidReports(voidReportsData?.data?.data);
        setVoidReportsMeta(voidReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setVoidReportsLoading(false);
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

    voidReports.forEach((specs) => {
      formattedData.push({
        siNumber: specs.siNumber,
        productCode: specs.productCode,
        price: roundUpAmount(specs.price),
        cashierId: specs.cashierId,
        date: moment.utc(specs.specsDate).format('MM/DD/YYYY LT')
      });
    });

    const columns = {
      siNumber: 'SI Number',
      productCode: 'Product Code',
      price: 'Amount',
      cashierId: 'Refunded By',
      date: 'Date'
    };

    let filename = currentDate;
    if (filters.from && filters.to) {
      if (filters.from !== filters.to) {
        filename = `(${filters.from}-${filters.to})`;
      }
    }
    downloadCsv(formattedData, columns, `${filename}_REFUNDED-SALES`);

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
      )} has downloaded a CSV report for refunded sales.`,
      'Download CSV Refunded Sales Report',
      `${
        posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
    );
  };

  useEffect(() => {
    fetchRefunded()
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
          <Typography variant="h6">Refunded Sales</Typography>
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
            data={voidReports || []}
            columns={columns}
            setSortState={setSortState}
            isLoading={voidReportsLoading}
            total={voidReportsMeta?.totalRecords}
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
              fetchRefunded();
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
              fetchRefunded();
              clearQueries();
            }}
          />
        </Scrollbar>
      </ModalCard>
    </StyledModal>
  );
}
