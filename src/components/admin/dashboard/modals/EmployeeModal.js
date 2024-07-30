import styled from '@emotion/styled';
import { Box, Card, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import useFormErrors from '../../../../hooks/error/useFormError';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

const ROLE_OPTIONS = [
  { value: 'cashier', label: 'Cashier' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'manager', label: 'Manager' },
  { value: 'it_admin', label: 'IT Admin' }
];

const EmployeeModal = (props) => {
  const { context, record, open, setOpen, onCreateCallback, onUpdateCallback } = props;

  const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

  const initialPayload = {
    role: '',
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

  const handleSave = () => {
    if (context === 'create') {
      handleCreate();
    } else if (context === 'update') {
      handleUpdate();
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.post(`${process.env.REACT_APP_API_URL}/employee`, payload);

      if (result.status === 201) {
        setOpen(false);
        setPayload(initialPayload);
        onCreateCallback('success', result.data.message);
      }
    } catch (err) {
      if (err.response.status === 422) {
        const errors = errorHandler(err);
        setFormErrors(errors);
      } else if (err.response.status === 401) {
        const error401 = errorHandler(err);
        onCreateCallback('error', error401);
      }
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.patch(
        `${process.env.REACT_APP_API_URL}/employee/${record.employeeId}`,
        payload
      );

      if (result.status === 200) {
        setOpen(false);
        setPayload(initialPayload);
        onUpdateCallback('success', result.data.message);
      }
    } catch (err) {
      if (err.response.status === 422) {
        const errors = errorHandler(err);
        setFormErrors(errors);
      } else if (err.response.status === 401) {
        const error401 = errorHandler(err);
        onUpdateCallback('error', error401);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (record && context === "update") {
      setPayload({
        role: record.role,
        firstname: record.firstname,
        middlename: record.middlename,
        lastname: record.lastname,
        employeeId: record.employeeId,
        contactNumber: record.contactNumber
      });
    } else {
      setPayload(initialPayload);
    }
    setFormErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">New Employee</Typography>
        <Typography variant="body2">Adding new employee in this current branch.</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="role"
                name="role"
                select
                label="Role"
                value={payload.role}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'role')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('role') : ''}
              >
                {ROLE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                id="firstname"
                name="firstname"
                label="First name"
                variant="outlined"
                fullWidth
                value={payload.firstname}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'firstname')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('firstname') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="middlename"
                label="Middle name"
                name="middlename"
                variant="outlined"
                fullWidth
                value={payload.middlename}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'middlename')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('middlename') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="lastname"
                label="Last name"
                name="lastname"
                variant="outlined"
                fullWidth
                value={payload.lastname}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'lastname')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('lastname') : ''}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                id="employeeId"
                name="employeeId"
                label="Employee ID"
                variant="outlined"
                fullWidth
                value={payload.employeeId}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'employeeId')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('employeeId') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="contactNumber"
                name="contactNumber"
                label="Contact number"
                variant="outlined"
                fullWidth
                value={payload.contactNumber}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'contactNumber')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('contactNumber') : ''}
              />
            </Grid>
            {context !== 'update' && (
              <>
                <Grid item xs={6}>
                  <TextField
                    id="username"
                    name="username"
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={payload.username}
                    onChange={handleChange}
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
                    error={
                      formErrors.errors
                        ? formErrors.errors.some((error) => error.param === 'confirmPassword')
                        : false
                    }
                    helperText={formErrors.errors ? handleFormErrors('confirmPassword') : ''}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleSave}
          >
            {context === 'create' ? 'Add' : 'Update'} Employee
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
};

export default EmployeeModal;
