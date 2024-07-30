import React, { useState } from 'react'
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles'
import { styled } from '@mui/material/styles';
import { Box, Button, Card, Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
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

const ImportEmployeeModal = (props) => {
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
            await axios.post(`${process.env.REACT_APP_API_URL}/employee/import-csv`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsLoading(false);
            setStatus('success');
            setStatusMessage('Employees successfully imported!');

            onImportCallback();

        } catch (err) {
            setIsLoading(false);
            setStatus('error');
            setStatusMessage('Something went wrong, please try again!');
        }
    };

    const handleDownloadTemplate = () => {
        const columns = {
            employeeId: 'Employee ID',
            firstName: 'First Name',
            middleName: 'Middle Name',
            lastName: 'Last Name',
            role: 'Role',
            contactNumber: 'Contact Number',
            username: 'Username',
            password: 'Password',
          };

          const sampleData  = [{
            employeeId: '0000010',
            firstName: 'Maria Clara',
            middleName: 'Cruz',
            lastName: 'Dela Cruz',
            role: 'cashier',
            contactNumber: '09123456789',
            username: 'mariaclara',
            password: 'umbracashier01',
          },
        ]


        downloadCsv(sampleData, columns, `employee-import-template`);
    }

    return (
        <StyledModal open={open} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">Import Employees</Typography>
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

export default ImportEmployeeModal