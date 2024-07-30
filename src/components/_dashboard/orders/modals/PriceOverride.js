import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// material
import { Box, Grid, MenuItem, TextField, Typography, Stack, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { capitalCase, titleCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addOverridedPrice, updateAmounts } from '../../../../redux/cart/action';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
// components
import { SupervisorAuthorization } from '../../reports';
import useNetwork from '../../../../functions/common/useNetwork';

// ----------------------------------------------------------------------

PriceOverride.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function PriceOverride({ setOpen }) {
  const { user } = JSON.parse(localStorage.getItem('userData'));
  const state = store.getState();
  const { cart } = state;
  const { online } = useNetwork();

  const [inputValues, setInputValues] = useState({
    product: '',
    price: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');

  const handleAddOverridedPrice = () => {
    setIsLoading(true);

    if (inputValues.product === '' || inputValues.price === 0) {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();
    const storedData = JSON.parse(localStorage.getItem('userData'));

    addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'Transaction',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has set price override for PO Number: ${inputValues.product.poNumber} from ${fCurrency(
        'P',
        inputValues.product.price.toFixed(2)
      )} to ${fCurrency('P', Number(inputValues.price).toFixed(2))}.`,
      'Price Overrided Item',
      `${posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
      online
    );
    store.dispatch(
      addOverridedPrice(
        inputValues.product.orderId,
        inputValues.product.productCode,
        inputValues.price
      )
    );
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

  useEffect(() => {
    if (approveFunction === 'overridePrice') {
      handleAddOverridedPrice();
      setApproveFunction('');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  const handleSupervisorAccess = (toAccess) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
  };

  return (
    <>
      <Box>
        <Typography variant="h6">Price Override</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Select Item"
                value={inputValues.product}
                onChange={(e) => setInputValues({ ...inputValues, product: e.target.value })}
              >
                {cart.confirmOrders.map(({ products, firstName, lastName, orderId }) =>
                  products.map((product, index) => {
                    product.orderId = orderId;
                    return (
                      <MenuItem key={index} disabled={product.price === 0} value={product} >
                        {`${titleCase(`${firstName} ${lastName}`)} - ${product.productName
                          } - ${product.price === 0 ? 'FREE' : `P${product.price}`}`}
                      </MenuItem>
                    );
                  })
                )}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                disabled={inputValues.product === ''}
                label="Price Override"
                type="number"
                value={inputValues.price}
                onChange={(e) => setInputValues({ ...inputValues, price: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={5}>
          <LoadingButton
            variant="contained"
            type="submit"
            size="large"
            loading={isLoading}
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('overridePrice')
                : handleAddOverridedPrice()
            }
          >
            Save price
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
          toAccessFunction={toAccessFunction}
          setApproveFunction={setApproveFunction}
        />
      </Box>
    </>
  );
}
