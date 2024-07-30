import { Box, Card, Grid, Stack, TextField, Typography, styled } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { Backdrop, StyledModal } from '../_dashboard/reports/modal/styles/commonModalStyles';
import { LoadingButton } from '@mui/lab';
import useFormErrors from '../../hooks/error/useFormError';
import cryptoRandomString from 'crypto-random-string';
import axios from 'axios';

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 600
}));

const OrganizationModal = (props) => {
    const { context, record, open, setOpen, onCreateCallback, onUpdateCallback } = props;

    const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

    const [payload, setPayload] = useState({
        name: '',
        user: '',
        deviceId: '',
        apiKey: '',
        date: '',
        status: 'Disabled'
    });
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
        } else if (context === "update") {
            handleUpdate()
        }
    };

    const handleCreate = async () => {
        const apiPayload = {
            ...payload,
            accessKey: cryptoRandomString({ length: 44, type: 'alphanumeric' })
        }
        setIsLoading(true);

        try {
            const result = await axios.post(
                `${process.env.REACT_APP_API_URL}/demo-organization`,
                apiPayload
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
            } else if (err.response.status === 401) {
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
                `${process.env.REACT_APP_API_URL}/demo-organization/${record._id}`,
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
            } else if (err.response.status === 401) {
                const error401 = errorHandler(err);
                onUpdateCallback("error", error401);
            }
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (record && context === "update") {
            setPayload({
                name: record.name,
                user: record.user,
                deviceId: record.deviceId,
                apiKey: record.apiKey,
                date: record.date,
                status: record.status
            })
        }
        else {
            setPayload({
                name: '',
                user: '',
                deviceId: '',
                apiKey: '',
                date: '',
                status: 'Disabled'
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
                <Typography variant="h6"> {context === "create" ? "Add" : "Update"} Organization</Typography>
                <Box mt={3}>
                    <Grid container direction="row" spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                id="name"
                                label="Name"
                                name="name"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={payload.name}
                                onChange={handleChange}
                                error={
                                    formErrors.errors ? formErrors.errors.some((error) => error.param === 'name') : false
                                }
                                helperText={formErrors.errors ? handleFormErrors('name') : ''}
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="user"
                                label="User"
                                name="user"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={payload.user}
                                onChange={handleChange}
                                error={
                                    formErrors.errors ? formErrors.errors.some((error) => error.param === 'user') : false
                                }
                                helperText={formErrors.errors ? handleFormErrors('user') : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="deviceId"
                                label="Device ID"
                                name="deviceId"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={payload.deviceId}
                                onChange={handleChange}
                                error={
                                    formErrors.errors ? formErrors.errors.some((error) => error.param === 'deviceId') : false
                                }
                                helperText={formErrors.errors ? handleFormErrors('deviceId') : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="apiKey"
                                label="API Key"
                                name="apiKey"
                                variant="outlined"
                                type="text"
                                fullWidth
                                value={payload.apiKey}
                                onChange={handleChange}
                                error={
                                    formErrors.errors ? formErrors.errors.some((error) => error.param === 'apiKey') : false
                                }
                                helperText={formErrors.errors ? handleFormErrors('apiKey') : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="date"
                                name="date"
                                label="Scheduled Date"
                                variant="outlined"
                                type="date"
                                fullWidth
                                value={payload.date}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true
                                }}
                                error={
                                    formErrors.errors ? formErrors.errors.some((error) => error.param === 'date') : false
                                }
                                helperText={formErrors.errors ? handleFormErrors('date') : ''}
                            />
                        </Grid>
                    </Grid>
                    <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
                        <LoadingButton
                            size="large"
                            variant="contained"
                            type="submit"
                            loading={isLoading}
                            onClick={handleSave}
                        >
                            {context === "create" ? "Add" : "Update"} Organization
                        </LoadingButton>
                    </Stack>
                </Box>
            </ModalCard>
        </StyledModal>
    )
}

export default OrganizationModal