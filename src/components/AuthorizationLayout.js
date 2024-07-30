import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import { Endpoints } from '../enum/Endpoints';

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
  backgroundColor: '#fff'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 550
}));

// ----------------------------------------------------------------------

AuthorizationLayout.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function AuthorizationLayout({ open, setOpen }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSupervisorAccess = async () => {
    if (username === '' || password === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);

      return null;
    }

    try {
      const apiData = {
        username,
        password
      };

      const res = await axios.post(
        `${Endpoints.REPORTS}/supervisor-access`,
        apiData
      );
      const { firstname, lastname } = res.data.data;
      if (firstname && lastname) {
        setOpen(false);
        localStorage.setItem(
          'supervisor',
          JSON.stringify({
            firstname: firstname,
            lastname: lastname
          })
        );
      } else {
        setErrorMessage('Invalid supervisor credentials, please check it and try again.');
        setIsError(true);

        return null;
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      console.error(err);

    }

    return true;
  };

  const handleCancelAuthenticate = () => {
    navigate('/app/orders', { replace: true });
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSupervisorAccess();
    }
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Supervisor Authorization</Typography>
        <Typography variant="body2">
          Fill up below the supervisor's credentials to access a certain function.
        </Typography>
        <Box mt={3}>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="username"
                label="Username"
                name="username"
                variant="outlined"
                type="text"
                fullWidth
                onChange={(e) => setUsername(e.target.value)}
                inputProps={{
                  onKeyDown: handleKeyDown
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="password"
                label="Password"
                name="password"
                variant="outlined"
                type="password"
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{
                  onKeyDown: handleKeyDown
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
          <Button
            size="large"
            variant="contained"
            color="error"
            type="submit"
            onClick={handleCancelAuthenticate}
          >
            Cancel
          </Button>
          <Button size="large" variant="contained" type="submit" onClick={handleSupervisorAccess}>
            Access
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
