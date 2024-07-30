import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Divider, Button, Stack } from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
import moment from 'moment';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import ReceiptFooter from '../receipt-components/ReceiptFooter';
import ReceiptHeader from '../receipt-components/ReceiptHeader';
import { Endpoints } from '../../../../enum/Endpoints';

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
  padding: theme.spacing(1),
  width: 400
}));

// ----------------------------------------------------------------------

ReturnReceipt.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  fullData: PropTypes.object.isRequired
};

// ----------------------------------------------------------------------

export default function ReturnReceipt({ open, setOpen, fullData }) {
  const { data } = fullData;
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings[SettingsCategoryEnum.UnitConfig].storeCode

  const {mallAccr} = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  
  const [vats, setVats] = useState({
    vatableSale: 0,
    vatAmount: 0,
    vatExempt: 0,
    vatZeroRated: 0,
    nonVatable: 0
  });

  const roundUpAmount = (num) => {
    // num = Math.round(num * 100) / 100;
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  useEffect(() => {
    const computeVats = () => {
      let vatableSale = 0;
      let vatAmount = 0;
      let vatExempt = 0;
      let vatZeroRated = 0;

      if (
        data.cart.discounts.filter(
          (x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'SCD-5%'
        ).length > 0
      ) {
        vatExempt += data.cart.amounts.subtotal;

        data.cart.discounts
          // .filter((x) => x.prefix === 'VAT' || x.prefix === 'SCD-5%')
          .filter((x) => x.prefix === 'VAT')
          .forEach((discount) => {
            vatExempt -= discount.amount;
          });
      } else if (data.cart.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
        vatZeroRated += data.cart.amounts.subtotal;

        data.cart.discounts
          .filter((x) => x.prefix === 'VATZR')
          .forEach((discount) => {
            vatZeroRated -= discount.amount;
          });
      } else {
        data.cart.confirmOrders.forEach((order) => {
          order.products.forEach((specs, specsIndex) => {
            let specsPrice = specs.overridedPrice || specs.price * specs.quantity;

            if (specsIndex === 0) {
              if (data.cart.discounts) {
                data.cart.discounts.forEach((discount) => {
                  specsPrice -= discount.amount;
                });
              }
            }

            if (specs.discounts) {
              if (
                specs.discounts.filter(
                  (x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'VATEX'
                ).length > 0
              ) {
                vatExempt += specsPrice;

                specs.discounts
                  // .filter(
                  //   (x) =>
                  //     x.prefix === 'VAT' ||
                  //     x.prefix === 'SCD' ||
                  //     x.prefix === 'PWD' ||
                  //     x.prefix === 'PNSTMD' ||
                  //     x.prefix === 'VATEX'
                  // )
                  .filter(
                    (x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'VATEX'
                  )
                  .forEach((discount) => {
                    vatExempt -= discount.amount;
                  });
              } else if (specs.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
                vatZeroRated += specsPrice;

                specs.discounts
                  .filter((x) => x.prefix === 'VATZR')
                  .forEach((discount) => {
                    vatZeroRated -= discount.amount;
                  });
              } else {
                specs.discounts
                  .filter(
                    (x) =>
                      x.prefix !== 'VAT' &&
                      x.prefix !== 'SCD' &&
                      x.prefix !== 'PWD' &&
                      x.prefix !== 'PNSTMD' &&
                      x.prefix !== 'VATZR' &&
                      x.prefix !== 'VATEX'
                  )
                  .forEach((discount) => {
                    specsPrice -= discount.amount;
                  });

                vatAmount -= specsPrice / 1.12 - specsPrice;
                vatableSale += specsPrice / 1.12;
              }
            } else {
              vatableSale += specsPrice / 1.12;
              vatAmount += specsPrice - specsPrice / 1.12;
            }

            if (specs.upgrades) {
              let upgradesPrice = specs.upgrades.price;

              if (specs.upgrades.discounts) {
                if (specs.upgrades.discounts.filter((x) => x.prefix === 'VAT').length > 0) {
                  vatExempt += upgradesPrice;

                  specs.upgrades.discounts
                    .filter(
                      (x) =>
                        x.prefix === 'VAT' ||
                        x.prefix === 'SCD' ||
                        x.prefix === 'PWD' ||
                        x.prefix === 'PNSTMD'
                    )
                    .forEach((discount) => {
                      vatExempt -= discount.amount;
                    });
                } else if (
                  specs.upgrades.discounts.filter((x) => x.prefix === 'VATZR').length > 0
                ) {
                  vatZeroRated += specsPrice;

                  specs.upgrades.discounts
                    .filter((x) => x.prefix === 'VATZR')
                    .forEach((discount) => {
                      vatZeroRated -= discount.amount;
                    });
                } else {
                  specs.upgrades.discounts
                    .filter(
                      (x) =>
                        x.prefix !== 'VAT' &&
                        x.prefix !== 'SCD' &&
                        x.prefix !== 'PWD' &&
                        x.prefix !== 'PNSTMD' &&
                        x.prefix !== 'VATZR'
                    )
                    .forEach((discount) => {
                      upgradesPrice -= discount.amount;
                    });

                  vatAmount -= upgradesPrice / 1.12 - upgradesPrice;
                  vatableSale += upgradesPrice / 1.12;
                }
              } else {
                vatAmount += upgradesPrice - upgradesPrice / 1.12;
                vatableSale += upgradesPrice / 1.12;
              }
            }
          });
        });
      }

      setVats({
        vatableSale: data.cart.isNonVat ? 0 : vatableSale,
        vatAmount: data.cart.isNonVat ? 0 : vatAmount,
        vatExempt: data.cart.isNonVat ? 0 : vatExempt,
        vatZeroRated: data.cart.isNonVat ? 0 : vatZeroRated,
        nonVatable: data.cart.isNonVat ? data.cart.amounts.noPayment : 0
      });
    };

    computeVats();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handlePrintAgain = async () => {
    const apiData = {
      cart: data.cart,
      cashier: data.cashier,
      isReprint: true,
      settings,
      orig: {
        txnNumber: data.cart.txnNumber,
        siNumber: data.cart.siNumber
      }
    };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/transaction/return/receipt`, apiData, {
        withCredentials: true
      });

      // eslint-disable-next-line no-empty
    } catch (err) {}

    // robinson update reprint data
    if (mallAccr === 'robinson') {
      try {
        const dateOnly = moment(
          new Date(data.cart.confirmOrders[0].ordersSpecs[0].specsDate)
        ).format('YYYY-MM-DD');

        const reprintData = {
          type: 'return',
          siNumber: data.cart.siNumber,
          amount: -data.cart.amounts.subtotal
        };

        await axios.patch(
          `${Endpoints.ACCREDITATION}/robinson/reprint/${storeCode}/${dateOnly}`,
          reprintData,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (err) {}
    }
  };

  // const checkIfVatable = (discounts) => {
  //   const vatLength = discounts.filter((x) => x.prefix === 'VAT').length;
  //   return vatLength > 0 ? 'X' : 'T';
  // };

  let isVatZR = false;
  let vatZrRepresentative = '';
  let vatZrCert = '';

  data.cart.discounts
    .filter((x) => x.prefix === 'VATZR')
    .forEach((discount) => {
      isVatZR = true;
      vatZrRepresentative = discount.idNumber;
      vatZrCert = discount.pecaCertNo;
    });

  data.cart.confirmOrders.forEach((order) => {
    order.products.forEach((specs) => {
      if (specs.discounts) {
        specs.discounts
          .filter((x) => x.prefix === 'VATZR')
          .forEach((discount) => {
            isVatZR = true;
            vatZrRepresentative = discount.idNumber;
            vatZrCert = discount.pecaCertNo;
          });
      }
    });
  });

  const checkIfScdPwdField = (order) => {
    let isScPwd = false;
    let scPwdIdNumber = '';
    let type = '';

    data.cart.discounts
      .filter(
        (x) =>
          x.prefix === 'SCD' || x.prefix === 'SCD-5%' || x.prefix === 'PWD' || x.prefix === 'PNSTMD'
      )
      .forEach((discount) => {
        isScPwd = true;
        scPwdIdNumber = discount.idNumber;
        type = discount.prefix;
      });

    // if (order.discounts) {
    //   if (
    //     order.discounts.filter(
    //       (x) => x.prefix === 'SCD' || x.prefix === 'PWD' || x.prefix === 'PNSTMD'
    //     ).length > 0
    //   ) {
    //     isScPwd = true;
    //   }
    // }

    order.products.forEach((specs) => {
      if (specs.discounts) {
        specs.discounts
          .filter((x) => x.prefix === 'SCD' || x.prefix === 'PWD' || x.prefix === 'PNSTMD')
          .forEach((discount) => {
            isScPwd = true;
            scPwdIdNumber = discount.idNumber;
            type = discount.prefix;
          });
      }
    });

    return isScPwd ? (
      <>
        <Typography noWrap variant="subtitle2">
          {type === 'SCD' || type === 'SCD-5%' || type === 'PWD' ? 'SC/PWD TIN:' : ''}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {`${
            type === 'SCD' ||
            type === 'SCD-5%' ||
            type === 'PWD' ||
            (type === 'VAT' && type === 'PACKAGEDISCOUNT') ||
            type === 'VAT'
              ? 'OSCA ID/PWD ID:'
              : 'PNSTMD ID:'
          } ${scPwdIdNumber}`}
        </Typography>
        <Typography
          noWrap
          variant="subtitle2"
          sx={{ textAlign: 'center', my: 4, mx: 3, borderTop: '1px solid #000' }}
        >
          Signature
        </Typography>
      </>
    ) : (
      <>
        <Typography noWrap variant="subtitle2">
          TIN:
        </Typography>
        <Typography noWrap variant="subtitle2">
          Business Style:
        </Typography>
        <Typography noWrap variant="subtitle2">
          {isVatZR ? `PEZA Cert No: ${vatZrCert}` : 'OSCA ID/PED ID:'}
        </Typography>
        <Typography
          noWrap
          variant="subtitle2"
          sx={{
            textAlign: 'center',
            my: 4,
            mx: 3,
            borderTop: '1px solid #000',
            display: !isVatZR ? 'none' : 'block'
          }}
        >
          Signature
        </Typography>
      </>
    );
  };

  const checkIfCustomerInfoNeed = (isVatZR, vatZrRepresentative, order) => {
    let customerInfo = '';
    let isScPwd = false;

    data.cart.discounts
      .filter(
        (x) =>
          x.prefix === 'SCD' || x.prefix === 'SCD-5%' || x.prefix === 'PWD' || x.prefix === 'PNSTMD'
      )
      .forEach(() => {
        isScPwd = true;
      });

    // if (order.discounts) {
    //   if (
    //     order.discounts.filter(
    //       (x) => x.prefix === 'SCD' || x.prefix === 'PWD' || x.prefix === 'PNSTMD'
    //     ).length > 0
    //   ) {
    //     isScPwd = true;
    //   }
    // }

    order.products.forEach((specs) => {
      if (specs.discounts) {
        specs.discounts
          .filter(
            (x) =>
              x.prefix === 'SCD' ||
              x.prefix === 'PWD' ||
              x.prefix === 'PNSTMD' ||
              (x.prefix === 'VAT' && x.prefix === 'PACKAGEDISCOUNT') ||
              x.prefix === 'VAT'
          )
          .forEach(() => {
            isScPwd = true;
          });
      }
    });

    if (isVatZR) {
      customerInfo = `Customer: ${
        isVatZR
          ? vatZrRepresentative
          : `${order.lastname.toUpperCase()}, ${order.firstname.toUpperCase()}`
      } `;
    } else if (isScPwd) {
      customerInfo = `Customer: ${`${order.lastname.toUpperCase()}, ${order.firstname.toUpperCase()}`} `;
    } else {
      const notGuest = order.firstname && order.firstname.toUpperCase() !== 'GUEST';
      customerInfo = `Customer: ${
        notGuest ? order.lastname.toUpperCase() + ', ' + order.firstname.toUpperCase() : ''
      }`;
    }

    return customerInfo;
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Scrollbar sx={{ maxHeight: '80vh', px: 2 }}>
          <ReceiptHeader title="RETURN" vatable={data.cart.isNonVat}/>
          
          {data.cart.confirmOrders.map((order, index) => (
            <Box key={index} sx={{ borderBottom: '2px dashed #000' }}>
              <Box component="section" my={2}>
                <Typography noWrap variant="subtitle2">
                  {checkIfCustomerInfoNeed(isVatZR, vatZrRepresentative, order)}
                </Typography>
                <Typography noWrap variant="subtitle2">
                  Address:
                </Typography>
                {checkIfScdPwdField(order)}
                <Stack direction="row" justifyContent="space-between" mt={2}>
                  <Typography noWrap variant="subtitle2">
                    {`STORE # ${data.cart.branchCode}`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {`POS # ${settings[SettingsCategoryEnum.UnitConfig].terminalNumber}`}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`SI No.: ${data.cart.siNumber}-1`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    PHP
                  </Typography>
                </Stack>
                <Typography noWrap variant="subtitle2">
                  {`Txn No.: ${data.cart.newTxnNumber}`}
                </Typography>
                <Typography noWrap variant="subtitle2">
                  {`Date time: ${moment(data.cart.returnDate).format('MM/DD/YYYY - hh:mm:ss A')}`}
                </Typography>
              </Box>
              <Box
                component="section"
                sx={{
                  textAlign: 'center',
                  my: 1,
                  borderTop: '2px dashed #000'
                }}
              />
              {order.products.map((specs, index) => (
                <Box key={index}>
                  <Box component="section">
                    <Typography noWrap variant="subtitle2">
                      {`${specs.productCode} ${specs.productName}`}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={2}>
                        {`-${specs.quantity} PIECE @ ${fCurrency('', roundUpAmount(specs.price))}`}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {`${fCurrency(
                          '-',
                          specs.overridedPrice
                            ? roundUpAmount(specs.overridedPrice)
                            : roundUpAmount(specs.price * specs.quantity)
                        )}`}
                      </Typography>
                    </Stack>
                    {specs.discounts &&
                      specs.discounts.map((discount, index) => (
                        <Stack key={index} direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2" ml={3}>
                            {`LESS ${discount.receiptLabel} ${
                              discount.prefix === 'PERCENTAGE'
                                ? `${discount.percentageAmount}%`
                                : ''
                            }`}
                          </Typography>
                          <Typography noWrap variant="subtitle2" ml={3}>
                            {fCurrency('-', roundUpAmount(discount.amount))}
                          </Typography>
                        </Stack>
                      ))}
                    {/* <Typography noWrap variant="subtitle2" ml={3}>
                          {`PO Number: ${specs.poNumber}`}
                        </Typography> */}
                    {specs.upgrades && (
                      <Box>
                        <Typography noWrap variant="subtitle2">
                          {`${specs.upgrades.productCode} ${specs.upgrades.itemName}`}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2" ml={2}>
                            {`-1 PIECE @ ${fCurrency('-', roundUpAmount(specs.upgrades.price))}`}
                          </Typography>
                          <Typography noWrap variant="subtitle2">
                            {`${fCurrency('-', roundUpAmount(specs.upgrades.price))}`}
                          </Typography>
                        </Stack>
                        {specs.upgrades.discounts &&
                          specs.upgrades.discounts.map((discount, index) => (
                            <Stack key={index} direction="row" justifyContent="space-between">
                              <Typography noWrap variant="subtitle2" ml={3}>
                                {`LESS ${discount.receiptLabel} ${
                                  discount.prefix === 'PERCENTAGE'
                                    ? `${discount.percentageAmount}%`
                                    : ''
                                }`}
                              </Typography>
                              <Typography noWrap variant="subtitle2" ml={3}>
                                {fCurrency('-', roundUpAmount(discount.amount))}
                              </Typography>
                            </Stack>
                          ))}
                        <Typography noWrap variant="subtitle2" ml={3}>
                          {`Sales Agent: ${data.cashier.id}`}
                        </Typography>
                        <Typography noWrap variant="subtitle2" ml={3}>
                          Lab Code: 0
                        </Typography>
                        {/* <Typography noWrap variant="subtitle2" ml={3}>
                              {`PO Number: ${specs.poNumber}`}
                            </Typography> */}
                        <Typography noWrap variant="subtitle2" ml={3}>
                          {`Patient: ${order.lastname.toUpperCase()}, ${order.firstname.toUpperCase()}`}
                        </Typography>
                        <Typography noWrap variant="subtitle2" ml={3}>
                          Doctor:
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
              {order.discounts && (
                <>
                  <Box mt={1}>
                    {order.discounts.map((discount, index) => (
                      <Stack key={index} direction="row" justifyContent="space-between">
                        <Typography noWrap variant="subtitle2" ml={3}>
                          {`LESS (${discount.prefix})`}
                        </Typography>
                        <Typography noWrap variant="subtitle2" ml={3}>
                          {fCurrency('-', roundUpAmount(discount.amount))}
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                </>
              )}
              <Typography noWrap variant="subtitle2" ml={3} my={1}>
                {`No. of Items: ${
                  order.products.length + order.products.filter((x) => x.upgrades).length
                }`}
              </Typography>
            </Box>
          ))}
          <Box sx={{ my: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Total
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('-', roundUpAmount(data.cart.amounts.subtotal))}
              </Typography>
            </Stack>
            {data.cart.discounts && (
              <>
                {data.cart.discounts
                  .filter((x) => x.prefix !== 'LOYALTYPOINTS')
                  .map((discount, index) => (
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        {`LESS ${discount.receiptLabel} ${
                          discount.prefix === 'PERCENTAGE' ? `${discount.percentageAmount}%` : ''
                        }`}
                      </Typography>
                      <Typography noWrap variant="subtitle2" ml={3}>
                        {fCurrency('-', roundUpAmount(discount.amount))}
                      </Typography>
                    </Stack>
                  ))}
              </>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Amount Due
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('-', roundUpAmount(data.cart.amounts.noPayment))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Return Within 30 Days
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('-', roundUpAmount(data.cart.amounts.noPayment))}
              </Typography>
            </Stack>
            {/* {data.cart.discounts
              .filter((x) => x.prefix === 'LOYALTYPOINTS')
              .map((discount, index) => (
                <>
                  <Stack key={index} direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2" ml={3}>
                      PONITS REDEEM
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('-', roundUpAmount(discount.amount))}
                    </Typography>
                  </Stack>
                </>
              ))} */}
            {/* {data.cart.payments.map((payment, index) => (
              <>
                {payment.value === 'cash' && (
                  <Stack key={index} direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2" ml={3}>
                      CASH PESO
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('-', roundUpAmount(payment.amount))}
                    </Typography>
                  </Stack>
                )}
                {payment.value === 'giftCard' && (
                  <>
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        {payment.label}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {fCurrency('-', roundUpAmount(payment.amount))}
                      </Typography>
                    </Stack>
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        Ref No.
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {payment.referenceNumber}
                      </Typography>
                    </Stack>
                    {payment.changeType && (
                      <>
                        {payment.changeRefNumber && (
                          <>
                            <Stack key={index} direction="row" justifyContent="space-between">
                              <Typography noWrap variant="subtitle2" ml={3}>
                                Change (Gift Card)
                              </Typography>
                              <Typography noWrap variant="subtitle2">
                                {fCurrency('-', roundUpAmount(payment.excessGcAmount))}
                              </Typography>
                            </Stack>
                            <Stack key={index} direction="row" justifyContent="space-between">
                              <Typography noWrap variant="subtitle2" ml={3}>
                                Ref No.
                              </Typography>
                              <Typography noWrap variant="subtitle2">
                                {payment.changeRefNumber}
                              </Typography>
                            </Stack>
                          </>
                        )}
                        {payment.excessCash !== 0 && (
                          <>
                            <Stack key={index} direction="row" justifyContent="space-between">
                              <Typography noWrap variant="subtitle2" ml={3}>
                                Change (Cash)
                              </Typography>
                              <Typography noWrap variant="subtitle2">
                                {fCurrency('-', roundUpAmount(payment.excessCash))}
                              </Typography>
                            </Stack>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
                {payment.value === 'eWallet' && (
                  <>
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        {payment.label}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {fCurrency('-', roundUpAmount(payment.amount))}
                      </Typography>
                    </Stack>
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        Ref No.
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {payment.referenceNumber}
                      </Typography>
                    </Stack>
                  </>
                )}
                {payment.value === 'card' && (
                  <Box key={index}>
                    <Stack key={index} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={3}>
                        {payment.cardType === 'debit-card' ? 'EPS' : 'Mastercard'}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {fCurrency('-', roundUpAmount(payment.amount))}
                      </Typography>
                    </Stack>
                    <Typography noWrap variant="subtitle2" ml={3}>
                      {`Card No. : ************${payment.digitCode}`}
                    </Typography>
                    <Typography noWrap variant="subtitle2" ml={3}>
                      {`Slip No. : ${payment.slipNumber}`}
                    </Typography>
                  </Box>
                )}
              </>
            ))} */}
            {/* {data.cart.payments.filter(
              (x) => x.changeType === 'giftCard' || x.changeType === 'cash'
            ).length === 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography noWrap variant="subtitle2" ml={3}>
                  Change
                </Typography>
                <Typography noWrap variant="subtitle2" ml={3}>
                  {fCurrency('-', roundUpAmount(Number(data.cart.amounts.cashChange)))}
                </Typography>
              </Stack>
            )} */}
            <Typography noWrap variant="subtitle2" mt={1}>
              {`Orig Store: ${data.cart.branchCode}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Orig POS #: ${settings[SettingsCategoryEnum.UnitConfig].terminalNumber}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Orig Txn No.: ${data.cart.txnNumber}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Orig SI No.: ${data.cart.siNumber}`}
            </Typography>
            <Typography noWrap variant="subtitle2" mt={1}>
              {`Cashier: ${data.cashier.lastname}, ${data.cashier.firstname} [${data.cashier.id}]`}
            </Typography>
            <Typography noWrap variant="subtitle2" mt={1} mb={1}>
              {`RETURN Remarks: ${data.cart.remarks}`}
            </Typography>
          </Box>
          <Box sx={{ borderBottom: '2px dashed #000', pb: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VATable Sale
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('-', roundUpAmount(vats.vatableSale))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT 12%
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('-', roundUpAmount(vats.vatAmount))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT Exempt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('-', roundUpAmount(vats.vatExempt))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT Zero Rated
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('-', roundUpAmount(vats.vatZeroRated))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Non-VAT
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('-', roundUpAmount(vats.nonVatable))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="end">
              <Typography sx={{ fontSize: 27 }}>----------</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Total
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency(
                  '-',
                  roundUpAmount(
                    vats.vatableSale +
                      vats.vatAmount +
                      vats.vatExempt +
                      vats.vatZeroRated +
                      vats.nonVatable
                  )
                )}
              </Typography>
            </Stack>
          </Box>
          {data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS').length > 0 && (
            <Box component="section" sx={{ mt: 2 }}>
              <Typography noWrap variant="subtitle2">
                {`Customer Loyalty No.: ${
                  data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS')[0]
                    .customerLoyaltyId
                }`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {`Previous Points: ${
                  data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS')[0].previousPoints
                }`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {`Redeemed Points: ${
                  data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS')[0].redeemedPoints
                }`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {`Remaining Points: ${
                  data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS')[0]
                    .previousPoints -
                  data.cart.discounts.filter((x) => x.prefix === 'LOYALTYPOINTS')[0].redeemedPoints
                }`}
              </Typography>
            </Box>
          )}
          
          <ReceiptFooter vatable={false}/>
        </Scrollbar>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="end" spacing={1}>
          <Button size="medium" variant="outlined" onClick={handlePrintAgain}>
            Reprint
          </Button>
          <Button size="medium" variant="contained" onClick={() => setOpen(false)}>
            Close
          </Button>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
