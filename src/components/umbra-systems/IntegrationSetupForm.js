import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import Logo from '../Logo';
import { createApolloClient } from '../../graphql/apollo-client';
import useNetwork from '../../functions/common/useNetwork';
import { isProduction } from '../../utils/isProduction';
import { GET_DUMMY_POS_DEVICE_STATUS_QUERY } from '../../graphql/queries';
import { illustrationPos } from '../../images';

export default function IntegrationSetupForm({ version, onSuccess }) {
  const { online } = useNetwork();
  const [started, setStarted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputValues, setInputValues] = useState({
    deviceId: '',
    apiKey: ''
  });

  const apolloClient = createApolloClient(inputValues.apiKey);

  const handleConnect = async () => {
    setLoading(true);

    const { data } = await apolloClient.query({
      query: GET_DUMMY_POS_DEVICE_STATUS_QUERY,
      variables: { id: inputValues.deviceId }
    });

    try {
      if (data.dummyPosDeviceStatus.status) {
        try {
          const currentConfig = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
          const updatedConfig = {
            ...currentConfig,
            id: currentConfig._id,
            endpoint: (isProduction() ? process.env.REACT_APP_UMBRA_SYSTEMS_API_URL : await JSON.parse(localStorage.getItem("devOptions") ?? "{}")?.umbraSysAPI) || 'http://localhost:4000/',
            deviceId: inputValues.deviceId,
            status: data.dummyPosDeviceStatus.status,
            apiKey: inputValues.apiKey
          };

          await axios.patch(
            `${process.env.REACT_APP_API_URL}/settings/umbra-systems-config`,
            updatedConfig
          );
          localStorage.setItem('umbraSystemsConfig', JSON.stringify(updatedConfig));

          onSuccess();

          setError('');
          alert('Umbra POS is now activated!');
        } catch (err) {
          setError(err.message);
        }
      } 
    } catch (err) {
      if (err.graphQLErrors.length > 0) {
        if (err.message.includes('authenticated')) {
          setError('Invalid API Key.');
        } else {
          setError('There was an error activating your POS device. Please try again.');
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={3}
      height={'100%'}
    >
      <Logo />
      <Typography variant="h4" sx={{ px: 5, mt: 10, mb: 5 }}>
        Umbra POS v{version}
      </Typography>
      {!started ? (
        <>
          <CardMedia
            component="img"
            image={illustrationPos}
            alt="login"
            sx={{ minWidth: '300px', maxWidth: '30%', margin: '0 auto' }}
          />
          {online ? (
            <>
              <Typography variant="subtitle2" sx={{ px: 5, mt: 10, mb: 5 }}>
                Set up your Umbra POS to start using the system.
              </Typography>

              <Button variant="contained" type="submit" onClick={() => setStarted(true)}>
                Get Started
              </Button>
            </>
          ) : (
            <>
              <Typography variant="subtitle2" sx={{ px: 5, mt: 10, mb: 5 }}>
                Please connect to the internet to continue the setup.
              </Typography>

              <Button variant="contained" type="submit" onClick={() => window.location.reload()}>
                Reload
              </Button>
            </>
          )}
        </>
      ) : (
        <Card sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 4 }} textAlign="center">
            Activate Demo POS
          </Typography>
          <Box mt={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Device ID"
                  name="deviceId"
                  type="text"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                  value={inputValues.deviceId}
                  onChange={(e) => setInputValues({ ...inputValues, deviceId: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Umbra Systems API Key"
                  name="apiKey"
                  type="text"
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true
                  }}
                  value={inputValues.apiKey}
                  onChange={(e) => setInputValues({ ...inputValues, apiKey: e.target.value })}
                  onKeyDown={handleKeyDown}
                />
              </Grid>
            </Grid>
          </Box>
          {error && (
            <Typography color="error" mt={1} variant="body2">
              {error}
            </Typography>
          )}
          <Box
            display="flex"
            direction="row"
            justifyContent="start"
            alignItems="center"
            mt={4}
            gap={1}
          >
            <Button
              size="large"
              variant="contained"
              type="submit"
              disabled={loading}
              onClick={handleConnect}
              fullWidth
            >
              Activate
            </Button>
            {loading && (
              <CircularProgress size={24} sx={{ display: loading ? 'flex' : 'none', ml: 2 }} />
            )}
          </Box>
        </Card>
      )}
    </Stack>
  );
}
