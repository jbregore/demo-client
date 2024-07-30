import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Divider, Button, Stack } from '@mui/material';
// utils
import { fCurrency, sum } from '../../../../utils/formatNumber';
// components
import Scrollbar from '../../../Scrollbar';
import moment from 'moment';
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

PackageReceipt.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

// ----------------------------------------------------------------------

export default function PackageReceipt({ open, setOpen, data, doublePrinting }) {
  const settings = JSON.parse(localStorage.getItem('settings'));

  //   const checkIfVatable = (discounts, isUpgrade) => {
  //     isUpgrade = isUpgrade ? 'y' : 'n';
  //     const vatLength = discounts.filter(
  //       (x) => x.discount === 'VAT' && x.for_upgrade === isUpgrade
  //     ).length;

  //     return vatLength > 0 ? 'X' : 'T';
  //   };

  const getTotalAmount = (confirmPackages) => {
    let totalAmount = 0;
    confirmPackages.forEach((specsPagkage) => {
      totalAmount += specsPagkage.price * specsPagkage.quantity;
    });

    return totalAmount.toFixed(2);
  };

  //   const getExpireData = (transactionDate) => {
  //     const transactionDateData = transactionDate.split(' ');
  //     let expireDate = new Date(transactionDateData[0]);
  //     expireDate.setDate(expireDate.getDate() + 30);
  //     expireDate = `${expireDate.getFullYear()}-${
  //       expireDate.getMonth() + 1 < 10 ? `0${expireDate.getMonth() + 1}` : expireDate.getMonth() + 1
  //     }-${expireDate.getDate() < 10 ? `0${expireDate.getDate()}` : expireDate.getDate()}`;

  //     return expireDate;
  //   };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Scrollbar sx={{ maxHeight: '80vh', px: 2 }}>
          <ReceiptHeader title="SALES INVOICE" vatable={settings.unitConfiguration.nonVat} />

          <Box component="section" my={2}>
            <Typography noWrap variant="subtitle2">
              Customer:
            </Typography>
            <Typography noWrap variant="subtitle2">
              Address:
            </Typography>
            <Typography noWrap variant="subtitle2">
              TIN:
            </Typography>
            <Typography noWrap variant="subtitle2">
              Business Style:
            </Typography>
            <Typography noWrap variant="subtitle2">
              OSCA ID/PED ID:
            </Typography>
            <Stack direction="row" justifyContent="space-between" mt={2}>
              <Typography noWrap variant="subtitle2">
                {`STORE # ${data.storeCode}`}
              </Typography>
              <Typography noWrap variant="subtitle2">
                {`POS # ${settings.terminalNumber} PHP`}
              </Typography>
            </Stack>
            <Typography noWrap variant="subtitle2">
              {`SI No.: ${data.siNumber}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Txn No.: ${data.txnNumber}`}
            </Typography>
            <Typography noWrap variant="subtitle2">
              {`Date time: ${moment(data.transactionDate).format('MM/DD/YYYY hh:mm A')}`}
            </Typography>
          </Box>
          <Box
            component="section"
            sx={{
              textAlign: 'center',
              my: 1,
              py: 1,
              borderTop: '2px dashed #000',
              borderBottom: '2px dashed #000'
            }}
          >
            <Typography noWrap variant="subtitle2">
              R E G U L A R
            </Typography>
          </Box>
          <Box sx={{ borderBottom: '2px dashed #000' }}>
            {data.confirmPackages.map((specs, index) => (
              <>
                <Box key={index}>
                  <Box component="section">
                    <Typography noWrap variant="subtitle2">
                      {`${specs.productCode} ${specs.itemName}`}
                    </Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography noWrap variant="subtitle2" ml={2}>
                        {`${
                          specs.quantity > 1
                            ? `${specs.quantity} PIECES`
                            : `${specs.quantity} PIECE`
                        }  @ ${fCurrency('', Number(specs.price).toFixed(2))}`}
                      </Typography>
                      <Typography noWrap variant="subtitle2">
                        {`${fCurrency('', Number(specs.price).toFixed(2))}T`}
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              </>
            ))}
            <Typography noWrap variant="subtitle2" ml={3} my={1}>
              {`No. of Items: ${sum(data.confirmPackages, 'quantity')}`}
            </Typography>
          </Box>
          <Box sx={{ my: 1, borderBottom: '2px dashed #000' }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Total
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('', getTotalAmount(data.confirmPackages))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Amount Due
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('', getTotalAmount(data.confirmPackages))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                CASH PESO
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('', getTotalAmount(data.confirmPackages))}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2" ml={3}>
                Change
              </Typography>
              <Typography noWrap variant="subtitle2" ml={3}>
                {fCurrency('', getTotalAmount(data.confirmPackages))}
              </Typography>
            </Stack>
            <Typography noWrap variant="subtitle2" my={1}>
              {`Cashier: ${data.cashier.lastname}, ${data.cashier.firstname} [${data.cashier.id}]`}
            </Typography>
          </Box>
          <Box sx={{ borderBottom: '2px dashed #000', pb: 1 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VATable Sale
              </Typography>
              <Typography noWrap variant="subtitle2">
                0.00
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT 12%
              </Typography>
              <Typography noWrap variant="subtitle2">
                0.00
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT Exempt
              </Typography>
              <Typography noWrap variant="subtitle2">
                0.00
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                VAT Zero Rated
              </Typography>
              <Typography noWrap variant="subtitle2">
                0.00
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography noWrap variant="subtitle2">
                Non-VAT
              </Typography>
              <Typography noWrap variant="subtitle2">
                0.00
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
                {fCurrency('', getTotalAmount(data.confirmPackages))}
              </Typography>
            </Stack>
          </Box>
          <Box component="section" sx={{ mt: 2, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2">
              Umbra Digital Company
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              930 unit 510 Aurora Blvd. Cubao, Quezon City, Metro Manila, Philippines
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`VAT REG TIN: ${settings.vatReg}`}
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`Accreditation: ${settings.accr} Date issued: ${settings.accrDateIssued}`}
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {`PTU No. ${settings.permit} Date issued: ${settings.ptuDateIssued}`}
            </Typography>
          </Box>
          <Box sx={{ my: 2, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2" sx={{ mt: 1, whiteSpace: 'initial' }}>
              "Thank you for shopping"
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              Visit us at
            </Typography>
            <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
              {settings.companyWebsiteLink}
            </Typography>
          </Box>
        </Scrollbar>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="end" spacing={1}>
          <Button size="medium" variant="outlined">
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
