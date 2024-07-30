import { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { Modal, Card, Box, Typography, Stack, Alert, Snackbar } from '@mui/material';
import Scrollbar from '../../../Scrollbar';
import { useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { fCurrency, sum } from '../../../../utils/formatNumber';
import { Endpoints } from '../../../../enum/Endpoints';

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const RowTitle = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.primary.lighter,
  padding: theme.spacing(1, 0),
  '& p': {
    fontWeight: 700
  }
}));

const RowLabel = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(1, 3)
}));

const GridInBetween = ({ title, label, value }) =>
  title ? (
    <RowTitle
      direction="row"
      alignItems="center"
      justifyContent={title ? 'center' : 'space-between'}
      spacing={3}
    >
      <Typography>{title || label}</Typography>
      {value && <Typography>{value}</Typography>}
    </RowTitle>
  ) : (
    <RowLabel
      direction="row"
      alignItems="center"
      justifyContent={title ? 'center' : 'space-between'}
      spacing={3}
    >
      <Typography>{title || label}</Typography>
      {value && <Typography>{value}</Typography>}
    </RowLabel>
  );


CashierSalesModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  cashierId: PropTypes.string,
  setSelectedCashier: PropTypes.func
};

const CASH_PAYMENTS = new Set(['Cash', 'Lalamove', 'LBC', 'WSI', 'Payo']);

