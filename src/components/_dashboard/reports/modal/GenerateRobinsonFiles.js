import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
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
  const { storeCode, tenantId,terminalNumber } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const {robinsonsFTPHost}= settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false)
  const [message, setMessage] = useState('');

  const generateRobinsonsFileReport = async () => {
    setIsError(false)
    setIsSuccess(false)
    setMessage('')
    setIsLoading(true);

    try {
      const res = await axios.get(
        `${Endpoints.ACCREDITATION}/robinson/daily-sales-data/${storeCode}/${transactionDate}`,
        {
          params: {
            tenantId: tenantId,
            terminalNumber: terminalNumber
          }
        }
      );

      if (robinsonsFTPHost) {
        await axios.post(`${Endpoints.ACCREDITATION}/robinson/sendFile`, {
          file: res.data.file,
          settings,
          transactionDate
        })

        setIsSuccess(true)
        setMessage('Sales file successfully sent to RLC server.');
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      setIsError(true);
      if (err.response?.data?.message === 'Something went wrong on sending the files to RLC server.') {
        setMessage('Sales file is not sent to RLC server. Please contact your POS vendor.')
      } else {
        setMessage(err.response?.data?.message)
      }
    } finally {
      setIsLoading(false)
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsSuccess(false)
    setIsError(false);
  };

  useEffect(() => {
    if (open) {
      setIsError(false)
      setIsSuccess(false)
      setMessage('')
    }
  }, [open])

  return (
    <StyledModal
      open={open}
      onClose={() => !isLoading && setOpen(false)}
      BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Generate Robinson Report Files</Typography>
        <Box mt={3}>
          {isLoading ? (
            <Typography textAlign="center" mt={1}>
              Processing Reports . . .
            </Typography>
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
            onClick={generateRobinsonsFileReport}
            loading={isLoading}
          >
            Resend File
          </LoadingButton>
        </Stack>
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
      </ModalCard>
    </StyledModal>
  );
}