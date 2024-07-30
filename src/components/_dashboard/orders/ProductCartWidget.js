import { useState, useRef, useEffect } from 'react';
// import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Menu,
  Card,
  Stack,
  Button,
  Divider,
  MenuItem,
  Checkbox,
  IconButton,
  Typography,
  ListItemText,
  Chip
} from '@mui/material';
// icons
import { Icon } from '@iconify/react';
import dropdownIcon from '@iconify/icons-eva/arrow-down-fill';
import editCartIcon from '@iconify/icons-eva/edit-2-outline';
import RemoveIcon from '@iconify/icons-eva/trash-outline';
// utils
import { capitalCase, titleCase } from 'text-case';
import { filter } from 'lodash';
import uniqid from 'uniqid';
import { fCurrency } from '../../../utils/formatNumber';
// components
import CartItemList from './CartItemList';
import Scrollbar from '../../Scrollbar';
import { DiscountModal, CheckoutModal } from './modals';
import { ReturnReceipt, PackageReceipt } from '../reports';
// redux
import { store } from '../../../redux/cart/store';
import {
  updateSelectedOrders,
  addSelectedOrders,
  updateAmounts,
  removeTransactionDiscount,
  removePayment,
  clearCart,
  updateSelectedReturnOrders,
  addSelectedReturnOrders,
  clearReturnCart,
  updateReturnAmountDue,
  clearPackageCart
} from '../../../redux/cart/action';
import { ordersStore } from '../../../redux/orders/store';
// functions
import addUserActivityLog from '../../../functions/common/addUserActivityLog';
import useNetwork from '../../../functions/common/useNetwork';
import { SettingsCategoryEnum } from '../../../enum/Settings';
import { Endpoints } from '../../../enum/Endpoints';
// ----------------------------------------------------------------------

const CART_ACTIONS = [
  { bind: '1', id: 'itemDiscount', label: 'Item Discount' },
  { bind: '2', id: 'orderDiscount', label: 'Order Discount' },
  // { bind: null, id: 'freeItem', label: 'Free Item' },
  { bind: '3', id: 'priceOverride', label: 'Price Override' },
  { bind: '4', id: 'transactionDiscount', label: 'Transaction Discount' }
  // { bind: null, id: 'packageTransaction', label: 'Package Transaction' }
];

// ----------------------------------------------------------------------

const CART_WIDTH = 400;

const CartBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  width: CART_WIDTH,
  height: 'calc(100% - 30px)',
  right: 0,
  top: 0,
  padding: theme.spacing(3),
  backgroundColor: theme.palette.grey[100]
}));

const CartHeader = styled(Stack)(({ theme }) => ({
  paddingBottom: theme.spacing(5),

  '& > button': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: 4,
    '&:hover': {
      backgroundColor: theme.palette.primary.main
    }
  }
}));

const CartSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0)
}));

const CartCustomer = styled(Box)(({ theme }) => ({
  '& > div:first-of-type': {
    padding: theme.spacing(2),
    borderRadius: 8,
    cursor: 'pointer'
  },
  '& svg': {
    fontSize: 16,
    color: theme.palette.text.secondary
  }
}));

const StyledMenu = styled(Menu)({
  marginTop: 8,

  '& .MuiPaper-root': {
    width: 352
  },

  '& .MuiMenuItem-root': {
    display: 'block'
  }
});

const RemoveItemIcon = styled(Box)(({ theme }) => ({
  padding: 8,
  lineHeight: '14px',
  cursor: 'pointer',

  '& svg': {
    fontSize: 14,
    color: theme.palette.error.main
  }
}));

// ----------------------------------------------------------------------

/* eslint-disable react/prop-types */

const roundUpAmount = (num) => {
  // num = Math.round(num * 100) / 100;
  num = Number(num);
  num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

  return num;
};

const discountType = (discounts) => {
  let discountType;
  let discountArr = [];

  discounts.map((disc, i) => discountArr.push(disc.prefix));

  discountType = discountArr
    .join(' | ')
    .replace('PERCENTAGE', 'PNT')
    .replace('FIXED', 'FXD')
    .replace('SCD-5%', 'SCD5')
    .replace('SCD', 'SCD20')
    .replace('SCD205', 'SCD5')
    .replace('PWD', 'PWD20')
    .replace('DPLMTS', 'VATEX')
    .replace('PACKAGEDISCOUNT', 'PCKGDSC');

  return discountType;
};

