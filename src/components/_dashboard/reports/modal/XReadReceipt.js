import { Fragment } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Divider, Button, Stack } from '@mui/material';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
import moment from 'moment';
import { capitalCase } from 'text-case';
import ReceiptHeader from '../receipt-components/ReceiptHeader';

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

XReadReceipt.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  setOpenMainModal: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function XReadReceipt({ open, setOpen, setOpenMainModal, data }) {
  const settings = JSON.parse(localStorage.getItem('settings'));

  const handlePrintAgain = async () => {
    const apiData = {
      xReadData: data.xReadData,
      cashier: data.cashier,
      isReprint: true
    };

    // const formData = new FormData();
    // formData.append('apiData', JSON.stringify(apiData));
    // formData.append('settings', JSON.stringify(settings));

    const formData = { apiData, settings };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reports/x-read/print`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  const handleCloseModal = () => {
    setOpen(false);
    setOpenMainModal(false);
  };

  const roundUpAmount = (num) => {
    // num = Math.round(num * 100) / 100;
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const renderSinglePayment = (data, label) => {
    if (label === 'summary') return null;

    return (
      <Box>
        <Typography noWrap variant="subtitle2">
          *** {label} ***
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography noWrap variant="subtitle2">
            {`${label} (${data.count})`}
          </Typography>
          <Typography noWrap variant="subtitle2">
            {fCurrency('', roundUpAmount(data.total))}
          </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography noWrap variant="subtitle2">
            {`TOTAL ${label} (${data.count})`}
          </Typography>
          <Typography noWrap variant="subtitle2">
            {fCurrency('', roundUpAmount(data.total))}
          </Typography>
        </Stack>
      </Box>
    );
  };

  const { version } = data.xReadData;

  const {
    payments,
    discounts,
    vat,
    department,
    initialFund,
    takeout,
    cashDrop,
    FINAL_TOTAL,
    OVER_SHORT,
    cashierAudit,
    SALES,
    SI_NUM
  } = data.xReadData;

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Scrollbar sx={{ maxHeight: '80vh', px: 2 }}>
          <ReceiptHeader title="X-Reading" isReading={true} />

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`SHIFT OPENING of ${data.cashier.lastname}, ${data.cashier.firstname} - ${data.cashier.id}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Store code: ${settings[SettingsCategoryEnum.UnitConfig].storeCode}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Transaction date: ${moment(initialFund.INITIAL_FUND.cashDate).format(
                'MM-DD-YYYY'
              )}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`From: ${moment(data.cashier.shiftFrom).utc().format('MM-DD-YYYY hh:mm A')}`}
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`To: ${moment(data.cashier.shiftTo).format('MM-DD-YYYY hh:mm A')}`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                PHP
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Payment (COUNT)
              </Typography>
              <Typography noWrap variant="subtitle2">
                Amount
              </Typography>
            </Stack>
            {payments.cash.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** CASH ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`CASH PESO (${payments.cash.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.cash.total))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL CASH PESO (${payments.cash.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.cash.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}

            {payments.cashOnDelivery?.LALAMOVE?.count > 0 && (
              <>
                <Typography noWrap variant="subtitle2">
                  *** LALAMOVE ***
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`LALAMOVE (${payments.cashOnDelivery.LALAMOVE.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.LALAMOVE.total))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`TOTAL LALAMOVE (${payments.cashOnDelivery.LALAMOVE.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.LALAMOVE.total))}
                  </Typography>
                </Stack>
              </>
            )}

            {payments.cashOnDelivery?.LBC?.count > 0 && (
              <>
                <Typography noWrap variant="subtitle2">
                  *** LBC ***
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`LBC (${payments.cashOnDelivery.LBC.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.LBC.total))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`TOTAL LBC (${payments.cashOnDelivery.LBC.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.LBC.total))}
                  </Typography>
                </Stack>
              </>
            )}

            {payments.cashOnDelivery?.PAYO?.count > 0 && (
              <>
                <Typography noWrap variant="subtitle2">
                  *** PAYO ***
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`PAYO (${payments.cashOnDelivery.PAYO.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.PAYO.total))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`TOTAL PAYO (${payments.cashOnDelivery.PAYO.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.PAYO.total))}
                  </Typography>
                </Stack>
              </>
            )}

            {payments.cashOnDelivery?.WSI?.count > 0 && (
              <>
                <Typography noWrap variant="subtitle2">
                  *** WSI ***
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`WSI (${payments.cashOnDelivery.WSI.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.WSI.total))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`TOTAL WSI (${payments.cashOnDelivery.WSI.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.WSI.total))}
                  </Typography>
                </Stack>
              </>
            )}

            {payments.cashOnDelivery?.CONSEGNIA?.count > 0 && (
              <>
                <Typography noWrap variant="subtitle2">
                  *** CONSEGNIA ***
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`CONSEGNIA (${payments.cashOnDelivery.CONSEGNIA.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.CONSEGNIA.total))}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`TOTAL CONSEGNIA (${payments.cashOnDelivery.CONSEGNIA.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(payments.cashOnDelivery.CONSEGNIA.total))}
                  </Typography>
                </Stack>
              </>
            )}

            {/* custom cash methods */}
            {
              payments.custom?.cash?.summary?.count > 0 && (
                payments.custom.cash.data.map((item, i) => (
                  <Fragment key={i}>
                    {renderSinglePayment(item, item.title.toUpperCase())}
                  </Fragment>
                ))
              )
            }

            {payments.nonCash.cards.CREDIT_CARD.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** CREDIT CARD ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`MASTER CARD (${payments.nonCash.cards.CREDIT_CARD.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.cards.CREDIT_CARD.total))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL CREDIT CARD (${payments.nonCash.cards.CREDIT_CARD.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.cards.CREDIT_CARD.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
            {payments.nonCash.cards.DEBIT_CARD.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** DEBIT CARD ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`EPS (${payments.nonCash.cards.DEBIT_CARD.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.cards.DEBIT_CARD.total))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL DEBIT CARD (${payments.nonCash.cards.DEBIT_CARD.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.cards.DEBIT_CARD.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}

            {Object.keys(payments.nonCash.cards)
              .filter(
                (label) =>
                  !['CREDIT_CARD', 'DEBIT_CARD'].includes(label) &&
                  payments.nonCash.cards[label].count > 0
              )
              .map((label) => renderSinglePayment(payments.nonCash.cards[label], label))}
            {version === '2.0' ? (
              <>
                {payments.nonCash.eWallets.GCASH.count +
                  payments.nonCash.eWallets.MAYA.count +
                  (payments.nonCash.eWallets.PAYPAL?.count || 0) +
                  (payments.nonCash.eWallets.PAYMONGO?.count || 0) >
                  0 && (
                  <>
                    <Box>
                      <Typography noWrap variant="subtitle2">
                        *** E-WALLET ***
                      </Typography>
                      {payments.nonCash.eWallets.GCASH.count > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2">
                            {`GCASH (${payments.nonCash.eWallets.GCASH.count})`}
                          </Typography>
                          <Typography noWrap variant="subtitle2">
                            {fCurrency('', roundUpAmount(payments.nonCash.eWallets.GCASH.total))}
                          </Typography>
                        </Stack>
                      )}
                      {payments.nonCash.eWallets.MAYA.count > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2">
                            {`MAYA (${payments.nonCash.eWallets.MAYA.count})`}
                          </Typography>
                          <Typography noWrap variant="subtitle2">
                            {fCurrency('', roundUpAmount(payments.nonCash.eWallets.MAYA.total))}
                          </Typography>
                        </Stack>
                      )}
                      {payments.nonCash.eWallets.PAYMONGO?.count > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2">
                            {`PAYMONGO (${payments.nonCash.eWallets.PAYMONGO.count})`}
                          </Typography>
                          <Typography noWrap variant="subtitle2">
                            {fCurrency('', roundUpAmount(payments.nonCash.eWallets.PAYMONGO.total))}
                          </Typography>
                        </Stack>
                      )}
                      {payments.nonCash.eWallets.PAYPAL?.count > 0 && (
                        <Stack direction="row" justifyContent="space-between">
                          <Typography noWrap variant="subtitle2">
                            {`PAYPAL (${payments.nonCash.eWallets.PAYPAL.count})`}
                          </Typography>
                          <Typography noWrap variant="subtitle2">
                            {fCurrency('', roundUpAmount(payments.nonCash.eWallets.PAYPAL.total))}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" justifyContent="space-between">
                        <Typography noWrap variant="subtitle2">
                          {`TOTAL E-WALLET (${
                            payments.nonCash.eWallets.GCASH.count +
                            payments.nonCash.eWallets.MAYA.count +
                            (payments.nonCash.eWallets.PAYPAL?.count || 0) +
                            (payments.nonCash.eWallets.PAYMONGO?.count || 0)
                          })`}
                        </Typography>
                        <Typography noWrap variant="subtitle2">
                          {fCurrency(
                            '',
                            roundUpAmount(
                              payments.nonCash.eWallets.GCASH.total +
                                payments.nonCash.eWallets.MAYA.total +
                                (payments.nonCash.eWallets.PAYPAL?.total || 0) +
                                (payments.nonCash.eWallets.PAYMONGO?.total || 0)
                            )
                          )}
                        </Typography>
                      </Stack>
                    </Box>
                  </>
                )}
              </>
            ) : (
              <>
                {/* eWallets now their own payment methods */}
                {Object.keys(payments.nonCash.eWallets)
                  .filter((label) => payments.nonCash.eWallets[label].count > 0)
                  .map((label) => renderSinglePayment(payments.nonCash.eWallets[label], label))}

                {/* other noncash methods */}
                {Object.keys(payments.nonCash.others)
                  .filter((label) => payments.nonCash.others[label].count > 0)
                  .map((label) => renderSinglePayment(payments.nonCash.others[label], label))}

                {/* custom noncash methods */}
                {
                  payments.custom?.nonCash?.summary?.count > 0 && (
                    payments.custom.nonCash.data.map((item, i) => (
                      <Fragment key={i}>
                        {renderSinglePayment(item, item.title.toUpperCase())}
                      </Fragment>
                    ))
                  )
                }
              </>
            )}

            {payments.nonCash.returns.RMES_ISSUANCE.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** RETURN ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`RETURN WITHIN 30 DAYS (${payments.nonCash.returns.RMES_ISSUANCE.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.returns.RMES_ISSUANCE.total))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL RETURN (${payments.nonCash.returns.RMES_ISSUANCE.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.returns.RMES_ISSUANCE.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
            {payments.nonCash.returns.RMES_REDEMPTION.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** EXCHANGE ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`EXCHANGE (${payments.nonCash.returns.RMES_REDEMPTION.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.returns.RMES_REDEMPTION.total))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL EXCHANGE (${payments.nonCash.returns.RMES_REDEMPTION.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.returns.RMES_REDEMPTION.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
            {payments.nonCash.giftCards.summary.count > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** GIFT CARD ***
                  </Typography>
                  {payments.nonCash.giftCards.GC_ITEMS_METHODS.map((gift, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2">
                        {`${gift._id.toUpperCase()} (${gift.count})`}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {fCurrency('', roundUpAmount(gift.total))}
                      </Typography>
                    </Stack>
                  ))}
                  {payments.nonCash.giftCards.summary.EXCESS_GC > 0 && (
                    <>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography noWrap variant="subtitle2">
                          EXCESS GC
                        </Typography>
                        <Typography noWrap variant="subtitle2">
                          {fCurrency(
                            '-',
                            roundUpAmount(payments.nonCash.giftCards.summary.EXCESS_GC)
                          )}
                        </Typography>
                      </Stack>
                    </>
                  )}
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL GIFT CARD (${payments.nonCash.giftCards.summary.count})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(payments.nonCash.giftCards.summary.total))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
            {cashierAudit.NUM_REFUND_TXN > 0 && (
              <>
                <Box>
                  <Typography noWrap variant="subtitle2">
                    *** REFUND ***
                  </Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`REFUND (${cashierAudit.NUM_REFUND_TXN})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(cashierAudit.REFUND_TXN_AMOUNT))}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography noWrap variant="subtitle2">
                      {`TOTAL REFUND (${cashierAudit.NUM_REFUND_TXN})`}
                    </Typography>
                    <Typography noWrap variant="subtitle2">
                      {fCurrency('', roundUpAmount(cashierAudit.REFUND_TXN_AMOUNT))}
                    </Typography>
                  </Stack>
                </Box>
              </>
            )}
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`TOTAL (${payments.summary.count})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(payments.summary.total))}
              </Typography>
            </Stack>
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`CASH (${payments.cash.count + (payments.cashOnDelivery?.summary?.count || 0) + (payments.custom?.cash?.summary?.count || 0)})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency(
                  '',
                  roundUpAmount(
                    payments.cash.total + (payments.cashOnDelivery?.summary?.total || 0) + (payments.custom?.cash?.summary?.total || 0)
                  )
                )}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`NON CASH (${payments.nonCash.summary.count + (payments.custom?.nonCash?.summary?.count || 0)})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(payments.nonCash.summary.total + (payments.custom?.nonCash?.summary?.total || 0)))}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Discount (Count)
              </Typography>
              <Typography noWrap variant="subtitle2">
                Amount
              </Typography>
            </Stack>
            {discounts.DISCOUNT_ITEMS.map((dc, index) => {
              const promoCodeLabel = dc.discount === 'PROMOCODE' ? dc.receiptLabel : dc.discount;

              return (
                <Stack key={index} direction="row" justifyContent="space-between">
                  <Typography noWrap variant="subtitle2">
                    {`${dc.discount === 'SCD' ? 'SCD-20%' : promoCodeLabel} (${dc.count})`}
                  </Typography>
                  <Typography noWrap variant="subtitle2">
                    {fCurrency('', roundUpAmount(dc.total))}
                  </Typography>
                </Stack>
              );
            })}
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`TOTAL Discount (${discounts.summary.count})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(discounts.summary.total))}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT of ZR & VE (Count)
              </Typography>
              <Typography noWrap variant="subtitle2">
                Amount
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`VAT (${data.xReadData.isNonVat ? 0 : vat.count})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {data.xReadData.isNonVat ? '0.00' : fCurrency('', roundUpAmount(vat.total))}
              </Typography>
            </Stack>
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`TOTAL VAT (${data.xReadData.isNonVat ? 0 : vat.count})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {data.xReadData.isNonVat ? '0.00' : fCurrency('', roundUpAmount(vat.total))}
              </Typography>
            </Stack>
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VATable Sales
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', vat.VAT_DETAILS.vatableSales)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', vat.VAT_DETAILS.vatAmount)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT-Exempt Sales
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', vat.VAT_DETAILS.vatExemptSales)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT-Zero Rated Sales
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', vat.VAT_DETAILS.vatZeroRated)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Non-VAT
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', vat.VAT_DETAILS.nonVatable)}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                TOTAL NET SALES
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', SALES.net)}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Category (Count)
              </Typography>
              <Typography noWrap variant="subtitle2">
                Amount
              </Typography>
            </Stack>
            {department.CATEGORIES.map((cat, index) => (
              <Stack key={index} direction="row" justifyContent="space-between">
                <Typography noWrap variant="subtitle2">
                  {`${capitalCase(cat.category)} (${cat.count})`}
                </Typography>
                <Typography noWrap variant="subtitle2">
                  {fCurrency('', roundUpAmount(cat.total))}
                </Typography>
              </Stack>
            ))}
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`TOTAL (${department.summary.count})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(department.summary.total))}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Typography noWrap variant="subtitle2">
              INITIAL FUND
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {data.cashier.id}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(initialFund.INITIAL_FUND.total))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                TOTAL
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(initialFund.INITIAL_FUND.total))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                CASH DEPOSIT AMT
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(initialFund.INITIAL_FUND.total))}
              </Typography>
            </Stack>
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }} />
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Typography noWrap variant="subtitle2" sx={{ textAlign: 'center' }}>
              - - - SUBTRACT - - -
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ textAlign: 'left' }}>
              CASH DROP
            </Typography>
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }} />
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                TOTAL IN DRAWER
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency(
                  '',
                  initialFund.INITIAL_FUND ? roundUpAmount(cashDrop.TOTAL_IN_DRAWER) : '0.00'
                )}
              </Typography>
            </Stack>
            <Typography noWrap variant="subtitle2">
              TOTAL DECLARATION
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                {`CASH PESO (${cashDrop.totalDeclaration.cash.TOTAL_COUNT_DENOMINATIONS})`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency(
                  '',
                  takeout
                    ? roundUpAmount(cashDrop.totalDeclaration.cash.TOTAL_CASH_DECLARATION)
                    : '0.00'
                )}
              </Typography>
            </Stack>
            {payments.nonCash.giftCards.GC_ITEMS_TYPES.map((gift, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography noWrap variant="subtitle2">
                  {`${gift.type.toUpperCase()} (${gift.count})`}
                </Typography>
                <Typography noWrap variant="subtitle2">
                  {fCurrency('', roundUpAmount(gift.total))}
                </Typography>
              </Stack>
            ))}
            {payments.nonCash.giftCards.summary.EXCESS_GC_AMOUNT > 0 && (
              <Stack direction="row" justifyContent="space-between">
                <Typography noWrap variant="subtitle2">
                  GIFT CARD CHANGE
                </Typography>
                <Typography noWrap variant="subtitle2">
                  {fCurrency(
                    '-',
                    roundUpAmount(cashDrop.totalDeclaration.giftCard.GIFT_CARD_CHANGE)
                  )}
                </Typography>
              </Stack>
            )}
          </Box>
          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                TOTAL
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', takeout ? roundUpAmount(FINAL_TOTAL) : '0.00')}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                OVER/SHORT
              </Typography>
              <Typography noWrap variant="subtitle2">
                {/* XREAD TODO */}
                {fCurrency('', roundUpAmount(OVER_SHORT))}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ my: 1, pb: 1, borderBottom: '2px dashed #000' }}>
            <Typography noWrap variant="subtitle2" sx={{ textAlign: 'center' }}>
              CASHIER'S AUDIT
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Items Sold
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_ITEMS_SOLD}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Sales Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_SALES_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Non Sales Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_NON_SALES_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Total Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_TOTAL_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Cancelled Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_CANCELLED_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Cancelled Txn. Amt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(cashierAudit.CANCELLED_TXN_AMOUNT))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Suspended Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_SUSPENDED_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Void Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_VOID_TXN}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Void Txn. Amt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(cashierAudit.VOID_TXN_AMOUNT))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                No. of Refund Txn
              </Typography>
              <Typography noWrap variant="subtitle2">
                {cashierAudit.NUM_REFUND_TXN ? cashierAudit.NUM_REFUND_TXN : 0}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Refund Txn. Amt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency(
                  '',
                  roundUpAmount(cashierAudit.REFUND_TXN_AMOUNT ? cashierAudit.REFUND_TXN_AMOUNT : 0)
                )}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Discount Amt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(cashierAudit.TOTAL_DISCOUNT_AMOUNT))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Deposit Amt
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(cashierAudit.TOTAL_DEPOSIT_AMOUNT))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Ave. Basket
              </Typography>
              <Typography noWrap variant="subtitle2">
                {fCurrency('', roundUpAmount(cashierAudit.AVE_BASKET))}
              </Typography>
            </Stack>
          </Box>

          <Box component="section" sx={{ mt: 2 }}>
            <Typography noWrap variant="subtitle2">
              Beginning SI No.
            </Typography>
            <Typography noWrap variant="subtitle2">
              {SI_NUM.from}
            </Typography>
            <Typography noWrap variant="subtitle2">
              Ending SI No.
            </Typography>
            <Typography noWrap variant="subtitle2">
              {SI_NUM.to}
            </Typography>
            <Typography noWrap variant="subtitle2">
              GENERATED ON
            </Typography>
            <Typography noWrap variant="subtitle2">
              {moment(data.cashier.shiftTo).format('MM/DD/YYYY hh:mm A')}
            </Typography>
            <Typography noWrap variant="subtitle2">
              Authorized By
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`${data.cashier.firstname.toUpperCase()} ${data.cashier.lastname.toUpperCase()} (${
                data.cashier.id
              })`}
            </Typography>
          </Box>

          <Box component="section" sx={{ mt: 2, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2">
              Umbra Digital Company
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              930 unit 510 Aurora Blvd. Cubao, Quezon City, Metro Manila, Philippines
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`VAT REG TIN: ${settings[SettingsCategoryEnum.BirInfo].vatReg}`}
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`Accreditation: ${settings[SettingsCategoryEnum.BirInfo].accr} Date issued: ${
                settings[SettingsCategoryEnum.BirInfo].accrDateIssued
              }`}
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`PTU No. ${settings[SettingsCategoryEnum.UnitConfig].permit} Date issued: ${
                settings[SettingsCategoryEnum.UnitConfig].ptuDateIssued
              }`}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2" sx={{ mt: 1, whiteSpace: 'initial' }}>
              "Thank you for shopping"
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              Visit us at
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {settings[SettingsCategoryEnum.CompanyInfo].companyWebsiteLink}
            </Typography>
          </Box>
        </Scrollbar>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="end" spacing={1}>
          <Button size="medium" variant="outlined" onClick={handlePrintAgain}>
            Reprint
          </Button>
          <Button size="medium" variant="contained" onClick={handleCloseModal}>
            Close
          </Button>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
