import { Alert, Snackbar } from '@mui/material';
import React from 'react';

const CustomSnack = (props) => {
  const { open, setOpen, severity, message } = props;
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => {
        setOpen(false);
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert
        severity={severity}
        onClose={() => {
          setOpen(false);
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnack;
