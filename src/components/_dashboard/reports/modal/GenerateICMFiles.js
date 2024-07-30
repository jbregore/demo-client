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
    Box,
    Grid,
    TextField
} from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 500
}));

// ----------------------------------------------------------------------

GenerateICMFiles.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GenerateICMFiles({ open, setOpen }) {
    const settings = JSON.parse(localStorage.getItem('settings'));

    const [transactionDate, setTransactionDate] = useState(
        localStorage.getItem('transactionDate').split(' ')[0]
      );

    const [isLoading,] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCloseError = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsError(false);
        setIsSuccess(false)
    };

    const handleGenerateICMFiles = async () => {
        try {
            await Promise.all([
                axios.post(`${Endpoints.ACCREDITATION}/icm/daily-sales`, 
                {
                    transactionDate, 
                    settings
                }
                ),
                
                axios.post(`${Endpoints.ACCREDITATION}/icm/hourly-sales`, 
                {
                    transactionDate, 
                    settings
                }
                ),
            ])

            setIsSuccess(true)
            setSuccessMessage('Successfully generated ICM files.')
        } catch(err) {
            console.log(err)
            setIsError(true)
            setErrorMessage(err.response?.data?.message ||  'Something went wrong on generating the files.')
        }

    }

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
                <Typography variant="h6">Generate ICM Files</Typography>
                <Box mt={3}>
                    {isLoading ? (
                        <Typography textAlign="center" mt={1}>
                        Processing Reports . . .
                        </Typography>
                        ) : (
                        <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                            id="transactionDate"
                            label="Transaction Date"
                            name="transactionDate"
                            type="date"
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{
                                shrink: true
                            }}
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                            />
                        </Grid>
                        </Grid>
                    )}
                </Box>
                <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
                    <LoadingButton
                        size="large"
                        variant="contained"
                        type="submit"
                        loading={isLoading}
                        onClick={handleGenerateICMFiles}
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
