import moment from 'moment';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BaseTableV2 from '../../../table/BaseTableV2';
import MenuAction from '../../../table/MenuAction';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import useQueryString from '../../../../hooks/table/useQueryString';
import CategoryModal from '../modals/CategoryModal';
import { Box, Button, Stack, Typography } from '@mui/material';
import Confirmation from '../../../Confirmation';
import CustomSnack from '../../../CustomSnack';
import useSnack from '../../../../hooks/useSnack';
import plusFill from '@iconify/icons-eva/plus-fill';
import useFormErrors from '../../../../hooks/error/useFormError';
import { Icon } from '@iconify/react';
import { dashboardStore } from '../../../../redux/admin/dashboard/store';
import { setRefreshProducts } from '../../../../redux/admin/dashboard/action';
import useTableQueries from '../../../../hooks/table/useTableQueries';

const initialFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc'
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

const CategoriesTable = () => {
  const state = dashboardStore.getState();
  const [refreshCategories, setRefreshCategories] = useState(dashboardStore.getState().refreshCategories);

  const [categories, setCategories] = useState([]);
  const [categoriesMeta, setCategoriesMeta] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    name: 'desc',
    updatedAt: 'desc'
  });

  const { objectToString } = useQueryString();

  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();

  const { errorHandler } = useFormErrors();

  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [categoryModalContext, setCategoryModalContext] = useState('create');

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState('');
  const [categoryToUpdate, setCategoryToUpdate] = useState(null);

  const choices = [
    {
      name: 'Edit',
      function: (record) => {
        setCategoryToUpdate(record);
        setOpenCategoryModal(true);
        setCategoryModalContext('update');
      },
      icon: editFill
    },
    {
      name: 'Remove',
      function: (record) => {
        setOpenConfirmation(true);
        setCategoryToDelete(record._id);
      },
      icon: trash2Outline
    }
  ];

  const columns = [
    { label: 'Name', column: 'name', enableSort: true, sortOrder: sortState.name, sortBy: 'name' },
    {
      label: 'Created At',
      render: (data) => <>{moment(data.createdAt).format('MM/DD/YYYY hh:mm a')}</>
    },
    {
      label: 'Updated At',
      render: (data) => <>{moment(data.createdAt).format('MM/DD/YYYY hh:mm a')}</>,
      alignment: 'left',
      enableSort: true,
      sortOrder: sortState.updatedAt,
      sortBy: 'updatedAt'
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

  const tableFilters = [];

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const categoriesData = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventory/categories`
      );
      if (categoriesData?.data?.data) {
        setCategories(categoriesData?.data?.data);
        setCategoriesMeta(categoriesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setCategoriesLoading(false);
  };

  const refetch = async () => {
    setCategoriesLoading(true);
    try {
      const categoriesData = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventory/categories?${objectToString(queryData)}`
      );
      if (categoriesData?.data?.data) {
        setCategories(categoriesData?.data?.data);
        setCategoriesMeta(categoriesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setCategoriesLoading(false);
    setIsRefetching(false);
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await axios.delete(
        `${process.env.REACT_APP_API_URL}/inventory/categories/${categoryToDelete}`
      );
      if (result.status === 200) {
        successSnack(result?.data?.message);
        fetchCategories();
        clearQueries();
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  useEffect(() => {
    const unsubscribe = dashboardStore.subscribe(() => {
      const newRefreshCategories = dashboardStore.getState().refreshCategories;
      if (newRefreshCategories !== refreshCategories) {
        setRefreshCategories(newRefreshCategories);
        fetchCategories();
        clearQueries();
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshCategories]);

  return (
    <>
      <Box sx={{ pb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Categories</Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon={plusFill} />}
            onClick={() => {
              setOpenCategoryModal(true);
              setCategoryModalContext('create');
            }}
          >
            New Category
          </Button>
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
        data={categories || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={categoriesLoading}
        total={categoriesMeta?.totalRecords}
        limitChoices={[5, 10, 20]}
        withSearch
        searchLabel="Search name"
        onSearchCb={(keyword) => {
          setIsRefetching(true);
          setQueryData({
            ...queryData,
            page: '',
            pageSize: '',
            search: keyword
          });
        }}
        onClearSearch={() => {
          fetchCategories();
          clearQueries();
        }}
        // withFilters
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
      />

      <CategoryModal
        context={categoryModalContext}
        record={categoryToUpdate}
        open={openCategoryModal}
        setOpen={setOpenCategoryModal}
        onCreateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }

          refetch()
          dashboardStore.dispatch(setRefreshProducts(!state.refreshProducts));
        }}
        onUpdateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }
          refetch()
          dashboardStore.dispatch(setRefreshProducts(!state.refreshProducts));
        }}
      />

      <Confirmation
        context={'delete'}
        title={'Delete Category'}
        helperText={'Are you sure you want to delete this category?'}
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onSave={handleDeleteCategory}
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

export default CategoriesTable;
