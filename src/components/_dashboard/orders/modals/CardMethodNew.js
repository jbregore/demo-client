import React from 'react';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CardSwipe from 'react-card-swipe';
// material
import { Grid, TextField, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';

CardMethodNew.propTypes = {
  setOpen: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired
};

export default function CardMethodNew  ({ setOpen, type })  {
  const state = store.getState();
  const { cart } = state;

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const [inputValues, setInputValues] = useState({
    cardType: type,
    amount: roundUpAmount(cart.amounts.amountDue),
    digitCode: '',
    expDate: '',
    approvalCode: ''
  });

  useEffect(() => {
    setInputValues({
      cardType: type,
      amount: roundUpAmount(cart.amounts.amountDue),
      digitCode: '',
      expDate: '',
      approvalCode: ''
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    CardSwipe.init({
      success: (data) =>
        setInputValues({
          ...inputValues,
          digitCode: data.account.slice(-4),
          expDate: `${data.expMonth}/${data.expYear}`
        }),
      debug: false
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = () => {
    const totalInput = roundUpAmount(cart.amounts.amountDue);
    const changeInput =
      Number(inputValues.amount) >= totalInput ? Number(inputValues.amount) - totalInput : 0;

    store.dispatch(setCashChange(changeInput));
  };

  const handleAddPayment = () => {
    setIsLoading(true);

    if (
      inputValues.amount === 0 ||
      inputValues.cardType === '' ||
      inputValues.digitCode === '' ||
      inputValues.expDate === '' ||
      inputValues.approvalCode === ''
    ) {
      setErrorMessage('Please enter all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    if (inputValues.amount > Number(roundUpAmount(cart.amounts.amountDue))) {
      setErrorMessage('You have entered more than the total amount due.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    handleChange();

    const { amount, cardType, digitCode, expDate, approvalCode } = inputValues;
    const paymentData = {
      amount,
      cardType,
      digitCode,
      expDate,
      approvalCode
    };

    store.dispatch(addPayment('cardNew', paymentData));
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
            label="Last 4 digits"
            type="number"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.digitCode}
            onChange={(e) => setInputValues({ ...inputValues, digitCode: e.target.value })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Exp Date"
            type="text"
            placeholder="MM/YY"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.expDate}
            onChange={(e) => {
              const expdate = e.target.value;
              const expDateFormatter =
                expdate.replace(/\//g, '').substring(0, 2) +
                (expdate.length > 2 ? '/' : '') +
                expdate.replace(/\//g, '').substring(2, 4);

              setInputValues({
                ...inputValues,
                expDate: expDateFormatter
              });
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Approval Code"
            type="number"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.approvalCode}
            onChange={(e) => setInputValues({ ...inputValues, approvalCode: e.target.value })}
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
};

