import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import moment from 'moment';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
    Button,
    Card,
    Modal,
    Stack,
    TextField,
    Typography,
    Snackbar,
    Alert,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TablePagination
} from '@mui/material';
// utils
import { capitalCase } from 'text-case';
// functions
import addUserActivityLog from '../../../../functions/common/addUserActivityLog';
import useNetwork from '../../../../functions/common/useNetwork';
import Scrollbar from '../../../Scrollbar';
import { UserListHead } from '../../user';
import SearchNotFound from '../../../SearchNotFound';
import { fCurrencyAccounting } from '../../../../utils/formatNumber';
import addDate from '../../../../utils/addDate';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
    { id: 'date', label: 'Date', alignRight: false },
    { id: 'storeCode', label: 'Store Code', alignRight: false },
    { id: 'cashSales', label: 'Cash Sales', alignRight: false },
    { id: 'actualCash', label: 'Actual Cash', alignRight: false },
    { id: 'excessCash', label: 'Excess Cash', alignRight: false },
    { id: 'shortOver', label: 'Short/(Over)', alignRight: false }
];

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
    position: 'fixed',
    zIndex: 1300,
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});

const Backdrop = styled('div')({
    zIndex: '-1px',
    position: 'fixed',
    right: 0,
    bottom: 0,
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 800
}));

// ----------------------------------------------------------------------

EodCashReport.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------
const currentDate = new Date();
export default function EodCashReport({ open, setOpen }) {
    const [fromTransactionDate, setFromTransactionDate] = useState(addDate(currentDate, 0));
    const [toTransactionDate, setToTransactionDate] = useState(addDate(currentDate, 0));
    const { online } = useNetwork();
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Table
    const [eodCashReports, setEodCashReports] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - eodCashReports.length) : 0;

    useEffect(() => {
        const fetchEodCashReports = async () => {
            try {
                const res = await axios.get(`${Endpoints.REPORTS}/takeout/download`, {
                    params: {
                        format: 'json',
                        from: fromTransactionDate,
                        to: toTransactionDate
                    }
                });

                const { data } = res;
                if (data.length > 0 && !fromTransactionDate) {
                    setFromTransactionDate(moment(data[0].date).format('YYYY-MM-DD'));
                    setToTransactionDate(moment(data[data.length - 1].date).format('YYYY-MM-DD'));
                }

                setEodCashReports(data);
            } catch (err) {
                setErrorMessage('There was an error fetching EOD Cash Reports.');
                setIsError(true);
            }
        };

        fetchEodCashReports();
    }, [fromTransactionDate, toTransactionDate]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };



    const handleDownloadEodCashReport = async () => {
        if (fromTransactionDate > toTransactionDate) {
            setErrorMessage('Date From cannot be set later than Date To.');
            setIsError(true);
            return;
        }

        try {
            const res = await axios.get(`${Endpoints.REPORTS}/takeout/check-range`, {
                params: {
                    from: fromTransactionDate,
                    to: toTransactionDate
                }
            });

            if (res.data.count === 0) {
                setErrorMessage('There is no transaction in selected range.');
                setIsError(true);
                return;
            }

            const storedData = JSON.parse(localStorage.getItem('userData'));
            const posDateData = localStorage.getItem('transactionDate').split(' ');
            const todayDate = new Date();
            const generatedDate = `${posDateData[0]
                } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;

            window.location.assign(
                `${Endpoints.REPORTS}/takeout/download?from=${fromTransactionDate}&to=${toTransactionDate}`
            );

            addUserActivityLog(
                storedData.user.firstname,
                storedData.user.lastname,
                storedData.user.employeeId,
                'EOD Cash Report',
                `${capitalCase(storedData.user.firstname)} ${capitalCase(
                    storedData.user.lastname
                )} had downloaded EOD Cash Report from ${fromTransactionDate} to ${toTransactionDate}.`,
                'Confirm Return',
                generatedDate,
                online
            );

            setOpen(false);
            // eslint-disable-next-line no-empty
        } catch (err) {
            setErrorMessage('There was an error downloading EOD Cash Report.');
            setIsError(true);
        }

        return true;
    };

    const handleCloseError = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setIsError(false);
    };

    return (
        <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">EOD Cash Report</Typography>
                <Stack direction="row" alignItems="center" my={3} spacing={2}>
                    <TextField
                        sx={{ flex: 1 }}
                        id="transactionDate"
                        label="Date From"
                        name="transactionDate"
                        type="date"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true
                        }}
                        value={fromTransactionDate}
                        onChange={(e) => setFromTransactionDate(e.target.value)}
                    />
                    <TextField
                        sx={{ flex: 1 }}
                        id="transactionDate"
                        label="Date To"
                        name="transactionDate"
                        type="date"
                        variant="outlined"
                        InputLabelProps={{
                            shrink: true
                        }}
                        value={toTransactionDate}
                        onChange={(e) => setToTransactionDate(e.target.value)}
                    />
                    <Button
                        size="large"
                        variant="contained"
                        type="submit"
                        startIcon={<Icon icon="simple-icons:microsoftexcel" />}
                        onClick={handleDownloadEodCashReport}
                    >
                        Download
                    </Button>
                </Stack>

                <Scrollbar>
                    <TableContainer>
                        <Table>
                            <UserListHead
                                order={'asc'}
                                orderBy={'date'}
                                headLabel={TABLE_HEAD}
                                rowCount={eodCashReports.length}
                                numSelected={0}
                                onRequestSort={() => { }}
                                onSelectAllClick={() => { }}
                            />
                            <TableBody>
                                {eodCashReports
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        return (
                                            <TableRow hover key={index} tabIndex={-1}>
                                                <TableCell component="th" scope="row">
                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                        <Typography variant="subtitle2" noWrap>
                                                            {row.date}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="center">{row.storeCode}</TableCell>
                                                <TableCell align="right">{fCurrencyAccounting(row.cashSales)}</TableCell>
                                                <TableCell align="right">{fCurrencyAccounting(row.actualCash)}</TableCell>
                                                <TableCell align="right">{fCurrencyAccounting(row.excessCash)}</TableCell>
                                                <TableCell align="right">{fCurrencyAccounting(row.shortOver)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: 53 * emptyRows
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                            {eodCashReports.length === 0 && (
                                <TableBody>
                                    <TableRow>
                                        <TableCell
                                            align="center"
                                            colSpan={12}
                                            sx={{
                                                py: 3
                                            }}
                                        >
                                            <SearchNotFound searchQuery={''} />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            )}
                        </Table>
                    </TableContainer>
                </Scrollbar>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={eodCashReports.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                <Snackbar open={isError} autoHideDuration={3000} onClose={handleCloseError}>
                    <Alert
                        onClose={handleCloseError}
                        severity="error"
                        sx={{ width: '100%', backgroundColor: 'darkred', color: '#fff' }}
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </ModalCard>
        </StyledModal>
    );
}