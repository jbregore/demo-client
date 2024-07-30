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
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { capitalCase, titleCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import {
  addSpecsDiscount,
  updateAmounts,
  updateCustomerName
} from '../../../../redux/cart/action';
// components
import { SupervisorAuthorization } from '../../reports';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

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
  {
    value: 'senior_citizen',
    label: 'Senior Citizen (20%)',
    prefix: 'SCD',
    receiptLabel: '(SCD) 20%',
    percentage: true
  },
  {
    value: 'senior_citizen_below_4475',
    label: 'Senior Citizen below 4475',
    prefix: 'SCD',
    receiptLabel: '(SCD) 20%',
    percentage: true
  },
  // {
  //   value: 'senior_citizen',
  //   label: 'Senior Citizen (5%)',
  //   prefix: 'SCD-5%',
  //   receiptLabel: '(SCD) 5%',
  //   percentage: true
  // },
  { value: 'pwd', label: 'PWD (20%)', prefix: 'PWD', receiptLabel: '(PWD) 20%', percentage: true },
  {
    value: 'pwd_below_4475',
    label: 'PWD below 4475',
    prefix: 'PWD',
    receiptLabel: '(PWD) 20%',
    percentage: true
  },
  {
    value: 'pnstmd',
    label: 'PNSTMD (20%)',
    prefix: 'PNSTMD',
    receiptLabel: '(PNSTMD) 20%',
    percentage: true
  },
  {
    value: 'employee',
    label: 'Employee',
    prefix: 'EMPLOYEE',
    receiptLabel: '(EMPLOYEE)',
    percentage: true
  },
  {
    value: 'vip',
    label: 'Vip',
    prefix: 'VIP',
    receiptLabel: '(VIP)',
    percentage: true
  },
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
  {
    value: 'promo_code',
    label: 'Promo Code',
    prefix: 'PROMOCODE',
    receiptLabel: '(PROMOCODE)',
    percentage: false
  },
  {
    value: 'package_discount',
    label: 'Package Discount (795)',
    prefix: 'PACKAGEDISCOUNT',
    receiptLabel: '(PACKAGEDISCOUNT)',
    percentage: false,
    amount: 795
  },
  {
    value: 'LZDPD',
    label: 'Lazada Promotional Discount',
    prefix: 'LZDPD',
    receiptLabel: '(LZDPD)',
    percentage: false
  },
  {
    value: 'SHPPD',
    label: 'Shopee Promotional Discount',
    prefix: 'SHPPD',
    receiptLabel: '(SHPPD)',
    percentage: false
  },
  {
    value: 'ZLRPD',
    label: 'Zalora Promotional Discount',
    prefix: 'ZLRPD',
    receiptLabel: '(ZLRPD)',
    percentage: false
  }
];

// ----------------------------------------------------------------------

