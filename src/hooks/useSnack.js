import { useState } from 'react';

const useSnack = () => {
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackSeverity, setSnackSeverity] = useState('success');
  const [snackMessage, setSnackMessage] = useState(false);

  const successSnack = (message) => {
    setSnackOpen(true);
    setSnackMessage(message);
    setSnackSeverity('success');
  };

  const errorSnack = (message) => {
    setSnackOpen(true);
    setSnackMessage(message);
    setSnackSeverity('error');
  };

  return {
    snackOpen,
    setSnackOpen,
    snackSeverity,
    setSnackSeverity,
    snackMessage,
    setSnackMessage,
    successSnack,
    errorSnack
  };
};

export default useSnack;
