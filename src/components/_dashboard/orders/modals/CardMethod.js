import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import CardSwipe from 'react-card-swipe';
// material
import { Grid, TextField, Snackbar, Alert, MenuItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

const CARD_TYPE = ['credit-card', 'debit-card'];

// ----------------------------------------------------------------------

CardMethod.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CardMethod({ setOpen }) {
  const state = store.getState();
  const { cart } = state;

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const [inputValues, setInputValues] = useState({
    cardType: '',
    amount: roundUpAmount(cart.amounts.amountDue),
    digitCode: '',
    expDate: '',
    slipNumber: ''
  });

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
      inputValues.slipNumber === ''
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

    const { amount, cardType, digitCode, expDate, slipNumber } = inputValues;
    const paymentData = {
      amount,
      cardType,
      digitCode,
      expDate,
      slipNumber
    };

    store.dispatch(addPayment('card', paymentData));
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
            select
            fullWidth
            label="Card Type"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.cardType}
            onChange={(e) => setInputValues({ ...inputValues, cardType: e.target.value })}
          >
            {CARD_TYPE.map((type, i) => (
              <MenuItem key={i} value={type}>
                {type.replace('-', ' ')}
              </MenuItem>
            ))}
          </TextField>
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
            label="Slip Number"
            type="number"
            disabled={cart.confirmOrders.length === 0}
            value={inputValues.slipNumber}
            onChange={(e) => setInputValues({ ...inputValues, slipNumber: e.target.value })}
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
