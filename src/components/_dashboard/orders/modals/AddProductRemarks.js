import { useState } from 'react';
import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Modal,
  Typography,
  Grid,
  TextField,
  Box,
  Stack,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';

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

AddProductRemark.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function AddProductRemark({ open, setOpen, product, onSave }) {
  const [addRemarks, setAddRemarks] = useState('');

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddRemarks = () => {
    if (addRemarks === '') {
        setIsError(true);
        setErrorMessage('Please enter remarks');
    } else {
      onSave(addRemarks);
      handleCloseModal();
    }
  };


  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleCloseModal = () => {
    setAddRemarks('');
    setOpen(false);
    setIsError(false);
  };

  return (
    <StyledModal open={open} onClose={handleCloseModal} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Add Product Remarks</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product"
                type="text"
                value={`${product.name} - ${fCurrency('P', product.price)}`}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Remarks"
                    type="text"
                    value={addRemarks}
                    onChange={(e) => setAddRemarks(e.target.value)}
                    multiline
                    rows={4}
                />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={5}>
          <Button
            variant="outlined"
            color='error'
            size="large"
            onClick={handleCloseModal}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleAddRemarks}
          >
            Save
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
