import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
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
// components
import {
  InitialCashReceipt,
  CashTakeoutReceipt,
  RegularReceipt,
  ReturnReceipt,
  PackageReceipt
} from '..';

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

AddProduct.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function AddProduct({ open, setOpen }) {
  const [transactionNumber, setTransactionNumber] = useState('');

  const [transactionType, setTransactionType] = useState('');

  const [previewInitialData, setPreviewInitialData] = useState({});
  const [previewInitialOpen, setPreviewInitialOpen] = useState(false);
  const [previewTakeoutData, setPreviewTakeoutData] = useState({});
  const [previewTakeoutOpen, setPreviewTakeoutOpen] = useState(false);
  const [previewRegularData, setPreviewRegularData] = useState({});
  const [previewRegularOpen, setPreviewRegularOpen] = useState(false);
  const [previewReturnData, setPreviewReturnData] = useState({});
  const [previewReturnOpen, setPreviewReturnOpen] = useState(false);
  const [previewPackageData, setPreviewPackageData] = useState({});
  const [previewPackageOpen, setPreviewPackageOpen] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleGetTransaction = async () => {
    if (transactionNumber === '') {
      setIsError(true);
      setErrorMessage('Please enter a transaction number.');
      return null;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/preview/${transactionNumber}`
      );
      const previewResponse = res.data.data;

      if (previewResponse) {
        const txnType = previewResponse.type;

        if (txnType === 'initial cash') {
          setPreviewInitialData(previewResponse.data);
          setPreviewInitialOpen(true);
        } else if (txnType === 'cash takeout') {
          setPreviewTakeoutData(previewResponse.data);
          setPreviewTakeoutOpen(true);
        } else if (txnType === 'regular') {
          setPreviewRegularData(previewResponse.data);
          setPreviewRegularOpen(true);
        } else if (txnType === 'return') {
          setPreviewReturnData(previewResponse.data);
          setPreviewReturnOpen(true);
        } else if (txnType === 'package') {
          setPreviewPackageData(previewResponse.data);
          setPreviewPackageOpen(true);
        }

        setTransactionType(txnType);
        setIsError(false);

        return true;
      }

      setIsError(true);
      setErrorMessage('Transaction number is invalid, please check it and try again.');

      // eslint-disable-next-line no-empty
    } catch (err) {}

    return null;
  };

  return (
    <StyledModal
      open={open}
      onClose={() => {
        setOpen(false);
        setIsError(false);
      }}
      BackdropComponent={Backdrop}
    >
      <ModalCard>
        <Typography variant="h6">Preview Transactions</Typography>
        <Box mt={3}>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction Number"
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={3}>
          <Button size="large" variant="contained" onClick={handleGetTransaction}>
            Preview
          </Button>
        </Stack>
        <Snackbar open={isError} autoHideDuration={5000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>
        {transactionType === 'initial cash' && (
          <InitialCashReceipt
            open={previewInitialOpen}
            setOpen={setPreviewInitialOpen}
            closeMainModal={() => ''}
            data={previewInitialData}
          />
        )}
        {transactionType === 'cash takeout' && (
          <CashTakeoutReceipt
            open={previewTakeoutOpen}
            setOpen={setPreviewTakeoutOpen}
            closeMainModal={() => ''}
            data={previewTakeoutData}
          />
        )}
        {transactionType === 'regular' && (
          <RegularReceipt
            open={previewRegularOpen}
            setOpen={setPreviewRegularOpen}
            data={previewRegularData}
            doublePrinting={false}
          />
        )}
        {transactionType === 'return' && (
          <ReturnReceipt
            open={previewReturnOpen}
            setOpen={setPreviewReturnOpen}
            data={previewReturnData}
          />
        )}
        {transactionType === 'package' && (
          <PackageReceipt
            open={previewPackageOpen}
            setOpen={setPreviewPackageOpen}
            data={previewPackageData}
            doublePrinting={false}
          />
        )}
      </ModalCard>
    </StyledModal>
  );
}
