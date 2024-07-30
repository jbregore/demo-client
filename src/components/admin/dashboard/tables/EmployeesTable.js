import { Icon } from '@iconify/react';
import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import BaseTableV2 from '../../../table/BaseTableV2';
import axios from 'axios';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import { capitalCase } from 'text-case';
import useQueryString from '../../../../hooks/table/useQueryString';
import MenuAction from '../../../table/MenuAction';
import restoreFill from '@iconify/icons-ic/outline-restore';
import Confirmation from '../../../Confirmation';
import useSnack from '../../../../hooks/useSnack';
import useFormErrors from '../../../../hooks/error/useFormError';
import CustomSnack from '../../../CustomSnack';
import EmployeeModal from '../modals/EmployeeModal';
import uploadFill from '@iconify/icons-eva/upload-fill';
import ImportEmployeeModal from '../modals/ImportEmployeeModal';

const initialFilters = {
  sortBy: 'employeeId',
  sortOrder: 'asc',
  role: 'All',
  isArchive: 'All'
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

const EmployeesTable = () => {
  const [employees, setEmployees] = useState([]);
  const [employeesMeta, setEmployeesMeta] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    employeeId: 'asc'
  });

  const { objectToString } = useQueryString();
  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();
  const { errorHandler } = useFormErrors();

  const [openEmployeeModal, setOpenEmployeeModal] = useState(false);
  const [openEmployeeImportModal, setOpenEmployeeImportModal] = useState(false);
  const [employeeModalContext, setEmployeeModalContext] = useState('create');

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [employeeToUpdate, setEmployeeToUpdate] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('archive');

  const archivedChoices = [
    {
      name: 'Restore',
      function: (record) => {
        setOpenConfirmation(true);
        setEmployeeToUpdate(record.employeeId);
        setEmployeeStatus('restore');
      },
      icon: restoreFill
    }
  ];

  const enabledChoices = [
    {
      name: 'Edit',
      function: (record) => {
        setEmployeeToUpdate(record);
        setOpenEmployeeModal(true);
        setEmployeeModalContext('update');
      },
      icon: editFill
    },
    {
      name: 'Archive',
      function: (record) => {
        setOpenConfirmation(true);
        setEmployeeToUpdate(record.employeeId);
        setEmployeeStatus('archive');
      },
      icon: trash2Outline
    }
  ];

  const columns = [
    {
      label: 'Employee ID',
      column: 'employeeId',
      enableSort: true,
      sortOrder: sortState.employeeId,
      sortBy: 'employeeId'
    },
    {
      label: 'Name',
      render: (data) => (
        <>{`${capitalCase(data.lastname)}, ${capitalCase(
          `${data.firstname} ${data.middlename}`
        )}`}</>
      )
    },
    {
      label: 'Role',
      render: (data) => <>{capitalCase(data.role)}</>
    },
    {
      label: 'Contact',
      render: (data) => <>{data.contactNumber ? data.contactNumber : 'N/A'}</>
    },
    {
      label: 'Status',
      render: (data) => <>{data.isArchive ? 'Archived' : 'Active'}</>
    },
    {
      label: '',
      render: (data) => (
        <>
          <MenuAction choices={data.isArchive ? archivedChoices : enabledChoices} record={data} />
        </>
      )
    }
  ];

  const tableFilters = [
    {
      name: 'role',
      label: 'Role',
      options: [
        {
          value: 'All',
          label: 'All'
        },
        {
          value: 'cashier',
          label: 'Cashier'
        },
        {
          value: 'supervisor',
          label: 'Supervisor'
        }
      ],
      optionsUsingId: true,
      type: 'select',
      placeholder: 'Role',
      value: filters.role
    },
    {
      name: 'isArchive',
      label: 'Status',
      options: [
        {
          value: 'All',
          label: 'All'
        },
        {
          value: true,
          label: 'Archived'
        },
        {
          value: false,
          label: 'Active'
        }
      ],
      optionsUsingId: true,
      type: 'select',
      placeholder: 'Status',
      value: filters.isArchive
    }
  ];

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const employeesData = await axios.get(`${process.env.REACT_APP_API_URL}/employee`);
      if (employeesData?.data?.data) {
        setEmployees(employeesData?.data?.data);
        setEmployeesMeta(employeesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setEmployeesLoading(false);
  };

  const refetch = async () => {
    setEmployeesLoading(true);
    try {
      const employeesData = await axios.get(
        `${process.env.REACT_APP_API_URL}/employee?${objectToString(queryData)}`
      );
      if (employeesData?.data?.data) {
        setEmployees(employeesData?.data?.data);
        setEmployeesMeta(employeesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setEmployeesLoading(false);
    setIsRefetching(false);
  };

  const handleUpdateStatus = async () => {
    try {
      const result = await axios.patch(
        `${process.env.REACT_APP_API_URL}/employee/${employeeStatus}/${employeeToUpdate}`
      );
      if (result.status === 200) {
        successSnack(result?.data?.message);
        refetch()
      }
    } catch (err) {
      if (err.response.status === 401) {
        const error401 = errorHandler(err);
        errorSnack(error401);
      }
      console.log('err ', err);
    }
    setOpenConfirmation(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  return (
    <>
      <Box sx={{ pb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4" gutterBottom>
            Employees
          </Typography>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              variant="contained"
              startIcon={<Icon icon={plusFill} />}
              onClick={() => {
                setOpenEmployeeModal(true);
                setEmployeeModalContext('create');
              }}
            >
              New Employee
            </Button>

            <Button
              variant="outlined"
              startIcon={<Icon icon={uploadFill} />}
              onClick={() => {
                setOpenEmployeeImportModal(true)
              }}
            >
              Import CSV
            </Button>
          </Stack>
        </Stack>
      </Box>

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
        data={employees || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={employeesLoading}
        total={employeesMeta?.totalRecords}
        limitChoices={[5, 10, 20]}
        withSearch
        searchLabel="Search employee id"
        onSearchCb={(keyword) => {
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: '',
            search: keyword
          });
        }}
        onClearSearch={() => {
          fetchEmployees();
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
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: '',
            search: '',
            ...filters
          });
        }}
        onResetFilterCb={() => {
          fetchEmployees();
          clearQueries();
        }}
      />

      <EmployeeModal
        context={employeeModalContext}
        record={employeeToUpdate}
        open={openEmployeeModal}
        setOpen={setOpenEmployeeModal}
        onCreateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }
          refetch()
        }}
        onUpdateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }
          refetch()
        }}
      />

      <ImportEmployeeModal
        open={openEmployeeImportModal}
        setOpen={setOpenEmployeeImportModal}
        onImportCallback={() => {
          refetch()
        }}
      />

      <Confirmation
        context={employeeStatus === 'restore' ? 'primary' : 'delete'}
        title={`${capitalCase(employeeStatus)} Employee`}
        helperText={`Are you sure you want to ${employeeStatus} this employee?`}
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onSave={handleUpdateStatus}
      />

      <CustomSnack
        open={snackOpen}
        setOpen={setSnackOpen}
        severity={snackSeverity}
        message={snackMessage}
      />
    </>
  );
};

export default EmployeesTable;
