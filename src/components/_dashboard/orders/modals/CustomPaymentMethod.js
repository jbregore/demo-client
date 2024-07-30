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

CustomPaymentMethod.propTypes = {
  setOpen: PropTypes.func.isRequired,
  paymentMethodData: PropTypes.object.isRequired
};

// ----------------------------------------------------------------------

export default function CustomPaymentMethod({ setOpen, paymentMethodData }) {
  const { id, type, method, label, properties, inputFields, key } = paymentMethodData;
  const state = store.getState();
  const { cart } = state;

  const [paymentAmount, setPaymentAmount] = useState(properties.amount);
  const [change, setChange] = useState(0);
  const [refNumber, setRefNumber] = useState('');

  // for cards
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiration, setCardExpiration] = useState('');

  const initializeCustomInputs = (inputFields) => {
    const inputFieldsObject = {};

    if (inputFields && inputFields.length > 0) {
      inputFields.forEach((inputField) => {
        inputFieldsObject[inputField.label] = null;

        switch (inputField.type) {
          case 'number':
            inputFieldsObject[inputField.label] = 0;
            break;
          default:
            inputFieldsObject[inputField.label] = '';
            break;
        }
      });
    }

    return inputFieldsObject;
  };
  const [customInputs, setCustomInputs] = useState(initializeCustomInputs(inputFields));

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
  useEffect(() => {
    setCustomInputs(initializeCustomInputs(inputFields));
    if (paymentMethodData.type.startsWith('c_')) {
      setPaymentAmount(properties.amount);
    } else {
      setPaymentAmount(cart.amounts.amountDue);
    }
    setRefNumber('');
    setChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethodData]);

  // auto calculate change
  const handlePaymentAmountInput = (evt) => {
    const amountInput = evt.target.value === '' ? '' : parseInt(evt.target.value, 10);
    const totalInput = Number(cart.amounts.amountDue.toFixed(3)).toFixed(2);
    const changeInput = amountInput >= totalInput ? amountInput - totalInput : 0;

    setPaymentAmount(amountInput);
    setChange(changeInput.toFixed(2));
  };

  const handleAddPayment = () => {
    setIsLoading(true);

    if (paymentAmount === 0) {
      if (cart.amounts.amountDue !== 0) {
        setErrorMessage('Please enter an amount for payment.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }
    }

    const requiredInputFields = inputFields
      .filter((inputField) => inputField.required)
      .map((inputField) => inputField.label);
    for (const field of Object.keys(customInputs)) {
      if (requiredInputFields.includes(field) && `${customInputs[field]}` === '') {
        setErrorMessage('Please enter value for the required fields.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }
    }

    const paymentData = {
      ...properties,
      id,
      type,
      method,
      label,
      amount: paymentAmount,
      refNumber,
      cardNumber,
      cardExpiration
    };

    store.dispatch(addPayment(key, paymentData));
    store.dispatch(updateAmounts());
    store.dispatch(setCashChange(change));

    setIsLoading(true);
    setOpen(false);

    return true;
  };

  const handleCustomInput = (e) => {
    let { name, value } = e.target;

    if (e.target.getAttribute('data-as') === 'refNum') {
      setRefNumber(value);
    }

    if (e.target.getAttribute('data-as') === 'cardNum') {
      setCardNumber(value);
    }

    if (e.target.getAttribute('data-as') === 'cardExp') {
      value =
        value.replace(/\//g, '').substring(0, 2) +
        (value.length > 2 ? '/' : '') +
        value.replace(/\//g, '').substring(2, 4);

      setCardExpiration(value);
    }

    setCustomInputs({
      ...customInputs,
      [name]: value
    });
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
              label="Payment Amount"
              value={paymentAmount}
              disabled={cart.confirmOrders.length === 0}
              onChange={handlePaymentAmountInput}
              InputProps={{ readOnly: properties.isFixedAmount }}
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

          {
            type.startsWith('c_') && (
              <Grid item xs={12}>
                <TextField fullWidth label="Change" value={change} InputProps={{ readOnly: true }} />
              </Grid>
            )
          }

          {inputFields &&
            inputFields.length > 0 &&
            inputFields.map((field, i) => (
              <Grid item xs={12} key={i}>
                <TextField
                  fullWidth
                  label={field.label}
                  value={customInputs[field.label]}
                  name={field.label}
                  onChange={handleCustomInput}
                  inputProps={{ 'data-as': field.type }}
                  error={isError && field.required && `${customInputs[field.label]}` === ''}
                />
              </Grid>
            ))}
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
