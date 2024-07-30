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
  Alert
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';

// ----------------------------------------------------------------------
const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

GenerateSlcl.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateSlcl({ open, setOpen }) {
  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (open) {
      // Reset error message alert on mount
      setIsError(false);
      setErrorMessage('');
    }
  }, [open]);

  const handleGenerateReport = async () => {
    try {
      setIsError(false);
      setIsLoading(true);
      const [clReport, slReport] = await Promise.allSettled([
        axios.get(`${process.env.REACT_APP_API_URL}/reports/sp/cl/${transactionDate}`),
        axios.get(`${process.env.REACT_APP_API_URL}/reports/sp/sl/${transactionDate}`)
      ]);

      // If both SL and CL Reports are created, then call /sp/sl/download endpoint
      if (clReport?.status === 'fulfilled' && slReport?.status === 'fulfilled') {
        if (slReport.value?.status === 204 || clReport.value?.status === 204) {
          setIsError(true);
          setErrorMessage('No SL/CL reports saved in this date.');
          setIsLoading(false);
          return;
        }
      } else {
        setIsError(true);
        setErrorMessage('Something went wrong on creating the SL/CL Files');
        setIsLoading(false);
      }
    } catch (err) {
      setIsError(true);
      setErrorMessage(err.response.data?.message || 'Something went wrong.');
    }

    // Send the SL/CL to server
    try {
      await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/sp/sl/download/${transactionDate}`
      );

      setTimeout(() => {
        setIsLoading(false);
        setOpen(false);
      }, 2000);

    } catch(err) {
      setIsError(true);
      setErrorMessage('SL/CL files saved. Files were not sent to the server.')
      setIsLoading(false);

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
        <Typography variant="h6">Generate SLCL Report</Typography>
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
            onClick={handleGenerateReport}
            loading={isLoading}
          >
            Generate Report
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
