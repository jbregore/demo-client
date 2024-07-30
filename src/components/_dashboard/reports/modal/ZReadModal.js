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
  Button,
  LinearProgress
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import timestamp from 'time-stamp';
import { capitalCase } from 'text-case';
import uniqid from 'uniqid';
// components
import { ZReadReceipt } from '..';
// functions
// contexts
import { MallAccrEnum, SettingsCategoryEnum } from '../../../../enum/Settings';
import { Endpoints } from '../../../../enum/Endpoints';

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

// ----------------------------------------------------------------------

ZReadModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function ZReadModal({ open, setOpen }) {
  const { apiKey, deviceId } = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode, tenantId, mallAccr, terminalNumber } =
    settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const { mwcSalesTypeCode } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const { robinsonsFTPHost } = settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const todayDate = new Date();
  const transactionDate = localStorage.getItem('transactionDate');
  const posDateData = localStorage.getItem('transactionDate').split(' ');
  const { user } = JSON.parse(localStorage.getItem('userData'));

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(null);
  const [currentProcess, setCurrentProcess] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const [previewData, setPreviewData] = useState();
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchZRead = async () => {
      try {
        setIsLoading(true);
        const branchCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;

        const userLogs = await axios.get(
          `${Endpoints.LOGIN}/logs/${user.employeeId}/${transactionDate}`
        );

        const todayDate = new Date();
        const timeFrom = moment(userLogs.data.realtimeLogs).format('YYYY-MM-DD HH:mm:ss');
        const timeTo = moment(todayDate).format('YYYY-MM-DD HH:mm:ss');

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/reports/z-read/${branchCode}/${transactionDate}`
        );

        const previewData = res.data.data;
        const supervisorData = JSON.parse(localStorage.getItem('supervisor'));
        previewData.supervisor = supervisorData;
        previewData.timeFrom = timeFrom;
        previewData.timeTo = timeTo;

        setPreview(previewData.takeout.length ? previewData : false);

        return;
        // eslint-disable-next-line no-empty
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };

    if (open && !preview) {
      fetchZRead();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user.employeeId]);

  const handleLogZRead = async () => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    const txnNumber = `${settings[SettingsCategoryEnum.UnitConfig].storeCode}-${timestamp(
      'YYYYMMDDHHmmss'
    )}`;
    const posIsNonVat = settings[SettingsCategoryEnum.UnitConfig].nonVat;
    const [posDate] = transactionDate.split(' ');
    const [, currentTime] = moment().format('YYYY-MM-DD HH:mm:ss').split(' ');

    // Add nonVat field to xRead data depending on nonvat settings
    preview.isNonVat = posIsNonVat;

    try {
      setIsLoading(true);
      setError(false);
      setSuccess(false);

      const apiData = {
        zReadData: preview,
        realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss'),
        cashier: {
          id: storedData.user.employeeId,
          firstname: storedData.user.firstname,
          lastname: storedData.user.lastname,
          role: storedData.user.role,
          shiftFrom: preview.timeFrom,
          shiftTo: preview.timeTo
        }
      };

      // Add z-read to previews
      const previewPayload = {
        type: 'z-read',
        storeCode: storeCode,
        transactionDate: `${posDate} ${currentTime}`,
        data: apiData,
        txnNumber
      };

      const activityPayload = {
        firstname: storedData.user.firstname,
        lastname: storedData.user.lastname,
        employeeId: storedData.user.employeeId,
        activity: 'Sales Report',
        description: `${capitalCase(user.firstname)} ${capitalCase(
          user.lastname
        )} did an Z Read report.`,
        action: 'Z Read',
        storeCode,
        activityDate: `${posDate} ${currentTime}`
      };

      const zReadLogPayload = {
        reportReadLogId: uniqid(storeCode),
        cashierId: user.employeeId,
        storeCode: storeCode,
        type: 'z-read',
        readDate: `${posDate} ${currentTime}`
      };

      const printPayload = {
        apiData,
        settings
      };

      const umbraSystemsPayload = {
        apiKey,
        deviceId
      };

      const payload = {
        previewPayload,
        activityPayload,
        zReadLogPayload,
        printPayload,
        umbraSystemsPayload
      };

      const result = await axios.post(`${Endpoints.REPORTS}/z-read/generate`, payload);

      if (result.status === 200) {
        setPreviewData(apiData);
        setIsLoading(false);
        setPreviewOpen(true);
        setCurrentProcess('');
        localStorage.setItem('isZRead', true);
      }

      // sending files to mall
      switch (mallAccr) {
        case MallAccrEnum.MegaWorld:
          generateMwcSalesReport();
          onFinishZRead();
          break;

        case MallAccrEnum.Robinson:
          generateRobinsonSalesReport();
          break;

        case MallAccrEnum.Ayala:
          generateAyalaFilesReport();
          onFinishZRead();
          break;

        case MallAccrEnum.ICM:
          generateIcmFilesReport();
          onFinishZRead();
          break;

        case MallAccrEnum.Araneta:
          generateAranetaSalesReport();
          onFinishZRead();
          break;

        case MallAccrEnum.EVIA:
          generateEviaSalesReport();
          onFinishZRead();
          break;

        default:
          onFinishZRead();
      }
    } catch (err) {
      console.log(`Error is `, err);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishZRead = () => {
    setIsLoading(false);
    setPreviewOpen(true);
    setCurrentProcess('');
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setError(false);
    setSuccess(false);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const generateMwcSalesReport = async () => {
    try {
      setCurrentProcess('Downloading Z Read file...');
      await axios.get(
        `${Endpoints.ACCREDITATION}/mwc/daily-sales-data/${storeCode}/${moment(
          new Date(transactionDate)
        ).format('YYYY-MM-DD')}`,
        {
          params: {
            tenantId: tenantId,
            terminalNumber: terminalNumber,
            salesTypeCode: mwcSalesTypeCode ?? ''
          }
        }
      );

      // eslint-disable-next-line no-empty
    } catch (err) {
      setError(true);
      setMessage(
        err?.response?.data?.message ||
          err?.response?.data?.message ||
          'Something went wrong while generating reports.'
      );
    }
  };

  const generateRobinsonSalesReport = async () => {
    setIsLoading(true);
    const posDate = transactionDate.split(' ')[0];

    try {
      setCurrentProcess('Downloading Z Read file...');
      const res = await axios.get(
        `${Endpoints.ACCREDITATION}/robinson/daily-sales-data/${storeCode}/${moment(
          new Date(transactionDate)
        ).format('YYYY-MM-DD')}`,
        {
          params: {
            tenantId: tenantId,
            terminalNumber: terminalNumber
          }
        }
      );

      try {
        if (robinsonsFTPHost) {
          setCurrentProcess('Sending Z Read file to SFTP server...');
          await axios.post(`${Endpoints.ACCREDITATION}/robinson/sendFile`, {
            file: res.data.file,
            settings,
            transactionDate: posDate
          });
          setSuccess(true);
          setMessage('Sales file successfully sent to RLC server');
        }
      } catch (err) {
        setError(true);
        setMessage('Sales file is not sent to RLC server. Please contact your POS vendor');
      } finally {
        setTimeout(() => {
          setPreviewOpen(true);
          setIsLoading(false);
          setCurrentProcess('');
        }, 2000);
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      console.log('Error on sending file');
      setMessage(err?.response?.data?.message || 'Something went wrong while generating reports.');
      setPreviewOpen(true);
    }
  };

  const generateAyalaFilesReport = async () => {
    try {
      setSuccess(false);
      setError(false);
      const { contractNumber, contractName, companyCode } =
        settings[SettingsCategoryEnum.UnitConfig] ?? {};

      if (!contractNumber || !contractName || !companyCode) {
        setError(true);
        setMessage(
          'Please set ayala mall details (contract number, company code, etc.) in the admin settings.'
        );
        return;
      }

      setCurrentProcess('Downloading Z Read files...');
      await Promise.all([
        axios.post(`${Endpoints.ACCREDITATION}/ayala/z-report`, {
          settings,
          transactionDate: moment(transactionDate).format('YYYY-MM-DD')
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/hourly-sales-data`, {
          transactionDate,
          settings
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/daily-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/regenerate/new-hourly-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings,
          hour: moment().hour()
        })
      ]);

      await axios.post(`${Endpoints.ACCREDITATION}/ayala/new-daily-sales-data`, {
        transactionDate,
        settings
      });

      await Promise.allSettled([
        axios.post(`${Endpoints.ACCREDITATION}/ayala/resend/new-hourly-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings
        })
      ]);
    } catch (err) {
      setError(true);
      if (err.response.data?.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage('Something went wrong.');
      }
    }
  };

  const generateIcmFilesReport = async () => {
    try {
      await Promise.all([
        axios.post(`${Endpoints.ACCREDITATION}/icm/daily-sales`, {
          settings,
          transactionDate: transactionDate.split(' ')[0]
        }),
        axios.post(`${Endpoints.ACCREDITATION}/icm/hourly-sales`, {
          transactionDate: transactionDate.split(' ')[0],
          settings
        })
      ]);
    } catch (err) {
      setError(true);
      setMessage(err?.response?.data?.message || 'Something went wrong while generating reports.');
    }
  };

  const generateAranetaSalesReport = async () => {
    try {
      const apiData = {
        transactionDate: transactionDate.split(' ')[0],
        settings,
        user
      };

      await axios.post(`${Endpoints.ACCREDITATION}/araneta/z-read`, apiData);
    } catch (err) {
      setError(true);
      setMessage(err?.response?.data?.message || 'Something went wrong while generating reports.');
    }
  };

  const generateEviaSalesReport = async () => {
    try {
      const apiData = {
        transactionDate: transactionDate.split(' ')[0],
        settings,
        user
      };

      await axios.post(`${Endpoints.ACCREDITATION}/evia`, apiData);
    } catch (err) {
      setError(true);
      setMessage(err?.response?.data?.message || 'Something went wrong while generating reports.');
    }
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop} onClose={handleCloseModal}>
      <ModalCard>
        <Typography variant="h6" textAlign="center">
          Terminal's Reading
        </Typography>
        <Box mt={3}>
          {isLoading && !preview && <LinearProgress />}
          {!isLoading && !preview && (
            <Typography>Please make your cash takeout report first</Typography>
          )}
          {preview && (
            <>
              {!isLoading && (
                <>
                  <Typography textAlign="center" mt={1}>
                    Please check the data below before proceeding to prevent duplicate z read.
                  </Typography>
                  <Typography textAlign="center" mt={1}>
                    POS Transaction Date: {posDateData[0]}
                  </Typography>
                  <Typography textAlign="center">
                    Date Today:{' '}
                    {`${todayDate.getFullYear()}-${
                      todayDate.getMonth() + 1 < 10
                        ? `0${todayDate.getMonth() + 1}`
                        : todayDate.getMonth() + 1
                    }-${
                      todayDate.getDate() < 10 ? `0${todayDate.getDate()}` : todayDate.getDate()
                    }`}
                  </Typography>
                </>
              )}
              <Typography textAlign="center" mt={1}>
                {isLoading
                  ? `Processing Reports: ${currentProcess}`
                  : 'Would you like to proceed with Z-Read Report?'}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                sx={{ marginTop: 5 }}
                spacing={3}
              >
                <LoadingButton
                  size="large"
                  variant="contained"
                  loading={isLoading}
                  onClick={() => handleLogZRead()}
                >
                  Yes
                </LoadingButton>
                {!isLoading && (
                  <Button size="large" variant="contained" color="error" onClick={handleCloseModal}>
                    No
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Box>
        <Snackbar open={success} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="success"
            sx={{
              width: '100%',
              backgroundColor: 'green',
              color: '#fff'
            }}
          >
            {message}
          </Alert>
        </Snackbar>
        <Snackbar open={error} autoHideDuration={5000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{
              width: '100%',
              backgroundColor: 'darkred',
              color: '#fff'
            }}
          >
            {message}
          </Alert>
        </Snackbar>
        {previewData && (
          <ZReadReceipt
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
