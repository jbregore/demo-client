import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Box,
  Snackbar,
  InputAdornment,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// utils
import { capitalCase } from 'text-case';
import { fCurrency, sum } from '../../../../utils/formatNumber';
// functions
import moment from 'moment';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

// ----------------------------------------------------------------------
const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

const CustomAdornment = styled(InputAdornment)({
  width: 100,
  '&>div': {
    width: '100%',
    textAlign: 'center'
  }
});

const TotalTextField = styled(TextField)({
  '& input': {
    textAlign: 'right'
  }
});

// ----------------------------------------------------------------------

CashTakeoutModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function CashTakeoutModal({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { storeCode, devMode, nonVat } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const { user } = JSON.parse(localStorage.getItem('userData'));

  const defaultValue = {
    peso1000: 0,
    peso500: 0,
    peso200: 0,
    peso100: 0,
    peso50: 0,
    peso20: 0,
    peso10: 0,
    peso5: 0,
    peso1: 0,
    cent25: 0,
    cent10: 0,
    cent05: 0,
    cent01: 0,
    employeeId: user.employeeId,
    cashierFirstName: user.firstname,
    cashierLastName: user.lastname,
    shift: '',
    txnNumber: '',
    branchCode: storeCode,
    dateTime: '04-25-2022 - 11:50pm' // it's just temporary
  };

  const [inputValues, setInputValues] = useState(defaultValue);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [total, setTotal] = useState(0);
  const [bills, setBills] = useState([
    { name: 'peso1000', value: 0, calc: 1000 },
    { name: 'peso500', value: 0, calc: 500 },
    { name: 'peso200', value: 0, calc: 200 },
    { name: 'peso100', value: 0, calc: 100 },
    { name: 'peso50', value: 0, calc: 50 },
    { name: 'peso20', value: 0, calc: 20 },
    { name: 'peso10', value: 0, calc: 10 },
    { name: 'peso5', value: 0, calc: 5 },
    { name: 'peso1', value: 0, calc: 1 },
    { name: 'cent25', value: 0, calc: 0.25 },
    { name: 'cent10', value: 0, calc: 0.1 },
    { name: 'cent05', value: 0, calc: 0.05 },
    { name: 'cent01', value: 0, calc: 0.01 }
  ]);

  useEffect(() => {
    const setOpenDrawer = async () => {
      try {
        await axios.post(`${Endpoints.REPORTS}/open-drawer`,
          { settings },
          { withCredentials: true });

        // eslint-disable-next-line no-empty
      } catch (err) { }

      return true;
    };

    if (open && !devMode) {
      setOpenDrawer();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleLogCashTakeout = async () => {
    setIsLoading(true);

    if (inputValues.shift === '') {
      setErrorMessage('Please select your shift.');
      setIsError(true);
      setIsLoading(false);

      return null;
    }

    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();
    const transactionDate = `${posDateData[0]} ${moment().format('HH:mm:ss')}`;
    const storedData = JSON.parse(localStorage.getItem('userData'));

    const totalCount = {
      peso1000Total: inputValues.peso1000 !== 0 ? inputValues.peso1000 * 1000 : 0,
      peso500Total: inputValues.peso500 !== 0 ? inputValues.peso500 * 500 : 0,
      peso200Total: inputValues.peso200 !== 0 ? inputValues.peso200 * 200 : 0,
      peso100Total: inputValues.peso100 !== 0 ? inputValues.peso100 * 100 : 0,
      peso50Total: inputValues.peso50 !== 0 ? inputValues.peso50 * 50 : 0,
      peso20Total: inputValues.peso20 !== 0 ? inputValues.peso20 * 20 : 0,
      peso10Total: inputValues.peso10 !== 0 ? inputValues.peso10 * 10 : 0,
      peso5Total: inputValues.peso5 !== 0 ? inputValues.peso5 * 5 : 0,
      peso1Total: inputValues.peso1 !== 0 ? inputValues.peso1 * 1 : 0,
      cent25Total: inputValues.cent25 !== 0 ? inputValues.cent25 * 0.25 : 0,
      cent10Total: inputValues.cent10 !== 0 ? inputValues.cent10 * 0.1 : 0,
      cent05Total: inputValues.cent05 !== 0 ? inputValues.cent05 * 0.05 : 0,
      cent01Total: inputValues.cent01 !== 0 ? inputValues.cent01 * 0.01 : 0
    };

    const total = Object.values(totalCount).reduce((a, b) => a + b, 0);
    const totalWithDecimal = total.toFixed(2);

    try {
      const posTransaction = {
        amount: totalWithDecimal,
        employeeId: storedData.user.employeeId,
        storeCode,
        type: 'cash takeout',
        transactionDate
      };

      const activityLog = {
        firstname: storedData.user.firstname,
        lastname: storedData.user.lastname,
        employeeId: storedData.user.employeeId,
        activity: 'Cash Report',
        description: {
          user: {
            firstname: capitalCase(storedData.user.firstname),
            lastname: capitalCase(storedData.user.lastname)
          },
          total: fCurrency('P', total)
        },
        action: 'Cash Takeout',
        storeCode,
        activityDate: `${posDateData[0]
          } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`
      };

      const cashTakeout = {
        ...inputValues,
        cashDate: transactionDate,
        realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
      };

      const printData = {
        apiData: {
          cashReport: {
            ...inputValues,
            isNonVat: nonVat
          },
          total
        },
        settings
      };

      const previewData = {
        type: 'cash takeout',
        storeCode,
        transactionDate,
        data: {
          cashReport: {
            ...inputValues,
            isNonVat: nonVat,
            cashDate: transactionDate,
            realTimeDate: moment(todayDate).format('YYYY-MM-DD HH:mm:ss')
          },
          total
        }
      };

      const payload = {
        posTransaction,
        activityLog,
        cashTakeout,
        printData,
        previewData
      };

      const result = await axios.post(`${Endpoints.REPORTS}/takeout`, payload, {
        withCredentials: true
      });

      if (result.status === 200) {
        setIsError(false);
        setIsLoading(false);
      }

      setInputValues(defaultValue);
      setOpen(false);
    } catch (err) {
      setIsError(true);
      setIsLoading(false);
      if (err.response.status === 400) {
        setErrorMessage(err.response.data.message);
      }
    }

    return true;

  };

  const handleChange = (e) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value });

    // calculate total
    const newBills = bills.map((b) =>
      b.name === e.target.name ? { ...b, value: e.target.value * b.calc } : b
    );
    setBills(newBills);

    setTotal(sum(newBills, 'value').toFixed(2));
  };

  const handleBlur = (e) => {
    if (e.target.value === '') {
      setInputValues({ ...inputValues, [e.target.name]: 0 });
    }
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
        <Typography variant="h6">Cash Takeout</Typography>
        <Box mt={3}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                id="shift"
                label="Shift"
                name="shift"
                select
                fullWidth
                value={inputValues.shift}
                onChange={handleChange}
              >
                <MenuItem value="OPENING">Opening</MenuItem>
                <MenuItem value="CLOSING">Closing</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso1000"
                name="peso1000"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso1000}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  inputProps: { min: 0 },
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>1000</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso500"
                name="peso500"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso500}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>500</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso200"
                name="peso200"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso200}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>200</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso100"
                name="peso100"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso100}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>100</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso50"
                name="peso50"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso50}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>50</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso20"
                name="peso20"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso20}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>20</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso10"
                name="peso10"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso10}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>10</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso5"
                name="peso5"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso5}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>5</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="peso1"
                name="peso1"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.peso1}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>1</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="cent25"
                name="cent25"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.cent25}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>0.25</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="cent10"
                name="cent10"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.cent10}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>0.10</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="cent05"
                name="cent05"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.cent05}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>0.05</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="cent01"
                name="cent01"
                variant="outlined"
                type="number"
                fullWidth
                value={inputValues.cent01}
                onChange={handleChange}
                onFocus={(evt) => evt.target.select()}
                onBlur={handleBlur}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>0.01</Box>
                      </CustomAdornment>
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <TotalTextField
                variant="outlined"
                type="text"
                fullWidth
                value={total}
                InputProps={{
                  startAdornment: (
                    <>
                      <CustomAdornment position="start">
                        <Box>Total</Box>
                      </CustomAdornment>
                    </>
                  ),
                  readOnly: true
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <LoadingButton
                size="large"
                variant="contained"
                type="submit"
                fullWidth
                loading={isLoading}
                onClick={() => handleLogCashTakeout()}
                sx={{ height: 56 }}
              >
                Save & Print
              </LoadingButton>
            </Grid>
          </Grid>
        </Box>
        <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
          <Alert
            onClose={handleCloseError}
            severity="error"
            sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
          >
            {errorMessage !== '' ? errorMessage : 'Something went wrong! Please try again later.'}
          </Alert>
        </Snackbar>
      </ModalCard>
    </StyledModal>
  );
}
