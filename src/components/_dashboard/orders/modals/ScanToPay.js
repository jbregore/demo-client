import PropTypes from 'prop-types';
import React, { useState } from 'react';
// iconify
import { Icon } from '@iconify/react';
import qrCode from '@iconify/icons-mdi/qrcode-scan';
import cartCheck from '@iconify/icons-mdi/cart-check';
// material
import { styled } from '@mui/material/styles';
import { Box, Typography, Button, Stack } from '@mui/material';

// ----------------------------------------------------------------------

const PaymentBox = styled(Box)(({ theme }) => ({
  top: 0,
  '& section': {
    textAlign: 'center',
    position: 'absolute',
    width: '100%',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)'
  },
  '& svg': {
    fontSize: 90,
    color: theme.palette.text.secondary
  },
  '& h6': {
    marginTop: 8,
    fontSize: 20,
    color: theme.palette.text.secondary
  }
}));

// ----------------------------------------------------------------------

// eslint-disable-next-line react/prop-types
function IconContent({ paid }) {
  return (
    <Box component="section">
      <Icon icon={!paid ? qrCode : cartCheck} />
      <Typography variant="subtitle2">{!paid ? 'Scan To Pay' : 'Payment Successful!'}</Typography>
    </Box>
  );
}

// ----------------------------------------------------------------------

ScanToPay.propTypes = {
  type: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired
};

// ----------------------------------------------------------------------

export default function ScanToPay({ type, total }) {
  const [paid, setPaid] = useState(false);

  const handlePayment = () => {
    alert(`${total} has been paid in ${type}!`);
    setPaid(true);
  };

  const handleGenerate = () => {
    alert(`generate QR for ${type} to display in QR device facing customer.`);
  };

  return (
    <Box>
      <PaymentBox>
        {!paid ? (
          <>
            <IconContent paid={paid} />
            <Box sx={{ position: 'absolute', bottom: 0, right: 0 }}>
              <Stack direction="row" justifyContent="flex-end" spacing={1}>
                <Button variant="outlined" onClick={handleGenerate} size="large">
                  Generate QR
                </Button>
                <Button variant="contained" onClick={handlePayment} size="large">
                  Set Paid
                </Button>
              </Stack>
            </Box>
          </>
        ) : (
          <IconContent paid={paid} />
        )}
      </PaymentBox>
    </Box>
  );
}
