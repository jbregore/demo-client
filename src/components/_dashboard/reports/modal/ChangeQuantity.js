import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Button, Card,  Stack, Typography, TextField, Snackbar, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { updateAmounts, updateQuantity } from '../../../../redux/cart/action';
import { store } from '../../../../redux/cart/store';
import { Backdrop, StyledModal } from './styles/commonModalStyles';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

// ----------------------------------------------------------------------

ChangeQuantityModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  specs: PropTypes.object
};

export default function ChangeQuantityModal({ open, setOpen, specs }) {
  const [quantity, setQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleChangeQuantity = () => {
    setIsError(false);
    console.log();
    if (quantity <= 0) {
      setIsError(true);
      setErrorMessage('Quantity must be at least 1.');
      return;
    } else if (!Number.isInteger(Number(quantity))) {
      setIsError(true);
      setErrorMessage('Please enter a valid number for quantity.');
      return;
    }

    store.dispatch(updateQuantity(specs.productCode, quantity - specs.quantity));
    store.dispatch(updateAmounts());
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      setIsError(false);
      setErrorMessage('');
      setQuantity(specs?.quantity);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Change Item Quantity</Typography>
        <Stack mt={2} direction={'column'} spacing={2}>
          <Typography variant="body1">{specs?.itemName}</Typography>
          <TextField
            id="quantity"
            label="Quantity"
            fullWidth
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"

          />
        </Stack>
        <Stack mt={2} direction="row" justifyContent="flex-end" spacing={1}>
          <Button
            color='error'
            size="large"
            variant="contained"
            sx={{ width: 'fit-content' }}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="large"
            variant="contained"
            sx={{ width: 'fit-content' }}
            onClick={handleChangeQuantity}
          >
            Change
          </Button>
        </Stack>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
