import { useEffect, useState } from 'react';
import Page from '../components/Page';
import {
  Container,
  Card,
  Typography,
  Stack,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Box
} from '@mui/material';
import axios from 'axios';
import Markdown from 'react-markdown';
import moment from 'moment';

const mdContainerStyle = {
  'h1,h2,h3,h4,h5,h6': { my: 2, fontSize: '1rem' },
  ul: { listStylePosition: 'inside' },
  li: { my: 1, ml: 4 }
};

export default function Info() {
  const [appVersion, setAppVersion] = useState(null);
  const [birVersion, setBirVersion] = useState(null);
  const [releaseNotes, setReleaseNotes] = useState('');
  const [releaseDate, setReleaseDate] = useState(null);

  const fetchReleaseNotes = async (version) => {
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

      const installedRelease = response.data.find((release) => release.name === version);
      if (installedRelease) {
        setReleaseDate(installedRelease.published_at);
        const notes = installedRelease.body
          .split('**Full Changelog**')[0]
          .split('## New Contributors')[0];
        setReleaseNotes(notes);
      }
    } catch (error) {}
  };

  const getVersion = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/electron/version`);
      setAppVersion(res.data.version);
      setBirVersion(res.data.birVersion);

      fetchReleaseNotes(res.data.version);
    } catch (err) {}
  };

  useEffect(() => {
    getVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page title="Updates">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Updates
          </Typography>
        </Stack>
        <Typography variant="h6" gutterBottom>
          Version Information
        </Typography>
        <Card>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell width="20%" sx={{ minWidth: 200, fontWeight: 'bold' }}>
                  POS Version
                </TableCell>
                <TableCell width="80%">{birVersion}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="20%" sx={{ minWidth: 200, fontWeight: 'bold' }}>
                  Patch
                </TableCell>
                <TableCell width="80%">{appVersion}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="20%" sx={{ minWidth: 200, fontWeight: 'bold' }}>
                  Release Date
                </TableCell>
                <TableCell width="80%">
                  {releaseDate && moment(releaseDate).format('YYYY-MM-DD')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        <Typography variant="h6" gutterBottom mt={4}>
          Release Notes
        </Typography>
        <Card>
          <Box sx={mdContainerStyle} p={2}>
            <Markdown>{releaseNotes}</Markdown>
          </Box>
        </Card>
      </Container>
    </Page>
  );
}
