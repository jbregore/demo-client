import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import BarcodeReader from 'react-barcode-reader';
// icons
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
// material
import { styled } from '@mui/material/styles';
import {
  Container,
  Box,
  Typography,
  Stack,
  OutlinedInput,
  InputAdornment,
  CircularProgress,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
// context
import { AuthContext } from '../shared/context/AuthContext';
// components
import Page from '../components/Page';
import ProductManagement from '../components/ProductManagement';
import { ProductList, ProductCartWidget, CategoriesList } from '../components/_dashboard/orders';
import ScanProduct from '../components/_dashboard/orders/modals/ScanProduct';
// import OnlineOrders from '../components/_dashboard/orders/modals/OnlineOrders';
import UpdateProducts from '../components/_dashboard/orders/modals/UpdateProducts';
// import OutOfSyncWarning from '../components/_dashboard/orders/modals/OutOfSyncModal';
import { InitialCashModal } from '../components/_dashboard/reports';
// redux
import { ordersStore } from '../redux/orders/store';
import {
  setSearchParams
} from '../redux/orders/action';
import { SettingsCategoryEnum, MallAccrEnum } from '../enum/Settings';
import { Endpoints } from '../enum/Endpoints';
import { store } from '../redux/cart/store';
import { clearCart } from '../redux/cart/action';



// ----------------------------------------------------------------------

const CART_WIDTH = 400;
const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  height: 50,
  fontSize: 14,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));
const ProductMenuBox = styled(Box)({
  width: `calc(100% - ${CART_WIDTH + 36}px)`
});

// ----------------------------------------------------------------------

export default function Orders() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const auth = useContext(AuthContext);
  const timestamp = moment().valueOf();
  const posDate = localStorage.getItem('transactionDate');
  const sysDate = localStorage.getItem('systemDate');
  const posDateExceed = moment(posDate).isAfter(moment(sysDate), 'date');

  let outOfSync = localStorage.getItem('outOfSyncWarning') === 'true';
  if (settings[SettingsCategoryEnum.UnitConfig]?.mallAccr === MallAccrEnum.Robinson) {
    const currentPosDate = localStorage.getItem('transactionDate').split(' ')[0];
    const currentSysDate = sysDate.split(' ')[0];
    if (moment(currentSysDate).diff(moment(currentPosDate), 'days') === 1 && moment().hour() < 4) {
      localStorage.setItem('outOfSyncWarning', false);
      // eslint-disable-next-line
      outOfSync = false;
    }
  }

  const [ordersState, setOrdersState] = useState(ordersStore.getState());
  const [scanProductModalOpen, setScanProductModalOpen] = useState(false);
  const [initialCashModal, setInitialCashModal] = useState(false);
  const [openUpdateProducts, setOpenUpdateProducts] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [error, setError] = useState('');
  const [scanTime, setScanTime] = useState(null);

  useEffect(() => {
    const updateOrdersState = () => {
      setOrdersState(ordersStore.getState());
    };
    ordersStore.subscribe(updateOrdersState);
  }, []);


  // check if user did initial cash already
  const initialCash = JSON.parse(localStorage.getItem('initialCash'));
  const storedData = JSON.parse(localStorage.getItem('userData'));
  useEffect(() => {
    if (!initialCash && storedData?.user.role === 'cashier') {
      if (settings[SettingsCategoryEnum.UnitConfig].ecomm) {
        setInitialCashModal(true);
      } else {
        !posDateExceed && setInitialCashModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCash, storedData]);

  // Barcode scanner

  const handleEnableScanner = () => {
    setScanTime(timestamp);
    setScanProductModalOpen(true);
  };

  const handleScan = async (data) => {
    try {
      const res = await axios.get(
        `${Endpoints.ORDER}/product/single-item/scanner/${ordersState.category}/${data}`
      );
      const [productData] = res.data.data;

      if (res.data.data.length) {
        setProductDetails(productData);
        handleEnableScanner();
      } else {
        setError('Product not found, please try again.');
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      setProductDetails(null);
      setError('Failed to scan barcode, please try again.');
    }
  };

  const handleError = () => { };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setError('');
  };

  // =============================== BIND KEY: START

  // trigger check online orders
  useEffect(() => {
    const numOpts = ['+'];

    const checkOnlineKeyDown = (e) => {
      if (numOpts.includes(e.key)) {
        // setOpenOnlineOrders(true);
      }
    };

    // initiate
    document.addEventListener('keydown', checkOnlineKeyDown);

    return () => {
      // cleanup
      document.removeEventListener('keydown', checkOnlineKeyDown);
      // clear cart
      store.dispatch(clearCart());
    };
  }, []);

  // =============================== BIND KEY: END

  if (['manager'].includes(auth.user.role.toLowerCase())) return <ProductManagement />;

  return (
    <Page title="Dashboard">
      <BarcodeReader onError={handleError} onScan={handleScan} scanButtonKeyCode={32} />
      <Container maxWidth={false} sx={{ paddingRight: '0 !important' }}>
        <ProductMenuBox>
          <Box sx={{ pb: 5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h4">Categories</Typography>
              <Stack direction="row" alignItems="center">
                <SearchStyle
                  placeholder="Search product"
                  startAdornment={
                    <InputAdornment position="start">
                      <Box
                        component={Icon}
                        icon={searchFill}
                        sx={{ color: 'text.disabled', fontSize: 20 }}
                      />
                    </InputAdornment>
                  }
                  onChange={(e) =>
                    ordersStore.dispatch(setSearchParams(e.target.value.toLowerCase()))
                  }
                />
              </Stack>
            </Stack>
          </Box>
          {/* CATEGORIES */}
          <CategoriesList /*currentCategory={currentCategory} setCategory={setCurrentCat}*/ />

          <Box sx={{ pb: 5 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4">Products</Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {`${ordersState.products.length} ${ordersState.products.length > 1 ? 'Products' : 'Product'
                    } Result`}
                </Typography>
              </Box>
              <Button
                color="primary"
                variant="contained"
                size="small"
                onClick={() => setOpenUpdateProducts(true)}
              >
                Update Products
              </Button>
            </Stack>
          </Box>
          <ProductList />
          {ordersState.isLoadingProducts && (
            <Stack direction="row" justifyContent="center">
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body2">Loading products . . .</Typography>
              </Box>
            </Stack>
          )}
        </ProductMenuBox>
        <ProductCartWidget />
      </Container>
      {!initialCash && storedData && (
        <InitialCashModal
          open={initialCashModal}
          setOpen={setInitialCashModal}
          user={storedData?.user}
          report={false}
        />
      )}
      {productDetails && (
        <ScanProduct
          open={scanProductModalOpen}
          setOpen={setScanProductModalOpen}
          product={productDetails}
          setProduct={setProductDetails}
          timestamp={scanTime}
        />
      )}
      {/* <OnlineOrders open={openOnlineOrders} setOpen={setOpenOnlineOrders} />*/}
      {/* {settings[SettingsCategoryEnum.UnitConfig].ecomm === false && (
        <OutOfSyncWarning open={openOutOfSyncWarning} setOpen={setOpenOutOfSyncWarning} />
      )} */}
      <UpdateProducts
        open={openUpdateProducts}
        setOpen={setOpenUpdateProducts}
      />
      <Snackbar open={error !== ''} autoHideDuration={3000} onClose={handleCloseError}>
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Page>
  );
}
