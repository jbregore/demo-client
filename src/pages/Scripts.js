import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Page from '../components/Page';
import { Container, Grid, Typography, Stack, Button, Snackbar, Alert } from '@mui/material';
import {
  // GenerateZRead,
  // GenerateXRead,
  UpdatePriceOverride,
  ReindexCollectionsModal,
  AddIndexModal,
  ResetDataModal,
} from '../components/_dashboard/reports';

const CustomButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  }
}));

export default function Scripts() {
  // const [generateZReadModal, setGenerateZReadModal] = useState(false);
  // const [generateXReadModal, setGenerateXReadModal] = useState(false);
  const [updatePriceOverrideModal, setUpdatePriceOverrideModal] = useState(false);
  const [reindexCollectionsModal, setReindexCollectionsModal] = useState(false);
  const [addIndexModal, setAddIndexModal] = useState(false);
  const [resetDataModal, setResetDataModal] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);

  const { user } = JSON.parse(localStorage.getItem('userData'));

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
    setDeleted(false);
  };

  return (
    <Page title="Scripts">
      <UpdatePriceOverride open={updatePriceOverrideModal} setOpen={setUpdatePriceOverrideModal} />
      <ReindexCollectionsModal open={reindexCollectionsModal} setOpen={setReindexCollectionsModal} />
      <AddIndexModal open={addIndexModal} setOpen={setAddIndexModal} />
      <ResetDataModal
        open={resetDataModal}
        setOpen={setResetDataModal}
        setDeleted={setDeleted}
        setErrorMessage={setErrorMessage}
        setIsError={setIsError}
      />
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Scripts
          </Typography>
        </Stack>
        <Grid container spacing={3} pb={4}>
          {user.username === 'umbra_admin' && (
            <>
              {/* <Grid item xs={4}>
                <CustomButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setGenerateXReadModal(true)}
                >
                  Generate X Read
                </CustomButton>
              </Grid>
              <Grid item xs={4}>
                <CustomButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setGenerateZReadModal(true)}
                >
                  Generate Z Read
                </CustomButton>
              </Grid> */}
              <Grid item xs={4}>
                <CustomButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setUpdatePriceOverrideModal(true)}
                >
                  Fix Price Override
                </CustomButton>
              </Grid>
              <Grid item xs={4}>
                <CustomButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setReindexCollectionsModal(true)}
                >
                  Reindex Collections (MongoDB)
                </CustomButton>
              </Grid>
              <Grid item xs={4}>
                <CustomButton
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setResetDataModal(true)}
                >
                  Reset Data
                </CustomButton>
              </Grid>
            </>
          )}

        </Grid>
      </Container>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={deleted}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Data successfully cleared.
        </Alert>
      </Snackbar>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={isError}
        autoHideDuration={4000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Page>
  );
}
