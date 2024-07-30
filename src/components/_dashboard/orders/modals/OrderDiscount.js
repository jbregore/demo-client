import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
// material
import {
  Box,
  Grid,
  Stack,
  MenuItem,
  TextField,
  Typography,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { titleCase } from 'text-case';
// redux
import { store } from '../../../../redux/cart/store';
import { addOrderDiscount, updateAmounts } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

const DISCOUNT_OPTIONS = [
  { value: 'fixed_price', label: 'Fixed Price', prefix: 'FIXED', percentage: false },
  { value: 'percentage', label: 'Percentage', prefix: 'PERCENTAGE', percentage: true },
  // { value: 'senior_citizen', label: 'Senior Citizen (20%)', prefix: 'SCD', percentage: true },
  // { value: 'pwd', label: 'PWD (20%)', prefix: 'PWD', percentage: true },
  { value: 'promo_code', label: 'Promo Code', prefix: 'PROMOCODE', percentage: false }
];

// ----------------------------------------------------------------------

OrderDiscount.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function OrderDiscount({ setOpen }) {
  const state = store.getState();
  const { cart } = state;

  const [inputValues, setInputValues] = useState({
    order: '',
    discountOption: '',
    discountAmount: 0,
    selectedPromoCode: ''
  });

  const [promoCodes, setPromoCodes] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const getPromoCodes = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/order/promo-codes`,
          {
            params: {
              promoType: 'order'
            }
          }
        );
        const promoCodeData = res.data.data;

        setPromoCodes(promoCodeData);

        // eslint-disable-next-line no-empty
      } catch (err) { }
    };

    getPromoCodes();
  }, []);

  const handleAddOrderDiscount = () => {
    setIsLoading(true);

    if (inputValues.order === '' || inputValues.discountOption === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    if (
      inputValues.discountOption.value === 'fixed_price' ||
      inputValues.discountOption.value === 'percentage'
    ) {
      if (inputValues.discountAmount === 0) {
        setErrorMessage('Please fill up all the required fields.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }
    }

    if (inputValues.discountOption.value === 'promo_code') {
      if (inputValues.selectedPromoCode === '') {
        setErrorMessage('Please fill up all the required fields.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }
    }

    const { order, discountOption, discountAmount, selectedPromoCode } = inputValues;

    const discount = { prefix: discountOption.prefix };

    if (discountOption.value === 'promo_code') {
      discount.promoCodeId = selectedPromoCode.promoCodeId;
      discount.promoType = selectedPromoCode.type;
      discount.promoValue = selectedPromoCode.value;

      if (selectedPromoCode.type === 'percentage') {
        discount.label = `${selectedPromoCode.promoName} (${selectedPromoCode.value}%)`;
        discount.percentage = true;
        discount.percentageAmount = Number(selectedPromoCode.value);
      } else {
        discount.label = `${selectedPromoCode.promoName} (P${selectedPromoCode.value})`;
        discount.amount = Number(selectedPromoCode.value);
      }
    } else {
      discount.label = discountOption.label;
      discount.percentage = discountOption.percentage;

      if (discountOption.percentage) {
        if (discountOption.value === 'senior_citizen' || discountOption.value === 'pwd') {
          discount.percentageAmount = 20;
        } else {
          discount.percentageAmount = Number(discountAmount);
        }
      } else {
        discount.amount = Number(discountAmount);
      }
    }

    store.dispatch(addOrderDiscount(order.orderId, discount));
    store.dispatch(updateAmounts());

    setIsLoading(false);
    setOpen({ status: false, type: null });

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
      <Typography variant="h6">Order Discount</Typography>
      <Box mt={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Select Order"
              value={inputValues.order}
              onChange={(e) => setInputValues({ ...inputValues, order: e.target.value })}
            >
              {cart.confirmOrders.map((order, index) => (
                <MenuItem key={index} value={order}>
                  {`${titleCase(`${order.firstname} ${order.lastname}`)}: ${order.orderId}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Select Discount"
              disabled={inputValues.order === ''}
              value={inputValues.discountOption}
              onChange={(e) => setInputValues({ ...inputValues, discountOption: e.target.value })}
            >
              {DISCOUNT_OPTIONS.map((discount, index) => (
                <MenuItem key={index} value={discount}>
                  {discount.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {(inputValues.discountOption.value === 'fixed_price' ||
            inputValues.discountOption.value === 'percentage') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discount Value"
                  type="number"
                  value={inputValues.discountAmount}
                  onChange={(e) => setInputValues({ ...inputValues, discountAmount: e.target.value })}
                  InputProps={{
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Box>{inputValues.discountOption.percentage ? '%' : '₱'}</Box>
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              </Grid>
            )}
          {inputValues.discountOption.value === 'promo_code' && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  select
                  label="Promo Code"
                  value={inputValues.selectedPromoCode}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, selectedPromoCode: e.target.value })
                  }
                >
                  {promoCodes &&
                    promoCodes.map((promo) => (
                      <MenuItem key={promo.promoName} value={promo}>
                        {promo.promoName}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              {inputValues.selectedPromoCode.value !== '' && (
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Discount Value"
                    type="number"
                    value={inputValues.selectedPromoCode.value}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Box>
                              {inputValues.selectedPromoCode.type === 'percentage' ? '%' : '₱'}
                            </Box>
                          </InputAdornment>
                        </>
                      )
                    }}
                  />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Box>
      <Stack direction="row" justifyContent="end" mt={5}>
        <LoadingButton
          variant="contained"
          size="large"
          loading={isLoading}
          onClick={() => handleAddOrderDiscount()}
        >
          Apply Discount
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
    </>
  );
}
