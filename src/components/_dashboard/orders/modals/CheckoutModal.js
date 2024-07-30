/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import moment from 'moment';
// iconify
import { Icon } from '@iconify/react';
import cashMethodIcon from '@iconify/icons-mdi/hand-coin-outline';
import creditCardMethodIcon from '@iconify/icons-ant-design/credit-card-outline';
import qrCodeMethodIcon from '@iconify/icons-ant-design/scan-outline';
import giftCardIcon from '@iconify/icons-ant-design/gift-outlined';
import loyaltyMethodIcon from '@iconify/icons-ant-design/user-outline';
import rmesMethodIcon from '@iconify/icons-mdi/exchange';
import cashOnDeliveryIcon from '@iconify/icons-mdi/cash-fast';
import mayaIcon from '@iconify/icons-arcticons/maya';
import gcashIcon from '@iconify/icons-arcticons/gcash';
import paypalIcon from '@iconify/icons-ic/baseline-paypal';
import walletIcon from '@iconify/icons-ic/baseline-wallet';
import moneyIcon from '@iconify/icons-mdi/money';
// import lalamoveIcon from '@iconify/icons-arcticons/lalamove';
// material
import { styled } from '@mui/material/styles';
import { Modal, Card, Box, Grid, Typography, Button } from '@mui/material';
// utils
import { capitalCase, upperCase } from 'text-case';
import uniqid from 'uniqid';
import { sum, fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
import {
  CashMethod,
  CardMethod,
  GiftCardMethod,
  EWalletMethod,
  LoyaltyMethod,
  LazadaMethod,
  ShoppeeMethod,
  ZaloraMethod,
  RmesMethod,
  CODMethod,
  CardMethodNew
} from '.';
import { RegularReceipt } from '../../reports';
import CustomPaymentMethod from './CustomPaymentMethod';
// redux
import { store } from '../../../../redux/cart/store';
import { clearCart } from '../../../../redux/cart/action';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';
import { MallAccrEnum, SettingsCategoryEnum } from '../../../../enum/Settings';
import { Endpoints } from '../../../../enum/Endpoints';
import { Backdrop, StyledModal } from '../../reports/modal/styles/commonModalStyles';
import roundUpAmount from '../../../../utils/roundUpAmount';
import {
  computeGlobalDiscount,
  computeSpecsPrice,
  computeVatDetails,
  formatCartPayments,
  getOrdersToUpdate,
  getPaymentLogsToInsert,
  getPosDiscountTransactions,
  getPromoCodeLogs,
  getSCPWDDiscounts,
  preparePosTransactionPayload
} from '../../../../utils/checkout/checkoutService';

// ----------------------------------------------------------------------

const getIcon = (item) => {
  let icon = {
    cash: cashMethodIcon,
    creditCard: creditCardMethodIcon,
    eWallet: qrCodeMethodIcon,
    loyalty: loyaltyMethodIcon,
    giftCard: giftCardIcon,
    lazada: cashMethodIcon,
    shoppee: cashMethodIcon,
    zalora: cashMethodIcon,
    rmes: rmesMethodIcon,
    cashOnDelivery: cashOnDeliveryIcon,
    gcash: gcashIcon,
    gcashQr: gcashIcon,
    maya: mayaIcon,
    mayaQr: mayaIcon,
    paypal: paypalIcon,
    atome: walletIcon,
    paymongo: walletIcon,
    lalamove: cashOnDeliveryIcon,
    lbc: cashOnDeliveryIcon,
    wsi: cashOnDeliveryIcon,
    payo: cashOnDeliveryIcon,
    consegnia: cashOnDeliveryIcon,
    bdoCredit: creditCardMethodIcon,
    mayaCredit: creditCardMethodIcon,
    bdoDebit: creditCardMethodIcon,
    mayaDebit: creditCardMethodIcon
  }[item.id];

  if (!icon && item.key?.startsWith('CUSTOM::')) {
    if (item.type?.startsWith('c_')) {
      icon = cashMethodIcon;
    } else if (item.type?.split('_')[1]?.toLowerCase()?.includes('card')) {
      icon = creditCardMethodIcon;
    } else if (item.type?.split('_')[1]?.toLowerCase()?.includes('e-wallet')) {
      icon = walletIcon;
    } else if (item.type?.startsWith('rd_')) {
      icon = rmesMethodIcon;
    }
  }

  if (!icon) {
    icon = moneyIcon;
  }

  return icon;
};

// const discountType = (discounts) => {
//   let discountType;
//   let discountArr = [];

//   discounts.map((disc, i) =>
//     discountArr.push(disc.prefix === 'PROMOCODE' ? disc.label : disc.prefix)
//   );

//   const pckgDiscRename = () => {
//     let label = '';

//     if (discounts.filter((x) => x.prefix === 'PACKAGEDISCOUNT' && x.scd).length) {
//       label = 'SCDPCKG';
//     } else if (discounts.filter((x) => x.prefix === 'PACKAGEDISCOUNT' && x.pwd).length) {
//       label = 'PWDPCKG';
//     } else {
//       label = 'PCKGDSC';
//     }

//     return label;
//   };

//   discountType = discountArr
//     .join(' | ')
//     .replace('PERCENTAGE', 'PNT')
//     .replace('FIXED', 'FXD')
//     .replace('SCD-5%', 'SCD5')
//     .replace('SCD', 'SCD20')
//     .replace('SCD205', 'SCD5')
//     .replace('PWD', 'PWD20')
//     .replace('DPLMTS', 'VATEX')
//     .replace('PACKAGEDISCOUNT', pckgDiscRename());

//   return discountType;
// };

const cashTypes = ['cash', 'Payo', 'WSI', 'LBC', 'Lalamove', 'Consegnia'];
const nonCashTypes = [
  'Atome',
  'GCash',
  'GCash QR',
  'Maya',
  'Maya QR',
  'PayPal',
  'PayMongo',
  'Card (BDO Credit)',
  'Card (BDO Debit)',
  'Card (Maya Credit)',
  'Card (Maya Debit)'
];
const paymentMethodInfo = {
  cash: {
    cash: {
      paymentMethodString: 'C',
      paymentDescriptionString: 'CASH',
      tenderType: 'C',
      tenderCode: 'C',
      tenderDesc: 'CASH'
    },
    Payo: {
      paymentMethodString: 'PAYO',
      paymentDescriptionString: 'PAYO',
      tenderType: 'PAYO',
      tenderCode: 'PY',
      tenderDesc: 'PAYO'
    },
    WSI: {
      paymentMethodString: 'WSI',
      paymentDescriptionString: 'WSI',
      tenderType: 'WSI',
      tenderCode: 'WSI',
      tenderDesc: 'WSI'
    },
    LBC: {
      paymentMethodString: 'LBC',
      paymentDescriptionString: 'LBC',
      tenderType: 'LBC',
      tenderCode: 'LBC',
      tenderDesc: 'LBC'
    },
    Lalamove: {
      paymentMethodString: 'LALAMOVE',
      paymentDescriptionString: 'LALAMOVE',
      tenderType: 'LALAMOVE',
      tenderCode: 'LLM',
      tenderDesc: 'LALAMOVE'
    },
    Consegnia: {
      paymentMethodString: 'CONSEGNIA',
      paymentDescriptionString: 'CONSEGNIA',
      tenderType: 'CONSEGNIA',
      tenderCode: 'CNSGN',
      tenderDesc: 'CONSEGNIA'
    }
  },
  nonCash: {
    Atome: {
      paymentMethodString: 'ATOME',
      paymentDescriptionString: 'ATOME',
      tenderType: 'ATOME',
      tenderCode: 'ATOME',
      tenderDesc: 'ATOME'
    },
    GCash: {
      paymentMethodString: 'GCASH',
      paymentDescriptionString: 'GCASH',
      tenderType: 'GCASH',
      tenderCode: 'GX',
      tenderDesc: 'GCASH'
    },
    'GCash QR': {
      paymentMethodString: 'GCASH QR',
      paymentDescriptionString: 'GCASH QR',
      tenderType: 'GCASH QR',
      tenderCode: 'GXQR',
      tenderDesc: 'GCASH QR'
    },
    Maya: {
      paymentMethodString: 'MAYA',
      paymentDescriptionString: 'MAYA',
      tenderType: 'MAYA',
      tenderCode: 'MAYA',
      tenderDesc: 'MAYA'
    },
    'Maya QR': {
      paymentMethodString: 'MAYA QR',
      paymentDescriptionString: 'MAYA QR',
      tenderType: 'MAYA QR',
      tenderCode: 'MYQR',
      tenderDesc: 'MAYA QR'
    },
    PayPal: {
      paymentMethodString: 'PAYPAL',
      paymentDescriptionString: 'PAYPAL',
      tenderType: 'PAYPAL',
      tenderCode: 'PP',
      tenderDesc: 'PAYPAL'
    },
    PayMongo: {
      paymentMethodString: 'PAYMONGO',
      paymentDescriptionString: 'PAYMONGO',
      tenderType: 'PAYMONGO',
      tenderCode: 'PM',
      tenderDesc: 'PAYMONGO'
    },
    'Card (BDO Credit)': {
      paymentMethodString: 'CCBDO',
      paymentDescriptionString: 'BDO CREDIT',
      tenderType: 'BDO CREDIT',
      tenderCode: 'CCBDO',
      tenderDesc: 'BDO CREDIT'
    },
    'Card (BDO Debit)': {
      paymentMethodString: 'DBBDO',
      paymentDescriptionString: 'BDO DEBIT',
      tenderType: 'BDO DEBIT',
      tenderCode: 'DBBDO',
      tenderDesc: 'BDO DEBIT'
    },
    'Card (Maya Credit)': {
      paymentMethodString: 'CCMY',
      paymentDescriptionString: 'MAYA CREDIT',
      tenderType: 'MAYA CREDIT',
      tenderCode: 'CCMY',
      tenderDesc: 'MAYA CREDIT'
    },
    'Card (Maya Debit)': {
      paymentMethodString: 'DBMY',
      paymentDescriptionString: 'MAYA DEBIT',
      tenderType: 'MAYA DEBIT',
      tenderCode: 'DBMY',
      tenderDesc: 'MAYA DEBIT'
    }
  }
};

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

const CardOptions = styled(Box)(({ theme }) => ({
  height: 80,
  width: 100,
  borderRadius: 8,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  '&:not(:last-of-type)': {
    marginBottom: 4
  },
  '& p': {
    fontSize: 12,
    marginTop: 8
  },
  '& svg': {
    fontSize: 32
  }
}));

// ----------------------------------------------------------------------

CheckoutModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CheckoutModal({ open, setOpen }) {
  const { apiKey, deviceId } = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
  const settings = JSON.parse(localStorage.getItem('settings'));
  const activePaymentMethod = settings.paymentMethod.filter((a) => a.active === true);
  const { storeCode, devMode, nonVat } = settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const {  mallAccr, } = settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const { online } = useNetwork();
  // redux states
  const state = store.getState();
  const { cart } = state;
  // payment method state
  const [method, setMethod] = useState(activePaymentMethod[0]);

  const [changeModal, setChangeModal] = useState(false);
  const [change, setChange] = useState(0);

  const [previewRegularData, setPreviewRegularData] = useState();
  const [previewRegularOpen, setPreviewRegularOpen] = useState(false);

  const getPaymentMethodForm = (method) => {
    const forms = {
      cash: <CashMethod setOpen={setOpen} />,
      creditCard: <CardMethod setOpen={setOpen} />,
      loyalty: <LoyaltyMethod setOpen={setOpen} />,
      giftCard: <GiftCardMethod setOpen={setOpen} />,
      lazada: <LazadaMethod setOpen={setOpen} />,
      shoppee: <ShoppeeMethod setOpen={setOpen} />,
      zalora: <ZaloraMethod setOpen={setOpen} />,
      rmes: <RmesMethod setOpen={setOpen} />,
      lalamove: <CODMethod setOpen={setOpen} type={'lalamove'} />,
      lbc: <CODMethod setOpen={setOpen} type={'lbc'} />,
      wsi: <CODMethod setOpen={setOpen} type={'wsi'} />,
      payo: <CODMethod setOpen={setOpen} type={'payo'} />,
      consegnia: <CODMethod setOpen={setOpen} type={'consegnia'} />,
      gcash: <EWalletMethod setOpen={setOpen} type="gcash" />,
      gcashQr: <EWalletMethod setOpen={setOpen} type="gcashQr" />,
      maya: <EWalletMethod setOpen={setOpen} type="maya" />,
      mayaQr: <EWalletMethod setOpen={setOpen} type="mayaQr" />,
      paypal: <EWalletMethod setOpen={setOpen} type="paypal" />,
      paymongo: <EWalletMethod setOpen={setOpen} type="paymongo" />,
      atome: <EWalletMethod setOpen={setOpen} type="atome" />,
      bdoCredit: <CardMethodNew setOpen={setOpen} type="bdoCredit" />,
      bdoDebit: <CardMethodNew setOpen={setOpen} type="bdoDebit" />,
      mayaCredit: <CardMethodNew setOpen={setOpen} type="mayaCredit" />,
      mayaDebit: <CardMethodNew setOpen={setOpen} type="mayaDebit" />
    };

    let form = forms[method.id];

    if (!form && method.type?.startsWith('rd_')) {
      form = <RmesMethod setOpen={setOpen} />;
    }

    if (!form && method.key?.startsWith('CUSTOM::')) {
      form = <CustomPaymentMethod setOpen={setOpen} paymentMethodData={method} />;
    }

    return form;
  };

  useEffect(() => {
    const saveOrderCheckout = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        const posDateData = localStorage.getItem('transactionDate').split(' ');
        const todayDate = new Date();
        const productDate = `${moment(posDateData[0]).format('YYYY-MM-DD')} ${moment(
          todayDate
        ).format('HH:mm:ss')}`;

        if (!devMode) {
          const setOpenDrawer = async () => {
            try {
              await axios.post(
                `${Endpoints.REPORTS}/open-drawer`,
                {
                  settings
                },
                {
                  withCredentials: true
                }
              );

              // eslint-disable-next-line no-empty
            } catch (err) {}

            return true;
          };

          if (
            cart.payments.filter((x) => x.value === 'cash' || x.value === 'giftCard').length > 0
          ) {
            setOpenDrawer();
          }
        }

        const posTxnPayload = {
          amount: cart.amounts.noPayment,
          cashierId: storedData.user.employeeId,
          storeCode: storeCode,
          type: 'regular',
          transactionDate: productDate
        };

        cart.isNonVat = settings[SettingsCategoryEnum.UnitConfig].nonVat === true;
        let formattedCart = formatCartPayments(cart);

        const { vatableSale, vatAmount, vatExempt, vatZeroRated, nonVatable, totalAmount } =
          computeVatDetails(formattedCart, settings);

        const posTxnAmountPayload = {
          vatableSale,
          vatAmount,
          vatExempt,
          vatZeroRated,
          nonVatable,
          cashierId: storedData.user.employeeId,
          storeCode: storeCode,
          totalAmount,
          transactionDate: productDate
        };

        const activityPayload = {
          firstname: storedData.user.firstname,
          lastname: storedData.user.lastname,
          employeeId: storedData.user.employeeId,
          activity: 'Transaction',
          description: {
            user: {
              firstname: capitalCase(storedData.user.firstname),
              lastname: capitalCase(storedData.user.lastname)
            },
            total: fCurrency('P', roundUpAmount(formattedCart.amounts.noPayment))
          },
          action: 'Order Checkout',
          storeCode,
          activityDate: `${
            posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
        };

        const realtime = `${moment(new Date()).format('YYYY-MM-DD')} ${moment(productDate).format(
          'HH:mm:ss'
        )}`;

        formattedCart.branchCode = storeCode;
        formattedCart.cartDate = realtime;

        const previewPayload = {
          type: 'regular',
          storeCode: storeCode,
          transactionDate: productDate,
          data: {
            cart: formattedCart,
            cashier: {
              id: storedData.user.employeeId,
              firstname: storedData.user.firstname,
              lastname: storedData.user.lastname
            }
          }
        };

        const printPayload = {
          apiData: {
            cart: previewPayload.data.cart,
            cashier: previewPayload.data.cashier
          },
          settings
        };

        const {
          ordersToUpdate: ordersToUpdatePayload,
          posDiscountOrderLog: posDiscountOrderLogsPayload,
          posDiscountItemLog: posDiscountItemLogsPayload,
          posSCPWDReport: posSCPWDReportPayload
        } = getOrdersToUpdate(
          formattedCart,
          posDateData[0],
          settings,
          productDate,
          storedData.user.employeeId
        );

        const paymentLogsToInsertPayload = getPaymentLogsToInsert(
          formattedCart,
          productDate,
          settings,
          storedData.user.employeeId
        );

        let scPwdDiscountsPayload = [];
        if (formattedCart.discounts) {
          scPwdDiscountsPayload = getSCPWDDiscounts(formattedCart, productDate, settings);
        }

        let posDiscountsTransactionPayload = [];
        if (formattedCart.discounts) {
          posDiscountsTransactionPayload = getPosDiscountTransactions(
            formattedCart,
            productDate,
            settings,
            storedData.user.employeeId
          );
        }

        const promoCodePayload = getPromoCodeLogs(formattedCart, settings);

        const umbraSystemsPayload = {
          apiKey,
          deviceId
        };

        const payload = {
          posTxnPayload,
          posTxnAmountPayload,
          activityPayload,
          previewPayload,
          printPayload,
          ordersToUpdatePayload,
          posDiscountOrderLogsPayload,
          posDiscountItemLogsPayload,
          posSCPWDReportPayload,
          paymentLogsToInsertPayload,
          scPwdDiscountsPayload,
          posDiscountsTransactionPayload,
          promoCodePayload,
          umbraSystemsPayload
        };

        const result = await axios.post(`${Endpoints.ORDER}/checkout`, payload, {
          withCredentials: true
        });

        if (result.status === 200) {
          formattedCart.siNumber = result.data.siNumber
          formattedCart.txnNumber = result.data.txnNumber
          const cartCopy = structuredClone(formattedCart);

          store.dispatch(clearCart());

          if (mallAccr === MallAccrEnum.SM) {
            let skip = false;
            const hasRMES = cart.payments.filter((payment) => payment.label === 'RMES');
            if (hasRMES?.length > 0) skip = true;

            if (!skip) {
              // Update Transactions in SM files
                await Promise.all([
                  axios.put(
                    `${Endpoints.ACCREDITATION}/sm/update-transaction-details`,
                    {
                      transactionDate: posDateData[0],
                      settings: settings,
                      siNumber: result.data.siNumber
                    }
                  ),
                  axios.put(`${Endpoints.ACCREDITATION}/sm/update-transaction`, {
                    transactionDate: posDateData[0],
                    settings: settings,
                    siNumber: result.data.siNumber
                  })
                ]);

                // Add transaction to SM Transaction Details and Transaction file
                await Promise.all([
                  axios.post(`${Endpoints.ACCREDITATION}/sm/save-transaction-details`, {
                    transactionType: 'regular',
                    transactionDate: posDateData[0],
                    cart: cartCopy,
                    settings: settings
                  }),
                  await axios.post(`${Endpoints.ACCREDITATION}/sm/save-transaction`, {
                    transactionType: 'regular',
                    transactionDate: posDateData[0],
                    cart: cartCopy,
                    settings: settings
                  })
                ]);
            }
          }

          if (mallAccr === MallAccrEnum.Araneta) {
            await axios.post(`${Endpoints.ACCREDITATION}/araneta`, {
              cart: cartCopy,
              settings,
              posDate: localStorage.getItem('transactionDate')
            });
          }
        }

        //TODO: WHEN LOYALTY ADJUSTMENT DONE
        // cart.discounts.forEach((discount) => {
        //   const updatePosLoyaltyPoints = async (customerId, newPoints) => {
        //     try {
        //       const apiData = {
        //         customerId,
        //         newPoints
        //       };

        //       await axios.patch(`${Endpoints.ORDER}/pos-loyalty-points/update-points`, apiData, {
        //         withCredentials: true
        //       });

        //       // eslint-disable-next-line no-empty
        //     } catch (err) {}
        //   };

        //   if (discount.prefix === 'LOYALTYPOINTS') {
        //     updatePosLoyaltyPoints(
        //       discount.customerLoyaltyId,
        //       discount.previousPoints - discount.redeemedPoints
        //     );
        //   }
        // });
      } catch (err) {
        console.log('err ', err);
      }
    };

    if (cart.amounts.amountDue < 1 && cart.payments.length > 0) {
      // set change in store
      setChange(cart.amounts.cashChange);
      setOpen(false);

      if (cart.amounts.cashChange > 0) {
        setChangeModal(true);
      }

      saveOrderCheckout();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, cart.amounts.amountDue, cart.payments, cart.amounts.cashChange]);

  // change payment method function
  const handleChangeMethod = (method) => {
    setMethod(method);
  };

  const handleCompleteTransaction = () => {
    setChangeModal(false);
    store.dispatch(clearCart());
  };

  const excludeCustomGiftCardsFilter = (paymentMethod) => !paymentMethod.type?.startsWith('gc_');

  // display settings
  const activeRootStyle = {
    color: 'primary.contrastText',
    bgcolor: 'primary.main',
    '&:hover': {
      bgcolor: 'primary.main'
    }
  };

  return (
    <>
      <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
        <ModalCard>
          <Grid container alignItems="stretch" flexWrap="nowrap" maxHeight={550}>
            <Grid item width={140}>
              <Scrollbar
                sx={{
                  height: '100%',
                  '& .simplebar-content': { height: '100%' }
                }}
              >
                {activePaymentMethod.filter(excludeCustomGiftCardsFilter).map((item) => (
                  <CardOptions
                    key={item.id}
                    sx={item.id === method.id && activeRootStyle}
                    onClick={() => handleChangeMethod(item)}
                  >
                    <Icon icon={getIcon(item)} />
                    <Typography style={{textAlign: 'center'}}>{item.label}</Typography>
                  </CardOptions>
                ))}
              </Scrollbar>
            </Grid>
            <Grid item sx={{ width: '100%', position: 'relative' }}>
              <Typography variant="h6">{method.title}</Typography>
              <Box mt={3}>{getPaymentMethodForm(method)}</Box>
            </Grid>
          </Grid>
        </ModalCard>
      </StyledModal>
      <StyledModal open={changeModal} BackdropComponent={Backdrop}>
        <ModalCard sx={{ padding: (theme) => theme.spacing(12, 0) }}>
          <Typography align="center" variant="h5" component="p">
            Customer's Change:
          </Typography>
          <Typography align="center" variant="h1">
            P{change}
          </Typography>
          <Button
            variant="outlined"
            size="large"
            onClick={handleCompleteTransaction}
            sx={{ width: 250, margin: '50px auto 0', display: 'block' }}
          >
            Change has been taken out
          </Button>
        </ModalCard>
      </StyledModal>
      {previewRegularData && (
        <RegularReceipt
          open={previewRegularOpen}
          setOpen={setPreviewRegularOpen}
          data={previewRegularData}
          doublePrinting={true}
        />
      )}
    </>
  );
}
