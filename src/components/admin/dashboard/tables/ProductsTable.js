import React, { useEffect, useState } from 'react';
import BaseTableV2 from '../../../table/BaseTableV2';
import axios from 'axios';
import { fCurrency } from '../../../../utils/formatNumber';
import MenuAction from '../../../table/MenuAction';
import closeCirlceOutline from '@iconify/icons-eva/close-circle-fill';
import useQueryString from '../../../../hooks/table/useQueryString';
import { Button, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import ProductModal from '../modals/ProductModal';
import Confirmation from '../../../Confirmation';
import useSnack from '../../../../hooks/useSnack';
import CustomSnack from '../../../CustomSnack';
import useFormErrors from '../../../../hooks/error/useFormError';
import restoreFill from '@iconify/icons-ic/outline-restore';
import { dashboardStore } from '../../../../redux/admin/dashboard/store';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import useCategories from '../../../../hooks/common-data/useCategories';
import uploadFill from '@iconify/icons-eva/upload-fill';
import ImportProductModal from '../modals/ImportProductModal';
import { setRefreshCategories } from '../../../../redux/admin/dashboard/action';

const initialFilters = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  category: 'All',
  availability: 'All'
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

const ProductsTable = () => {
  const state = dashboardStore.getState();
  const [refreshProducts, setRefreshProducts] = useState(dashboardStore.getState().refreshProducts);

  const { categoryOptions } = useCategories();

  const [products, setProducts] = useState([]);
  const [productsMeta, setProductsMeta] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    productCode: 'asc'
  });

  const { objectToString } = useQueryString();
  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();
  const { errorHandler } = useFormErrors();

  const [openProductModal, setOpenProductModal] = useState(false);
  const [openProductImportModal, setOpenProductImportModal] = useState(false);
  const [productModalContext, setProductModalContext] = useState('create');

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const [productToUpdate, setProductToUpdate] = useState('');
  const [isProductEnabled, setIsProductEnabled] = useState(false);

  const disabledChoices = [
    {
      name: 'Disable',
      function: (record) => {
        setOpenConfirmation(true);
        setProductToUpdate(record.productCode);
        setIsProductEnabled(false);
      },
      icon: closeCirlceOutline
    }
  ];

  const enabledChoices = [
    {
      name: 'Enable',
      function: (record) => {
        setOpenConfirmation(true);
        setProductToUpdate(record.productCode);
        setIsProductEnabled(true);
      },
      icon: restoreFill
    }
  ];

  const columns = [
    {
      label: 'Code',
      column: 'productCode',
      enableSort: true,
      sortOrder: sortState.productCode,
      sortBy: 'productCode'
    },
    {
      label: 'Name',
      column: 'name'
    },
    {
      label: 'Category',
      render: (data) => <>{data.category.name}</>
    },
    {
      label: 'Price',
      render: (data) => <>{fCurrency('P', data.price)}</>
    },
    {
      label: 'Availability',
      render: (data) => <>{data.availability ? 'Enabled' : 'Disabled'}</>
    },
    {
      label: '',
      render: (data) => (
        <>
          <MenuAction
            choices={data.availability ? disabledChoices : enabledChoices}
            record={data}
          />
        </>
      ),
      alignment: 'left'
    }
  ];

  const tableFilters = [
    {
      name: 'category',
      label: 'Category',
      options: [
        {
          value: 'All',
          label: 'All'
        },
        ...(categoryOptions
          ? categoryOptions.map((item) => ({
            value: item.value,
            label: item.label
          }))
          : [])
      ],
      optionsUsingId: true,
      type: 'select',
      placeholder: 'Category',
      value: filters.category
    },
    {
      name: 'availability',
      label: 'Availability',
      options: [
        {
          value: 'All',
          label: 'All'
        },
        {
          value: true,
          label: 'Enabled'
        },
        {
          value: false,
          label: 'Disabled'
        }
      ],
      optionsUsingId: true,
      type: 'select',
      placeholder: 'Availability',
      value: filters.availability
    }
  ];

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const productsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventory/all-products`
      );
      if (productsData?.data?.data) {
        setProducts(productsData?.data?.data);
        setProductsMeta(productsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setProductsLoading(false);
  };

  const refetch = async () => {
    setProductsLoading(true);
    try {
      const productsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/inventory/all-products?${objectToString(queryData)}`
      );
      if (productsData?.data?.data) {
        setProducts(productsData?.data?.data);
        setProductsMeta(productsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setProductsLoading(false);
    setIsRefetching(false);
  };

  const handleUpdateProduct = async () => {
    try {
      const result = await axios.patch(
        `${process.env.REACT_APP_API_URL}/inventory/products/${productToUpdate}`,
        {
          availability: isProductEnabled
        }
      );
      if (result.status === 200) {
        successSnack(result?.data?.message);
        fetchProducts();
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
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  useEffect(() => {
    const unsubscribe = dashboardStore.subscribe(() => {
      const newRefreshProducts = dashboardStore.getState().refreshProducts;
      if (newRefreshProducts !== refreshProducts) {
        setRefreshProducts(newRefreshProducts);
        fetchProducts();
        clearQueries();
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshProducts]);

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Icon icon={plusFill} />}
            onClick={() => {
              setOpenProductModal(true);
              setProductModalContext('create');
            }}
          >
            New Product
          </Button>
          <Button
            variant="outlined"
            startIcon={<Icon icon={uploadFill} />}
            onClick={() => {
              setOpenProductImportModal(true)
            }}
          >
            Import CSV
          </Button>
        </Stack>
      </Stack>

      <BaseTableV2
        pageChangeCb={(page) => {
          setIsRefetching(true);
          setQueryData({
            page: page + 1,
            pageSize: queryData.pageSize
          });
        }}
        rowsChangeCb={(size) => {
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: size
          });
        }}
        data={products || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={productsLoading}
        total={productsMeta?.totalRecords}
        limitChoices={[1, 5, 10, 20]}
        withSearch
        searchLabel="Search code, name"
        onSearchCb={(keyword) => {
          setIsRefetching(true);
          setQueryData({
            page: '',
            pageSize: '',
            search: keyword
          });
        }}
        onClearSearch={() => {
          fetchProducts();
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
      />

      <ProductModal
        context={productModalContext}
        open={openProductModal}
        setOpen={setOpenProductModal}
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

      <ImportProductModal
        open={openProductImportModal}
        setOpen={setOpenProductImportModal}
        onImportCallback={() => {
          refetch()
          dashboardStore.dispatch(setRefreshCategories(!state.refreshCategories));
        }}
      />


      <Confirmation
        context={isProductEnabled ? 'primary' : 'delete'}
        title={`${isProductEnabled ? 'Enable' : 'Disable'} Product`}
        helperText={`Are you sure you want to ${isProductEnabled ? 'Enable' : 'Disable'
          } this product?`}
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onSave={handleUpdateProduct}
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

export default ProductsTable;
