import { useEffect, useRef, useState } from 'react';
import Page from '../components/Page';
import {
  Container,
  Card,
  Typography,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableHead,
  TableCell,
  Box,
  Button,
  Skeleton,
  LinearProgress,
  IconButton,
  Chip
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import moment from 'moment';
import ClearIcon from '@mui/icons-material/Clear';
import ReleaseNotesModal from '../components/_dashboard/updates/modal/ReleaseNotesModal';

export default function Updates() {
  const [appVersion, setAppVersion] = useState(null);

  const [releases, setReleases] = useState([]);
  const [status, setStatus] = useState('idle');

  const [selectedRelease, setSelectedRelease] = useState(null);

  const fetchReleases = async () => {
    setStatus('loading');
    try {
      const response = await axios.get(
        `https://api.github.com/repos/Umbra-Digital-Company/umbra-pos-retails/releases`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.REACT_APP_GITHUB_API_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      );
      setReleases(response.data);
      setStatus('idle');
    } catch (error) {
      setStatus('error');
    }
  };

  const getVersion = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/electron/version`);
      setAppVersion(res.data.version);
    } catch (err) {}
  };

  useEffect(() => {
    getVersion();
  }, []);

  return (
    <Page title="Updates">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Updates
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mt={5} mb={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Releases
            </Typography>
            <Typography variant="body2" gutterBottom>
              See the available releases of Umbra POS for download.
            </Typography>
          </Box>
          <Button variant="contained" onClick={fetchReleases}>
            Check
          </Button>
        </Stack>
        {status === 'loading' && (
          // Table Skeleton
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  {Array.from({ length: 6 }).map((release, i) => {
                    return (
                      <TableCell key={i}>
                        <Skeleton width={100} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 10 }).map((release, i) => {
                  return (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((release, i) => {
                        return (
                          <TableCell key={i}>
                            <Skeleton width={100} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
        {status === 'idle' && releases.length > 0 && (
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Release</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>File Size</TableCell>
                  <TableCell align="center">Download</TableCell>
                  <TableCell align="center">Release Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {releases
                  .filter((r) => !r.draft)
                  .map((release) => (
                    <CustomTableRow
                      installed={release.name === appVersion}
                      key={release.id}
                      release={release}
                      setSelectedRelease={setSelectedRelease}
                    />
                  ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </Container>
      <ReleaseNotesModal release={selectedRelease} setSelectedRelease={setSelectedRelease} />
    </Page>
  );
}

function CustomTableRow({ release, setSelectedRelease, installed }) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);

  const abortControllerRef = useRef();

  const asset = release.assets.filter((asset) => asset.name.endsWith('.exe'))[0];

  const downloadRelease = async (asset) => {
    try {
      abortControllerRef.current = new AbortController();
      setStatus('pending');
      const res = await axios({
        method: 'GET',
        url: `${process.env.REACT_APP_API_URL}/electron/release/${asset.id}/download`,
        responseType: 'blob', // Specify the response type as 'blob' for file download
        onDownloadProgress: (progressEvent) => {
          const p = Math.round((progressEvent.loaded / asset.size) * 100);
          setProgress(p);
          setStatus('downloading');
        },
        signal: abortControllerRef.current.signal
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', asset.name);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
    } finally {
      setStatus('idle');
      setProgress(0);
    }
  };

  const cancelDownload = () => {
    abortControllerRef.current.abort();
  };

  return (
    <TableRow key={release.id}>
      <TableCell>
        {installed ? (
          <Chip
            label={`${release.name}`}
            color="primary"
            variant="outlined"
            onDelete={() => {}}
            deleteIcon={<CheckIcon />}
            ml={2}
          />
        ) : (
          release.name
        )}
      </TableCell>
      <TableCell>{asset.name}</TableCell>
      <TableCell>{moment(release.published_at).format('MM-DD-YYYY')}</TableCell>
      <TableCell>{(asset.size / 1024 / 1024).toFixed(2)} MB</TableCell>
      <TableCell align="center">
        {status !== 'idle' ? (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <LinearProgress
              variant={status === 'downloading' ? 'determinate' : 'indeterminate'}
              value={progress}
              width={70}
              sx={{ flex: 1 }}
            />
            <IconButton aria-label="cancel" size="small" onClick={cancelDownload}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </span>
        ) : (
          <Button variant="outlined" onClick={() => downloadRelease(asset)}>
            Download
          </Button>
        )}
      </TableCell>
      <TableCell align="center">
        <Button variant="outlined" onClick={() => setSelectedRelease(release)}>
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}
