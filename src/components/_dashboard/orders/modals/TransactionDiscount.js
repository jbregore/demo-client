import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
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
// redux
import { store } from '../../../../redux/cart/store';
import {
  addTransactionDiscount,
  updateAmounts,
  updateCustomerName
} from '../../../../redux/cart/action';
// components
import { SupervisorAuthorization } from '../../reports';

// ----------------------------------------------------------------------

let DISCOUNT_OPTIONS = [
  {
    value: 'fixed_price',
    label: 'Fixed Price',
    prefix: 'FIXED',
    receiptLabel: '(FIXED)',
    percentage: false
  },
  {
    value: 'percentage',
    label: 'Percentage',
    prefix: 'PERCENTAGE',
    receiptLabel: '(PERCENTAGE)',
    percentage: true
  },
  // {
  //   value: 'senior_citizen',
  //   label: 'Senior Citizen (5%)',
  //   prefix: 'SCD-5%',
  //   receiptLabel: '(SCD) 5%',
  //   percentage: true
  // },
  {
    value: 'vatZero',
    label: 'VAT ZR',
    prefix: 'VATZR',
    receiptLabel: '(VAT)',
    percentage: true
  },
  {
    value: 'diplomats',
    label: 'VAT EX',
    prefix: 'DPLMTS',
    receiptLabel: '(DPLMTS)',
    percentage: true
  },
  // { value: 'senior_citizen', label: 'Senior Citizen (20%)', prefix: 'SCD', percentage: true },
  // { value: 'pwd', label: 'PWD (20%)', prefix: 'PWD', percentage: true },
  {
    value: 'promo_code',
    label: 'Promo Code',
    prefix: 'PROMOCODE',
    receiptLabel: '(PROMOCODE)',
    percentage: false
  }
];

// ----------------------------------------------------------------------

