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
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

GenerateMwFiles.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateMwFiles({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode, mwcSalesTypeCode, tenantId,terminalNumber } = settings[SettingsCategoryEnum.UnitConfig] ?? {};

  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const generateMwcFileReport = async () => {
    setIsLoading(true);

    try {
      const res = await axios.get(
        `${Endpoints.ACCREDITATION}/mwc/daily-sales-data/${storeCode}/${transactionDate}`,
        {
          params: {
            tenantId: tenantId,
            terminalNumber: terminalNumber,
            salesTypeCode: mwcSalesTypeCode
          }
        }
      );

      if (res) {
        setIsLoading(false);
        setErrorMessage('');
        setIsError(false);
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage('');
      setErrorMessage(
        err?.response?.data?.message || 'Something went wrong while generating reports.'
      );
    }

    setIsLoading(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Generate Megaworld Report Files</Typography>
        <Box mt={3}>
          {isLoading ? (
            <Typography textAlign="center" mt={1}>
              Processing Reports . . .
            </Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  id="transactionDate"
                  label="Transaction Date"
                  name="transactionDate"
                  type="date"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </Grid>
            </Grid>
          )}
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            onClick={generateMwcFileReport}
            loading={isLoading}
          >
            Generate File
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
