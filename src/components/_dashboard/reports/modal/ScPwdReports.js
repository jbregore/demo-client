import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
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
import useTableQueries from '../../../../hooks/table/useTableQueries';
import useQueryString from '../../../../hooks/table/useQueryString';
import BaseTableV2 from '../../../table/BaseTableV2';
import { format } from 'date-fns';
import { Backdrop, ModalCard, StyledModal } from './styles/commonModalStyles';
import useDateRange from '../../../../hooks/common-reports/useDateRange';

ScPwdReports.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};


const initialFilters = {
  sortBy: 'txnNumber',
  sortOrder: 'desc',
  from: '',
  to: ''
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

export default function ScPwdReports({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings?.unitConfiguration?.storeCode;
  const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');

  const [scReports, setSCReports] = useState([]);
  const [scReportsMeta, setSCReportsMeta] = useState([]);
  const [scReportsLoading, setSCReportsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    txnNumber: 'desc',
    reportDate: "desc"
  });

  const { objectToString } = useQueryString();
  const { adjustDateFilter } = useDateRange(queryData, setQueryData, filters, setFilters, setIsRefetching);

  const columns = [
    {
      label: 'Txn Number',
      column: 'txnNumber',
      enableSort: true,
      sortOrder: sortState.txnNumber,
      sortBy: 'txnNumber'
    },
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
      label: 'Type',
      column: 'type'
    },
    {
      label: 'OSCA/SC/PWD ID',
      column: 'idNumber'
    },
    {
      label: 'Gross Sales',
      render: (data) => <>{fCurrency('P', roundUpAmount(data.grossSales))}</>
    },
    {
      label: 'Discount Amount',
      render: (data) => <>{fCurrency('P', roundUpAmount(data.discountAmount))}</>
    },
    {
      label: 'Date',
      render: (data) => <>{moment.utc(data.reportDate).format('MM/DD/YYYY LT')}</>,
      enableSort: true,
      sortOrder: sortState.reportDate,
      sortBy: 'reportDate'
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

  const fetchSCReport = async () => {
    setIsRefetching(false);
    setSCReportsLoading(true);

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
      const scReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/sc-pwd-reports/${storeCode}?${objectToString(initialParams)}`
      );
      if (scReportsData?.data?.data) {
        setSCReports(scReportsData?.data?.data);
        setSCReportsMeta(scReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setSCReportsLoading(false);
  };


  const refetch = async () => {
    setSCReportsLoading(true);
    try {
      const scReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/sc-pwd-reports/${storeCode}?${objectToString(queryData)}`
      );
      if (scReportsData?.data?.data) {
        setSCReports(scReportsData?.data?.data);
        setSCReportsMeta(scReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setSCReportsLoading(false);
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

    scReports.forEach((specs) => {
      formattedData.push({
        name: capitalCase(`${specs.firstName} ${specs.lastName}`),
        // poNumber: specs.poNumber,
        idNumber: specs.idNumber,
        grossSales: roundUpAmount(specs.grossSales),
        discountAmount: roundUpAmount(specs.discountAmount),
        txnNumber: specs.txnNumber,
        date: moment.utc(specs.reportDate).format('MM/DD/YYYY LT') 
      });
    });

    const columns = {
      name: 'Name',
      // poNumber: 'PO Number',
      idNumber: 'OSCA/SC/PWD ID',
      grossSales: 'Gross Sales',
      discountAmount: 'Discount Amount',
      txnNumber: 'Txn Number',
      date: 'Date'
    };

    let filename = currentDate;
    if (filters.from && filters.to) {
      if (filters.from !== filters.to) {
        filename = `(${filters.from}-${filters.to})`;
      }
    }

    downloadCsv(formattedData, columns, `${filename}_SC/PWD-REPORTS`);

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
      `${posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
    );
  };

  // const resetTable = async () => {
  //   clearQueries();

  //   const fromDate = currentDate;
  //   const toDate = currentDate;

  //   setFilters({
  //     ...filters,
  //     from: fromDate,
  //     to: toDate
  //   });
  // };

  useEffect(() => {
    fetchSCReport()
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
          <Typography variant="h6">SC/PWD Reports</Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="fa-solid:file-csv" />}
            onClick={() => {
              handlePrintCsv()
            }}
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
            data={scReports || []}
            columns={columns}
            setSortState={setSortState}
            isLoading={scReportsLoading}
            total={scReportsMeta?.totalRecords}
            limitChoices={[5, 10, 20]}
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
              fetchSCReport();
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
              fetchSCReport();
              clearQueries();
            }}
          />
        </Scrollbar>
      </ModalCard>
    </StyledModal>
  );
}
