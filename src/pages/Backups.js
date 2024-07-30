import Page from '../components/Page';
import {
  Container,
  Stack,
  Button,
  Typography,
  TableContainer,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { UserListHead } from '../components/_dashboard/user';
import GenericLoadingModal from '../shared/modals/GenericLoadingModal';
import CustomSnack from '../components/CustomSnack';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import RestoreDatabaseBackupModal from '../components/_dashboard/settings/modals/RestoreDatabaseBackupModal';
import useSnack from '../hooks/useSnack';

export default function Backups() {
  const [uploadQueueCount, setUploadQueueCount] = useState(0);
  const [backupDates, setBackupDates] = useState([]);
  const [datesFetching, setDatesFetching] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedDate, setSelectedDate] = useState('');

  const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
    useSnack();

  const TABLE_HEAD = [
    { id: 'date', label: 'Date', alignRight: false },
    { id: 'actions', label: 'Actions', alignRight: false }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchBackupDates = async () => {
    setDatesFetching(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/database-backup`);
      setBackupDates(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setDatesFetching(false);
    }
  };

  const fetchUploadQueueCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/database-backup/upload-queue/count`
      );
      setUploadQueueCount(response.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  const handleBackupNow = async () => {
    setBackupLoading(true);
    setMessage('Backing up database...');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/database-backup/backup`);
      await fetchBackupDates();
      await fetchUploadQueueCount();
      setBackupLoading(false);
      setMessage('');
      successSnack('Database backup successful.');
    } catch (error) {
      setBackupLoading(false);
      setMessage('Failed to backup database, please try again.');
      errorSnack('Failed to backup database, please try again.');
      console.log(error);
    }
  };

  const handleUploadQueue = async () => {
    setBackupLoading(true);
    setMessage('Uploading backup queue...');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/database-backup/upload-queue`);
      await fetchBackupDates();
      await fetchUploadQueueCount();
      setBackupLoading(false);
      setMessage('');
      successSnack('Upload queue executed successfully.');
    } catch (error) {
      setBackupLoading(false);
      setMessage('Failed to execute upload queue, please try again.');
      errorSnack('Failed to execute upload queue, please try again.');
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUploadQueueCount();
    fetchBackupDates();
  }, []);

  return (
    <>
      <Page title="Backups">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Backups
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ width: '100%' }}>
            <Typography variant="body2" mb={2} sx={{ fontWeight: 500 }}>
              Last backup:{' '}
              {backupDates[0]
                ? moment(backupDates[0]?.lastModified).format('YYYY-MM-DD h:mm A')
                : ''}
            </Typography>
            <Stack direction="row" spacing={1}>
              {uploadQueueCount > 0 && (
                <Button variant="outlined" onClick={handleUploadQueue}>
                  Upload Queue ({uploadQueueCount})
                </Button>
              )}
              <Button variant="contained" onClick={handleBackupNow}>
                Backup Now
              </Button>
            </Stack>
          </Stack>
          <TableContainer sx={{ marginBottom: '50px' }}>
            <Table>
              <UserListHead
                headLabel={TABLE_HEAD}
                onRequestSort={() => {
                  return;
                }}
                onSelectAllClick={() => {
                  return;
                }}
              />
              <TableBody>
                {datesFetching ? (
                  <>
                    <TableRow>
                      <TableCell align="center" colSpan={2} sx={{ py: 3 }}>
                        <CircularProgress />
                        <Typography variant="body2">Loading...</Typography>
                      </TableCell>
                    </TableRow>
                  </>
                ) : backupDates.length > 0 ? (
                  <>
                    {backupDates
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((backupDate, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell component={'th'} scope="row" width="100%">
                              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                                <Typography variant="body1">{backupDate.date}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell component={'th'} scope="row">
                              <Stack direction={'row'} spacing={1}>
                                <Button
                                  variant="outlined"
                                  onClick={() => setSelectedDate(backupDate.lastModified)}
                                >
                                  Restore
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </>
                ) : (
                  <>
                    <TableRow>
                      <TableCell align="center" colSpan={2} sx={{ py: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          There is no data available.
                        </Typography>
                        <Typography variant="body2">No data to display.</Typography>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={backupDates.length}
            rowsPerPageOptions={[5, 10]}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Container>
      </Page>
      <GenericLoadingModal open={backupLoading} setOpen={setBackupLoading} message={message} />
      <RestoreDatabaseBackupModal
        open={selectedDate !== ''}
        setOpen={setSelectedDate}
        timestamp={selectedDate}
        onFinish={(message, error) => {
          if (error) {
            errorSnack(message);
          } else {
            successSnack(message);
          }
        }}
      />
      <CustomSnack
        open={snackOpen}
        setOpen={setSnackOpen}
        severity={snackSeverity}
        message={snackMessage}
      />
    </>
  );
}
