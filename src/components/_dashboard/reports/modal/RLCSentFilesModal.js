import { useEffect, useState } from 'react';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import moment from 'moment';
import {
    Card,
    Stack,
    TextField,
    Typography,
    TableContainer,
    Table,
    TableCell,
    TableBody,
    TableRow,
    TablePagination,
} from '@mui/material';
// utils
import Scrollbar from '../../../Scrollbar';
import { UserListHead } from '../../user';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 800
}));

const TABLE_HEAD = [
    { id: 'fileName', label: 'File', alignRight: false },
    { id: 'date', label: 'Date', alignRight: false },
];

export default function RLCSentFilesModal({ open, setOpen }) {
    const transactionDate = localStorage.getItem('transactionDate');
    const [filteredDate, setFilteredDate] = useState(transactionDate.split(' ')[0]);
    const [page, setPage] = useState(0);
    // eslint-disable-next-line no-unused-vars
    const [order, ] = useState('asc');
    // eslint-disable-next-line no-unused-vars
    const [orderBy, ] = useState('siNumber');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sentFiles, setSentFiles] = useState([]);
    const [resending, ] = useState(false);

    const fetchSentFiles = async () => {
        try {
            const sentFilesRes = await axios.get(
                `${Endpoints.ACCREDITATION}/robinson/sentFiles/${filteredDate}`
            );
            setSentFiles(sentFilesRes.data?.sentFiles);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        setFilteredDate(transactionDate.split(' ')[0])
        if (open) {
            fetchSentFiles();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDateChange = async (date) => {
        try {
            const sentFilesRes = await axios.get(
                `${Endpoints.ACCREDITATION}/robinson/sentFiles/${date}`
            );
            setSentFiles(sentFilesRes.data?.sentFiles);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <StyledModal open={open} onClose={() => {
            if (resending) { return }
            setOpen(false)
        }} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">RLC Sent Files</Typography>
                <Stack mt={2} direction="row" justifyContent={'flex-end'}>
                    <TextField
                        type="date"
                        label="From"
                        InputLabelProps={{
                            shrink: true
                        }}
                        value={filteredDate}
                        onChange={(e) => {
                            setFilteredDate();
                            handleDateChange(e.target.value);
                        }}
                        sx={{ maxWidth: 180 }}
                    />
                </Stack>
                <Scrollbar>
                    <TableContainer>
                        <Table>
                            <UserListHead
                                order={order}
                                orderBy={orderBy}
                                headLabel={TABLE_HEAD}
                                rowCount={sentFiles.length}
                                onRequestSort={() => {
                                    return;
                                }}
                            />
                            <TableBody>
                                {sentFiles
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        return (
                                            <TableRow hover key={index}>
                                                <TableCell component={'th'} scope="row">
                                                    {row?.fileName ?? ''}
                                                </TableCell>
                                                <TableCell component={'th'} scope="row">
                                                    {row?.transactionDate ? moment(row.transactionDate).format('YYYY-MM-DD') : ''}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={sentFiles.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </ModalCard>
        </StyledModal>
    );
}