import { useEffect, useState } from 'react';
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
import getDateDiff from "../../../../utils/getDateDiff";
import addDate from '../../../../utils/addDate';
import moment from 'moment';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

PeriodicalZread.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function PeriodicalZread({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const [fromTransactionDate, setFromTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );
  const { online } = useNetwork();
  const [toTransactionDate, setToTransactionDate] = useState(
    localStorage.getItem('transactionDate').split(' ')[0]
  );
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    const from = new Date(fromTransactionDate);
    const to = new Date(toTransactionDate);

    const dateDIff = getDateDiff(from, to);
    if (dateDIff < 0) {
      setToTransactionDate(addDate(from, 0));
    }
  }, [fromTransactionDate, toTransactionDate]);

  useEffect(() => {
    if(open) {
      setErrorMessage('')
      setIsError(false)
    }
  }, [open])


  const handlePeriodicalZRead = async () => {
    try {
      const res = await axios.get(
        `${Endpoints.REPORTS}/periodical-zread/${fromTransactionDate}/${toTransactionDate}/${storeCode}`
      );
      const transactions = res.data.data;
      const { PAYMENTS_TXN_AMOUNT } = res.data;

      if (transactions.length > 0) {
        const storedData = JSON.parse(localStorage.getItem('userData'));
        const posDateData = localStorage.getItem('transactionDate').split(' ');
        const todayDate = new Date();
        const generatedDate = `${posDateData[0]
          } ${moment().format('HH:mm:ss')}`;
        const supervisorData = JSON.parse(localStorage.getItem('supervisor'));

        const apiData = {
          transactions,
          PAYMENTS_TXN_AMOUNT,
          fromTransactionDate,
          toTransactionDate,
          generatedDate,
          supervisor: supervisorData,
          cashier: {
            id: storedData.user.employeeId,
            firstname: storedData.user.firstname,
            lastname: storedData.user.lastname,
            role: storedData.user.role,
            shiftFrom: `${posDateData[0]} ${posDateData[1]}`,
            shiftTo: `${posDateData[0]
              } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
          }
        };

        // const formData = new FormData();
        // formData.append('apiData', JSON.stringify(apiData));
        // formData.append('settings', JSON.stringify(settings));

        const formData = { apiData, settings };

        try {
          const response = await axios.post(
            `${Endpoints.REPORTS}/periodical-zread/print-receipt`,
            formData,
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              },
               responseType: 'blob'
            }
          );

          if(response.status === 200){
            const url = window.URL.createObjectURL(response.data); 
            const a = document.createElement('a');
            a.href = url;
            a.download = 'PeriodicalZRead.txt';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          }
        } catch (err) { 
          console.log("err ", err)
        }

        addUserActivityLog(
          storedData.user.firstname,
          storedData.user.lastname,
          storedData.user.employeeId,
          'Periodical Z-Reading',
          `${capitalCase(storedData.user.firstname)} ${capitalCase(
            storedData.user.lastname
          )} had generated a periodical Z-Reading from ${fromTransactionDate} to ${toTransactionDate}.`,
          'Confirm Return',
          generatedDate,
          online
        );

        setOpen(false);
      } else {
        setErrorMessage('There is no transaction in selected range.');
        setIsError(true);

        return null;
      }

      // eslint-disable-next-line no-empty
    } catch (err) { }

    return true;
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
        <Typography variant="h6">Periodical - Z READ</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="transactionDate"
                label="ZREAD Date From"
                name="transactionDate"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                value={fromTransactionDate}
                onChange={(e) => setFromTransactionDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="transactionDate"
                label="ZREAD Date To"
                name="transactionDate"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                value={toTransactionDate}
                onChange={(e) => {
                  console.log(e.target.value);
                  setToTransactionDate(e.target.value);
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <Button size="large" variant="contained" type="submit" onClick={handlePeriodicalZRead}>
            Generate Z Read
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
