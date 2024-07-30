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
  CircularProgress
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

GenerateEVIAFile.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateEVIAFile({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));

  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );

  const [isLoading, ] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (open) {
      setIsError(false);
      setIsSuccess(false);
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [open]);

  const handleGenerateEviaFile = async () => {
    try {
      await axios.post(`${Endpoints.ACCREDITATION}/evia`, {
        transactionDate,
        settings
      });

      setIsSuccess(true);
      setSuccessMessage('Successfully generated EVIA files.');
    } catch (err) {
      console.log(err);
      setIsError(true);
      setErrorMessage(err.reponse?.data?.message || 'Something went wrong on generating the file.');
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
    setIsSuccess(false);
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Generate EVIA Report File</Typography>
        <Box mt={3}>
          {isLoading ? (
            <>
              <Stack direction="row" alignItems={'center'} spacing={1}>
                {isLoading && <CircularProgress size={20} />}
                <Typography>Processing Z Report</Typography>
              </Stack>
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
            loading={isLoading}
            onClick={handleGenerateEviaFile}
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
        <Snackbar open={isSuccess} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="success"
            sx={{ width: '100%', backgroundColor: 'green', color: '#fff' }}
          >
            {successMessage}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