TransactionDiscount.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function TransactionDiscount({ setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const state = store.getState();
  const cartLength = state.cart.confirmOrders.length;
  const { cart } = state;

  const [promoCodes, setPromoCodes] = useState([]);

  const [inputValues, setInputValues] = useState({
    discountOption: '',
    discountAmount: 0,
    selectedPromoCode: '',
    scPwdIdNumber: '',
    pezaCertNo: '',
    firstname: '',
    lastname: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [approveFunction, setApproveFunction] = useState('');
  const [promoCodeValue] = useState('0');

  const selectedPromoCode = promoCodes.find((x) => x.promoCodeId === inputValues.selectedPromoCode);

  useEffect(() => {
    if (approveFunction === 'transactionDiscount') {
      handleAddTransactionDiscount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  useEffect(() => {
    const getPromoCodes = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/order/promo-codes`,
          {
            params: {
              promoType: 'transaction'
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

  const handleAddTransactionDiscount = () => {
    setIsLoading(true);

    if (cartLength === 0) {
      setErrorMessage('There is no order in the cart.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    if (inputValues.discountOption === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    let valid = true;

    cart.confirmOrders.forEach((order) => {
      order.products.forEach((product) => {
        if ((cart.discounts?.length > 0 || product.discounts?.length > 0) && approveFunction === '') {
          valid = false;
        }
      });
    });

    if (!valid) {
      setSupervisorAccessModal(true);

      return null;
    }

    // if (cart.discounts?.length > 0 && approveFunction === '') {
    // setSupervisorAccessModal(true);

    // return null;
    // }

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

    const { discountOption, discountAmount, selectedPromoCode, scPwdIdNumber, pezaCertNo } =
      inputValues;

    const discount = { prefix: discountOption.prefix, receiptLabel: discountOption.receiptLabel };

    if (discountOption.value === 'promo_code') {
      if (selectedPromoCode !== '') {
        const selectedPromoCodeObj = promoCodes.filter(
          (x) => x.promoCodeId === selectedPromoCode
        )[0];
        if (selectedPromoCodeObj.type === "fixed" && selectedPromoCodeObj.value === "0") {
          discount.promoValue = promoCodeValue;
        } else {
          discount.promoValue = selectedPromoCodeObj.value;
        }
        discount.promoCodeId = selectedPromoCodeObj.promoCodeId;
        discount.promoType = selectedPromoCodeObj.type;
        discount.receiptLabel = `(${selectedPromoCodeObj.promoName}) ${selectedPromoCodeObj.type === 'percentage' ? `${selectedPromoCodeObj.value}%` : ''
          }`;
        if (selectedPromoCodeObj.type === 'percentage') {
          discount.label = `${selectedPromoCodeObj.promoName} (${selectedPromoCodeObj.value}%)`;
          discount.percentage = true;
          discount.percentageAmount = Number(selectedPromoCodeObj.value);
        } else {
          if (selectedPromoCodeObj.type === "fixed" && selectedPromoCodeObj.value === "0") {
            discount.label = `${selectedPromoCodeObj.promoName} (P${discount.promoValue})`;
            discount.amount = Number(discount.promoValue);
          } else {
            discount.label = `${selectedPromoCodeObj.promoName} (P${selectedPromoCodeObj.value})`;
            discount.amount = Number(selectedPromoCodeObj.value);
          }
        }
      }
    } else {
      discount.label = discountOption.label;
      discount.percentage = discountOption.percentage;

      if (discountOption.percentage) {
        if (discountOption.value === 'senior_citizen' || discountOption.value === 'pwd') {
          discount.percentageAmount = 20;
          discount.idNumber = scPwdIdNumber;

          store.dispatch(updateCustomerName(inputValues.firstname, inputValues.lastname));
        } else if (discountOption.value === 'vatZero') {
          discount.percentageAmount = 1.12;
          discount.idNumber = scPwdIdNumber;
          discount.pecaCertNo = pezaCertNo;

          store.dispatch(updateCustomerName(inputValues.scPwdIdNumber, ''));
        } else if (discountOption.value === 'diplomats') {
          discount.percentageAmount = 1.12;
        } else {
          discount.percentageAmount = Number(discountAmount);
        }
      } else {
        discount.amount = Number(discountAmount);
      }
    }

    const isNonVat = settings.unitConfiguration.nonVat;

    store.dispatch(addTransactionDiscount(discount));
    store.dispatch(updateAmounts());

    if (discount.prefix === 'SCD-5%' && !isNonVat) {
      const vatDiscount = {
        label: 'VAT',
        percentage: true,
        percentageAmount: 12,
        prefix: 'VAT',
        receiptLabel: '(VAT)'
      };

      store.dispatch(addTransactionDiscount(vatDiscount));
      store.dispatch(updateAmounts());
    }

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

  const isNonVat = settings.unitConfiguration.nonVat;

  if (isNonVat) {
    DISCOUNT_OPTIONS = DISCOUNT_OPTIONS.filter((x) => x.prefix !== 'VATZR');
  }

  return (
    <>
      <Box>
        <Typography variant="h6">Transaction Discount</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Select Discount"
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
            {(inputValues.discountOption.prefix === 'SCD' ||
              inputValues.discountOption.prefix === 'SCD-5%' ||
              inputValues.discountOption.prefix === 'PWD') && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={
                        inputValues.discountOption.prefix === 'SCD' ||
                          inputValues.discountOption.prefix === 'SCD-5%'
                          ? `Senior Citizen ID No.`
                          : `PWD ID No.`
                      }
                      type="text"
                      value={inputValues.scPwdIdNumber}
                      onChange={(e) =>
                        setInputValues({ ...inputValues, scPwdIdNumber: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Firstname"
                      type="text"
                      value={inputValues.firstname}
                      onChange={(e) => setInputValues({ ...inputValues, firstname: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Lastname"
                      type="text"
                      value={inputValues.lastname}
                      onChange={(e) => setInputValues({ ...inputValues, lastname: e.target.value })}
                    />
                  </Grid>
                </>
              )}
            {inputValues.discountOption.prefix === 'VATZR' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Representative Name"
                    type="text"
                    value={inputValues.scPwdIdNumber}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, scPwdIdNumber: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="PEZA Certificate No."
                    type="text"
                    value={inputValues.pezaCertNo}
                    onChange={(e) => setInputValues({ ...inputValues, pezaCertNo: e.target.value })}
                  />
                </Grid>
              </>
            )}
            {(inputValues.discountOption.value === 'fixed_price' ||
              inputValues.discountOption.value === 'percentage') && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Discount Value"
                    type="number"
                    value={inputValues.discountAmount}
                    onChange={(e) =>
                      setInputValues({ ...inputValues, discountAmount: e.target.value })
                    }
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
                    <MenuItem value="">-- Select promo code --</MenuItem>
                    {promoCodes &&
                      promoCodes.map((promo) => (
                        <MenuItem key={promo.promoName} value={promo.promoCodeId}>
                          {promo.promoName}
                        </MenuItem>
                      ))}
                  </TextField>
                </Grid>
                {inputValues.selectedPromoCode !== '' && (
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Discount Value"
                      type="number"
                      value={
                        selectedPromoCode.type === "fixed" &&
                          selectedPromoCode.value === "0" ?
                          promoCodeValue
                          :
                          selectedPromoCode.value || 0
                      }
                      InputProps={{
                        readOnly: selectedPromoCode.type === "fixed" && selectedPromoCode.value === "0" ? false : true,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Box>
                                {promoCodes.find(
                                  (x) => x.promoCodeId === inputValues.selectedPromoCode
                                ).type === 'percentage'
                                  ? '%'
                                  : '₱'}
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
            type="submit"
            loading={isLoading}
            onClick={() => handleAddTransactionDiscount()}
            disabled={cartLength < 1}
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
        <SupervisorAuthorization
          open={supervisorAccessModal}
          setOpen={setSupervisorAccessModal}
          toAccessFunction="transactionDiscount"
          setApproveFunction={setApproveFunction}
        />
      </Box>
    </>
  );
}
