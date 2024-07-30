import styled from '@emotion/styled';
import { LoadingButton } from '@mui/lab';
import {  Box, Card, Stack, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useFormErrors from '../../../../hooks/error/useFormError';
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

const CategoryModal = (props) => {
  const { context, record, open, setOpen, onCreateCallback, onUpdateCallback } = props;

  const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

  const [payload, setPayload] = useState({
    name:  ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    if (context === 'create') {
      handleCreate();
    }else if (context === "update"){
      handleUpdate()
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/inventory/categories`,
        payload
      );

      if (result?.status === 201) {
        setOpen(false);
        setPayload('');
        onCreateCallback("success", result.data.message);
      }
    } catch (err) {
      if (err.response.status === 422) {
        const errors = errorHandler(err);
        setFormErrors(errors);
      }else if (err.response.status === 401) {
        const error401 = errorHandler(err);
        onCreateCallback("error", error401);
      }
    }
    setIsLoading(false);
  };

  const handleUpdate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.put(
        `${process.env.REACT_APP_API_URL}/inventory/categories/${record._id}`,
        payload
      );

      if (result.status === 200) {
        setOpen(false);
        setPayload('');
        onUpdateCallback("success", result.data.message);
      }
    } catch (err) {
      if (err.response.status === 422) {
        const errors = errorHandler(err);
        setFormErrors(errors);
      }else if (err.response.status === 401) {
        const error401 = errorHandler(err);
        onUpdateCallback("error", error401);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if(record && context === "update"){
      setPayload({
        name: record.name
      })
    }
    else {
      setPayload({
        name: ''
      });
    }
    setFormErrors([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <StyledModal open={open} onClose={() => {
      setOpen(false)
    }} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6"> {context === "create" ? "Add" : "Update"} Category</Typography>
        <Box mt={3}>
          <TextField
            id="name"
            label="Name"
            name="name"
            variant="outlined"
            type="text"
            fullWidth
            value={payload.name}
            onChange={(e) => setPayload({ name: e.target.value })}
            error={
              formErrors.errors ? formErrors.errors.some((error) => error.param === 'name') : false
            }
            helperText={formErrors.errors ? handleFormErrors('name') : ''}
          />
          <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
            <LoadingButton
              size="large"
              variant="contained"
              type="submit"
              loading={isLoading}
              onClick={handleSave}
            >
              {context === "create" ? "Add" : "Update"} Category
            </LoadingButton>
          </Stack>
        </Box>
      </ModalCard>
    </StyledModal>
  );
};

export default CategoryModal;