export default function CashierSalesModal({ open, setOpen, cashierId, setSelectedCashier }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const transactionDate = localStorage.getItem('transactionDate');
  const { user } = JSON.parse(localStorage.getItem('userData'));

  // States
  const [previewData, setPreviewData] = useState({});
  const [returnedPaymentsTxn, setReturnedPaymentsTxn] = useState(new Set([]));
  const [noReturnedItems, setNoReturnedItems] = useState(0);
  const [totalDiscounts, setTotalDiscounts] = useState({});

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  async function fetchCashierSalesData() {
    try {
      const branchCode = settings.unitConfiguration.storeCode;
      const transactionDate = localStorage.getItem('transactionDate');

      const userLogs = await axios.get(
        `${Endpoints.LOGIN}/logs/${cashierId}/${transactionDate}`
      );

      const todayDate = moment();
      const timeFrom = moment.utc(userLogs.data.realtimeLogs).format('YYYY-MM-DD HH:mm:ss');
      const timeTo = moment(todayDate).format('YYYY-MM-DD HH:mm:ss');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/cashier-sales/${transactionDate}/${cashierId}/${branchCode}/${timeFrom}/${timeTo}`
      );

      const cashierData = response.data;
      cashierData?.payments?.forEach((payment) => {
        if (payment.method === 'RMES') {
          returnedPaymentsTxn.add(payment.txn_number);
        }
      });

      // Add all the returned items add transactions to a Set that are voided, returned, or refunded
      let returnedItems = 0;
      let newReturnedTxns = new Set([...returnedPaymentsTxn]);
      cashierData?.specs?.forEach((spec) => {
        if (spec.status === 'return' || spec.status === 'void' || spec.status === 'refund') {
          newReturnedTxns.add(spec.txn_number);
          if (spec.status === 'return') {
            returnedItems += 1;
          }
        }
      });

      // Calculate the quantity the total and group all discounts by type
      const reducedDiscountsArray = cashierData?.discounts?.reduce((acc, curr) => {
        if (newReturnedTxns.has(curr.txn_number)) return acc;
        const type = curr.discount;
        if (!acc[`${type}`]) {
          return (acc = {
            ...acc,
            [`${type}`]: {
              amount: parseFloat(curr.amount),
              qty: 1
            }
          });
        }

        acc[`${type}`].amount += parseFloat(curr.amount);
        acc[`${type}`].qty += 1;
        return acc;
      }, {});


      setPreviewData(cashierData);
      setNoReturnedItems(noReturnedItems + returnedItems);
      setReturnedPaymentsTxn(newReturnedTxns);
      setTotalDiscounts(reducedDiscountsArray);
    } catch (err) {
      console.log(err);
      setIsError(true);
      setErrorMessage('Failed getting data for cashier');
    }
  }

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  useEffect(() => {
    if (open) {
      fetchCashierSalesData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <StyledModal
      open={open}
      onClose={() => {
        setOpen(false);
        if (user.role !== 'cashier') {
          setSelectedCashier('');
        }
      }}
      BackdropComponent={Backdrop}
    >
      <ModalCard>
        <Typography variant="h6"> Cashier Sales</Typography>
        <Box mt={3}>
          <Scrollbar sx={{ maxHeight: 400 }}>
            <GridInBetween title="Cashier" />
            <GridInBetween label="Transaction Date" value={moment(transactionDate).format('LL')} />
            <GridInBetween label="Cashier ID" value={user.employeeId} />
            <GridInBetween label="Shift" value={previewData?.initial?.shift} />

            <GridInBetween title="Payments" />
            <GridInBetween
              label={`Cash (${previewData?.payments?.filter(
                (payment) => CASH_PAYMENTS.has(payment.method) && payment.status === 'success'
              ).length
                })`}
              value={fCurrency(
                'P',
                sum(
                  previewData?.payments?.filter(
                    (payment) => CASH_PAYMENTS.has(payment.method) && payment.status === 'success'
                  ) ?? [],
                  'amount'
                )
              )}
            />
            <GridInBetween
              label={`Non Cash (${previewData?.payments?.filter(
                (payment) => !CASH_PAYMENTS.has(payment.method) && payment.status === 'success'
              ).length
                })`}
              value={fCurrency(
                'P',
                sum(
                  previewData?.payments?.filter(
                    (payment) => !CASH_PAYMENTS.has(payment.method) && payment.status === 'success'
                  ) ?? [],
                  'amount'
                )
              )}
            />
            <GridInBetween
              label={`Total (${previewData?.payments?.filter((payment) => payment.status === 'success').length
                })`}
              value={fCurrency(
                'P',
                sum(
                  previewData?.payments?.filter((payment) => payment.status === 'success') ?? [],
                  'amount'
                )
              )}
            />

            <GridInBetween title="Discounts" />
            {Object.keys(totalDiscounts).map((key) => (
              <GridInBetween
                key={key}
                label={`${key} (${totalDiscounts[`${key}`].qty})`}
                value={fCurrency('P', totalDiscounts[`${key}`].amount)}
              />
            ))}

            <GridInBetween
              label={`Total (${sum(
                Object.keys(totalDiscounts).map((key) => totalDiscounts[`${key}`]) ?? [],
                'qty'
              )})`}
              value={fCurrency(
                'P',
                sum(
                  Object.keys(totalDiscounts).map((key) => totalDiscounts[`${key}`]) ?? [],
                  'amount'
                )
              )}
            />

            <GridInBetween title="VAT Details" />
            <GridInBetween
              label="VATABLE Sales"
              value={fCurrency(
                'P',
                sum(
                  previewData?.vat?.filter((vat) => !returnedPaymentsTxn.has(vat.txn_number)) ?? [],
                  'vatable_sale'
                )
              )}
            />
            <GridInBetween
              label="VAT"
              value={fCurrency(
                'P',
                sum(
                  previewData?.vat?.filter((vat) => !returnedPaymentsTxn.has(vat.txn_number)) ?? [],
                  'vat_amount'
                )
              )}
            />
            <GridInBetween
              label="VAT-Exempt Sales"
              value={fCurrency(
                'P',
                sum(
                  previewData?.vat?.filter((vat) => !returnedPaymentsTxn.has(vat.txn_number)) ?? [],
                  'vat_exempt'
                )
              )}
            />
            <GridInBetween
              label="VAT-Zero Rated Sales"
              value={fCurrency(
                'P',
                sum(
                  previewData?.vat?.filter((vat) => !returnedPaymentsTxn.has(vat.txn_number)) ?? [],
                  'vat_zero_rated'
                )
              )}
            />
            <GridInBetween title="Cashier's Accountability" />
            <GridInBetween
              label="Gross Sales"
              value={fCurrency(
                'P',
                sum(
                  previewData?.payments?.filter((payment) => payment.status === 'success') ?? [],
                  'amount'
                ) +
                sum(
                  previewData?.discounts
                    ?.filter((discount) => !returnedPaymentsTxn.has(discount.txn_number))
                    .map((value) => ({ ...value, amount: parseFloat(value.amount) })) ?? [],
                  'amount'
                )
              )}
            />
            <GridInBetween
              label="Initial Cash"
              // value={previewData?.initial?.total ?? 0}
              value={fCurrency('P', parseFloat(previewData?.initial?.total)) ?? 0}
            />
            <GridInBetween
              label="Total In Drawer"
              value={
                (previewData?.takeoutCash?.total || previewData?.takeoutCash?.total === 0)
                  ? fCurrency(
                    'P',
                    parseFloat(previewData?.initial?.total) +
                    sum(
                      previewData?.payments?.filter(
                        (payment) => payment.method === 'Cash' && payment.status === 'success'
                      ) ?? [],
                      'amount'
                    )
                  ) ?? 0
                  : fCurrency('P', parseFloat('0.00'))
              }
            />
            <GridInBetween
              label="Total Declaration"
              value={fCurrency('P', parseFloat(previewData?.takeoutCash?.total)) ?? 0}
            />
            <GridInBetween
              label="Over/Short"
              value={
                fCurrency(
                  'P',
                  parseFloat(previewData?.initial?.total) +
                  parseFloat(sum(
                    previewData?.payments?.filter(
                      (payment) => payment.method === 'Cash' && payment.status === 'success'
                    ) ?? [],
                    'amount'
                  ).toFixed(2)) -
                  parseFloat(previewData?.takeoutCash?.total)
                ) ?? 0
              }
            />
            <GridInBetween title="Cashier's Audit" />
            <GridInBetween
              label="No. of Items Sold"
              value={
                sum(
                  previewData?.specs?.filter((spec) => {
                    return spec.status === 'paid';
                  }) ?? [],
                  'quantity'
                ) - noReturnedItems
              }
            />
            <GridInBetween
              label="No. of Sales Transaction"
              value={
                previewData?.transactions?.filter(
                  (txn) => txn.type === 'regular' && !returnedPaymentsTxn.has(txn.txn_number)
                ).length
              }
            />
            <GridInBetween
              label="No. of Non Sales Transaction"
              value={
                previewData?.transactions?.filter(
                  (txn) => txn.type !== 'regular' || returnedPaymentsTxn.has(txn.txn_number)
                ).length
              }
            />
            <GridInBetween
              label="Total No. of Transactions"
              value={previewData?.transactions?.length}
            />
            <GridInBetween
              label="No. of Void Transactions"
              value={previewData?.transactions?.filter((txn) => txn.type === 'void').length}
            />
            <GridInBetween
              label="Void Transactions Amount"
              value={fCurrency(
                'P',
                sum(previewData?.transactions?.filter((txn) => txn.type === 'void') ?? [], 'amount')
              )}
            />
          </Scrollbar>
        </Box>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
            onClose={handleCloseError}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
