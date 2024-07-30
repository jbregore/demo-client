import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
    Card,
    Stack,
    Typography,
    Snackbar,
    Alert,
    Button,
    CircularProgress
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 500
}));

// ----------------------------------------------------------------------

GenerateSMFiles.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateSMFiles({ open, setOpen }) {
    const settings = JSON.parse(localStorage.getItem('settings'));

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleGenerateSMFiles = async () => {
        try {
            setIsError(false)
            setIsSuccess(false)
            setIsLoading(true)
            await Promise.all([
                axios.post(`${Endpoints.ACCREDITATION}/sm/generate-transaction-details`, {
                    transactionDate: localStorage.getItem('transactionDate').split(' ')[0],
                    settings: settings
                }),
                axios.post(`${Endpoints.ACCREDITATION}/sm/generate-transaction`, {
                    transactionDate: localStorage.getItem('transactionDate').split(' ')[0],
                    settings: settings
                }),
            ])

            setIsSuccess(true)
            setSuccessMessage('SM Transaction files saved successfully.')
        } catch (err) {
            setIsError(true)
            setErrorMessage('Failed to save SM transaction files.')
            console.log(err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCloseError = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsError(false);
        setIsSuccess(false)
    };

    useEffect(() => {
        if (open) {
            setIsError(false)
            setIsSuccess(false)
            setErrorMessage('')
        }
    }, [open])

    return (
        <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">Generate SM Transaction Files</Typography>
                {
                    isLoading ? <Stack direction={'row'} alignItems={'center'} spacing={1} >
                        <CircularProgress size={30} />
                        <Typography mt={2} mb={2}>Generating SM Transaction files...</Typography>
                    </Stack> : <Typography mt={2} mb={2}>Would you like to regenerate transaction files from the last 30 days?</Typography>
                }
                <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
                    <LoadingButton
                        size="large"
                        variant="contained"
                        type="submit"
                        loading={isLoading}
                        onClick={handleGenerateSMFiles}
                    >
                        Yes
                    </LoadingButton>
                    <Button
                        size="large"
                        variant="contained"
                        color='error'
                        type="submit"
                        disabled={isLoading}
                        onClick={() => setOpen(false)}
                    >
                        No
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
                <Snackbar open={isSuccess} autoHideDuration={3000} onClose={handleCloseError}>
                    <Alert
                        onClose={handleCloseError}
                        severity="success"
                        sx={{ width: '100%', backgroundColor: 'green', color: '#fff' }}
                    >
                        {successMessage}
                    </Alert>
                </Snackbar>
            </ModalCard>
        </StyledModal>
    );
}
