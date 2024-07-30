import { Box, Button, Stack, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import plusFill from '@iconify/icons-eva/plus-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import { Icon } from '@iconify/react';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import axios from 'axios';
import BaseTableV2 from '../../../table/BaseTableV2';
import checkSquareFilled from '@iconify/icons-ant-design/check-square-filled';
import closeSquareFilled from '@iconify/icons-ant-design/close-square-filled';
import downloadFill from '@iconify/icons-eva/download-fill';
import moment from 'moment';
import MenuAction from '../../../table/MenuAction';
import useQueryString from '../../../../hooks/table/useQueryString';
import useSnack from '../../../../hooks/useSnack';
import useFormErrors from '../../../../hooks/error/useFormError';
import Confirmation from '../../../Confirmation';
import CustomSnack from '../../../CustomSnack';
import PromoCodeModal from '../modals/PromoCodeModal';
import FetchPromoCodesModal from '../modals/FetchPromoCodesModal';
import { LoadingButton } from '@mui/lab';
import { fCurrency } from '../../../../utils/formatNumber';
import { Endpoints } from '../../../../enum/Endpoints';

const initialFilters = {
  sortBy: 'promoName',
  sortOrder: 'asc'
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

const StatusIcon = ({ y }) => {
  return (
    <Icon
      icon={y ? checkSquareFilled : closeSquareFilled}
      color={y ? '#00AB55' : '#FF4842'}
      fontSize={20}
    />
  );
};

const PromoCodesTable = () => {
  const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));

  const [promoCodes, setPromoCodes] = useState([]);
  const [promoCodesMeta, setPromoCodesMeta] = useState([]);
  const [promoCodesLoading, setPromoCodesLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
  const [filters, setFilters] = useState(initialFilters);
  const [sortState, setSortState] = useState({
    promoName: 'asc'
  });

  const { objectToString } = useQueryString();
  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();

  const { errorHandler } = useFormErrors();

  const [openPromoModal, setOpenPromoModal] = useState(false);
  const [promoModalContext, setPromoModalContext] = useState('create');

  const [openConfirmation, setOpenConfirmation] = useState(false);

  const [promoToDelete, setPromoToDelete] = useState('');

  const [openFetchPromoCodesModal, setOpenFetchPromoCodesModal] = useState(false);

  const choices = [
    {
      name: 'Delete',
      function: (record) => {
        setOpenConfirmation(true);
        setPromoToDelete(record._id);
      },
      icon: trash2Outline
    }
  ];

  const columns = [
    {
      label: 'Promo Code',
      column: 'promoCode',
      enableSort: true,
      sortOrder: sortState.promoName,
      sortBy: 'promoName'
    },
    {
      label: 'Value',
      render: (data) => {
        switch (data.type) {
          case 'percentage':
            return `${data.value}%`;
          case 'fixed':
            return fCurrency('₱', data.value);
          default:
            return data.value;
        }
      }
    },
    {
      label: 'Item Discount',
      render: (data) => (
        <>
          <StatusIcon y={data.itemDiscount === true} />
        </>
      ),
      alignment: 'center'
    },
    {
      label: 'Transaction Discount',
      render: (data) => (
        <>
          <StatusIcon y={data.transactionDiscount === true} />
        </>
      ),
      alignment: 'center'
    },
    {
      label: 'Date Start',
      render: (data) => <>{data.dateStart ? moment(data.dateStart).format('MMMM DD YYYY') : '-'}</>
    },
    {
      label: 'Date End',
      render: (data) => <>{data.dateEnd ? moment(data.dateEnd).format('MMMM DD YYYY') : '-'}</>
    },
    {
      label: 'Time Start',
      render: (data) => (
        <>
          {data.timeStart && data.dateStart
            ? moment(`${data.dateStart} ${data.timeStart}`).format('LT')
            : '-'}
        </>
      )
    },
    {
      label: 'Time End',
      render: (data) => (
        <>
          {data.timeEnd && data.dateEnd
            ? moment(`${data.dateEnd} ${data.timeEnd}`).format('LT')
            : '-'}
        </>
      )
    },
    ...['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => ({
      label: day.charAt(0).toUpperCase() + day.slice(1),
      render: (data) => (
        <>
          <StatusIcon y={data.days.includes(day)} />
        </>
      )
    })),

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

  const fetchPromoCodes = async () => {
    setPromoCodesLoading(true);
    try {
      const promoCodesData = await axios.get(`${Endpoints.PROMO}`);
      if (promoCodesData?.data?.data) {
        setPromoCodes(promoCodesData?.data?.data);
        setPromoCodesMeta(promoCodesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setPromoCodesLoading(false);
  };

  const refetch = async () => {
    setPromoCodesLoading(true);
    try {
      const promoCodesData = await axios.get(
        `${Endpoints.PROMO}?${objectToString(queryData)}`
      );
      if (promoCodesData?.data?.data) {
        setPromoCodes(promoCodesData?.data?.data);
        setPromoCodesMeta(promoCodesData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setPromoCodesLoading(false);
    setIsRefetching(false);
  };

  const handleDeletePromo = async () => {
    try {
      const result = await axios.delete(
        `${Endpoints.PROMO}/${promoToDelete}`
      );
      if (result.status === 200) {
        successSnack(result?.data?.message);
        refetch();
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
    fetchPromoCodes();
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
            Promo Codes
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            {umbraSystems?.deviceId && (
              <LoadingButton
                variant="outlined"
                // loading={isLoading}
                startIcon={<Icon icon={downloadFill} />}
                onClick={() => setOpenFetchPromoCodesModal(true)}
              >
                Fetch online
              </LoadingButton>
            )}
            <Button
              variant="contained"
              startIcon={<Icon icon={plusFill} />}
              onClick={() => {
                setOpenPromoModal(true);
                setPromoModalContext('create');
              }}
            >
              New Promo code
            </Button>
          </Stack>
        </Stack>
      </Box>

      <BaseTableV2
        withVerticalScroll
        verticalScrollWidth={1500}
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
        data={promoCodes || []}
        columns={columns}
        setSortState={setSortState}
        isLoading={promoCodesLoading}
        total={promoCodesMeta?.totalRecords}
        limitChoices={[5, 10, 20]}
        withSearch
        searchLabel="Search promo code"
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
          fetchPromoCodes();
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

      <PromoCodeModal
        context={promoModalContext}
        open={openPromoModal}
        setOpen={setOpenPromoModal}
        onCreateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }
          refetch();
        }}
      />

      <Confirmation
        context={'delete'}
        title={'Delete Promo'}
        helperText={'Are you sure you want to delete this promo?'}
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onSave={handleDeletePromo}
      />

      <FetchPromoCodesModal
        open={openFetchPromoCodesModal}
        setOpen={setOpenFetchPromoCodesModal}
        onCreateCallback={(status, message) => {
          if (status === 'success') {
            successSnack(message);
          } else {
            errorSnack(message);
          }
          refetch();
        }}
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

export default PromoCodesTable;
