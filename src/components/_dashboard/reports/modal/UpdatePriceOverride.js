import { useState } from 'react';
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

UpdatePriceOverride.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function UpdatePriceOverride({ open, setOpen }) {
  const transactionDate = localStorage.getItem('transactionDate');

  const [selectedDate, setselectedDate] = useState(transactionDate.split(' ')[0]);

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFixData = async () => {
    setIsLoading(true);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/script/price-override/incorrect/${selectedDate}`
      );

      if (res.data.data === 'success') {
        setTimeout(() => {
          setIsLoading(false);
          setIsError(false);
          setOpen(false);
        }, 3000);
      }
    } catch (err) {
      setErrorMessage(err.response.data?.message);
      setIsError(true);
      setIsLoading(false);
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Fix Price Override Data</Typography>
        <Box mt={3}>
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
                value={selectedDate}
                onChange={(e) => setselectedDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleFixData}
          >
            Update
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