ItemDiscount.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function ItemDiscount({ setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const state = store.getState();
  const { cart } = state;
  const { online } = useNetwork();

  const [inputValues, setInputValues] = useState({
    product: '',
    isUpgrade: false,
    discountOption: '',
    discountAmount: 0,
    selectedPromoCode: '',
    scPwdIdNumber: cart?.confirmOrders[0]?.idNumber || '',
    pezaCertNo: '',
    firstname:
      cart?.confirmOrders[0]?.firstname !== 'guest' ? cart?.confirmOrders[0]?.firstname : '',
    lastname: cart?.confirmOrders[0]?.lastname !== 'guest' ? cart?.confirmOrders[0]?.lastname : ''
  });
  const [promoCodes, setPromoCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [approveFunction, setApproveFunction] = useState('');
  const [promoCodeValue] = useState('0');

  const selectedPromoCode = promoCodes.find((x) => x.promoCodeId === inputValues.selectedPromoCode);
  useEffect(() => {
    if (approveFunction === 'itemDiscount') {
      handleAddSpecsDiscount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  useEffect(() => {
    const getPromoCodes = async () => {
      try {
        const res = await axios.get(
          `${Endpoints.ORDER}/promo-codes`,
          {
            params: {
              promoType: 'item'
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

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const handleAddSpecsDiscount = () => {
    setIsLoading(true);
    const orderId = cart.confirmOrders[0].orderId;

    if (inputValues.product === '' || inputValues.discountOption === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    if (
      (inputValues.product.discounts?.length > 0 || cart.discounts?.length > 0) &&
      approveFunction === ''
    ) {
      setSupervisorAccessModal(true);

      return null;
    }

    if (
      inputValues.discountOption.value === 'fixed_price' ||
      inputValues.discountOption.value === 'percentage' ||
      inputValues.discountOption.value === 'LZDPD' ||
      inputValues.discountOption.value === 'SHPPD' ||
      inputValues.discountOption.value === 'ZLRPD' ||
      inputValues.discountOption.value === 'employee' ||
      inputValues.discountOption.value === 'vip'
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

    const {
      product,
      isUpgrade,
      discountOption,
      discountAmount,
      selectedPromoCode,
      scPwdIdNumber,
      pezaCertNo
    } = inputValues;

    let discount = { prefix: discountOption.prefix, receiptLabel: discountOption.receiptLabel };

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
          }
          else {
            discount.label = `${selectedPromoCodeObj.promoName} (P${selectedPromoCodeObj.value})`;
            discount.amount = Number(selectedPromoCodeObj.value);
          }
        }
      }
    } else {
      discount.label = discountOption.label;
      discount.percentage = discountOption.percentage;

      if (discountOption.percentage) {
        if (
          discountOption.value === 'senior_citizen' ||
          discountOption.value === 'pwd' ||
          discountOption.value === 'pnstmd'
        ) {
          discount.percentageAmount = 20;
          discount.idNumber = scPwdIdNumber;

          store.dispatch(
            updateCustomerName(inputValues.firstname, inputValues.lastname, scPwdIdNumber)
          );
        } else if (discountOption.value === 'vatZero') {
          discount.percentageAmount = 1.12;
          discount.idNumber = scPwdIdNumber;
          discount.pecaCertNo = pezaCertNo;

          store.dispatch(updateCustomerName(inputValues.scPwdIdNumber, '', ''));
        } else if (discountOption.value === 'diplomats') {
          discount.percentageAmount = 1.12;
        } else {
          discount.percentageAmount = Number(discountAmount);
        }
      } else {
        let amount = 0;

        if (discountOption.value === 'package_discount') {
          amount = discountOption.amount;
        } else {
          amount = Number(discountAmount);
        }

        discount.amount = amount;
      }
    }

    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();
    const storedData = JSON.parse(localStorage.getItem('userData'));

    let discountLabelLog = '';
    let discountAmountLog = 0;

    if (discountOption.prefix === 'FIXED' || discountOption.prefix === 'PERCENTAGE' || discountOption.prefix === 'EMPLOYEE' || discountOption.prefix === 'VIP') {
      if (discountOption.percentage) {
        discountLabelLog = `${discountOption.prefix} (${discountAmount}%)`;

        const specsPrice = product.overridedPrice || product.price * product.quantity;
        discountAmountLog = (discountAmount / 100) * specsPrice;
      } else {
        discountLabelLog = discountOption.prefix;
        discountAmountLog = discountAmount;
      }
    } else if (discountOption.prefix === 'PACKAGEDISCOUNT') {
      discountLabelLog = discountOption.label;
      discountAmountLog = discountOption.amount;
    } else if (
      discountOption.prefix === 'SCD' ||
      discountOption.prefix === 'PWD' ||
      discountOption.prefix === 'PNSTMD'
    ) {
      discountLabelLog = discountOption.label;

      const specsPrice = product.overridedPrice || product.price * product.quantity;
      discountAmountLog = specsPrice / 1.12;
      discountAmountLog *= 0.2;
      if (settings[SettingsCategoryEnum.UnitConfig].mallAccr === 'sm' && discountOption.prefix === 'PNSTMD') {
        const vatAmount = specsPrice - specsPrice / 1.12;
        discountAmountLog += vatAmount;
      }
    } else if (discountOption.prefix === 'PROMOCODE') {
      const selectedPromoCodeObj = promoCodes.filter((x) => x.promoCodeId === selectedPromoCode)[0];
      discountLabelLog = `Promo Code ${selectedPromoCodeObj.promoName}`;

      if (selectedPromoCodeObj.type === 'percentage') {
        const specsPrice = product.overridedPrice || product.price * product.quantity;
        discountAmountLog = (selectedPromoCodeObj.value / 100) * specsPrice;
      } else {
        if (selectedPromoCodeObj.type === "fixed" && selectedPromoCodeObj.value === "0") {
          discountAmountLog = discount.promoValue;
        }
        else {
          discountAmountLog = selectedPromoCodeObj.value;
        }
      }
    }

    addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'Transaction',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has applied a discount ${discountLabelLog} - ${fCurrency(
        'P',
        roundUpAmount(discountAmountLog)
      )} to a item with an No.: ${product.poNumber}`,
      'Applied Item Discount',
      `${posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
      online
    );

    const matchRuleShort = (str, rule) => {
      const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'); // eslint-disable-line
      return new RegExp('^' + rule.split('*').map(escapeRegex).join('.*') + '$').test(str); // eslint-disable-line
    };

    if (
      discountOption.value === 'senior_citizen_below_4475' ||
      discountOption.value === 'pwd_below_4475'
    ) {
      if (
        matchRuleShort(product.productCode, '*SS1*') ||
        matchRuleShort(product.productCode, '*60253-*')
      ) {
        discount = {
          prefix: 'PACKAGEDISCOUNT',
          label: 'Package Discount (795)',
          percentage: false,
          receiptLabel: '(PACKAGEDISCOUNT)',
          amount: 795,
          scd: discountOption.value === 'senior_citizen_below_4475',
          pwd: discountOption.value === 'pwd_below_4475'
        };
      } else {
        discount = {
          label: 'VAT',
          percentage: true,
          percentageAmount: 12,
          prefix: 'VAT',
          receiptLabel: '(VAT)'
        };
      }

      store.dispatch(
        updateCustomerName(inputValues.firstname, inputValues.lastname, scPwdIdNumber)
      );
    }

    store.dispatch(addSpecsDiscount(orderId, product.productCode, discount, isUpgrade));
    store.dispatch(updateAmounts());

    if (
      discount.prefix === 'SCD' ||
      discount.prefix === 'PWD' ||
      discount.prefix === 'PNSTMD' ||
      discountOption.value === 'senior_citizen_below_4475' ||
      discountOption.value === 'pwd_below_4475'
    ) {
      const isNonVat = settings.unitConfiguration.nonVat;
      // Condition for SM on PNSTMD
      const mallSM = settings[SettingsCategoryEnum.UnitConfig].mallAccr === 'sm' && inputValues.discountOption.prefix === 'PNSTMD';

      if (!isUpgrade) {
        if (product.discounts.filter((x) => x.prefix === 'VAT').length < 1 && !isNonVat) {
          discount = {
            label: 'VAT',
            percentage: true,
            percentageAmount: 12,
            prefix: 'VAT',
            receiptLabel: '(VAT)'
          };

          if (!mallSM) {
            store.dispatch(addSpecsDiscount(orderId, product.productCode, discount, isUpgrade));
            store.dispatch(updateAmounts());
          }
        }
      } else {
        const discountLength = product.upgrades.discounts.filter((x) => x.prefix === 'VAT').length;

        if (discountLength < 1 && !isNonVat) {
          discount = {
            label: 'VAT',
            percentage: true,
            percentageAmount: 12,
            prefix: 'VAT',
            receiptLabel: '(VAT)'
          };

          if (!mallSM) {
            store.dispatch(addSpecsDiscount(orderId, product.productCode, discount, isUpgrade));
            store.dispatch(updateAmounts());
          }
        }
      }
    }

    setIsLoading(false);
    setOpen({ status: false, type: null });
    setApproveFunction('');

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

  if (settings.activeCategory !== 'OPTICAL') {
    DISCOUNT_OPTIONS = DISCOUNT_OPTIONS.filter(
      (x) =>
        x.value !== 'senior_citizen_below_4475' &&
        x.value !== 'pwd_below_4475' &&
        x.value !== 'package_discount'
    );
  }

  if (settings.ecomm === 'false') {
    DISCOUNT_OPTIONS = DISCOUNT_OPTIONS.filter(
      (x) => !['ZLRPD', 'SHPPD', 'LZDPD'].includes(x.value)
    );
  }

  return (
    <>
      <Typography variant="h6">Item Discount</Typography>
      <Box>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Select Item"
                value={inputValues.product}
                onChange={(e) =>
                  setInputValues({ ...inputValues, product: e.target.value, isUpgrade: false })
                }
              >
                {cart?.confirmOrders.map((order) =>
                  order.products.map((product, index) => (
                    <MenuItem key={index} disabled={product.isFree && !product.upgrades} value={product}>
                      {`${titleCase(`${order.firstName} ${order.lastName}`)} - ${product.productName} ${product.isFree ? '- FREE ITEM' : ''
                        }`}
                    </MenuItem>
                  ))
                )}
              </TextField>
              <FormControlLabel
                control={
                  <Checkbox
                    onClick={() =>
                      setInputValues({ ...inputValues, isUpgrade: !inputValues.isUpgrade })
                    }
                    name="upgradeDiscount"
                  />
                }
                label="Apply the discount to upgrades."
                sx={!inputValues.product.upgrades ? { display: 'none' } : {}}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Select Discount"
                disabled={inputValues.product === ''}
                value={inputValues.discountOption}
                onChange={(e) => setInputValues({ ...inputValues, discountOption: e.target.value })}
                SelectProps={{ MenuProps: { sx: { maxHeight: 300 } } }}
              >
                {DISCOUNT_OPTIONS.map((discount, index) => (
                  <MenuItem key={index} value={discount}>
                    {discount.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {(inputValues.discountOption.prefix === 'SCD' ||
              inputValues.discountOption.prefix === 'PWD') && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={
                        inputValues.discountOption.prefix === 'SCD'
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
            {inputValues.discountOption.prefix === 'PNSTMD' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="PNSTMD ID No."
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
              inputValues.discountOption.value === 'percentage' ||
              inputValues.discountOption.value === 'employee' ||
              inputValues.discountOption.value === 'vip' ||
              inputValues.discountOption.value === 'LZDPD' ||
              inputValues.discountOption.value === 'SHPPD' ||
              inputValues.discountOption.value === 'ZLRPD') && (
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
            loading={isLoading}
            onClick={() => handleAddSpecsDiscount()}
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
          toAccessFunction="itemDiscount"
          setApproveFunction={setApproveFunction}
        />
      </Box>
    </>
  );
}
