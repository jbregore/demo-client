import axios from 'axios';
import { styled } from '@mui/material/styles';
import {
  Modal,
  Card,
  Box,
  Typography,
  Stack,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import { useEffect } from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';

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

SelectCashierModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  setCashierSalesModal: PropTypes.func.isRequired,
  setSelectedCashier: PropTypes.func.isRequired
};

export default function SelectCashierModal({
  open,
  setOpen,
  setCashierSalesModal,
  setSelectedCashier
}) {
  const transactionDate = localStorage.getItem('transactionDate');
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings?.unitConfiguration?.storeCode

  const [cashiers, setCashiers] = useState([]);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  async function getCashiers() {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/cashier-sales/get-cashiers/${transactionDate}/${storeCode}`
      );

      setCashiers(response.data.cashiers);
    } catch (err) {
      console.log(`Error is `, err);
      setIsError(true);
      setErrorMessage('Failed getting cashier list.');
    }
  }

  function handleSubmit() {
    setCashierSalesModal(true);
    setOpen(false);
  }

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  useEffect(() => {
    if (open) {
      getCashiers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <StyledModal
        BackdropComponent={Backdrop}
        open={open}
        onClose={() => {
          setCashiers([]);
          setOpen(false);
        }}
      >
        <ModalCard>
          <Typography variant="h6"> Select Cashier</Typography>
          <Box my={3}>
            <Grid container direction="row" spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="cashier"
                  label="Select Cashier"
                  name="cashier"
                  select
                  fullWidth
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedCashier(id);
                  }}
                >
                  {cashiers.map((cashier) => (
                    <MenuItem key={cashier.cashier_id} value={cashier.cashier_id}>
                      {cashier.cashier_id} - {cashier.cashier_first_name}{' '}
                      {cashier.cashier_last_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Stack direction="row" justifyContent="end" mt={3} spacing={1}>
              <Button variant="contained" size="large" onClick={handleSubmit}>
                Submit
              </Button>
            </Stack>
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
    </>
  );
}
