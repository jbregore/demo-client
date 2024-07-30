import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

ReindexCollectionsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function ReindexCollectionsModal({ open, setOpen }) {

  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  const reindexPreviews = async () => {
    try {
      setStatus('loading');
      const response = await axios.post(`${Endpoints.SETTINGS}/reindex-collections`);
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => {
        setOpen(false);
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response.data.message);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    setStatus('');
    if (reason === 'clickaway') {
      return;
    }
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Reindex Collections</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Are you sure you want to reindex all Collections from MongoDB? This may take a while.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={status === 'loading'}
            disabled={status === 'loading' || status === 'success'}
            onClick={reindexPreviews}
          >
            Proceed
          </LoadingButton>
        </Stack>
        <Snackbar open={status !== '' && status !== 'loading'} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert
            onClose={handleCloseSnackbar}
            severity={(status === 'loading' || status === '') ? 'info' : status}
            sx={{ width: '100%', backgroundColor: status === 'error' ? 'red' : '#f6fdf2', color: '#446032' }}
          >
            {message}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
