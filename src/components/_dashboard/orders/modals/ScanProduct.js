import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import { Card, Modal, Typography, Grid, TextField, Box, Stack, Button } from '@mui/material';
// utils
import { capitalCase } from 'text-case';
import { fCurrency } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import {
  addSpecs,
  addOrder,
  updateAmounts,
  updateQuantity,
  addSpecsDiscount
} from '../../../../redux/cart/action';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

const roundUpAmount = (num) => {
  num = Number(num);
  num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

  return num;
};

// ----------------------------------------------------------------------

ScanProduct.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  timestamp: PropTypes.number.isRequired
};

// ----------------------------------------------------------------------

export default function ScanProduct({ open, setOpen, product, setProduct, timestamp }) {
  const state = store.getState();
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { online } = useNetwork();

  const [cart, setCart] = useState(
    state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart
  );
  const [prevProduct, setPrevProduct] = useState(null);
  const [inputValues, setInputValues] = useState({
    quantity: 1,
    order: '',
    branchCode: settings.storeCode
  });

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      handleAddProduct(product);
    }
  };

  useEffect(() => {
    updateState();
    store.subscribe(updateState);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValues]);

  useEffect(() => {
    if (prevProduct && prevProduct?.productBarcode !== product.productBarcode) {
      handleAddProduct(prevProduct, true);
    } else if (prevProduct && prevProduct?.productBarcode === product.productBarcode) {
      handleIncrement('quantity');
    }

    setPrevProduct(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp]);

  const handleIncrement = (key) => {
    setInputValues((prevState) => ({
      ...prevState,
      [key]: prevState[key] + 1
    }));
  };

  const updateState = () => {
    const state = store.getState();
    setCart(state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart);
  };

  const matchRuleShort = (str, rule) => {
    const escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1'); // eslint-disable-line
    return new RegExp('^' + rule.split('*').map(escapeRegex).join('.*') + '$').test(str); // eslint-disable-line
  };

  const saveNewSpecsAndOrder = async (product) => {
    try {
      const apiData = {
        firstname: 'guest',
        lastname: 'guest',
        mobile: '123',
        email: 'guest@email.com',
        branchCode: settings.storeCode,
        paymentMethod: ''
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/order/order`, apiData, {
        withCredentials: true
      });
      const orderData = res.data.data;

      const storedData = JSON.parse(localStorage.getItem('userData'));
      const posDateData = localStorage.getItem('transactionDate').split(' ');
      const todayDate = new Date();

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
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
        online
      );

      const handleNewOrder = async (orderData) => {
        const posDateData = localStorage.getItem('transactionDate').split(' ');
        const todayDate = new Date();

        try {
          const apiData = {
            orderId: orderData.orderId,
            profileId: orderData.profileId,
            itemName: product.itemName,
            price: Number(product.price),
            quantity: Number(inputValues.quantity),
            productCodeDisplay: product.productCode,
            productCode: product.productCode,
            productUpgrade: '',
            currency: 'PHP',
            status: 'for payment',
            lensOption: 'without prescription',
            branchCode: inputValues.branchCode,
            specsFromWarehouse: settings.warehouseCode,
            specsDate: `${posDateData[0]
              } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
          };

          if (settings.activeCategory === 'OPTICAL') {
            if (
              matchRuleShort(apiData.productCode, '*SS1*') ||
              matchRuleShort(apiData.productCode, '*60253-*')
            ) {
              apiData.productUpgrade = 'fashion_lens';
            } else if (
              matchRuleShort(apiData.productCode, '*MC1016*') ||
              matchRuleShort(apiData.productCode, '*MC1015*') ||
              matchRuleShort(apiData.productCode, 'MGC*') ||
              matchRuleShort(apiData.productCode, 'MLBC*') ||
              matchRuleShort(apiData.productCode, 'MHC*') ||
              matchRuleShort(apiData.productCode, '*MH1007*') ||
              matchRuleShort(apiData.productCode, '*MH1008*') ||
              matchRuleShort(apiData.productCode, 'MCK*') ||
              matchRuleShort(apiData.productCode, 'MSPVHC*') ||
              matchRuleShort(apiData.productCode, '*60319-*') ||
              matchRuleShort(apiData.productCode, '*DMP*') ||
              matchRuleShort(apiData.productCode, 'AFC*') ||
              matchRuleShort(apiData.productCode, 'PL*') ||
              matchRuleShort(apiData.productCode, 'MSCL*')
            ) {
              apiData.productUpgrade = apiData.productCode;
              apiData.productCode = 'M100';
            } else if (matchRuleShort(apiData.productCode, 'AR*')) {
              apiData.productUpgrade = 'G100';
            } else if (
              !matchRuleShort(apiData.productCode, 'MC*') &&
              !matchRuleShort(apiData.productCode, 'SS*') &&
              !matchRuleShort(apiData.productCode, 'SP*') &&
              !matchRuleShort(apiData.productCode, '*TINTSAP2019*') &&
              !matchRuleShort(apiData.productCode, 'SC*') &&
              !matchRuleShort(apiData.productCode, 'PL*') &&
              !matchRuleShort(apiData.productCode, 'CP*') &&
              !matchRuleShort(apiData.productCode, 'C*') &&
              !matchRuleShort(apiData.productCode, 'H*') &&
              !matchRuleShort(apiData.productCode, 'GC*') &&
              !matchRuleShort(apiData.productCode, 'L*') &&
              !matchRuleShort(apiData.productCode, 'MH*') &&
              !matchRuleShort(apiData.productCode, 'P*') &&
              !matchRuleShort(apiData.productCode, 'VC*') &&
              !matchRuleShort(apiData.productCode, 'SO*') &&
              !matchRuleShort(apiData.productCode, 'S100*') &&
              !matchRuleShort(apiData.productCode, 'M100*') &&
              !matchRuleShort(apiData.productCode, 'SR100*') &&
              !matchRuleShort(apiData.productCode, 'MSPVHC*') &&
              !matchRuleShort(apiData.productCode, 'KIL*') &&
              !matchRuleShort(apiData.productCode, 'F100*') &&
              !matchRuleShort(apiData.productCode, 'DR-FEE*') &&
              !matchRuleShort(apiData.productCode, 'KSS*') &&
              !matchRuleShort(apiData.productCode, 'MGC*') &&
              !matchRuleShort(apiData.productCode, 'MSPHC*') &&
              !matchRuleShort(apiData.productCode, '60319-*') &&
              !matchRuleShort(apiData.productCode, '60290-*') &&
              !matchRuleShort(apiData.productCode, '60315-*') &&
              !matchRuleShort(apiData.productCode, '*DMP*') &&
              !matchRuleShort(apiData.productCode, '*AFC*') &&
              !matchRuleShort(apiData.productCode, '*AR*') &&
              !matchRuleShort(apiData.productCode, '*AFC*') &&
              !matchRuleShort(apiData.productCode, '*MSCL*') &&
              !matchRuleShort(apiData.productCode, 'AR*') &&
              !matchRuleShort(apiData.productCode, 'DC*') &&
              !matchRuleShort(apiData.productCode, 'EL*') &&
              !matchRuleShort(apiData.productCode, 'ML*') &&
              !matchRuleShort(apiData.productCode, 'u*')
            ) {
              apiData.productUpgrade = apiData.productCode;
              apiData.productCode = 'S100';
            }
          }

          const saveNewOrderSpecs = async (apiData, orderData) => {
            try {
              const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/order/orders-specs`,
                apiData,
                {
                  withCredentials: true
                }
              );
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

              apiData.ordersSpecsId = specsData.ordersSpecsId;
              apiData.poNumber = specsData.poNumber;
              apiData.material = product.material;
              apiData.specsFromWarehouse = settings.warehouseCode;

              orderData.ordersSpecs = [apiData];

              store.dispatch(addOrder(orderData));
              store.dispatch(updateAmounts());

              const addPosSpecs = async (data) => {
                const storedData = JSON.parse(localStorage.getItem('userData'));

                try {
                  const apiData = {
                    orderId: data.orderId,
                    ordersSpecsId: data.ordersSpecsId,
                    productCodeDisplay: data.productCode,
                    productCode: data.productCode,
                    material: data.material === '' ? 'NO DESC' : data.material,
                    price: data.price,
                    quantity: Number(inputValues.quantity),
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

                  await axios.post(`${process.env.REACT_APP_API_URL}/order/pos-specs`, apiData, {
                    withCredentials: true
                  });

                  // eslint-disable-next-line no-empty
                } catch (err) { }
              };

              addPosSpecs(apiData); // here

              if (product.vatable === 'y') {
                const vatDiscount = {
                  label: 'VAT',
                  percentage: true,
                  percentageAmount: 12,
                  prefix: 'VATEX',
                  receiptLabel: '(VAT)'
                };

                store.dispatch(
                  addSpecsDiscount(apiData.orderId, apiData.ordersSpecsId, vatDiscount, false)
                );
                store.dispatch(updateAmounts());
              }

              // eslint-disable-next-line no-empty
            } catch (err) { }
          };

          saveNewOrderSpecs(apiData, orderData);

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      handleNewOrder(orderData);

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  const saveNewSpecs = async (product) => {
    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();

    let orderId = '';
    let profileId = '';

    cart.confirmOrders.forEach((order) => {
      orderId = order.orderId;
      profileId = order.profileId;
    });

    try {
      const apiData = {
        itemName: product.itemName,
        price: Number(product.price),
        quantity: Number(inputValues.quantity),
        productCodeDisplay: product.productCode,
        productCode: product.productCode,
        productUpgrade: '',
        orderId,
        profileId,
        currency: 'PHP',
        status: 'for payment',
        lensOption: 'without prescription',
        branchCode: settings.storeCode,
        specsDate: `${posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
      };

      if (settings.activeCategory === 'OPTICAL') {
        if (
          matchRuleShort(apiData.productCode, '*SS1*') ||
          matchRuleShort(apiData.productCode, '*60253-*')
        ) {
          apiData.productUpgrade = 'fashion_lens';
        } else if (
          matchRuleShort(apiData.productCode, '*MC1016*') ||
          matchRuleShort(apiData.productCode, '*MC1015*') ||
          matchRuleShort(apiData.productCode, 'MGC*') ||
          matchRuleShort(apiData.productCode, 'MLBC*') ||
          matchRuleShort(apiData.productCode, 'MHC*') ||
          matchRuleShort(apiData.productCode, '*MH1007*') ||
          matchRuleShort(apiData.productCode, '*MH1008*') ||
          matchRuleShort(apiData.productCode, 'MCK*') ||
          matchRuleShort(apiData.productCode, 'MSPVHC*') ||
          matchRuleShort(apiData.productCode, '*60319-*') ||
          matchRuleShort(apiData.productCode, '*DMP*') ||
          matchRuleShort(apiData.productCode, 'AFC*') ||
          matchRuleShort(apiData.productCode, 'PL*') ||
          matchRuleShort(apiData.productCode, 'MSCL*')
        ) {
          apiData.productUpgrade = apiData.productCode;
          apiData.productCode = 'M100';
        } else if (matchRuleShort(apiData.productCode, 'AR*')) {
          apiData.productUpgrade = 'G100';
        } else if (
          !matchRuleShort(apiData.productCode, 'MC*') &&
          !matchRuleShort(apiData.productCode, 'SS*') &&
          !matchRuleShort(apiData.productCode, 'SP*') &&
          !matchRuleShort(apiData.productCode, '*TINTSAP2019*') &&
          !matchRuleShort(apiData.productCode, 'SC*') &&
          !matchRuleShort(apiData.productCode, 'PL*') &&
          !matchRuleShort(apiData.productCode, 'CP*') &&
          !matchRuleShort(apiData.productCode, 'C*') &&
          !matchRuleShort(apiData.productCode, 'H*') &&
          !matchRuleShort(apiData.productCode, 'GC*') &&
          !matchRuleShort(apiData.productCode, 'L*') &&
          !matchRuleShort(apiData.productCode, 'MH*') &&
          !matchRuleShort(apiData.productCode, 'P*') &&
          !matchRuleShort(apiData.productCode, 'VC*') &&
          !matchRuleShort(apiData.productCode, 'SO*') &&
          !matchRuleShort(apiData.productCode, 'S100*') &&
          !matchRuleShort(apiData.productCode, 'M100*') &&
          !matchRuleShort(apiData.productCode, 'SR100*') &&
          !matchRuleShort(apiData.productCode, 'MSPVHC*') &&
          !matchRuleShort(apiData.productCode, 'KIL*') &&
          !matchRuleShort(apiData.productCode, 'F100*') &&
          !matchRuleShort(apiData.productCode, 'DR-FEE*') &&
          !matchRuleShort(apiData.productCode, 'KSS*') &&
          !matchRuleShort(apiData.productCode, 'MGC*') &&
          !matchRuleShort(apiData.productCode, 'MSPHC*') &&
          !matchRuleShort(apiData.productCode, '60319-*') &&
          !matchRuleShort(apiData.productCode, '60290-*') &&
          !matchRuleShort(apiData.productCode, '60315-*') &&
          !matchRuleShort(apiData.productCode, '*DMP*') &&
          !matchRuleShort(apiData.productCode, '*AFC*') &&
          !matchRuleShort(apiData.productCode, '*AR*') &&
          !matchRuleShort(apiData.productCode, '*AFC*') &&
          !matchRuleShort(apiData.productCode, '*MSCL*') &&
          !matchRuleShort(apiData.productCode, 'AR*') &&
          !matchRuleShort(apiData.productCode, 'DC*') &&
          !matchRuleShort(apiData.productCode, 'EL*') &&
          !matchRuleShort(apiData.productCode, 'ML*') &&
          !matchRuleShort(apiData.productCode, 'u*')
        ) {
          apiData.productUpgrade = apiData.productCode;
          apiData.productCode = 'S100';
        }
      }

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/order/orders-specs`, apiData, {
        withCredentials: true
      });
      const specsData = res.data.data;

      const storedData = JSON.parse(localStorage.getItem('userData'));

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

      apiData.ordersSpecsId = specsData.ordersSpecsId;
      apiData.poNumber = specsData.poNumber;
      apiData.material = product.material;

      store.dispatch(addSpecs(inputValues.order, apiData));
      store.dispatch(updateAmounts());

      const addPosSpecs = async (data) => {
        const storedData = JSON.parse(localStorage.getItem('userData'));

        try {
          const apiData = {
            orderId: data.orderId,
            ordersSpecsId: data.ordersSpecsId,
            productCodeDisplay: data.productCode,
            productCode: data.productCode,
            material: data.material === '' ? 'NO DESC' : data.material,
            price: data.price,
            quantity: Number(inputValues.quantity),
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

          await axios.post(`${process.env.REACT_APP_API_URL}/order/pos-specs`, apiData, {
            withCredentials: true
          });

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      addPosSpecs(apiData);

      if (product.vatable === 'y') {
        const vatDiscount = {
          label: 'VAT',
          percentage: true,
          percentageAmount: 12,
          prefix: 'VATEX',
          receiptLabel: '(VAT)'
        };

        store.dispatch(
          addSpecsDiscount(apiData.orderId, apiData.ordersSpecsId, vatDiscount, false)
        );
        store.dispatch(updateAmounts());
      }

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  const handleAddProduct = (productScanned, doNotClose = false) => {
    if (cart.confirmOrders.length === 0) {
      saveNewSpecsAndOrder(productScanned);
    } else {
      let productExist = false;

      cart.confirmOrders.forEach((order) => {
        order.ordersSpecs.forEach((specs) => {
          if (specs.productCode === productScanned.productCode) {
            productExist = true;
          }
        });
      });

      if (productExist) {
        store.dispatch(updateQuantity(productScanned.productCode, Number(inputValues.quantity)));
        store.dispatch(updateAmounts());
      } else {
        saveNewSpecs(productScanned);
      }
    }

    if (doNotClose) {
      handleReset();
    } else {
      handleCloseModal();
    }

    return true;
  };

  const handleReset = () => {
    setInputValues({
      quantity: 1,
      order: '',
      branchCode: settings.storeCode
    });
  };

  const handleCloseModal = () => {
    handleReset();
    setOpen(false);
    setProduct(null);
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Product Details</Typography>
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" type="text" value={product.itemName} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Price"
                type="text"
                value={product.price * inputValues.quantity}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="text"
                onChange={(e) =>
                  setInputValues({
                    ...inputValues,
                    quantity: e.target.value
                  })
                }
                value={inputValues.quantity}
                onFocus={(evt) => evt.target.select()}
              />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
            <Button variant="contained" size="large" color="error" onClick={handleCloseModal}>
              Cancel
            </Button>
            <LoadingButton
              variant="contained"
              size="large"
              onClick={() => handleAddProduct(product)}
            >
              Add item
            </LoadingButton>
          </Stack>
        </Box>
      </ModalCard>
    </StyledModal>
  );
}
