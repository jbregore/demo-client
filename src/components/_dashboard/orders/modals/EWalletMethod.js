import { useState } from 'react';
import PropTypes from 'prop-types';
// material
import { Grid, TextField, Snackbar, Alert, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

EWalletMethod.propTypes = {
  setOpen: PropTypes.func.isRequired,
  type: PropTypes.string
};

// ----------------------------------------------------------------------

export default function EWalletMethod({ setOpen, type }) {
  const state = store.getState();
  const { cart } = state;

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const [inputValues, setInputValues] = useState({
    eType: type || '',
    amount: roundUpAmount(cart.amounts.amountDue),
    refNumber: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = () => {
    const totalInput = roundUpAmount(cart.amounts.amountDue);
    const changeInput =
      Number(inputValues.amount) >= totalInput ? Number(inputValues.amount) - totalInput : 0;

    store.dispatch(setCashChange(changeInput));
  };

  const handleAddPayment = () => {
    setIsLoading(true);

    if (inputValues.amount === 0 || inputValues.eType === '') {
      setErrorMessage('Please enter all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    handleChange();

    const { amount, refNumber } = inputValues;
    const paymentData = {
      amount,
      eType: type,
      refNumber
    };

    store.dispatch(addPayment('e-wallet', paymentData));
    store.dispatch(updateAmounts());

    setIsLoading(true);
    setOpen(false);

    return true;
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Total Amount Due"
            disabled={cart.confirmOrders.length === 0}
            value={
              cart.amounts.amountDue !== 0
                ? fCurrency('', roundUpAmount(cart.amounts.amountDue))
                : cart.amounts.amountDue
            }
            type="text"
            InputProps={{ readOnly: true }}
          />
        </Grid>
        {
          !type && (
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="E-Wallet Type"
                disabled={cart.confirmOrders.length === 0}
                value={inputValues.eType}
                onChange={(e) => setInputValues({ ...inputValues, eType: e.target.value })}
              >
                <MenuItem value="gcash">GCash</MenuItem>
                <MenuItem value="maya">Maya</MenuItem>
              </TextField>
            </Grid>
          )
        }
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Payment Amount"
            type="number"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.amount}
            onChange={(e) => setInputValues({ ...inputValues, amount: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reference Number"
            type="text"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.refNumber}
            onChange={(e) => setInputValues({ ...inputValues, refNumber: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} textAlign="right">
          <LoadingButton
            variant="contained"
            size="large"
            disabled={cart.confirmOrders.length === 0}
            sx={{ minWidth: 150 }}
            loading={isLoading}
            onClick={() => handleAddPayment()}
          >
            Enter
          </LoadingButton>
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
      </Grid>
    </>
  );
}
