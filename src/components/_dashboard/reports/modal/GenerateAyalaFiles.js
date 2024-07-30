import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
// utils
import { LoadingButton } from '@mui/lab';
import moment from 'moment';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

// ----------------------------------------------------------------------


const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

GenerateRobinsonFiles.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateRobinsonFiles({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));

  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );
  const initStatus = {
    zRead: {
      status: 'pending',
      message: ''
    },
    dailySales: {
      status: 'pending',
      message: ''
    },
    hourlySales: {
      status: 'pending',
      message: ''
    },
    newDailySales: {
      status: 'pending',
      message: ''
    },
    newHourlySales: {
      status: 'pending',
      message: ''
    },
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [status, setStatus] = useState(initStatus)


  useEffect(() => {
    if (open) {
      setIsError(false)
      setErrorMessage('')
    }
  }, [open])

  const generateAyalaFilesReport = async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      setStatus(initStatus)
      const { contractNumber, contractName, companyCode } = settings[SettingsCategoryEnum.UnitConfig]

      if (!contractNumber || !contractName || !companyCode) {
        setIsError(true)
        setErrorMessage('Please set ayala mall details (contract number, company code, etc.) in the admin settings.')
        return
      }

      const [zResponse, hourlySalesReponse, dailySalesResponse, newDailySalesResponse,] = await Promise.allSettled([
        axios.post(`${Endpoints.ACCREDITATION}/ayala/z-report`, {
          settings,
          transactionDate: moment(transactionDate).format('YYYY-MM-DD')
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/hourly-sales-data`, {
          transactionDate,
          settings,
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/daily-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings,
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/new-daily-sales-data`, {
          transactionDate,
          settings,
        }),
        axios.post(`${Endpoints.ACCREDITATION}/ayala/regenerate/new-hourly-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings,
        })
      ])

      const [resendFilesRes] = await Promise.allSettled([
        axios.post(`${Endpoints.ACCREDITATION}/ayala/resend/new-hourly-sales-data`, {
          transactionDate: moment(transactionDate).format('YYYY-MM-DD'),
          settings,
        })
      ])

      setStatus({
        zRead: {
          status: zResponse.status,
          message: zResponse.status === 'fulfilled' ? zResponse.value?.data?.message : zResponse.reason?.response?.data?.message ?? 'Something went wrong.'
        },
        hourlySales: {
          status: hourlySalesReponse.status,
          message: hourlySalesReponse.status === 'fulfilled' ? hourlySalesReponse.value?.data?.message : hourlySalesReponse.reason?.response?.data?.message ?? 'Something went wrong.'
        },
        dailySales: {
          status: dailySalesResponse.status,
          message: dailySalesResponse.status === 'fulfilled' ? dailySalesResponse.value?.data?.message : dailySalesResponse.reason?.response?.data?.message ?? 'Something went wrong.'
        },
        newDailySales: {
          status: newDailySalesResponse.status,
          message: newDailySalesResponse.status === 'fulfilled' ? newDailySalesResponse.value?.data?.message : newDailySalesResponse.reason?.response?.data?.message ?? 'Something went wrong.'
        },
        newHourlySales: {
          status: resendFilesRes.status,
          message: resendFilesRes.status === 'fulfilled' ? resendFilesRes.value.data.message : resendFilesRes.reason.response.data.message ?? 'Something went wrong.'
        }
      })

    } catch (err) {
      console.log(`Error is `, err)
      if (err.response.data?.message) {
        setIsError(true)
        setErrorMessage(err.response.data.message || err.response?.message)
      } else {
        setIsError(true)
        setErrorMessage('Something went wrong.')
      }
    } finally {
      setTimeout(() => {
        setIsLoading(false)
      }, 5000)
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Generate Ayala Report Files</Typography>
        <Box mt={3}>
          {isLoading ? (
            <>
              <Box>
                <Accordion sx={{ width: '100%' }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Stack direction='row' alignItems={'center'} spacing={1}>
                      {isLoading && <CircularProgress size={20} />}
                      <Typography>Processing Reports</Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ paddingBlock: '1px' }}>
                    <Box ml={5}>
                      <Stack direction='row'>
                        {status.zRead.status === 'rejected' && <CloseIcon sx={{ color: 'red' }} />}
                        {status.zRead.status === 'fulfilled' && <CheckIcon sx={{ color: 'green' }} />}
                        <Typography variant='body1'>Z Read File: {status.zRead.message}</Typography>
                      </Stack>
                      <Stack direction='row'>
                        {status.dailySales.status === 'rejected' && <CloseIcon sx={{ color: 'red' }} />}
                        {status.dailySales.status === 'fulfilled' && <CheckIcon sx={{ color: 'green' }} />}
                        <Typography variant='body1'>Daily Sales: {status.dailySales.message}</Typography>
                      </Stack>
                      <Stack direction='row'>
                        {status.hourlySales.status === 'rejected' && <CloseIcon sx={{ color: 'red' }} />}
                        {status.hourlySales.status === 'fulfilled' && <CheckIcon sx={{ color: 'green' }} />}
                        <Typography variant='body1'>Hourly Sales: {status.hourlySales.message}</Typography>
                      </Stack>
                      <Stack direction='row'>
                        {status.newDailySales.status === 'rejected' && <CloseIcon sx={{ color: 'red' }} />}
                        {status.newDailySales.status === 'fulfilled' && <CheckIcon sx={{ color: 'green' }} />}
                        <Typography variant='body1'>Daily Sales (New): {status.newDailySales.message}</Typography>
                      </Stack>
                      <Stack direction='row'>
                        {status.newHourlySales?.status === 'rejected' && <CloseIcon sx={{ color: 'red' }} />}
                        {status.newHourlySales?.status === 'fulfilled' && <CheckIcon sx={{ color: 'green' }} />}
                        <Typography variant='body1'>Hourly Sales (New): {status.newHourlySales.message}</Typography>
                      </Stack>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="transactionDate"
                  label="Transaction Date"
                  name="transactionDate"
                  type="date"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            onClick={generateAyalaFilesReport}
            loading={isLoading}
          >
            Generate File
          </LoadingButton>
        </Stack>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
