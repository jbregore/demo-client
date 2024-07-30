import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import {
  Box,
  Grid,
  TextField,
  Typography,
  Stack,
  Autocomplete,
  Snackbar,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { matchSorter } from 'match-sorter';
// redux
import { store } from '../../../../redux/cart/store';
import {
  addPackage,
  updatePackageAmountDue,
  clearCart,
  clearReturnCart
} from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

Package.propTypes = {
  setOpen: PropTypes.func.isRequired,
  activeCategory: PropTypes.object.isRequired
};

// ----------------------------------------------------------------------

export default function Package({ setOpen, activeCategory }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const [products, setProducts] = useState([]);
  const [inputValues, setInputValues] = useState({
    specs: '',
    quantity: 0,
    branchCode: settings.storeCode
  });

  const [searchKey, setSearchKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/order/product/free-item/${activeCategory.table}`
        );
        const productsData = res.data.data;

        setProducts(productsData);

        // eslint-disable-next-line no-empty
      } catch (err) { }
    };

    fetchProducts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddPackage = async () => {
    setIsLoading(true);

    if (inputValues.quantity === 0 || inputValues.specs === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    const specsPackage = {
      productCode: inputValues.specs.productCode,
      itemName: inputValues.specs.label,
      quantity: Number(inputValues.quantity),
      price: Number(inputValues.specs.price),
      storeCode: inputValues.branchCode
    };

    store.dispatch(addPackage(specsPackage));
    store.dispatch(updatePackageAmountDue());
    store.dispatch(clearCart());
    store.dispatch(clearReturnCart());

    setErrorMessage('');
    setIsError(false);
    setIsLoading(false);
    setOpen(false);

    return true;
  };

  const handleProductChange = (evt, val) => {
    setInputValues({
      ...inputValues,
      specs: val
    });
  };

  const handleQuantityChange = (evt) => {
    setInputValues({
      ...inputValues,
      quantity: evt.target.value
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
        <Typography variant="h6">Package Item</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                fullWidth
                openOnFocus
                options={products}
                onChange={handleProductChange}
                inputValue={searchKey}
                filterOptions={filterOptions}
                onInputChange={handleSearchKeyChange}
                renderInput={(params) => <TextField {...params} label="Select Product" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={inputValues.quantity}
                onChange={handleQuantityChange}
                name="quantity"
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
            onClick={() => handleAddPackage()}
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
