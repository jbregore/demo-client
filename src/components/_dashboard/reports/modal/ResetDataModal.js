import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
  Card,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Snackbar,
  Alert,
  TextField
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

ResetDataModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  setDeleted: PropTypes.func.isRequired
};

export default function ResetDataModal({ open, setOpen, setDeleted }) {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleResetData() {
    try {
      const uid = localStorage.getItem('uid') ?? ''
      let role = 'client-admin'
      if(uid === process.env.REACT_APP_USER_SECRET){
        role = 'admin'
      }

      if (!password || !password.length) {
        setIsError(true);
        setErrorMessage('Please enter a password to reset data');
        return;
      }

      setIsLoading(true);
      await axios.get(`${Endpoints.SETTINGS}/backup-database`, {
        params: {
          password
        }
      });
      await axios.delete(`${Endpoints.SETTINGS}/reset-data`, {
        params: {
          password,
          role
        }
      });

      setIsLoading(false);
      setOpen(false);
      setDeleted(true);
    } catch (err) {
      setIsError(true);
      if (err.response?.status === 401) {
        setErrorMessage('Invalid credentials. Please try again');
      } else {
        setErrorMessage('Failed resetting all data.');
      }
      setIsLoading(false);
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
      setIsError(false);
      setErrorMessage(false);
      setPassword('');
    }
  }, [open]);

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Reset Data</Typography>
        <Typography variant="body2" mt={1}>
          Enter password below to reset all data
        </Typography>
        <Box mt={2}>
          <Grid container direction="row" spacing={2}>
            <Grid item xs={12}>
              <TextField
                type="password"
                id="password"
                label="Password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" spacing={2} sx={{ marginTop: 5 }}>
          <Button
            size="large"
            variant="contained"
            color="error"
            onClick={() => {
              setPassword('');
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            size="large"
            variant="contained"
            color="primary"
            onClick={handleResetData}
          >
            Reset
          </LoadingButton>
        </Stack>
        
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
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
