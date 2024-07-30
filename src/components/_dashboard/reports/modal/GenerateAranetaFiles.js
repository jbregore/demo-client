import { useEffect, useState } from 'react';
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
  Alert,
  CircularProgress, 
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
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
  width: 500
}));

// ----------------------------------------------------------------------

GenerateAranetaFile.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateAranetaFile({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const {user} = JSON.parse(localStorage.getItem('userData'))

  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );

  const [isLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (open) {
      setIsError(false)
      setIsSuccess(false)
      setErrorMessage('')
      setSuccessMessage('')
    }
  }, [open])

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);  
    setIsSuccess(false)
  };

  const handleGenerateZReport = async () => {
    try {
        const apiData = {
            transactionDate,
            settings,
            user
        }

        await Promise.all([
          axios.post(`${Endpoints.ACCREDITATION}/araneta/z-read`, apiData),
          axios.post(`${Endpoints.ACCREDITATION}/araneta/regenerate-daily`, apiData),
        ])

        setIsSuccess(true)
        setSuccessMessage('Successfully created report file.')
    } catch(err) {
        setIsError(true)
        setErrorMessage(err.response?.data?.message ||  'Something went wrong on generating the Z report')
    }
  }

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Generate Araneta Z Report File</Typography>
        <Box mt={3}>
          {isLoading ? (
            <>
            <Stack direction='row' alignItems={'center'} spacing={1}>
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
            onClick={handleGenerateZReport}
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
