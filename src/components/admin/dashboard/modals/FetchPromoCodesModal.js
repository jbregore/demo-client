import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useQuery } from '@apollo/client';
import moment from 'moment';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Modal,
  Stack,
  Checkbox,
  Typography,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// icons
import { Icon } from '@iconify/react';
import checkSquareFilled from '@iconify/icons-ant-design/check-square-filled';
import closeSquareFilled from '@iconify/icons-ant-design/close-square-filled';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import BaseTableV2 from '../../../table/BaseTableV2';
// import { UserListHead } from '../../user';
// graphql
import { GET_PROMO_CODES_QUERY } from '../../../../graphql/queries';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import useFormErrors from '../../../../hooks/error/useFormError';
// ----------------------------------------------------------------------

const initialQueries = {
    page: '',
    pageSize: ''
  };


// ----------------------------------------------------------------------

const StatusIcon = ({ y }) => {
  return (
    <Icon
      icon={y ? checkSquareFilled : closeSquareFilled}
      color={y ? '#00AB55' : '#FF4842'}
      fontSize={20}
    />
  );
};

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 1000
}));

// ----------------------------------------------------------------------

FetchPromoCodesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  onCreateCallback: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function FetchPromoCodesModal({ open, setOpen, onCreateCallback }) {
  const settings = JSON.parse(localStorage.getItem('settings'));

  const { errorHandler } = useFormErrors();
  const { queryData, setQueryData } = useTableQueries(initialQueries);

  const [saveLoading, setSaveLoading] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_PROMO_CODES_QUERY, {
    variables: {
        pageInfo: {
            page: queryData.page || 1,
            limit: queryData.pageSize || 5,
        }
    },
    notifyOnNetworkStatusChange: true
  });

  const [selectedPromoCodes, setSelectedPromoCodes] = useState([]);

  useEffect(() => {
    if (open) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const payload = selectedPromoCodes.map((p) => ({
        type: p.type,
        value: p.value,
        promoCode: p.promoName,
        item: p.itemDiscount ? 'true' : 'false',
        transaction: p.transactionDiscount ? 'true' : 'false',
        date: {
          start: p.dateFrom,
          end: p.dateTo
        },
        time: {
          start: p.timeFrom,
          end: p.timeTo
        },
        days: p.day ? p.day.split(',') : [],
        storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
        isRestricted: p.dateFrom ? 'true' : 'false',
      }))

      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/promo-code/batch`,
        payload
      );

      if (result.status === 200) {
        const severity = result.data.data.failed > 0 ? 'warning' : 'success';
        setOpen(false);
        setSelectedPromoCodes([]);
        onCreateCallback(severity, result.data.message);
      }
    } catch (err) {
      const errorMsg = errorHandler(err);
      onCreateCallback("error", errorMsg);
    }
    setSaveLoading(false);
  };

  const columns = [
    {
      label: '',
      render: (data) => {
        return (
          <Checkbox
            checked={selectedPromoCodes.findIndex((p) => p.promoCodeId === data.promoCodeId) > -1}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPromoCodes((prev) => [...prev, data]);
              } else {
                setSelectedPromoCodes((prev) =>
                  prev.filter((promoCodeId) => promoCodeId !== data)
                );
              }
            }}
          />
        );
      }
    },
    {
      label: 'Promo Code',
      column: 'promoName'
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
          <StatusIcon y={data.day.includes(day)} />
        </>
      )
    }))
  ];

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Promo Codes from Online</Typography>
        <Typography variant="body2">Select promo codes to download.</Typography>

        {error ? (
          <Typography variant="body1" color="error">
            Error fetching promo codes
          </Typography>
        ) : data?.promoCodes?.data?.length === 0 ? (
          <Typography variant="body1" color="error">
            No promo codes available
          </Typography>
        ) : (
          <>
            <Box mt={2} p={2}>
                <BaseTableV2
                    withVerticalScroll
                    verticalScrollWidth={1500}
                    pageChangeCb={(page) => {
                        setQueryData({
                            ...queryData,
                            page: page + 1
                        });                        
                    }}
                    rowsChangeCb={(size) => {
                        setQueryData({
                            ...queryData,
                            page: '',
                            pageSize: size
                        });
                    }}
                    data={data?.promoCodes?.data || []}
                    columns={columns}
                    isLoading={loading}
                    total={data?.promoCodes?.pageInfo?.totalItems || -1}
                    limitChoices={[5, 10, 20]}
                />
            </Box>
            <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
              <Button
                size="large"
                variant="contained"
                color="error"
                type="submit"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
              <LoadingButton
                size="large"
                variant="contained"
                type="submit"
                onClick={handleSave}
                loading={saveLoading}
                disabled={selectedPromoCodes.length === 0}
              >
                Save
              </LoadingButton>
            </Stack>
          </>
        )}
      </ModalCard>
    </StyledModal>
  );
}
