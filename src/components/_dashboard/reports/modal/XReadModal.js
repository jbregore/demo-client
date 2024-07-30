import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Modal,
  Typography,
  Box,
  Snackbar,
  Alert,
  Stack,
  LinearProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { capitalCase } from 'text-case';
import timestamp from 'time-stamp';
import uniqid from 'uniqid';
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
import { XReadReceipt } from '..';
// functions
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

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
  width: 600
}));

const RowTitle = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.primary.lighter,
  padding: theme.spacing(1, 0),
  '& p': {
    fontWeight: 700
  }
}));

const RowLabel = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1, 3)
}));

// ----------------------------------------------------------------------

// eslint-disable-next-line react/prop-types
const GridInBetween = ({ title, label, value }) =>
  title ? (
    <RowTitle
      direction="row"
      alignItems="center"
      justifyContent={title ? 'center' : 'space-between'}
      spacing={3}
    >
      <Typography>{title || label}</Typography>
      {value && <Typography>{value}</Typography>}
    </RowTitle>
  ) : (
    <RowLabel
      direction="row"
      alignItems="center"
      justifyContent={title ? 'center' : 'space-between'}
      spacing={3}
    >
      <Typography>{title || label}</Typography>
      {value && <Typography>{value}</Typography>}
    </RowLabel>
  );

// ----------------------------------------------------------------------

XReadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function XReadModal({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const { user } = JSON.parse(localStorage.getItem('userData'));
  const posDate = localStorage.getItem('transactionDate');
  // const { online } = useNetwork();

  const [errorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [preview, setPreview] = useState(null);

  const [previewData, setPreviewData] = useState();
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchXRead = async () => {
      try {
        setIsLoading(true);
        const branchCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;
        const userId = user.employeeId;
        const transactionDate = localStorage.getItem('transactionDate');

        const userLogs = await axios.get(`${Endpoints.LOGIN}/logs/${userId}/${transactionDate}`);

        const timeFrom = moment(userLogs.data.realtimeLogs).format('HH:mm:ss');
        const timeTo = moment().format('HH:mm:ss');

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/reports/x-read/${transactionDate}/${userId}/${branchCode}/${timeFrom}/${timeTo}`
        );
        const previewData = res.data.data;
        previewData.timeFrom = moment(userLogs.data.realtimeLogs).format('YYYY-MM-DD HH:mm:ss');
        previewData.timeTo = moment().format('YYYY-MM-DD HH:mm:ss');

        setPreview(previewData.takeout ? previewData : false);

        // eslint-disable-next-line no-empty
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    if (open && !preview) {
      fetchXRead();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.employeeId]);

  const handleLogXRead = async () => {
    try {
      const [, currentTime] = moment().format('YYYY-MM-DD HH:mm:ss').split(' ');
      const [date] = posDate.split(' ');
      const transactionDate = `${date} ${currentTime}`;
      const txnNumber = `${settings[SettingsCategoryEnum.UnitConfig].storeCode}-${timestamp(
        'YYYYMMDDHHmmss'
      )}`;
      const posIsNonVat = settings[SettingsCategoryEnum.UnitConfig].nonVat;

      // Add nonVat field to xRead data depending on nonvat settings
      preview.isNonVat = posIsNonVat;

      const apiData = {
        xReadData: preview,
        realTimeDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        cashier: {
          id: user.employeeId,
          firstname: user.firstname,
          lastname: user.lastname,
          role: user.role,
          shiftFrom: preview.timeFrom,
          shiftTo: preview.timeTo
        }
      };

      const previewPayload = {
        type: 'x-read',
        storeCode: storeCode,
        transactionDate,
        data: apiData,
        txnNumber
      };

      const activityPayload = {
        firstname: user.firstname,
        lastname: user.lastname,
        employeeId: user.employeeId,
        activity: 'Sales Report',
        description: `${capitalCase(user.firstname)} ${capitalCase(
          user.lastname
        )} did an X Read report.`,
        action: 'X Read',
        storeCode,
        activityDate: `${date} ${currentTime}`
      };

      const xReadLogPayload = {
        reportReadLogId: uniqid(storeCode),
        cashierId: user.employeeId,
        storeCode: storeCode,
        type: 'x-read',
        readDate: `${date} ${currentTime}`
      };

      const printPayload = {
        apiData,
        settings
      };

      const payload = {
        previewPayload,
        activityPayload,
        xReadLogPayload,
        printPayload
      };

      const result = await axios.post(`${Endpoints.REPORTS}/x-read/generate`, payload);

      if (result.status === 200) {
        setPreviewData(apiData);
        setPreviewOpen(true);
        localStorage.setItem('isXRead', true);
      }

    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const { payments, initialFund, takeout, cashDrop, OVER_SHORT } = preview || {};

  return (
    <StyledModal open={open} onClose={handleCloseModal} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Cashier's Reading</Typography>
        <Box mt={3}>
          {isLoading && !preview && <LinearProgress />}
          {!isLoading && !preview && (
            <Typography>Please make your cash takeout report first</Typography>
          )}
          {preview && (
            <Scrollbar sx={{ maxHeight: 800 }}>
              <GridInBetween title="Cashier" />
              <GridInBetween label="Store code" value={settings.unitConfiguration.storeCode} />
              <GridInBetween
                label="Transaction Date"
                value={moment(localStorage.getItem('transactionDate')).format('MMM DD, YYYY')}
              />
              <GridInBetween label="ID" value={user.employeeId} />
              <GridInBetween label="Name" value={`${user.firstname} ${user.lastname}`} />
              <GridInBetween title="Payments" />
              <GridInBetween
                label={`Cash (${payments.cash.count + (payments.custom?.cash?.summary?.count || 0)})`}
                value={fCurrency('P', payments.cash.total + (payments.custom?.cash?.summary?.total || 0))}
              />
              <GridInBetween
                label={`Non Cash (${payments.nonCash.summary.count + (payments.custom?.nonCash?.summary?.count || 0)})`}
                value={fCurrency('P', payments.nonCash.summary.total + (payments.custom?.nonCash?.summary?.total || 0))}
              />
              <GridInBetween
                label={`Total Sales (${payments.summary.count})`}
                value={fCurrency('P', payments.summary.total)}
              />
              <GridInBetween title="Cashier's Accountability" />
              <GridInBetween
                label="Initial Cash"
                value={fCurrency('P', initialFund.INITIAL_FUND.total)}
              />
              <GridInBetween
                label="Total in Drawer"
                value={fCurrency('P', cashDrop.TOTAL_IN_DRAWER)}
              />
              <GridInBetween
                label="Total Declaration"
                value={fCurrency(
                  'P',
                  takeout ? cashDrop.totalDeclaration.cash.TOTAL_CASH_DECLARATION : 0
                )}
              />
              <GridInBetween
                label="Over/Short"
                // value={"XREAD TODO"}
                value={fCurrency('P', OVER_SHORT)}
              />
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ marginTop: 5 }}
              >
                <LoadingButton
                  size="large"
                  variant="contained"
                  type="submit"
                  loading={isLoading}
                  onClick={() => handleLogXRead()}
                >
                  Print report
                </LoadingButton>
              </Stack>
            </Scrollbar>
          )}
        </Box>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage !== '' ? errorMessage : 'Something went wrong! Please try again later.'}
          </Alert>
        </Snackbar>
        {previewData && (
          <XReadReceipt
            open={previewOpen}
            setOpen={setPreviewOpen}
            setOpenMainModal={setOpen}
            data={previewData}
          />
        )}
      </ModalCard>
    </StyledModal>
  );
}
