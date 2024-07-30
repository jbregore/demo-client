import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { Alert, Box, Grid, Snackbar, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

RmesMethod.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function RmesMethod({ setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const state = store.getState();
  const { cart } = state;

  const [siNumber, setSiNumber] = useState('');
  const [origTransactionDate, setOrigTransactionDate] = useState('');
  const [rmesAmount, setRmesAmount] = useState(0);
  const [remainingBal, setRemainingBal] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAttachRmes = () => {
    setIsLoading(true);

    if (rmesAmount !== 0 && origTransactionDate !== '' && siNumber !== '') {
      const paymentData = { rmesAmount, remainingBal, origTransactionDate, siNumber };

      store.dispatch(addPayment('rmes', paymentData));
      store.dispatch(setCashChange(remainingBal));
      store.dispatch(updateAmounts());

      setIsLoading(true);
      setOpen(false);
      setRmesAmount(0);
    } else {
      setIsError(true);
      setErrorMessage('Please input SI Number');
      setIsLoading(false);
    }
  };

  const handleCheckSINumber = async () => {
    setIsLoading(true);

    if (siNumber) {
      try {
        const apiData = {
          siNumber,
          storeCode: settings.unitConfiguration.storeCode
        };

        const res = await axios.get(
          `${Endpoints.TRANSACTION}/return/item`,
          { params: apiData },
          {
            credentials: true
          }
        );


        const data = res?.data?.data;

        if (data) {
          const cartAmountDue = Number(cart.amounts.amountDue.toFixed(3)).toFixed(2);
          const redemptionAmount = Number(parseFloat(Math.abs(data.amount)).toFixed(3)).toFixed(2);
          const balance = cartAmountDue - redemptionAmount;

          setOrigTransactionDate(data.transactionDate);
          setRmesAmount(redemptionAmount);
          setRemainingBal(balance > 0 ? balance : 0);
        } else {
          setIsError(true);
          setErrorMessage('Invalid SI Number');
        }

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setIsError(true);
        console.log(err);
        setErrorMessage(err.response.data.message);
      }
    } else {
      setIsError(true);
      setErrorMessage('Please input SI Number');
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
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction="row" flexWrap="nowrap">
              <TextField
                autoFocus
                fullWidth
                label="SI Number"
                value={siNumber}
                onChange={(e) => setSiNumber(e.target.value)}
              />
              <LoadingButton
                variant="outlined"
                disabled={cart.confirmOrders.length === 0}
                sx={{ minWidth: 120, ml: 2 }}
                loading={isLoading}
                onClick={handleCheckSINumber}
              >
                Apply
              </LoadingButton>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Total Amount Due"
              disabled={cart.confirmOrders.length === 0}
              value={
                cart.amounts.amountDue !== 0
                  ? fCurrency('', Number(cart.amounts.amountDue.toFixed(3)).toFixed(2))
                  : cart.amounts.amountDue
              }
              type="text"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Exchange Amount"
              value={rmesAmount}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Remaining balance"
              value={remainingBal}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} textAlign="right">
            <LoadingButton
              variant="contained"
              size="large"
              disabled={cart.confirmOrders.length === 0}
              sx={{ minWidth: 150 }}
              loading={isLoading}
              onClick={handleAttachRmes}
            >
              Enter
            </LoadingButton>
          </Grid>
        </Grid>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}
