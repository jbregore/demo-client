import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
// material
import { Box, Card, Typography, Chip, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { capitalCase, titleCase } from 'text-case';
import { fCurrency } from '../../../utils/formatNumber';
// redux
import { store } from '../../../redux/cart/store';
import {
  addOrder,
  addSpecs,
  updateAmounts,
  updateQuantity,
  addSpecsDiscount,
  setLoadingState
} from '../../../redux/cart/action';
// functions
import addUserActivityLog from '../../../functions/common/addUserActivityLog';
import useNetwork from '../../../functions/common/useNetwork';
import moment from 'moment';
// components
// import AddProduct from './modals/AddProduct';
import AddProductRemarks from './modals/AddProductRemarks';
import { SettingsCategoryEnum } from '../../../enum/Settings';
import { Endpoints } from '../../../enum/Endpoints';

// ----------------------------------------------------------------------

const CardRoot = styled(Card)(({ theme }) => ({
  borderRadius: '8px',
  transition: 'background .15s ease-in-out',
  '&:hover': {
    backgroundColor: theme.palette.grey[300]
  }
}));

const CardBox = styled(Box)({
  padding: '16px',
  position: 'relative',
  cursor: 'pointer',
  minHeight: 165,
  '& h6': {
    fontSize: 14
  }
});

// ----------------------------------------------------------------------

ProductCard.propTypes = {
  product: PropTypes.object
};

// ----------------------------------------------------------------------

export default function ProductCard({ product }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const transactionDate = localStorage.getItem('transactionDate');
  const state = store.getState();
  const [cart, setCart] = useState(
    state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart
  );
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);

  const { online } = useNetwork();

  const handleAddProductRemarksModalOpen = async () => {
    // Retrieve the remarks of the product from POS specs
    let remarks = null;

    // eslint-disable-next-line
    if (settings[SettingsCategoryEnum.UnitConfig].ecomm == true && remarks === null) {
      setRemarksModalOpen(true);
    } else {
      handleAddProduct(remarks);
    }
  };

  const handleAddProduct = (remarks = null) => {
    if (state.isLoading) return;
    store.dispatch(setLoadingState(true));
    if (cart.confirmOrders.length === 0) {
      saveNewSpecsAndOrder(remarks);
    } else {
      let productExist = false;

      cart.confirmOrders.forEach((order) => {
        order.products.forEach((orderedProduct) => {
          if (product.productCode === orderedProduct.productCode) {
            productExist = true;
          }
        });
      });

      if (productExist) {
        store.dispatch(updateQuantity(product.productCode, 1));
        store.dispatch(updateAmounts());
      } else {
        saveNewSpecs(remarks);
      }
    }
    store.dispatch(setLoadingState(false));
  };

  useEffect(() => {
    updateState();
    store.subscribe(updateState);
  }, []);



  const updateState = () => {
    const state = store.getState();
    setCart(state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart);
  };

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const saveNewSpecsAndOrder = async (remarks) => {
    try {
      const storedData = JSON.parse(localStorage.getItem('userData'));
      const apiData = {
        branchCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
        cashierId: storedData.user.employeeId,
        transactionDate,
        product
      };

      const res = await axios.post(Endpoints.ORDER, apiData, {
        withCredentials: true
      });
      const orderData = res.data.data;

      const posDateData = transactionDate.split(' ');
      const currentTime = moment().format('HH:mm:ss');

      addUserActivityLog(
        storedData.user.firstname,
        storedData.user.lastname,
        storedData.user.employeeId,
        'Transaction',
        `${capitalCase(storedData.user.firstname)} ${capitalCase(
          storedData.user.lastname
        )} has added a new for payment order with an Order ID: ${orderData.orderId}.`,
        'New Order',
        `${posDateData[0]
        } ${currentTime}`,
        online
      );

      store.dispatch(addOrder(orderData));
      store.dispatch(updateAmounts());

      if (product.vatable === true) {
        const vatDiscount = {
          label: 'VAT',
          percentage: false,
          percentageAmount: 12,
          prefix: 'VATEX',
          receiptLabel: '(VAT)'
        };


        store.dispatch(
          addSpecsDiscount(orderData.orderId, product.productCode, vatDiscount, false)
        );
        store.dispatch(updateAmounts());
      }

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  const saveNewSpecs = async (remarks) => {
    const settings = JSON.parse(localStorage.getItem('settings'));
    const storedData = JSON.parse(localStorage.getItem('userData'));
    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();

    let orderId = '';
    cart.confirmOrders.forEach((order) => {
      orderId = order.orderId;
    });

    try {
      const apiData = {
        category: product.category._id,
        orderId,
        productName: product.name,
        productCode: product.productCode,
        categoryName: product.category.name,
        price: product.price,
        quantity: 1,
        branchCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
        vatable: product.vatable
      };

      const res = await axios.put(`${Endpoints.ORDER}/add-order-item`, apiData, {
        withCredentials: true
      });

      const specsData = res.data.data;

      addUserActivityLog(
        storedData.user.firstname,
        storedData.user.lastname,
        storedData.user.employeeId,
        'Transaction',
        `${capitalCase(storedData.user.firstname)} ${capitalCase(
          storedData.user.lastname
        )} has added a new for payment item with an No.: ${specsData.poNumber
        } and amounting of ${fCurrency('P', roundUpAmount(apiData.price))}.`,
        'New Item',
        `${posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
        online
      );

      store.dispatch(addSpecs([], specsData));
      store.dispatch(updateAmounts());

      if (product.vatable === true) {
        const vatDiscount = {
          label: 'VAT',
          percentage: true,
          percentageAmount: 12,
          prefix: 'VATEX',
          receiptLabel: '(VAT)'
        };

        store.dispatch(
          addSpecsDiscount(apiData.orderId, apiData.productCode, vatDiscount, false)
        );
        store.dispatch(updateAmounts());
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <>
      <CardRoot onClick={handleAddProductRemarksModalOpen}>
        <CardBox>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">
              {`${titleCase(product.name.toLowerCase())} `}{' '}
            </Typography>
            {product.vatable === true && (
              <Typography variant="subtitle1" noWrap>
                <Chip size="small" label="Ex. VAT" color="secondary" />
              </Typography>
            )}
          </Stack>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} fontSize={12}>
            {`SKU: ${product.productCode}`}
          </Typography>
          <Typography variant="subtitle1" sx={{ position: 'absolute', bottom: 16, left: 16 }}>
            {fCurrency('P', product.price)}
          </Typography>
        </CardBox>
      </CardRoot>
      {/* <AddProduct open={addProductModalOpen} setOpen={setAddProductModalOpen} product={product} /> */}
      <AddProductRemarks
        open={remarksModalOpen}
        setOpen={setRemarksModalOpen}
        product={product}
        onSave={handleAddProduct}
      />
    </>
  );
}