const computeGlobalDiscount = (cart, specs) => {
  // const notZero = cart.confirmOrders[0].ordersSpecs.length;
  // const notZero = cart.confirmOrders[0].ordersSpecs.filter((x) => x.price !== 0).length;
  let notZero = 0;
  cart.confirmOrders[0].ordersSpecs.forEach((line) => {
    if (line.price !== 0) {
      notZero += line.quantity * 1;
    }
  });

  const discounts = cart.discounts.reduce((x, y) => x + y.amount, 0);
  const split = (discounts / notZero) * specs.quantity;

  const result = notZero > 1 ? split : discounts;

  return specs.price > 0 ? roundUpAmount(result) : specs.price;
};

function DiscountContent({ value, title, amount, percentageAmount, onClick }) {
  return (
    <Stack direction="row" alignItems="center">
      <RemoveItemIcon onClick={() => onClick()}>
        <Icon icon={RemoveIcon} />
      </RemoveItemIcon>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Typography variant="subtitle2">{`Discount ${titleCase(
          `${value === 'percentage' ? `${title} (${percentageAmount}%)` : title}`
        )}: `}</Typography>
        <Typography variant="subtitle2">-{fCurrency('P', roundUpAmount(amount))}</Typography>
      </Stack>
    </Stack>
  );
}

function PaymentContent({ amount, label, onClick }) {
  return (
    <Stack direction="row" alignItems="center">
      <RemoveItemIcon onClick={() => onClick()}>
        <Icon icon={RemoveIcon} />
      </RemoveItemIcon>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: '100%' }}
      >
        <Typography variant="subtitle2">{`Payment (${label}):`}</Typography>
        <Typography variant="subtitle2">-{fCurrency('P', amount)}</Typography>
      </Stack>
    </Stack>
  );
}
/* eslint-disable react/prop-types */

// ----------------------------------------------------------------------

