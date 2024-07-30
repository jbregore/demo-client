import styled from '@emotion/styled';
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import React, { useState } from 'react';
import useCategories from '../../../../hooks/common-data/useCategories';
import axios from 'axios';
import useFormErrors from '../../../../hooks/error/useFormError';
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles';

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

const ProductModal = (props) => {
  const { context, open, setOpen, onCreateCallback } = props;

  const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

  const { categoryOptions } = useCategories();

  const initialPayload = {
    productCode: '',
    name: '',
    description: '',
    category: '',
    size: '',
    color: '',
    price: '',
    vatable: ''
  }

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
    }
  };

  const handleCreate = async () => {
    setIsLoading(true);

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_API_URL}/inventory/products`,
        payload
      );

      if (result.status === 201) {
        setOpen(false);
        setPayload(initialPayload);
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

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Add Product</Typography>
        <Typography variant="body2">Adding new product in the store.</Typography>
        <Box mt={3}>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={6}>
              <TextField
                id="productCode"
                name="productCode"
                label="Product Code"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.productCode}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'productCode')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('productCode') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="name"
                name="name"
                label="Product Name"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.name}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'name')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('name') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="description"
                name="description"
                label="Product Description"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.description}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'description')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('description') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="category"
                name="category"
                label="Category"
                variant="outlined"
                select
                fullWidth
                value={payload.category}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'category')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('category') : ''}
              >
                {categoryOptions.map((item, index) => (
                  <MenuItem value={item.value} key={index}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="size"
                name="size"
                label="Size"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.size}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'size')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('size') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="color"
                name="color"
                label="Color"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.color}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'color')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('color') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="price"
                name="price"
                label="Price"
                variant="outlined"
                type="number"
                fullWidth
                value={payload.price}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'price')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('price') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="vatable"
                name="vatable"
                label="Vatable"
                select
                fullWidth
                value={payload.vatable}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'vatable')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('vatable') : ''}
              >
                <MenuItem value={false}>No</MenuItem>
                <MenuItem value={true}>Yes</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleSave}
          >
            Add Product
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
};

export default ProductModal;
