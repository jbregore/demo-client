import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Grid, Divider, Button, Stack } from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
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

CashTakeoutReceipt.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  closeMainModal: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

// ----------------------------------------------------------------------

export default function CashTakeoutReceipt({ open, setOpen, closeMainModal, data }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const cash = {
    peso1000: {
      label: '1000.00',
      value: data.cashReport.peso1000
    },
    peso500: {
      label: '500.00',
      value: data.cashReport.peso500
    },
    peso200: {
      label: '200.00',
      value: data.cashReport.peso200
    },
    peso100: {
      label: '100.00',
      value: data.cashReport.peso100
    },
    peso50: {
      label: '50.00',
      value: data.cashReport.peso50
    },
    peso20: {
      label: '20.00',
      value: data.cashReport.peso20
    },
    peso10: {
      label: '10.00',
      value: data.cashReport.peso10
    },
    peso5: {
      label: '5.00',
      value: data.cashReport.peso5
    },
    peso1: {
      label: '1.00',
      value: data.cashReport.peso1
    },
    cent25: {
      label: '0.25',
      value: data.cashReport.cent25
    },
    cent10: {
      label: '0.10',
      value: data.cashReport.cent10
    },
    cent05: {
      label: '0.05',
      value: data.cashReport.cent05
    },
    cent01: {
      label: '0.01',
      value: data.cashReport.cent01
    }
  };

  let cashArray = Object.values(cash);
  cashArray = cashArray.filter((x) => x.value !== 0);


  const handlePrintAgain = async () => {
    const apiData = {
      cashReport: data.cashReport,
      total: data.total,
      isReprint: true
    };

    // const formData = new FormData();
    // formData.append('apiData', JSON.stringify(apiData));
    // formData.append('settings', JSON.stringify(settings));

    const formData = { apiData, settings };

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/reports/takeout/print`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // eslint-disable-next-line no-empty
    } catch (err) { }
  };

  const handleCloseModal = () => {
    setOpen(false);
    closeMainModal();
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Scrollbar sx={{ maxHeight: '80vh', px: 2 }}>
          <ReceiptHeader title="C A S H T A K E O U T" vatable={data.cashReport.isNonVat} />

          <Box
            component="section"
            sx={{ textAlign: 'center', pb: 1, borderBottom: 'dashed 2px #000' }}
          >
            {cashArray.map((cash, index) => (
              <>
                <Typography key={index} noWrap variant="subtitle2">
                  {`${cash.label} x ${cash.value}`}
                </Typography>
              </>
            ))}
          </Box>
          <Grid container>
            <Grid item xs={5}>
              <Box component="section">
                <Typography noWrap my={2} variant="subtitle2">
                  Total
                </Typography>
                <Typography noWrap variant="subtitle2">
                  Cashier
                </Typography>
                <Typography noWrap variant="subtitle2">
                  Shift
                </Typography>
                <Typography noWrap variant="subtitle2">
                  Date-time
                </Typography>
                <Typography noWrap variant="subtitle2">
                  Txn No.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={7}>
              <Box component="section">
                <Typography noWrap my={2} variant="subtitle2">{`: ${fCurrency(
                  '',
                  data.total.toFixed(2)
                )}`}</Typography>
                <Typography
                  noWrap
                  variant="subtitle2"
                >{`: ${data.cashReport.cashierFirstName.toUpperCase()} ${data.cashReport.cashierLastName.toUpperCase()} (${data.cashReport.employeeId
                  })`}</Typography>
                <Typography noWrap variant="subtitle2">{`: ${data.cashReport.shift}`}</Typography>
                <Typography noWrap variant="subtitle2">{`: ${moment(
                  data.cashReport.realTimeDate
                ).format('MM/DD/YYYY - hh:mm A')}`}</Typography>
                <Typography
                  noWrap
                  variant="subtitle2"
                >{`: ${data.cashReport.txnNumber}`}</Typography>
              </Box>
            </Grid>
          </Grid>
          <Box component="section" sx={{ my: 3, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2">
              {`${data.cashReport.cashierFirstName.toUpperCase()} ${data.cashReport.cashierLastName.toUpperCase()} (${data.cashReport.employeeId
                })`}
            </Typography>
          </Box>
          <Box
            component="section"
            sx={{ textAlign: 'center', borderTop: '2px solid #000', mt: 6, mx: 12 }}
          >
            <Typography noWrap variant="subtitle2">
              Cashier's Signature
            </Typography>
          </Box>
          <Box component="section" sx={{ mt: 2, textAlign: 'center' }}>
            <Typography noWrap variant="subtitle2">
              TURNED OVER BY
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
