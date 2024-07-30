import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { Alert, Box, Grid, Snackbar, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addTransactionDiscount, updateAmounts } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

CashMethod.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CashMethod({ setOpen }) {
  const state = store.getState();
  const { cart } = state;

  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // get customer
  const handleCustomerId = (evt) => {
    setCustomerId(evt.target.value);
  };

  // auto calculate change
  const handleAmountInput = (evt) => {
    const cashInput = evt.target.value === '' ? '' : parseInt(evt.target.value, 10);
    setAmount(cashInput);
  };

  const handleLoyaltyCustomer = async () => {
    // setIsLoading(true);

    try {
      const apiData = {
        id: customerId,
        total: cart.amounts.amountDue
      };

      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/loyalty/customer`,
        { params: apiData },
        {
          credentials: true
        }
      );

      const data = res.data.data[0];

      if (res.data.data.length === 0) {
        setIsError(true);
        setErrorMessage('Customer ID is not rezognized.');
        setIsLoading(false);

        return null;
      }

      if (amount > data.points) {
        setIsError(true);
        setErrorMessage('Not enough loyalty points.');
        setIsLoading(false);

        return null;
      }

      if (amount === 0) {
        if (cart.amounts.amountDue !== 0) {
          setErrorMessage('Please enter amount for payment.');
          setIsError(true);
          setIsLoading(false);

          return null;
        }
      }

      if (customerId === '') {
        setErrorMessage('Please enter customer id.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }

      // try {
      //   const apiData = {
      //     id: customerId,
      //     newPoints: customer.points - amount
      //   };

      //   await axios.patch(`${process.env.REACT_APP_API_URL}/loyalty/customer`, apiData, {
      //     credentials: true
      //   });

      //   // eslint-disable-next-line no-empty
      // } catch (err) {}

      const discount = {
        label: 'Loyalty Points',
        percentage: false,
        amount,
        prefix: 'LOYALTYPOINTS',
        receiptLabel: '(LOYALTY POINTS)',
        customerLoyaltyId: customerId,
        previousPoints: data.points,
        redeemedPoints: amount
      };

      // store.dispatch(addPayment('loyalty', amount));
      store.dispatch(addTransactionDiscount(discount));
      store.dispatch(updateAmounts());
      setIsLoading(false);
      setOpen(false);

      // eslint-disable-next-line no-empty
    } catch (err) { }

    return true;
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  return (
    <>
      <Box>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              autoFocus
              label="Customer ID"
              value={customerId}
              onChange={handleCustomerId}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Redeem Amount"
              value={amount}
              disabled={cart.confirmOrders.length === 0}
              onChange={handleAmountInput}
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
                  ? fCurrency('', roundUpAmount(cart.amounts.amountDue))
                  : cart.amounts.amountDue
              }
              type="text"
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
              onClick={() => handleLoyaltyCustomer()}
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
