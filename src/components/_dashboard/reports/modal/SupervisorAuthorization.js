import { useEffect, useState } from 'react';
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
import { LoadingButton } from '@mui/lab';
import { Endpoints } from '../../../../enum/Endpoints';

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
  width: 550
}));

// ----------------------------------------------------------------------

SupervisorAuthorization.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  toAccessFunction: PropTypes.string.isRequired,
  setApproveFunction: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function SupervisorAuthorization({
  open,
  setOpen,
  toAccessFunction,
  setApproveFunction
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open && isLoading) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSupervisorAccess = async () => {
    if (username === '' || password === '') {
      setErrorMessage('Please fill up all the required fields.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    setIsLoading(true);

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
        setApproveFunction(toAccessFunction);

        localStorage.setItem(
          'supervisor',
          JSON.stringify({
            firstname: firstname,
            lastname: lastname,
            remarks: remarks
          })
        );

        // Set username and password to empty state after approving
        setUsername('');
        setPassword('');
      } else {
        setErrorMessage('Invalid supervisor credentials, please check it and try again.');
        setIsError(true);
        setIsLoading(false);

        return null;
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      console.error(err);

    }

    return true;
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
    <StyledModal
      open={open}
      onClose={() => {
        // Set username and password to empty state on closing
        setUsername('');
        setPassword('');
        setOpen(false);
      }}
      BackdropComponent={Backdrop}
    >
      <ModalCard>
        {['void', 'return', 'refund'].includes(toAccessFunction) && (
          <>
            <Typography variant="h6">Remark / Reason</Typography>
            <Box my={3}>
              <Grid container direction="row" spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    id="remarks"
                    label="Input your remarks or reason"
                    name="remarks"
                    variant="outlined"
                    multiline
                    rows="2"
                    fullWidth
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </>
        )}
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
                value={username}
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
                value={password}
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
                inputProps={{
                  onKeyDown: handleKeyDown,
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
          <Button
            size="large"
            color="error"
            variant="contained"
            type="submit"
            onClick={() => {
              // Set username and password to empty state on cancel
              setUsername('');
              setPassword('');
              setOpen(false);
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleSupervisorAccess}
          >
            Access
          </LoadingButton>
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
