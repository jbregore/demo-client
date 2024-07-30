import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert
} from '@mui/material';
// utils
import { capitalCase } from 'text-case';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import moment from 'moment'

// ----------------------------------------------------------------------
const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

AccumulatedSales.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function AccumulatedSales({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const [transactionDate, setTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );
  const { online } = useNetwork();

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const downloadJournal = async () => {
    try {
      const res = await axios.get(
        `${Endpoints.REPORTS}/journal/${transactionDate}/${storeCode}`
      );
      const transactions = res.data.data;

      if (transactions.length > 0) {
        try {
          const formData = { transactions, settings };

          const res1 = await axios.post(
            `${Endpoints.REPORTS}/journal/upload`,
            formData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              },
              responseType: 'blob'
            }
          );

          if(res1.status === 200){
            const url = window.URL.createObjectURL(res1.data); 
            const a = document.createElement('a');
            a.href = url;
            a.download = 'E-Journal.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          }

          // eslint-disable-next-line no-empty
        } catch (err) {
          console.log("err ", err)
         }
      } else {
        setErrorMessage('There is no transaction in selected date.');
        setIsError(true);
      }

      const posDateData = localStorage.getItem('transactionDate').split(' ');
      const storedData = JSON.parse(localStorage.getItem('userData'));

      addUserActivityLog(
        storedData.user.firstname,
        storedData.user.lastname,
        storedData.user.employeeId,
        'Sales Report',
        `${capitalCase(storedData.user.firstname)} ${capitalCase(
          storedData.user.lastname
        )} has downloaded a journal for ${transactionDate} transacitons.`,
        'Download Journal Report',
        `${posDateData[0]
        } ${moment().format('HH:mm:ss')}`,
        online
      );

      // eslint-disable-next-line no-empty
    } catch (err) { }
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
        <Typography variant="h6">Downloadable Journal</Typography>
        <Box mt={3}>
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
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <Button size="large" variant="contained" type="submit" onClick={downloadJournal}>
            Download Journal
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
