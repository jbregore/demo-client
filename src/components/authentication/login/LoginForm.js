import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
// formik
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
// material
import { Stack, TextField, IconButton, Typography, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// icons
import { Icon } from '@iconify/react';
import eyeFill from '@iconify/icons-eva/eye-fill';
import eyeOffFill from '@iconify/icons-eva/eye-off-fill';
// utils
import uniqid from 'uniqid';
import { capitalCase } from 'text-case';
// context
import { AuthContext } from '../../../shared/context/AuthContext';
// redux
import { loginStore } from '../../../redux/login/store';
import { setShowPassword } from '../../../redux/login/action';
import { commonStore } from '../../../redux/common/store';
import { setIsError, setErrorMessage } from '../../../redux/common/action';
// functions
import addUserActivityLog from '../../../functions/common/addUserActivityLog';
import useNetwork from '../../../functions/common/useNetwork';
import { SettingsCategoryEnum, MallAccrEnum } from '../../../enum/Settings';
import { Endpoints } from '../../../enum/Endpoints';
// ----------------------------------------------------------------------

export default function LoginForm() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { online } = useNetwork();

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [loginState, setLoginState] = useState({});
  const [commonState, setCommonState] = useState({});

  useEffect(() => {
    localStorage.removeItem('supervisor');
  }, []);

  useEffect(() => {
    const updateLoginState = () => {
      setLoginState(loginStore.getState());
    };

    const updateCommonState = () => {
      setCommonState(commonStore.getState());
    };

    loginStore.subscribe(updateLoginState);
    commonStore.subscribe(updateCommonState);
  }, []);

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required')
  });

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: LoginSchema,
    onSubmit: async (data) => {
      try {
        const { storeCode, startingDate, mallAccr } = settings[SettingsCategoryEnum.UnitConfig];
        data.storeCode = storeCode;
        data.posDate = startingDate;

        const res = await axios.post(`${Endpoints.LOGIN}/`, data);

        if (res) {
          const user = res.data.data;
          const { initialCash, transactionDate } = res.data;

          let formattedDate = '';
          if (transactionDate) {
            formattedDate = moment(transactionDate).format('YYYY-MM-DD HH:mm:ss');
          } else {
            const todayDate = new Date();
            formattedDate = `${startingDate} ${moment(todayDate).format('HH:mm:ss')}`;
          }

          try {
            const apiData = {
              loginId: uniqid(storeCode),
              employeeId: user.employeeId,
              storeCode: storeCode,
              transactionDate: formattedDate
            };
            const res = await axios.post(`${Endpoints.LOGIN}/logs`, apiData);

            addUserActivityLog(
              user.firstname,
              user.lastname,
              user.employeeId,
              'System',
              `${capitalCase(user.firstname)} ${capitalCase(
                user.lastname
              )} has logged in to the system.`,
              'Logged In',
              formattedDate,
              online
            );

            const loginTime = new Date(res.data.transactionDate);

            formattedDate = `${moment(formattedDate).format('YYYY-MM-DD')} ${moment(
              loginTime
            ).format('HH:mm:ss')}`;

            const handleCheckXRead = async () => {
              try {
                const res = await axios.get(
                  `${Endpoints.LOGIN}/check-xread?cashierId=${user.employeeId}&transactionDate=${formattedDate}`
                );

                localStorage.setItem('isXRead', res.data.isXRead);

                // eslint-disable-next-line no-empty
              } catch (err) { }
            };

            handleCheckXRead();

            // robinson logs
            if (mallAccr === MallAccrEnum.Robinson) {
              try {
                await axios.post(
                  `${Endpoints.ACCREDITATION}/robinson/logs`,
                  {
                    storeCode: storeCode,
                    transactionDate: moment(formattedDate).format('YYYY-MM-DD')
                  },
                  {
                    withCredentials: true
                  }
                );
              } catch (err) { }
            }

            // eslint-disable-next-line no-empty
          } catch (err) { }

          try {
            const res = await axios.get(
              `${process.env.REACT_APP_API_URL}/reports/reset-count/${storeCode}`
            );
            const totalResetData = res.data?.resetCount?.count;

            if (!totalResetData || totalResetData === 0) {
              try {
                const apiData = {
                  resetCountLogId: uniqid(storeCode),
                  storeCode: storeCode,
                  resetDate: formattedDate
                };

                await axios.post(`${process.env.REACT_APP_API_URL}/reports/reset-count`, apiData, {
                  withCredentials: true
                });

                // eslint-disable-next-line no-empty
              } catch (err) { }
            }

            // eslint-disable-next-line no-empty
          } catch (err) { }

          auth.login(user, initialCash, formattedDate);
          navigate('/app/orders', { replace: true });
        }
      } catch (err) {
        commonStore.dispatch(setIsError(true));
        commonStore.dispatch(setErrorMessage(err.response.data.message));
      }
    }
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleShowPassword = () => {
    loginStore.dispatch(setShowPassword(!loginState.showPassword));
  };

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3} mb={5}>
          <TextField
            fullWidth
            autoComplete="username"
            type="text"
            label="Username"
            {...getFieldProps('username')}
            error={Boolean(touched.username && errors.username)}
            helperText={touched.username && errors.username}
          />
          <TextField
            fullWidth
            autoComplete="current-password"
            type={loginState.showPassword ? 'text' : 'password'}
            label="Password"
            {...getFieldProps('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleShowPassword} edge="end">
                    <Icon icon={loginState.showPassword ? eyeFill : eyeOffFill} />
                  </IconButton>
                </InputAdornment>
              )
            }}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />
        </Stack>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>
        {commonState.isError && (
          <Typography
            align="center"
            sx={{ color: (theme) => theme.palette.error.main, marginTop: 2 }}
          >
            {commonState.errorMessage}
          </Typography>
        )}
      </Form>
    </FormikProvider>
  );
}
