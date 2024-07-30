import { Box, CardMedia, Grid, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import useFormErrors from '../hooks/error/useFormError';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import useSnack from '../hooks/useSnack';
import CustomSnack from '../components/CustomSnack';
import { illustrationPos } from '../images';

const CreateClientAdminAccount = ({ onComplete }) => {
  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();
  const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

  const initialPayload = {
    role: 'manager',
    firstname: '',
    middlename: '',
    lastname: '',
    employeeId: '',
    contactNumber: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  const [payload, setPayload] = useState(initialPayload);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPayload({
      ...payload,
      [name]: value
    });
  };

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.post(`${process.env.REACT_APP_API_URL}/employee`, payload);

      if (result.status === 201) {
        setPayload(initialPayload);
        successSnack(result.data.message);
        setTimeout(onComplete, 1000);
      }
    } catch (err) {
      if (err.response.status === 422) {
        const errors = errorHandler(err);
        setFormErrors(errors);
      } else if (err.response.status === 401) {
        const error401 = errorHandler(err);
        errorSnack(error401);
      }
    }
    setIsLoading(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <>
      <Box p={8} display="grid" sx={{ placeItems: 'center' }} height="100%" overflow="auto">
        <Box maxWidth={800} mx="auto">
          <Box display="flex" alignItems="center" gap={2}>
            <CardMedia
              component="img"
              image={illustrationPos}
              alt="login"
              sx={{ maxWidth: '100px' }}
            />
            <Box>
              <Typography variant="h6">Create a Manager Account</Typography>
              <Typography variant="body2">
                Please fill out the form to create your account.
              </Typography>
            </Box>
          </Box>
          <Box mt={5}>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <TextField
                  id="firstname"
                  name="firstname"
                  label="First name"
                  variant="outlined"
                  fullWidth
                  value={payload.firstname}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'firstname')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('firstname') : ''}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="middlename"
                  label="Middle name"
                  name="middlename"
                  variant="outlined"
                  fullWidth
                  value={payload.middlename}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'middlename')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('middlename') : ''}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  id="lastname"
                  label="Last name"
                  name="lastname"
                  variant="outlined"
                  fullWidth
                  value={payload.lastname}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'lastname')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('lastname') : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="employeeId"
                  name="employeeId"
                  label="Employee ID"
                  variant="outlined"
                  fullWidth
                  value={payload.employeeId}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'employeeId')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('employeeId') : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="contactNumber"
                  name="contactNumber"
                  label="Contact number"
                  variant="outlined"
                  fullWidth
                  value={payload.contactNumber}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'contactNumber')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('contactNumber') : ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="username"
                  name="username"
                  label="Username"
                  variant="outlined"
                  fullWidth
                  value={payload.username}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'username')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('username') : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="password"
                  id="password"
                  name="password"
                  label="Password"
                  variant="outlined"
                  fullWidth
                  value={payload.password}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'password')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('password') : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  variant="outlined"
                  fullWidth
                  value={payload.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={onKeyDown}
                  error={
                    formErrors.errors
                      ? formErrors.errors.some((error) => error.param === 'confirmPassword')
                      : false
                  }
                  helperText={formErrors.errors ? handleFormErrors('confirmPassword') : ''}
                />
              </Grid>
            </Grid>
          </Box>
          <Stack mt={4} spacing={1}>
            <LoadingButton
              fullWidth
              size="large"
              variant="contained"
              type="submit"
              loading={isLoading}
              onClick={handleCreate}
            >
              Create Account
            </LoadingButton>
          </Stack>
        </Box>
      </Box>
      <CustomSnack
        open={snackOpen}
        setOpen={setSnackOpen}
        severity={snackSeverity}
        message={snackMessage}
      />
    </>
  );
};

export default CreateClientAdminAccount;
