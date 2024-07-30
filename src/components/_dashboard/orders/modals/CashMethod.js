import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// material
import { Alert, Box, Grid, Snackbar, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

CashMethod.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CashMethod({ setOpen }) {
  const state = store.getState();
  const { cart } = state;

  const [cash, setCash] = useState(0);
  const [change, setChange] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const computeChange = () => {
      const computeChange = cart.amounts.withPayment - cart.amounts.noPayment;

      if (computeChange >= 0) {
        setChange(computeChange < 1 ? 0 : computeChange.toFixed(2));
      }
    };

    computeChange();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto calculate change
  const handleCashInput = (evt) => {
    const cashInput = evt.target.value === '' ? '' : Number(evt.target.value);
    const roundUp = Number(cart.amounts.amountDue.toFixed(3)).toFixed(2);
    const totalInput = Number(roundUp);
    const changeInput = cashInput >= totalInput ? cashInput - totalInput : 0;

    setCash(cashInput);
    setChange(changeInput.toFixed(2));
  };

  const handleAddPayment = () => {
    setIsLoading(true);

    if (cash === 0) {
      if (cart.amounts.amountDue !== 0) {
        setErrorMessage('Please enter a cash for payment.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }
    }

    const paymentData = { cash };

    store.dispatch(addPayment('cash', paymentData));
    store.dispatch(updateAmounts());
    store.dispatch(setCashChange(change));

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
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              autoFocus
              label="Cash"
              value={cash}
              type="number"
              disabled={cart.confirmOrders.length === 0}
              onChange={handleCashInput}
              InputProps={{ readOnly: cart.amounts.amountDue < 1 }}
              onFocus={(evt) => evt.target.select()}
            />
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
            <TextField fullWidth label="Change" value={change} InputProps={{ readOnly: true }} />
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
