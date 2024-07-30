import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import {
  Box,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Stack,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { titleCase } from 'text-case';
import { matchSorter } from 'match-sorter';
// redux
import { store } from '../../../../redux/cart/store';
import { addSpecs, updateAmounts } from '../../../../redux/cart/action';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

// ----------------------------------------------------------------------

FreeItem.propTypes = {
  setOpen: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

export default function FreeItem({ setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode } = settings[SettingsCategoryEnum.UnitConfig];
  const state = store.getState();
  const { cart } = state;

  const [products, setProducts] = useState([]);

  const [inputValues, setInputValues] = useState({
    order: '',
    specs: '',
    branchCode: storeCode,
    quantity: 1
  });

  const [searchKey, setSearchKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${Endpoints.ORDER}/product/free-item`
        );
        const productsData = res.data.data;

        setProducts(productsData);

        // eslint-disable-next-line no-empty
      } catch (err) { }
    };

    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFreeItem = async () => {
    setIsLoading(true);

    if (inputValues.order === '' || inputValues.specs === '' || inputValues.quantity < 1) {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();

    try {
      const apiData = {
        itemName: inputValues.specs.label,
        price: Number(inputValues.specs.price),
        quantity: inputValues.quantity,
        productCodeDisplay: inputValues.specs.productCode,
        productCode: inputValues.specs.productCode,
        productUpgrade: '',
        material: inputValues.specs.description === '' ? 'NO DESC' : inputValues.specs.description,
        orderId: inputValues.order.orderId,
        profileId: inputValues.order.profileId,
        currency: 'PHP',
        status: 'for payment',
        lensOption: 'without prescription',
        branchCode: inputValues.branchCode,
        specsDate: `${posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
      };


      const res = await axios.post(`${Endpoints.ORDER}/orders-specs`, apiData, {
        withCredentials: true
      });
      const specsData = res.data.data;

      apiData.ordersSpecsId = specsData.ordersSpecsId;
      apiData.poNumber = specsData.poNumber;

      const addPosSpecs = async (data) => {
        const storedData = JSON.parse(localStorage.getItem('userData'));

        try {
          const apiData = {
            orderId: data.orderId,
            ordersSpecsId: data.ordersSpecsId,
            productCodeDisplay: data.productCode,
            productCode: data.productCode,
            material: data.description === '' ? 'NO DESC' : data.description,
            price: data.price,
            quantity: inputValues.quantity,
            status: 'for payment',
            payment: 'n',
            poNumber: data.poNumber,
            isVatable: '',
            vatAmount: '0',
            upgradePrice: 0,
            upgradeIsVatable: '',
            upgradeVatAmount: 0,
            cashierId: storedData.user.employeeId,
            storeCode: data.branchCode,
            specsDate: data.specsDate,
            txnNumber: '',
            siNumber: ''
          };

          await axios.post(`${Endpoints.ORDER}/pos-specs`, apiData, {
            withCredentials: true
          });

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      addPosSpecs(apiData);

      store.dispatch(addSpecs(inputValues.order, apiData));
      store.dispatch(updateAmounts());

      setIsLoading(false);
      setOpen({ status: false, type: null });

      // eslint-disable-next-line no-empty
    } catch (err) { }

    return true;
  };

  const handleChange = (evt, val) => {
    setInputValues({
      ...inputValues,
      specs: val
    });
  };

  const handleSearchKeyChange = (evt, inputVal) => {
    setSearchKey(inputVal);
  };

  const filterOptions = (products, { inputValue }) =>
    matchSorter(products, inputValue, { keys: ['label'] });

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  return (
    <>
      <Box>
        <Typography variant="h6">Free Item</Typography>
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
                {cart.confirmOrders.map((order) => (
                  <MenuItem key={order.orderId} value={order}>
                    {`${titleCase(`${order.firstname} ${order.lastname}`)}: ${order.orderId}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                disabled={inputValues.order === ''}
                fullWidth
                openOnFocus
                options={products}
                onChange={handleChange}
                inputValue={searchKey}
                filterOptions={filterOptions}
                onInputChange={handleSearchKeyChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    disabled={inputValues.order === ''}
                    label="Select Product"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="text"
                disabled={inputValues.specs === ''}
                label="Quantity"
                value={inputValues.quantity}
                onChange={(e) => setInputValues({ ...inputValues, quantity: e.target.value })}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={5}>
          <LoadingButton
            variant="contained"
            size="large"
            type="submit"
            loading={isLoading}
            onClick={() => handleAddFreeItem()}
          >
            Add Item
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
      </Box>
    </>
  );
}
