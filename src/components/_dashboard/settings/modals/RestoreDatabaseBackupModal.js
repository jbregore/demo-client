import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import {
  Modal,
  Card,
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  FormGroup,
  Checkbox
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import moment from 'moment';
import Scrollbar from '../../../Scrollbar';

const collectionNames = [
  'activity logs',
  'cash logs',
  'categories',
  'counters',
  'discount logs',
  'login logs',
  'orders',
  'payment logs',
  'previews',
  'products',
  'promocodelogs',
  'promocodes',
  'read logs',
  'reset count logs',
  'robinson_files_logs',
  'robinson_logs',
  'scpwd reports',
  'settings',
  'transaction amounts',
  'transactions',
  'users'
];

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
  width: 700
}));

RestoreDatabaseBackupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  timestamp: PropTypes.string,
  onFinish: PropTypes.func
};

export default function RestoreDatabaseBackupModal({ open, setOpen, timestamp, onFinish }) {
  const [action, setAction] = useState('full');

  const [selectedCollections, setSelectedCollections] = useState([]);

  const [mongoDbSnapshots, setMongoDbSnapshots] = useState([]);
  const [selectedMongoDbSnapshot, setSelectedMongoDbSnapshot] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFullRestore = async () => {
    try {
      setIsLoading(true);

      const restorePoint = {
        mongoDb: mongoDbSnapshots[selectedMongoDbSnapshot]
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/database-backup/restore`,
        {
          action,
          timestamp,
          restorePoint
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        setOpen('');
        onFinish('Data restored successfully.')
      }
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage(error.response.data.message);
    }
  };

  const handlePartialRestore = async () => {
    try {
      setIsLoading(true);

      const restorePoint = {
        mongoDb: mongoDbSnapshots[selectedMongoDbSnapshot]
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/database-backup/restore`,
        {
          action,
          timestamp,
          restorePoint,
          collections: selectedCollections
        }
      );

      if (response.status === 200) {
        setIsLoading(false);
        onFinish('Data restored successfully.')
        setOpen('');
      }
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage(error.response.data.message);
    }
  };

  const handleCloseError = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsError(false);
  };

  const fetchSnapshots = async () => {
    const snapshots = await axios.get(
      `${process.env.REACT_APP_API_URL}/database-backup/snapshots`,
      {
        params: {
          date: moment(timestamp).format('YYYY-MM-DD')
        }
      }
    );

    setMongoDbSnapshots(snapshots.data.mongoDb);

    if (snapshots.data.mongoDb.length) {
      setSelectedMongoDbSnapshot(0);
    }
  };

  useEffect(() => {
    if (open) {
      setIsError(false);
      setErrorMessage(false);
      fetchSnapshots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const snapshotSelector = (
    <Grid container spacing={2} my={2}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="mongo-snapshot-label">MongoDB Snapshot</InputLabel>
          <Select
            labelId="mongo-snapshot-label"
            id="mongo-snapshot"
            value={selectedMongoDbSnapshot}
            label="MongoDB Snapshot"
            onChange={(e) => setSelectedMongoDbSnapshot(e.target.value)}
          >
            {mongoDbSnapshots.map((snapshot, i) => (
              <MenuItem key={snapshot.timestamp} value={i}>
                {moment(snapshot.timestamp).format('MMM D, YYYY h:mm A')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  return (
    <StyledModal open={open} onClose={() => setOpen('')} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6" mb={4}>
          Restore Backup
        </Typography>

        {/* <Box maxHeight="70vh" sx={{ pt: 1 }}> */}
          <Scrollbar sx={{ maxHeight: '70vh', pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Action</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={action}
              label="Action"
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="full">Full Restore</MenuItem>
              <MenuItem value="partial">Select Collections</MenuItem>
            </Select>
          </FormControl>

          {action === 'full' && (
            <>
              {snapshotSelector}
              <Typography variant="body2" mt={4}>
                This action restores your data to the state it was in when the backup was created on
                the selected snapshot.
              </Typography>
            </>
          )}
          {action === 'partial' && (
            <>
              {snapshotSelector}
              <Typography variant="body2" my={2}>
                Select collections to restore data from the backup created on the selected
                snapshots.
              </Typography>

              <Grid container spacing={2} my={4}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" mb={2} component="legend">
                    Collections (MongoDB)
                  </Typography>
                  <Box>
                    <FormControl sx={{ mx: 3 }} component="fieldset" variant="standard">
                      <FormGroup>
                        {collectionNames.map((name) => (
                          <FormControlLabel
                            key={name}
                            control={
                              <Checkbox
                                checked={selectedCollections.includes(name)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCollections([...selectedCollections, name]);
                                  } else {
                                    setSelectedCollections(
                                      selectedCollections.filter((table) => table !== name)
                                    );
                                  }
                                }}
                                name={name}
                              />
                            }
                            label={name}
                          />
                        ))}
                      </FormGroup>
                    </FormControl>
                  </Box>
                </Grid>
              </Grid>

              {selectedCollections.length ? (
                <Alert severity="warning">
                  Partially restoring data will overwrite existing data in the selected
                  tables/collections only. Please proceed with caution.
                </Alert>
              ) : null}
            </>
          )}

          <Stack direction="row" justifyContent="end" spacing={2} sx={{ marginTop: 5 }}>
            <Button
              size="large"
              variant="contained"
              color="error"
              onClick={() => {
                setOpen('');
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              loading={isLoading}
              size="large"
              variant="contained"
              color="primary"
              onClick={action === 'full' ? handleFullRestore : handlePartialRestore}
              disabled={action === 'partial' && !selectedCollections.length}
            >
              Restore
            </LoadingButton>
          </Stack>
          </Scrollbar>
        {/* </Box> */}
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
