import { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import axios from 'axios';
import { Icon } from '@iconify/react';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Modal,
  Stack,
  Typography,
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Snackbar,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
// context
import { AuthContext } from '../../../../shared/context/AuthContext';
import { capitalCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
import timestamp from 'time-stamp';
import uniqid from 'uniqid';
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';
import { useNavigate } from 'react-router-dom';
import { MallAccrEnum, SettingsCategoryEnum } from '../../../../enum/Settings';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1500,
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
  width: 450
}));

// ----------------------------------------------------------------------

OutOfSyncWarning.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function OutOfSyncWarning({ open, setOpen }) {
  const [isLoading, setIsLoading] = useState(false);
  const robinsonsFiles = useRef([]);
  const [currentProcess, setCurrentProcess] = useState({
    current: 'cashTakeout',
    currentMessage: ''
  });
  const [status, setStatus] = useState({
    initialCash: {
      finished: false,
      details: []
    },
    cashTakeout: {
      finished: false,
      details: []
    },
    xRead: {
      finished: false,
      details: []
    },
    zRead: {
      finished: false,
      details: []
    }
  });

  const [currentEodProcess, setCurrentEodProcess] = useState('');
  const [oneDayEod, setOneDayEod] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [finished, setFinished] = useState(false);

  const auth = useContext(AuthContext);
  const settings = JSON.parse(localStorage.getItem('settings'));
  const {
    storeCode,
    mwcSalesTypeCode,
    tenantId,
    mallAccr,
    terminalNumber,
    robinsonsFTPHost,
    nonVat
  } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const sysDate = localStorage.getItem('systemDate');
  const posDateExceed = moment(localStorage.getItem('transactionDate')).isAfter(
    moment(sysDate),
    'date'
  );
  const userData = JSON.parse(localStorage.getItem('userData'));
  const supervisorData = JSON.parse(localStorage.getItem('supervisor'));
  const online = useNetwork();
  const navigate = useNavigate();
  let closable = false;

  const handleOutOfSync = () => {
    localStorage.setItem('outOfSyncWarning', false);
    setOpen(false);
  };

  const sendRobinsonsFiles = async () => {
    try {
      if (!robinsonsFTPHost) return;
      setCurrentProcess({
        current: 'zRead',
        currentMessage: 'Sending Robinsons Files to RLC server...'
      });
      await axios.post(`${Endpoints.ACCREDITATION}/robinson/sendBatchFiles`, {
        files: robinsonsFiles.current,
        settings
      });
      setIsSuccess(true);
      setMessage('Sales file successfully sent to RLC server.');
    } catch (err) {
      // Robinsons file not sent
      setIsError(true);
      setMessage('Sales file is not sent to RLC server. Please contact your POS vendor.');
    }
  };

  const generateRobinsonSalesReport = async (posDate) => {
    const zReadLogs = status.zRead.details;

    return new Promise(async (resolve, reject) => {
      try {
        setCurrentProcess({
          current: 'zRead',
          currentMessage: 'Downloading report file to local file system...'
        });
        const res = await axios.get(
          `${Endpoints.ACCREDITATION}/robinson/daily-sales-data/${storeCode}/${moment(
            posDate
          ).format('YYYY-MM-DD')}`,
          {
            params: {
              tenantId: tenantId,
              terminalNumber: terminalNumber
            }
          }
        );

        if (res?.data?.file) {
          zReadLogs.push({ message: 'Report file downloaded.', success: true });
          robinsonsFiles.current.push({ file: res.data.file, transactionDate: posDate });
          resolve(true);
        }
        // eslint-disable-next-line no-empty
      } catch (err) {
        zReadLogs.push({ message: 'Report file not downloaded.', success: false });
        reject(err);
      }
    });
  };

  const generateAyalaFilesReport = async (posDate) => {
    const zReadLogs = status.zRead.details;
    try {
      const { contractNumber, contractName, companyCode } =
        settings[SettingsCategoryEnum.CompanyInfo] ?? {};

      if (!contractNumber || !contractName || !companyCode) {
        zReadLogs.push({
          message: 'Please set ayala mall details in admin settings.',
          success: false
        });
        return;
      }

      setCurrentProcess({ current: 'zRead', currentMessage: 'Downloading Z Read files...' });
      zReadLogs.push({ message: 'Added Z Read to previews.', success: true });
      await Promise.all([
        axios.post(`${Endpoints.REPORTS}/ayala/z-report`, {
          settings,
          transactionDate: moment(posDate).format('YYYY-MM-DD')
        }),
        axios.post(`${Endpoints.REPORTS}/ayala/hourly-sales-data`, {
          transactionDate: posDate,
          settings
        }),
        axios.post(`${Endpoints.REPORTS}/ayala/daily-sales-data`, {
          transactionDate: moment(posDate).format('YYYY-MM-DD'),
          settings
        }),
        axios.post(`${Endpoints.REPORTS}/ayala/new-daily-sales-data`, {
          transactionDate: posDate,
          settings
        }),
        axios.post(`${Endpoints.REPORTS}/ayala/regenerate/new-hourly-sales-data`, {
          transactionDate: moment(posDate).format('YYYY-MM-DD'),
          settings,
          hour: moment().hour()
        })
      ]);

      zReadLogs.push({ message: 'Downloaded Z Read files.', success: true });

      await Promise.allSettled([
        axios.post(`${Endpoints.REPORTS}/ayala/resend/new-hourly-sales-data`, {
          transactionDate: moment(posDate).format('YYYY-MM-DD'),
          settings
        })
      ]);
    } catch (err) {
      zReadLogs.push({ message: 'Failed to download z read files.', success: false });
    } finally {
      setStatus((prevState) => ({
        ...prevState,
        zRead: {
          details: zReadLogs,
          finished: true
        }
      }));
      setCurrentProcess({ current: '', currentMessage: '' });
    }
  };

  const generateMwcSalesReport = async (posDate) => {
    const zReadLogs = status.zRead.details;

    try {
      setCurrentProcess({ current: 'zRead', currentMessage: 'Downloading Megaworld files...' });
      await axios.get(
        `${Endpoints.ACCREDITATION}/mwc/daily-sales-data/${storeCode}/${moment(
          new Date(posDate)
        ).format('YYYY-MM-DD')}`,
        {
          params: {
            tenantId: tenantId,
            terminalNumber: terminalNumber,
            salesTypeCode: mwcSalesTypeCode
          }
        }
      );

      zReadLogs.push({ message: 'Downloaded Megaworld files.', success: false });
      // eslint-disable-next-line no-empty
    } catch (err) {
      zReadLogs.push({ message: 'Failed to download Megaworld files.', success: false });
    } finally {
      setStatus((prevState) => ({
        ...prevState,
        zRead: {
          details: zReadLogs,
          finished: true
        }
      }));
      setCurrentProcess({ current: '', currentMessage: '' });
    }
  };

  const generateAranetaSalesReport = async (posDate) => {
    const zReadLogs = status.zRead.details;

    try {
      const apiData = {
        transactionDate: moment(posDate).format('YYYY-MM-DD'),
        settings,
        user: userData.user
      };

      await axios.post(`${Endpoints.ACCREDITATION}/araneta/z-read`, apiData);
    } catch (err) {
      zReadLogs.push({ message: 'Failed to save Araneta sales report file.', success: false });
    } finally {
      setStatus((prevState) => ({
        ...prevState,
        zRead: {
          details: zReadLogs,
          finished: true
        }
      }));
      setCurrentProcess({ current: '', currentMessage: '' });
    }
  };

  const handleInitialCash = async (posDate) => {
    return new Promise(async (resolve, reject) => {
      const initialCashLogs = status.initialCash.details;
      try {
        if (mallAccr === MallAccrEnum.Robinson) {
          // Create a robinson log for simulating login
          await axios.post(
            `${Endpoints.ACCREDITATION}/robinson/logs`,
            {
              storeCode,
              transactionDate: moment(posDate).format('YYYY-MM-DD')
            },
            {
              withCredentials: true
            }
          );
        }

        const posDateData = posDate.split(' ');
        const todayDate = new Date();
        const transactionDate = `${
          posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;
        const storedData = JSON.parse(localStorage.getItem('userData'));

        const total = 0;
        const totalWithDecimal = total.toFixed(2);

        const posTransaction = {
          amount: totalWithDecimal,
          employeeId: storedData.user.employeeId,
          storeCode,
          type: 'initial cash',
          transactionDate
        };

        const activityLog = {
          firstname: storedData.user.firstname,
          lastname: storedData.user.lastname,
          employeeId: storedData.user.employeeId,
          activity: 'Cash Report',
          description: {
            user: {
              firstname: capitalCase(storedData.user.firstname),
              lastname: capitalCase(storedData.user.lastname)
            },
            total: fCurrency('P', total)
          },
          action: 'Initial Cash',
          storeCode,
          activityDate: `${
            posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const cashReport = {
          peso1000: 0,
          peso500: 0,
          peso200: 0,
          peso100: 0,
          peso50: 0,
          peso20: 0,
          peso10: 0,
          peso5: 0,
          peso1: 0,
          cent25: 0,
          cent10: 0,
          cent05: 0,
          cent01: 0,
          employeeId: storedData.user.employeeId,
          cashierFirstName: storedData.user.firstname,
          cashierLastName: storedData.user.lastname,
          shift: 'OPENING',
          branchCode: storeCode,
          cashDate: transactionDate,
          realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss'),
          isNonVat: false
        };

        const initialCash = {
          ...cashReport,
          cashDate: transactionDate,
          realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
        };

        const previewData = {
          type: 'initial cash',
          storeCode,
          transactionDate,
          data: {
            cashReport: {
              ...cashReport,
              isNonVat: nonVat,
              cashDate: transactionDate,
              realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
            },
            total
          }
        };

        const payload = {
          posTransaction,
          activityLog,
          initialCash,
          previewData,
          fromOutofSync: true
        };

        setCurrentProcess({
          current: 'initialCash',
          currentMessage: 'Adding Initital Cash...'
        });

        const addPreviewRes = await axios.post(`${Endpoints.REPORTS}/initial`, payload, {
          withCredentials: true
        });

        initialCashLogs.push({
          message: 'Added Initital Cash to previews',
          success: addPreviewRes.data ? true : false
        });

        resolve(true);
      } catch (err) {
        initialCashLogs.push({
          message:
            err.response?.message ||
            err.response?.data?.message ||
            'Something went wrong on generating Initial Cash.',
          success: false
        });

        // reject(err)
      } finally {
        setStatus((prevState) => ({
          ...prevState,
          initialCash: {
            details: initialCashLogs,
            finished: true
          }
        }));

        resolve(true);
      }
    });
  };

  const handleCashTakeout = async (posDate) => {
    return new Promise(async (resolve, reject) => {
      const cashTakeoutLogs = status.cashTakeout.details;
      try {
        const { user } = userData;
        const posDateData = posDate.split(' ');
        const todayDate = new Date();
        const transactionDate = `${
          posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;

        // Open drawer
        if (!settings[SettingsCategoryEnum.UnitConfig].devMode) {
          await axios.post(
            `${Endpoints.REPORTS}/open-drawer`,
            { settings },
            { withCredentials: true }
          );
        }

        const userCashInitialRes = await axios.get(
          `${Endpoints.REPORTS}/initial/user-log/${user.employeeId}/${posDate}`
        );

        const userInitialCashData = userCashInitialRes.data.data;
        const defaultValues = {
          peso1000: 0,
          peso500: 0,
          peso200: 0,
          peso100: 0,
          peso50: 0,
          peso20: 0,
          peso10: 0,
          peso5: 0,
          peso1: 0,
          cent25: 0,
          cent10: 0,
          cent05: 0,
          cent01: 0,
          employeeId: user.employeeId,
          cashierFirstName: user.firstname,
          cashierLastName: user.lastname,
          shift: userInitialCashData?.shift || 'OPENING',
          branchCode: storeCode,
          dateTime: '04-25-2022 - 11:50pm' // it's just temporary
        };

        const totalCount = {
          peso1000Total: 0,
          peso500Total: 0,
          peso200Total: 0,
          peso100Total: 0,
          peso50Total: 0,
          peso20Total: 0,
          peso10Total: 0,
          peso5Total: 0,
          peso1Total: 0,
          cent25Total: 0,
          cent10Total: 0,
          cent05Total: 0,
          cent01Total: 0
        };

        const total = Object.values(totalCount).reduce((a, b) => a + b, 0);
        const totalWithDecimal = total.toFixed(2);

        const posTransaction = {
          amount: totalWithDecimal,
          employeeId: user.employeeId,
          storeCode,
          type: 'cash takeout',
          transactionDate
        };

        const activityLog = {
          firstname: user.firstname,
          lastname: user.lastname,
          employeeId: user.employeeId,
          activity: 'Cash Report',
          description: {
            user: {
              firstname: capitalCase(user.firstname),
              lastname: capitalCase(user.lastname)
            },
            total: fCurrency('P', total)
          },
          action: 'Cash Takeout',
          storeCode,
          activityDate: `${
            posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const cashTakeout = {
          ...defaultValues,
          isNonVat: nonVat,
          cashDate: transactionDate,
          realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
        };

        const previewData = {
          type: 'cash takeout',
          storeCode,
          transactionDate,
          data: {
            cashReport: {
              ...defaultValues,
              isNonVat: nonVat,
              cashDate: transactionDate,
              realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
            },
            total
          }
        };

        const payload = {
          posTransaction,
          activityLog,
          cashTakeout,
          previewData,
          fromOutofSync: true
        };

        const addPreviewRes = await axios.post(`${Endpoints.REPORTS}/takeout`, payload, {
          withCredentials: true
        });

        cashTakeoutLogs.push({
          message: 'Added Cash Takeout to previews',
          success: addPreviewRes.data ? true : false
        });

        resolve(true);
      } catch (err) {
        cashTakeoutLogs.push({
          message:
            err.response?.message ||
            err.response?.data?.message ||
            'Something went wrong on generating Cash Takeout.',
          success: false
        });

        // reject(err)
      } finally {
        setStatus((prevState) => ({
          ...prevState,
          cashTakeout: {
            details: cashTakeoutLogs,
            finished: true
          }
        }));

        resolve(true);
      }
    });
  };

  const handleXRead = async (posDate) => {
    return new Promise(async (resolve, reject) => {
      const xReadLogs = status.xRead.details;
      try {
        const { user } = userData;
        // Get User logs data
        const userLogsRes = await axios.get(
          `${Endpoints.LOGIN}/logs/${user.employeeId}/${localStorage.getItem('transactionDate')}`
        );

        const todayDate = new Date();
        const timeFrom = userLogsRes?.data?.realtimeLogs
          ? moment(userLogsRes.data.realtimeLogs)?.format('YYYY-MM-DD HH:mm:ss')
          : moment(todayDate).format('YYYY-MM-DD HH:mm:ss');
        const timeTo = moment(todayDate).format('YYYY-MM-DD HH:mm:ss');

        // Get X-Read Data
        const xReadDataRes = await axios.get(
          `${Endpoints.REPORTS}/x-read/${posDate}/${user.employeeId}/${storeCode}/${
            timeFrom.split(' ')[1]
          }/${timeTo.split(' ')[1]}`
        );

        const xReadData = xReadDataRes.data.data;
        xReadData.timeFrom = timeFrom;
        xReadData.timeTo = timeTo;
        xReadData.isNonVat = nonVat;

        let transactionDate = posDate.split(' ');
        transactionDate = `${
          transactionDate[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;
        const txnNumber = `${storeCode}-${timestamp('YYYYMMDDHHmmss')}`;

        const previewPayload = {
          txnNumber,
          type: 'x-read',
          storeCode: storeCode,
          transactionDate,
          data: {
            xReadData,
            realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss'),
            cashier: {
              id: user.employeeId,
              firstname: user.firstname,
              lastname: user.lastname,
              role: user.role,
              shiftFrom: xReadData.timeFrom,
              shiftTo: xReadData.timeTo
            }
          }
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
          activityDate: `${
            posDate.split(' ')[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const xReadLogPayload = {
          reportReadLogId: uniqid(storeCode),
          cashierId: user.employeeId,
          storeCode: storeCode,
          type: 'x-read',
          readDate: `${
            posDate.split(' ')[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const payload = {
          previewPayload,
          activityPayload,
          xReadLogPayload,
          fromOutofSync: true
        };

        const xReadCreateLogRes = await axios.post(`${Endpoints.REPORTS}/x-read/generate`, payload);

        xReadLogs.push({
          message: 'X-Read Complete',
          success: xReadCreateLogRes.data ? true : false
        });

        localStorage.setItem('isXRead', true);
        setStatus((prevState) => ({
          ...prevState,
          xRead: {
            details: xReadLogs,
            finished: true
          }
        }));

        resolve(true);
      } catch (err) {
        xReadLogs.push({
          message:
            err.response?.message ||
            err.response?.data?.message ||
            'Something went wrong on processing X-Read',
          success: false
        });
        // reject(err)
      } finally {
        setStatus((prevState) => ({
          ...prevState,
          xRead: {
            details: xReadLogs,
            finished: true
          }
        }));

        resolve(true);
      }
    });
  };

  const handleZRead = async (posDate) => {
    return new Promise(async (resolve, reject) => {
      const zReadLogs = status.xRead.details;
      try {
        const { user } = userData;
        const zReadLogs = status.zRead.details;

        // Get User Log
        const userLogs = await axios.get(
          `${Endpoints.LOGIN}/logs/${user.employeeId}/${localStorage.getItem('transactionDate')}`
        );

        const todayDate = new Date();
        const timeFrom = userLogs?.data?.realtimeLogs
          ? moment(userLogs.data.realtimeLogs)?.format('YYYY-MM-DD HH:mm:ss')
          : moment(todayDate).format('YYYY-MM-DD HH:mm:ss');
        const timeTo = moment(todayDate).format('YYYY-MM-DD HH:mm:ss');

        // Fetch Z-Read Data
        const zReadRes = await axios.get(`${Endpoints.REPORTS}/z-read/${storeCode}/${posDate}`);
        const zReadData = zReadRes.data.data;
        zReadData.supervisor = supervisorData || {
          firstname: '',
          lastname: '',
          remarks: ''
        };
        zReadData.timeFrom = timeFrom;
        zReadData.timeTo = timeTo;

        let transactionDate = posDate.split(' ');
        transactionDate = `${
          transactionDate[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;
        const txnNumber = `${storeCode}-${timestamp('YYYYMMDDHHmmss')}`;

        zReadData.isNonVat = nonVat;

        // Add z-read to previews
        const previewPayload = {
          txnNumber,
          type: 'z-read',
          storeCode: storeCode,
          transactionDate: transactionDate,
          data: {
            zReadData,
            realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss'),
            cashier: {
              id: user.employeeId,
              firstname: user.firstname,
              lastname: user.lastname,
              role: user.role,
              shiftFrom: zReadData.timeFrom,
              shiftTo: zReadData.timeTo
            }
          }
        };

        const activityPayload = {
          firstname: user.firstname,
          lastname: user.lastname,
          employeeId: user.employeeId,
          activity: 'Sales Report',
          description: `${capitalCase(user.firstname)} ${capitalCase(
            user.lastname
          )} did an Z Read report.`,
          action: 'Z Read',
          storeCode,
          activityDate: `${
            posDate.split(' ')[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const zReadLogPayload = {
          reportReadLogId: uniqid(storeCode),
          cashierId: user.employeeId,
          storeCode: storeCode,
          type: 'z-read',
          readDate: `${
            posDate.split(' ')[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const payload = {
          previewPayload,
          activityPayload,
          zReadLogPayload,
          fromOutofSync: true
        };

        const zReadCreateLogRes = await axios.post(`${Endpoints.REPORTS}/z-read/generate`, payload);

        zReadLogs.push({ message: 'Z-Read Complete', success: zReadCreateLogRes.data ? true : false });

        localStorage.setItem('isZRead', true);
        switch (mallAccr) {
          case MallAccrEnum.Robinson:
            await generateRobinsonSalesReport(posDate);
            break;

          case MallAccrEnum.Ayala:
            generateAyalaFilesReport(posDate);
            break;

          case MallAccrEnum.MegaWorld:
            generateMwcSalesReport(posDate);
            break;

          case MallAccrEnum.Araneta:
            generateAranetaSalesReport(posDate);
            break;

          default:
            setStatus((prevState) => ({
              ...prevState,
              zRead: {
                details: zReadLogs,
                finished: true
              }
            }));
            setCurrentProcess({ current: '', currentMessage: '' });
        }

        resolve(true);
      } catch (err) {
        zReadLogs.push({
          message:
            err.response?.message ||
            err.response?.data?.message ||
            'Something went wrong on processing X-Read',
          success: false
        });
        // reject(err)
      }finally {
        setStatus((prevState) => ({
          ...prevState,
          zRead: {
            details: zReadLogs,
            finished: true
          }
        }));

        resolve(true);
      }
    });
  };

  const handleQuickEod = async (posDate, oneDay = true) => {
    try {
      if (oneDay) {
        setIsSuccess(false);
        setIsError(false);
        setIsLoading(true);
        setFinished(false);
        setCurrentEodProcess(`Processing EOD for ${moment(posDate).format('ll')}`);
      }

      await handleInitialCash(posDate);
      await handleCashTakeout(posDate);
      await handleXRead(posDate);
      await handleZRead(posDate);

      if (oneDay) {
        mallAccr === MallAccrEnum.Robinson && (await sendRobinsonsFiles());
        setIsLoading(false);
        setFinished(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleIncrementalEod = async () => {
    try {
      setIsSuccess(false);
      setIsError(false);
      setIsLoading(true);
      setFinished(false);
      const dates = [];
      let currentPosDate = moment(localStorage.getItem('transactionDate'));

      while (currentPosDate.format('YYYY-MM-DD') !== moment(sysDate).format('YYYY-MM-DD')) {
        dates.push(moment(currentPosDate).format('YYYY-MM-DD HH:mm:ss'));
        currentPosDate = moment(currentPosDate).add(1, 'day');
      }

      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
      for (const date of dates) {
        setCurrentEodProcess(`Processing EOD for ${moment(date).format('ll')}`);
        await handleQuickEod(date, false);
        await delay(500);
      }

      setCurrentEodProcess(`Sending files to RLC Server...`);
      mallAccr === MallAccrEnum.Robinson && (await sendRobinsonsFiles());
      setCurrentEodProcess(`Finished processing EOD.`);

      setIsLoading(false);
      setFinished(true);
    } catch (err) {
      navigate('/app/reports');
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
    setIsSuccess(false);
  };

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <StyledModal
      open={open}
      onClose={() => {
        if (closable) {
          if (isLoading || posDateExceed) return;
          handleOutOfSync();
        } else {
          return;
        }
      }}
      BackdropComponent={Backdrop}
    >
      <ModalCard>
        {!posDateExceed && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Icon
              icon="mdi:close"
              color="red"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (closable) {
                  if (isLoading) return;
                  handleOutOfSync();
                }
              }}
            />
          </Box>
        )}

        <Typography variant="h5" textAlign="center">
          Warning: Date is Out of Sync
        </Typography>

        <Box mt={2} textAlign="center">
          <Grid container>
            <Grid item xs={6}>
              <Typography variant="h6">POS Date</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">System Date</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>
                {moment(localStorage.getItem('transactionDate')).format('YYYY-MM-DD')}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{moment(sysDate).format('YYYY-MM-DD')}</Typography>
            </Grid>
          </Grid>
        </Box>
        <Box mt={1}>
          {!finished && (
            <Typography textAlign="center">Previous day’s EOD was not performed</Typography>
          )}
          {finished && <Typography textAlign="center">Finished processing EOD.</Typography>}
        </Box>

        {!posDateExceed &&
          (isLoading ? (
            oneDayEod ? (
              <Box mt={1}>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Stack direction="row" alignItems={'center'} spacing={1}>
                      {!status.initialCash.finished && <CircularProgress size={20} />}
                      <Typography>
                        Initial Cash
                        {!status.initialCash.finished &&
                          currentProcess.current === 'initialCash' &&
                          `: ${currentProcess.currentMessage}`}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ paddingBlock: '1px' }}>
                    {status.initialCash.details.map((detail, index) => (
                      <Stack direction={'row'} key={`InitialCash${index}`}>
                        {detail.success ? (
                          <CheckIcon sx={{ color: 'green' }} />
                        ) : (
                          <CloseIcon sx={{ color: 'red' }} />
                        )}
                        <Typography variant="body2" m={0}>
                          {detail.message}
                        </Typography>
                      </Stack>
                    ))}
                  </AccordionDetails>
                </Accordion>

                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Stack direction="row" alignItems={'center'} spacing={1}>
                      {!status.cashTakeout.finished && <CircularProgress size={20} />}
                      <Typography>
                        Cash Takeout
                        {!status.cashTakeout.finished &&
                          currentProcess.current === 'cashTakeout' &&
                          `: ${currentProcess.currentMessage}`}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ paddingBlock: '1px' }}>
                    {status.cashTakeout.details.map((detail, index) => (
                      <Stack direction={'row'} key={`CashTakeout${index}`}>
                        {detail.success ? (
                          <CheckIcon sx={{ color: 'green' }} />
                        ) : (
                          <CloseIcon sx={{ color: 'red' }} />
                        )}
                        <Typography variant="body2" m={0}>
                          {detail.message}
                        </Typography>
                      </Stack>
                    ))}
                  </AccordionDetails>
                </Accordion>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Stack direction="row" alignItems={'center'} spacing={1}>
                      {!status.xRead.finished && <CircularProgress size={20} />}
                      <Typography>
                        X-Read
                        {!status.xRead.finished &&
                          currentProcess.current === 'xRead' &&
                          `: ${currentProcess.currentMessage}`}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {status.xRead.details.map((detail, index) => (
                      <Stack direction={'row'} key={`XRead${index}`}>
                        {detail.success ? (
                          <CheckIcon sx={{ color: 'green' }} />
                        ) : (
                          <CloseIcon sx={{ color: 'red' }} />
                        )}
                        <Typography variant="body2" m={0}>
                          {detail.message}
                        </Typography>
                      </Stack>
                    ))}
                  </AccordionDetails>
                </Accordion>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                  >
                    <Stack direction="row" alignItems={'center'} spacing={1}>
                      {!status.zRead.finished && <CircularProgress size={20} />}
                      <Typography>
                        Z-Read
                        {!status.zRead.finished &&
                          currentProcess.current === 'zRead' &&
                          `: ${currentProcess.currentMessage}`}
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {status.zRead.details.map((detail, index) => (
                      <Stack direction={'row'} key={`ZRead${index}`}>
                        {detail.success ? (
                          <CheckIcon sx={{ color: 'green' }} />
                        ) : (
                          <CloseIcon sx={{ color: 'red' }} />
                        )}
                        <Typography variant="body2" m={0}>
                          {detail.message}
                        </Typography>
                      </Stack>
                    ))}
                  </AccordionDetails>
                </Accordion>
              </Box>
            ) : (
              <Stack direction="row" justifyContent="center" alignItems={'center'} spacing={1}>
                <CircularProgress size={15} />
                <Typography textAlign="center">{currentEodProcess}</Typography>
              </Stack>
            )
          ) : (
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center" mt={3}>
              {!finished && (
                <>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => {
                      setOneDayEod(true);
                      handleQuickEod(localStorage.getItem('transactionDate'));
                    }}
                  >
                    Process EOD
                  </Button>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => {
                      setOneDayEod(false);
                      handleIncrementalEod();
                    }}
                  >
                    Simulate EOD To Current Date
                  </Button>
                </>
              )}
              <Button variant="contained" color="error" onClick={auth.logout} disabled={isLoading}>
                Logout
              </Button>
            </Stack>
          ))}

        {posDateExceed && (
          <>
            <Typography textAlign="center" mt={2}>
              POS Date is currently above System Date. Please synchronize the two dates.
            </Typography>
            <Stack direction="row" spacing={3} alignItems="center" justifyContent="center" mt={3}>
              <Button variant="contained" color="error" onClick={auth.logout} disabled={isLoading}>
                Logout
              </Button>
            </Stack>
          </>
        )}

        {mallAccr === MallAccrEnum.Robinson && (
          <>
            <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
              <Alert
                onClose={handleCloseError}
                severity="error"
                sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
              >
                {message}
              </Alert>
            </Snackbar>
            <Snackbar open={isSuccess} autoHideDuration={3000} onClose={handleCloseError}>
              <Alert
                onClose={handleCloseError}
                severity="success"
                sx={{ width: '100%', backgroundColor: 'green', color: '#fff' }}
              >
                {message}
              </Alert>
            </Snackbar>
          </>
        )}
      </ModalCard>
    </StyledModal>
  );
}
