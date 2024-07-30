import React, { useState } from 'react'
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles'
import { styled } from '@mui/material/styles';
import { Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Endpoints } from '../../../../enum/Endpoints';
import axios from 'axios';
import { ordersStore } from '../../../../redux/orders/store';
import { setCategory } from '../../../../redux/orders/action';
import downloadCsv from 'download-csv';

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 500
}));

const LinkTypography = styled(Typography)({
    color: "#005ce6",
    '&:hover': {
        cursor: 'pointer',
        textDecoration: 'underline',
    },
});

const ImportProductModal = (props) => {
    const { open, setOpen, onImportCallback } = props;

    const [csvFile, setCsvFile] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    const handleImport = async () => {
        setIsLoading(true);

        if (csvFile === '') {
            setIsLoading(false);
            setStatus('');
            setStatusMessage('');

            return false;
        }

        const data = new FormData();
        data.append('file', csvFile);

        try {
            await axios.post(`${Endpoints.INVENTORY}/update-products-csv`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            await ordersStore.dispatch(setCategory(-1));

            setIsLoading(false);
            setStatus('success');
            setStatusMessage('Products successfully imported!');

            onImportCallback();

        } catch (err) {
            setIsLoading(false);
            setStatus('error');
            setStatusMessage('Something went wrong, please try again!');
        }
    };

    const handleDownloadTemplate = () => {
        const columns = {
            name: 'Name',
            code: 'Product Code',
            description: 'Description',
            price: 'Price',
            category: 'Category',
            stock: 'Stocks',
            size: 'Size',
            color: 'Color',
            availability: 'Availability',
            vatable: 'Vatable',
          };

          const sampleData  = [{
            name: 'Running Shoes ',
            code: 'RS001',
            description: 'Lightweight running shoes with cushioned sole.',
            price: 80,
            category: 'Sports',
            stock: 200,
            size: 9,
            color: 'Black',
            availability: 'TRUE',
            vatable: 'TRUE',
          },
        ]


        downloadCsv(sampleData, columns, `product-import-template`);
    }

    return (
        <StyledModal open={open} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">Import Products</Typography>
                <Box mt={3}>
                    <TextField
                        fullWidth
                        type="file"
                        label="Upload CSV File"
                        InputLabelProps={{
                            shrink: true
                        }}
                        onChange={(e) => setCsvFile(e.target.files[0])}
                    />

                    <LinkTypography mt={2} onClick={handleDownloadTemplate}>
                        Download Template
                    </LinkTypography>
                </Box>
                {status !== '' && (
                    <Typography textAlign="center" color={status === 'success' ? 'primary' : status} mt={1}>
                        {statusMessage}
                    </Typography>
                )}
                <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
                    <Button size="large" variant="outlined" type="submit" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                    <LoadingButton
                        size="large"
                        variant="contained"
                        type="submit"
                        loading={isLoading}
                        onClick={handleImport}
                    >
                        Import
                    </LoadingButton>
                </Stack>
            </ModalCard>
        </StyledModal>
    )
}

export default ImportProductModal