export default function CartWidget() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode, ecomm, companyCode, warehouseCode } = settings[SettingsCategoryEnum.UnitConfig];
  const { taxCodeExempt, taxCodeRegular, taxCodeZeroRated } = settings[SettingsCategoryEnum.BirInfo];
  const [ordersState, setOrdersState] = useState(ordersStore.getState());
  const { online } = useNetwork();

  useEffect(() => {
    const updateOrdersState = () => {
      setOrdersState(ordersStore.getState());
    };

    ordersStore.subscribe(updateOrdersState);
  }, []);

  const [anchorEl, setAnchorEl] = useState(null);
  const [height, setHeight] = useState(0);

  const editCartRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const cartRef = useRef(null);
  const open = Boolean(anchorEl);

  const state = store.getState();
  const [cart, setCart] = useState(state.cart);
  const [returnCart, setReturnCart] = useState(state.returnCart);
  const [packageCart, setPackageCart] = useState(state.packageCart);

  const [retrieveOrders, setRetrieveOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [cartActionOpen, setcartActionOpen] = useState(false);

  const [discountModal, setDiscountModal] = useState({ status: false, type: null });
  const [checkoutModal, setCheckoutModal] = useState(false);

  const [previewReturnData] = useState();
  const [previewReturnOpen, setPreviewReturnOpen] = useState(false);

  const [previewPackageData, ] = useState();
  const [previewPackageOpen, setPreviewPackageOpen] = useState(false);

  useEffect(() => {
    if (headerRef.current && footerRef.current) {
      const cartHeight = cartRef.current.offsetHeight;
      const footerHeight = footerRef.current.offsetHeight;
      const headerHeight = headerRef.current.offsetHeight;
      const spacing = 48;

      setHeight(cartHeight - (headerHeight + footerHeight + spacing));
    }
  }, [height, footerRef.current?.offsetHeight]);

  useEffect(() => {
    updateState();
    store.subscribe(updateState);
  }, []);

  const updateState = () => {
    const state = store.getState();
    setCart(state.cart);
    setReturnCart(state.returnCart);
    setPackageCart(state.packageCart);
  };

  const fetchAvailableOrders = async () => {
    try {
      const posDate = localStorage.getItem('transactionDate');
      const res = await axios.get(
        `${Endpoints.ORDER}/order/for-payment/${posDate}`
      );
      const ordersData = res.data.data;

      setRetrieveOrders(ordersData);

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  const fetchReturnOrders = async () => {
    if (ordersState.activeCategory) {
      try {
        const res = await axios.get(
          `${Endpoints.ORDER}/order/return/${storeCode}`
        );
        const ordersData = res.data.data;

        setReturnOrders(ordersData);

        // eslint-disable-next-line no-empty
      } catch (err) { }
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (cart.selectedOrders.length === 0 && returnCart.selectedOrders.length === 0) {
      fetchAvailableOrders();
      fetchReturnOrders();
    }
  };

  const handleToggle = (order) => {
    store.dispatch(clearReturnCart());

    const currentIndex = cart.selectedOrders.indexOf(order);
    let newSelectedOrders = [...cart.selectedOrders];

    if (currentIndex === -1) {
      newSelectedOrders.push(order);
    } else {
      newSelectedOrders.splice(currentIndex, 1);
    }

    newSelectedOrders.forEach((order, index) => {
      order.id = index;
    });

    newSelectedOrders = newSelectedOrders.filter((x) => x.id === newSelectedOrders.length - 1);
    store.dispatch(updateSelectedOrders(newSelectedOrders));
  };

  const handleToggleReturn = (order) => {
    store.dispatch(clearCart());

    const currentIndex = returnCart.selectedOrders.indexOf(order);
    const newSelectedOrders = [...returnCart.selectedOrders];

    if (currentIndex === -1) {
      newSelectedOrders.push(order);
    } else {
      newSelectedOrders.splice(currentIndex, 1);
    }

    newSelectedOrders.forEach((order) => {
      const getSelectedSpecs = async () => {
        try {
          const res = await axios.get(
            `${Endpoints.ORDER}/orders-specs/return/${order.orderId}`
          );
          let specsData = res.data.data;

          const peripherals = ['G100', 'M100', 'S100', 'L100', 'F100'];

          specsData.forEach((specs) => {
            specs.price = Number(specs.price);

            if (peripherals.includes(specs.productCode)) {
              if (specs.otherItemName && specs.otherPrice) {
                specs.itemName = specs.otherItemName;
                specs.productCode = specs.productUpgrade;
                specs.description = specs.otherMaterial;
              } else {
                const filteredSpecs = filter(specsData, (_specs) => _specs !== specs);
                specsData = filteredSpecs;
              }
            }

            if (specs.lensCode) {
              const getProduct = async (productCode) => {
                try {
                  const res = await axios.get(
                    `${Endpoints.ORDER}/product/single-item/scanner/${productCode}`
                  );
                  const productData = await res.data.data[0];

                  productData.price = Number(productData.price);
                  specs.upgrades = productData;

                  // eslint-disable-next-line no-empty
                } catch (err) { }
              };

              getProduct(specs.lensCode);
            }
          });

          order.ordersSpecs = specsData;
          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      getSelectedSpecs();
    });

    store.dispatch(updateSelectedReturnOrders(newSelectedOrders));
  };

  const handleClose = (type) => {
    setAnchorEl(null);

    if (type !== 'null') {
      if (type === 'regular') {
        store.dispatch(addSelectedOrders(cart.selectedOrders));
        store.dispatch(updateAmounts());

        if (cart.selectedOrders.length === 0) {
          store.dispatch(clearCart());
        }
      } else {
        store.dispatch(clearCart());
        store.dispatch(addSelectedReturnOrders(returnCart.selectedOrders));
        store.dispatch(updateReturnAmountDue());
      }

      store.dispatch(clearPackageCart());
    }
  };

  const handleEditCart = (action) => {
    setDiscountModal({ status: true, type: action });
    setcartActionOpen(false);
  };

  const handleCheckout = async () => {

    if (cart.confirmOrders.length > 0) {
      setCheckoutModal(true);
    } else if (returnCart.confirmOrders.length > 0) {

      const handlePrintReturn = async (orders, siNumberData, txnNumberData, transactionDate) => {
        try {
          const res = await axios.get(
            `${Endpoints.ORDER}/return/orig-numbers/${orders[0].ordersSpecs[0].poNumber}`
          );
          const origSiNumber = res.data.siNumber;
          const origTxnNumber = res.data.txnNumber;

          try {
            const res = await axios.get(
              `${Endpoints.TRANSACTION}/void/specs/${origTxnNumber}`
            );
            const returnedData = res.data.data;

            returnedData.txnNumber = txnNumberData;
            returnedData.data.cart.txnNumber = txnNumberData;
            returnedData.data.cart.siNumber = siNumberData;
            returnedData.data.cart.origTxnNumber = origTxnNumber;
            returnedData.data.cart.origSiNumber = origSiNumber;
            returnedData.transactionDate = transactionDate;

            const storedData = JSON.parse(localStorage.getItem('userData'));

            const computeSpecsPrice = (order, specs, cart) => {
              const normalPrice = specs.price * specs.quantity;
              let computedPrice = specs.overridedPrice ? specs.overridedPrice : normalPrice;

              if (specs.discounts) {
                let totalItemDiscount = 0;

                specs.discounts.forEach((discount) => {
                  const oneItemDiscount = discount.amount / specs.quantity;
                  totalItemDiscount += oneItemDiscount;
                });

                if (totalItemDiscount > computedPrice) {
                  computedPrice -= computedPrice;
                } else {
                  computedPrice -= totalItemDiscount;
                }
              }

              if (specs.upgrades) {
                const upgradesPrice = specs.upgrades.price;
                computedPrice += upgradesPrice;

                if (specs.upgrades.discounts) {
                  let totalUpgradesDiscount = 0;

                  specs.upgrades.discounts.forEach((discount) => {
                    totalUpgradesDiscount += discount.amount;
                  });

                  if (totalUpgradesDiscount > upgradesPrice) {
                    computedPrice -= upgradesPrice;
                  } else {
                    computedPrice -= totalUpgradesDiscount;
                  }
                }
              }

              if (order.discounts) {
                // order.ordersSpecs.forEach((specs) => {
                //   const price = specs.overridedPrice || specs.price * specs.quantity;

                //   if (price !== 0) {
                //     totalNumberOrderSpecs += 1;
                //   }
                // });

                let totalNumberOrderSpecs = order.ordersSpecs.length;

                let totalOrderDiscount = 0;

                order.discounts.forEach((discount) => {
                  totalOrderDiscount = discount.amount;
                });

                computedPrice -= totalOrderDiscount / totalNumberOrderSpecs;
              }

              if (cart.discounts) {
                let totalNumberTransactionSpecs = 0;

                cart.confirmOrders.forEach((order) => {
                  order.ordersSpecs.forEach((specs) => {
                    const price = specs.overridedPrice || specs.price * specs.quantity;

                    if (price !== 0) {
                      totalNumberTransactionSpecs += specs.quantity * 1;
                    }
                  });
                });

                // totalNumberTransactionSpecs = cart.confirmOrders[0].ordersSpecs.length;

                let totalTransactionDiscount = 0;

                cart.discounts
                  .filter((x) => !x.percentage)
                  .forEach((discount) => {
                    totalTransactionDiscount += discount.amount;
                  });

                computedPrice -= totalTransactionDiscount / totalNumberTransactionSpecs;

                let totalTransactionDiscountPercentage = 0;

                cart.discounts
                  .filter((x) => x.percentage)
                  .forEach((discount) => {
                    totalTransactionDiscountPercentage += computeGlobalDiscount(cart, specs);
                  });

                computedPrice -= totalTransactionDiscountPercentage;
              }

              // return computedPrice.toFixed(2);
              return roundUpAmount(computedPrice / specs.quantity);
            };

            const addSpSlReport = async (posDate, siNumber, order, specs, index, returnedData) => {
              // const generateReturnPoNumber = (poNumber) => {
              //   const storeCode = settings.storeCode;
              //   let formattedPoNumber = poNumber.slice(storeCode.length);
              //   const poStr = '' + '7637';
              //   const poPad = '0000';
              //   formattedPoNumber += poPad.substring(0, poPad.length - poStr.length) + poStr;

              //   let storeCodeStartingLength = 0;

              //   for (let i = 0; i < storeCode.length; i++) {
              //     if (formattedPoNumber.charAt(i) === '0') {
              //       storeCodeStartingLength++;
              //     } else {
              //       i = storeCode.length;
              //     }
              //   }

              //   formattedPoNumber = `${settings.storeCode}${formattedPoNumber.slice(
              //     storeCodeStartingLength
              //   )}`;

              //   return formattedPoNumber;
              // };

              let taxCode = '';

              if (
                specs.discounts?.filter(
                  (x) =>
                    x.prefix === 'SCD' ||
                    x.prefix === 'PWD' ||
                    x.prefix === 'PNSTMD' ||
                    (x.prefix === 'VAT' && x.prefix === 'PACKAGEDISCOUNT') ||
                    x.prefix === 'VAT' ||
                    x.prefix === 'DPLMTS'
                ).length > 0 ||
                cart.discounts.filter(
                  (x) =>
                    x.prefix === 'SCD-5%' ||
                    x.prefix === 'PWD' ||
                    x.prefix === 'PNSTMD' ||
                    x.prefix === 'DPLMTS'
                ).length > 0
              ) {
                taxCode = taxCodeExempt;
              } else if (
                specs.discounts?.filter((x) => x.prefix === 'VATZR').length > 0 ||
                cart.discounts.filter((x) => x.prefix === 'VATZR').length > 0
              ) {
                taxCode = taxCodeZeroRated;
              } else {
                taxCode = taxCodeRegular;
              }

              const peripherals = ['G100', 'M100', 'S100', 'L100', 'F100'];

              const apiData = {
                sunniessSlId: uniqid(storeCode),
                postingDate: posDate,
                invoiceNo: siNumber,
                lineNo: index + 1,
                itemCode: peripherals.includes(specs.productCode)
                  ? specs.productUpgrade
                  : specs.productCode,
                description: specs.itemName,
                taxCode,
                quantity: `-${specs.quantity}`,
                grossPrice: specs.price,
                netPrice:
                  specs.price !== 0
                    ? computeSpecsPrice(order, specs, returnedData.data.cart)
                    : specs.price,
                discountType: specs.discounts ? discountType(specs.discounts) : '',
                discountPercentage: specs.discounts
                  ? specs.discounts.reduce((x, y) => x + y?.percentageAmount || 0, 0)
                  : 0,
                discountAmount: specs.discounts
                  ? specs.discounts.reduce((x, y) => x + y.amount, 0) / specs.quantity
                  : 0,
                globalDiscountType: returnedData.data.cart.discounts
                  ? discountType(returnedData.data.cart.discounts)
                  : '',
                globalDiscountPercentage: returnedData.data.cart.discounts
                  ? returnedData.data.cart.discounts.reduce(
                    (x, y) => x + y?.percentageAmount || 0,
                    0
                  )
                  : 0,
                globalDiscountAmount: returnedData.data.cart.discounts
                  ? computeGlobalDiscount(returnedData.data.cart, specs)
                  : 0,
                salesAttendant: '',
                cashier: storedData.user.employeeId,
                doctor: '',
                timestamp: posDate.split(' ')[1],
                customerName: '',
                companyCode,
                storeCode,
                specsSalesType: 'STORE',
                specsFromWarehouse:
                  ecomm || !specs.warehouseCode
                    ? warehouseCode
                    : specs.warehouseCode,
                poNumber: specs.poNumber,
                status: 'return'
              };

              try {
                await axios.post(`${process.env.REACT_APP_API_URL}/reports/sp/sl`, apiData, {
                  withCredentials: true
                });

                // eslint-disable-next-line no-empty
              } catch (err) { }
            };

            returnedData.data.cart.confirmOrders.forEach((node) => {
              node.ordersSpecs.forEach((specs, index) => {
                addSpSlReport(
                  returnedData.transactionDate,
                  returnedData.data.cart.siNumber,
                  node,
                  specs,
                  index + 1,
                  returnedData
                );
              });
            });

            const addSpClReport = async (
              posDate,
              siNumber,
              tenderType,
              tenderCode,
              amount,
              cardNo,
              expiryDate,
              reference,
              index
            ) => {
              const apiData = {
                sunniessClId: uniqid(storeCode),
                postingDate: posDate,
                invoiceNo: siNumber,
                lineNo: index,
                tenderType,
                amount,
                cardNo,
                expiryDate,
                reference,
                tenderCode,
                companyCode,
                storeCode
              };

              try {
                await axios.post(`${process.env.REACT_APP_API_URL}/reports/sp/cl`, apiData, {
                  withCredentials: true
                });

                // eslint-disable-next-line no-empty
              } catch (err) { }
            };

            addSpClReport(
              transactionDate,
              siNumberData,
              'RETURN',
              'RT',
              returnedData.data.cart.amounts.cashChange - returnedData.data.cart.payments[0].amount,
              '',
              '',
              '',
              1
            );

            try {
              const storedData = JSON.parse(localStorage.getItem('userData'));

              const apiData = {
                cart: returnedData.data.cart,
                cashier: returnedData.data.cashier,
                settings
              };

              await axios.post(`${Endpoints.TRANSACTION}/return/receipt`, apiData, {
                headers: {
                  'Content-Type': 'application/json',
                  'auth-token': storedData.token
                },
                withCredentials: true
              });

              const addPreview = async (data) => {
                const apiData = {
                  txnNumber: data.txnNumber,
                  type: 'return',
                  storeCode: data.storeCode,
                  transactionDate: data.transactionDate,
                  data: data.data
                };

                // const formData = new FormData();
                // formData.append('apiData', JSON.stringify(apiData));

                try {
                  await axios.post(`${process.env.REACT_APP_API_URL}/reports/preview`, apiData, {
                    withCredentials: true
                  });

                  // eslint-disable-next-line no-empty
                } catch (err) { }
              };

              addPreview(returnedData);

              let totalReturnAmount = 0;

              returnedData.data.cart.confirmOrders.forEach((order) => {
                order.ordersSpecs.forEach((specs) => {
                  totalReturnAmount += specs.price * specs.quantity;
                });
              });

              localStorage.setItem(
                'rmes',
                JSON.stringify({
                  siNumber: siNumberData,
                  amount: totalReturnAmount
                })
              );

              // eslint-disable-next-line no-empty
            } catch (err) { }

            // eslint-disable-next-line no-empty
          } catch (err) { }

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      const addPosTransaction = async (transactionDate, totalReturnAmount, returnSiNumber) => {
        const storedData = JSON.parse(localStorage.getItem('userData'));

        try {
          const apiData = {
            amount: returnCart.amountDue,
            cashierId: storedData.user.employeeId,
            storeCode,
            type: 'return',
            transactionDate,
            returnSiNumber: `${returnSiNumber}-1`
          };

          const res = await axios.post(
            `${Endpoints.ORDER}/pos-transaction`,
            apiData,
            {
              withCredentials: true
            }
          );
          const siNumberData = res.data.siNumber;
          const txnNumberData = res.data.txnNumber;

          addUserActivityLog(
            storedData.user.firstname,
            storedData.user.lastname,
            storedData.user.employeeId,
            'Transaction',
            `${capitalCase(storedData.user.firstname)} ${capitalCase(
              storedData.user.lastname
            )} has confirmed a return order with an Transaction Number: ${txnNumberData} with total amount of ${fCurrency(
              'P',
              roundUpAmount(totalReturnAmount)
            )}.`,
            'Confirm Return',
            `${posDateData[0]
            } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
            online
          );

          handlePrintReturn(returnCart.confirmOrders, siNumberData, txnNumberData, transactionDate);

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      const posDateData = localStorage.getItem('transactionDate').split(' ');
      const todayDate = new Date();
      const transactionDate = `${posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;

      let totalReturnAmount = 0;
      let returnSiNumber;

      returnCart.confirmOrders.forEach((order) => {
        order.ordersSpecs.forEach((specs) => {

          totalReturnAmount += specs.price * specs.quantity;
          returnSiNumber = specs.siNumber;
        });
      });

      addPosTransaction(transactionDate, totalReturnAmount, returnSiNumber);

      store.dispatch(clearReturnCart());
    }
  };

  const handleRemoveTransactionDiscount = (discount) => {
    store.dispatch(removeTransactionDiscount(discount));
    store.dispatch(updateAmounts());
  };

  const handleRemovePayment = (payment) => {
    store.dispatch(removePayment(payment));
    store.dispatch(updateAmounts());
  };

  const handleSuspendOrder = () => {
    try {
      const addPosTransaction = async () => {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        const posDateData = localStorage.getItem('transactionDate').split(' ');
        const todayDate = new Date();
        const transactionDate = `${posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;

        let suspendAmount = 0;

        cart.confirmOrders.forEach((order) => {
          order.products.forEach((specs) => {
            suspendAmount += Number(specs.price);
          });
        });

        try {
          const apiData = {
            amount: suspendAmount,
            cashierId: storedData.user.employeeId,
            storeCode,
            type: 'suspend',
            transactionDate
          };

          const res = await axios.post(
            `${Endpoints.ORDER}/pos-transaction`,
            apiData,
            {
              withCredentials: true
            }
          );
          const txnNumberData = res.data.txnNumber;

          addUserActivityLog(
            storedData.user.firstname,
            storedData.user.lastname,
            storedData.user.employeeId,
            'Transaction',
            `${capitalCase(storedData.user.firstname)} ${capitalCase(
              storedData.user.lastname
            )} has suspended an order with an Transaction Number: ${txnNumberData} with total amount of ${fCurrency(
              'P',
              roundUpAmount(suspendAmount)
            )}.`,
            'Suspended Order',
            `${posDateData[0]
            } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
            online
          );

          for (const order of cart.confirmOrders) {
            await axios.patch(`${Endpoints.ORDER}/suspend`, {
              orderId: order.orderId
            });
          }

          // eslint-disable-next-line no-empty
        } catch (err) { }
      };

      addPosTransaction();
      store.dispatch(clearCart());

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  // =============================== BIND KEY: START

  // trigger discount
  useEffect(() => {
    const discountKeyDown = (e) => {
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        if (e.key === 'd') {
          setcartActionOpen(true);
        }
      }
    };

    // initiate
    document.addEventListener('keydown', discountKeyDown);

    return () => {
      // cleanup
      document.removeEventListener('keydown', discountKeyDown);
    };
  }, []);

  // trigger discount options
  useEffect(() => {
    const numOpts = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

    if (cartActionOpen) {
      const optionKeyDown = (e) => {
        if (numOpts.includes(e.key)) {
          const validNum = CART_ACTIONS.filter((x) => x.bind === e.key)[0] || null;

          if (validNum) {
            handleEditCart(validNum.id);
          }
        }
      };

      // initiate
      document.addEventListener('keydown', optionKeyDown);

      return () => {
        // cleanup
        document.removeEventListener('keydown', optionKeyDown);
      };
    }
  }, [cartActionOpen]);

  // =============================== BIND KEY: END

  return (
    <>
      <CartBox ref={cartRef}>
        <Box ref={headerRef}>
          <CartHeader direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Order Summary</Typography>
            <IconButton ref={editCartRef} onClick={() => setcartActionOpen(true)}>
              <Icon icon={editCartIcon} width={24} height={24} />
            </IconButton>
            <Menu
              open={cartActionOpen}
              anchorEl={editCartRef.current}
              onClose={() => setcartActionOpen(false)}
              PaperProps={{
                sx: { width: 200, maxWidth: '100%' }
              }}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {CART_ACTIONS.map((option) => (
                <MenuItem
                  key={option.id}
                  onClick={() => handleEditCart(option.id)}
                  sx={
                    option.id === 'orderDiscount' && cart.confirmOrders.length === 1
                      ? { display: 'none' }
                      : {}
                  }
                >
                  <ListItemText
                    primary={`${option.bind} - ${option.label}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </MenuItem>
              ))}
            </Menu>
          </CartHeader>
          <CartCustomer>
            {cart.confirmOrders.length > 0 ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                onClick={handleSuspendOrder}
              >
                Suspend Order
              </Button>
            ) : (
              <Card
                id="customer-order-button"
                aria-controls="customer-order-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={(e) => handleClick(e)}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="subtitle2">Retrieve Order</Typography>
                    <Typography variant="body2" fontSize={11}>
                      You can select multiple orders
                    </Typography>
                  </div>
                  {/* {cart.confirmOrders.length > 0 || returnCart.confirmOrders.length > 0 ? (
                  <div style={{ maxWidth: 200 }}>
                    <Typography noWrap variant="subtitle2">
                      {cart.confirmOrders.map((order, i) => (
                        <Typography key={i} component="span" fontSize={14}>{`${
                          i ? ', ' : ''
                        } ${titleCase(`${order.firstname} ${order.lastname}`)}`}</Typography>
                      ))}
                      {returnCart.confirmOrders.map((order, i) => (
                        <Typography key={i} component="span" fontSize={14}>{`${
                          i ? ', ' : ''
                        } ${titleCase(`${order.firstname} ${order.lastname}`)}`}</Typography>
                      ))}
                    </Typography>
                    <Typography noWrap variant="body2" fontSize={11}>
                      {cart.confirmOrders.map((order, i) => (
                        <Typography key={i} component="span" fontSize={11}>
                          {`${i ? ', ' : ''} ${order.orderId}`}
                        </Typography>
                      ))}
                      {returnCart.confirmOrders.map((order, i) => (
                        <Typography key={i} component="span" fontSize={11}>
                          {`${i ? ', ' : ''} ${order.orderId}`}
                        </Typography>
                      ))}
                    </Typography>
                  </div>
                ) : (
                  <div>
                    <Typography variant="subtitle2">Retrieve Order</Typography>
                    <Typography variant="body2" fontSize={11}>
                      You can select multiple orders
                    </Typography>
                  </div>
                )} */}
                  <Icon icon={dropdownIcon} />
                </Stack>
              </Card>
            )}

            <StyledMenu
              id="customer-order-menu"
              MenuListProps={{
                'aria-labelledby': 'customer-order-button'
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleClose('null')}
            >
              <Scrollbar style={{ maxHeight: 300 }}>
                {retrieveOrders.map((order) => (
                  <MenuItem key={order.orderId} onClick={() => handleToggle(order)} disableRipple>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box component="section">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" mr={1}>
                            {titleCase(`${order.firstName ? order.firstName : 'Guest'} ${order.lastName ? order.lastName : 'Guest'}`)}
                          </Typography>
                          {order.status === 'suspend' && (
                            <Chip
                              label="SUSPEND"
                              color="warning"
                              size="small"
                              sx={{ fontSize: 10, color: '#fff' }}
                            />
                          )}
                        </Box>
                        <Typography variant="body2" fontSize={11}>
                          {order.orderId}
                        </Typography>
                      </Box>
                      <Checkbox
                        checked={
                          order.orderId ===
                          cart.selectedOrders.filter(
                            (checked) => checked.orderId === order.orderId
                          )[0]?.orderId
                        }
                        disableRipple
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Scrollbar>
              <Divider />
              <Scrollbar style={{ maxHeight: 300 }}>
                {returnOrders.map((order) => (
                  <MenuItem
                    key={order.orderId}
                    onClick={() => handleToggleReturn(order)}
                    disableRipple
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box component="section">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle2" mr={1}>
                            {titleCase(`${order.firstName} ${order.lastName}`)}
                          </Typography>
                          <Chip
                            label="RETURN"
                            color="warning"
                            size="small"
                            sx={{ fontSize: 10, color: '#fff' }}
                          />
                        </Box>

                        <Typography variant="body2" fontSize={11}>
                          {order.orderId}
                        </Typography>
                      </Box>
                      <Checkbox
                        checked={
                          order.orderId ===
                          returnCart.selectedOrders.filter(
                            (checked) => checked.orderId === order.orderId
                          )[0]?.orderId
                        }
                        disableRipple
                      />
                    </Stack>
                  </MenuItem>
                ))}
              </Scrollbar>
              <Divider />
              <Box px={2} pt={1}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() =>
                    handleClose(cart.selectedOrders.length === 0 ? 'return' : 'regular')
                  }
                >
                  Confirm Order
                </Button>
              </Box>
            </StyledMenu>
          </CartCustomer>
        </Box>
        <CartSection>
          <CartItemList maxHeight={height} />
        </CartSection>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            bottom: 0,
            right: 0,
            padding: (theme) => theme.spacing(2, 3),
            backgroundColor: (theme) => theme.palette.grey[100]
          }}
          ref={footerRef}
        >
          {cart.amounts.subtotal !== cart.amounts.amountDue ? (
            <>
              <Box sx={{ paddingRight: '12px', maxHeight: '150px', overflow: 'auto' }}>
                <Box mb={1} sx={{ paddingLeft: '8px' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2">Subtotal:</Typography>
                    <Typography variant="subtitle2">
                      {fCurrency('P', roundUpAmount(cart.amounts.subtotal))}
                    </Typography>
                  </Stack>
                </Box>
                {cart.discounts.map((discount, index) => (
                  <Box key={`${discount}_${index}`} mb={1} sx={{ paddingLeft: '8px' }}>
                    <DiscountContent
                      key={discount.value}
                      value={discount.value}
                      title={discount.label}
                      amount={discount.amount}
                      percentageAmount={discount.percentageAmount}
                      onClick={() => handleRemoveTransactionDiscount(discount)}
                    />
                  </Box>
                ))}
              </Box>
            </>
          ) : (
            ''
          )}
          {cart.payments.length !== 0 ? (
            <Box sx={{ paddingRight: '12px', maxHeight: '150px', overflow: 'auto' }}>
              {cart.payments.map((payment, index) => (
                <Box key={`${payment}_${index}`} mb={1} sx={{ paddingLeft: '8px' }}>
                  <PaymentContent
                    id={payment.id}
                    label={payment.label}
                    amount={roundUpAmount(payment.amount)}
                    onClick={() => handleRemovePayment(payment)}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            ''
          )}
          <Box mb={1} sx={{ padding: '0 12px 0 8px' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Total QTY:</Typography>
              <Typography variant="subtitle2">
                {cart.confirmOrders.length > 0
                  ? cart.confirmOrders.reduce(
                      (totalQty, order) =>
                        totalQty +
                        order.products.reduce(
                          (subtotalQty, specs) => subtotalQty + specs.quantity,
                          0
                        ),
                      0
                    )
                  : 0}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Amount Due:</Typography>
              <Typography variant="subtitle2">
                {cart.confirmOrders.length > 0 &&
                  fCurrency('P', roundUpAmount(cart.amounts.amountDue))}
                {returnCart.confirmOrders.length > 0 &&
                  fCurrency('P', roundUpAmount(returnCart.amountDue))}
                {packageCart.confirmPackages.length > 0 &&
                  fCurrency('P', roundUpAmount(packageCart.amountDue))}
                {cart.confirmOrders.length === 0 &&
                  returnCart.confirmOrders.length === 0 &&
                  packageCart.confirmPackages.length === 0 &&
                  fCurrency('P', '0.00')}
              </Typography>
            </Stack>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => handleCheckout()}
          >
            {cart.confirmOrders.length > 0 && 'Checkout'}
            {returnCart.confirmOrders.length > 0 && 'Confirm Return'}
            {packageCart.confirmPackages.length > 0 && 'Confirm Packages'}
            {cart.confirmOrders.length === 0 &&
              returnCart.confirmOrders.length === 0 &&
              packageCart.confirmPackages.length === 0 &&
              'Checkout'}
          </Button>
        </Box>
      </CartBox>
      <DiscountModal
        open={discountModal}
        setOpen={setDiscountModal}
      />
      <CheckoutModal open={checkoutModal} setOpen={setCheckoutModal} />
      {previewReturnData && (
        <ReturnReceipt
          open={previewReturnOpen}
          setOpen={setPreviewReturnOpen}
          data={previewReturnData}
        />
      )}
      {previewPackageData && (
        <PackageReceipt
          open={previewPackageOpen}
          setOpen={setPreviewPackageOpen}
          data={previewPackageData}
          doublePrinting={true}
        />
      )}
    </>
  );
}
