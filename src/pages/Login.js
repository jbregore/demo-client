import * as React from 'react';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { Card, Stack, Container, Typography, CardMedia } from '@mui/material';
// layouts
import AuthLayout from '../layouts/AuthLayout';
// components
import Page from '../components/Page';
import { MHidden } from '../components/@material-extend';
import { LoginForm } from '../components/authentication/login';
import { illustrationPos } from '../images';

// ----------------------------------------------------------------------

const RootStyle = styled(Page)(({ theme }) => ({
  height: '100%',

  [theme.breakpoints.up('md')]: {
    display: 'flex'
  }
}));

const SectionStyle = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 464,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  margin: theme.spacing(2, 0, 2, 2)
}));

const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(12, 0)
}));

// ----------------------------------------------------------------------

export default function Login() {
  const [birVersion, setBirVersion] = React.useState(null);

  React.useEffect(() => {
    const getBirVersion = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/electron/version`);

        const version = res.data.birVersion;
        setBirVersion(version);
      } catch (err) { }
    };

    getBirVersion();
  }, []);

  React.useEffect(() => {
    const getCompanySettings = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/settings`);
        const settingsData = res.data.data;

        const formattedSettings = {
          id: settingsData._id,
          ...settingsData
        };

        delete formattedSettings._id;
        delete formattedSettings.updatedAt;
        delete formattedSettings.createdAt;
        delete formattedSettings.__v;

        localStorage.setItem(
          'settings',
          JSON.stringify({
            id: settingsData._id,
            ...formattedSettings
          })
        );

        // eslint-disable-next-line no-empty
      } catch (err) { }
    };

    getCompanySettings();
  }, []);

  return (
    <RootStyle title="Login | Umbra POS">
      <AuthLayout />
      <MHidden width="mdDown">
        <SectionStyle>
          <Typography variant="h3" sx={{ px: 5, mt: 10, mb: 5 }}>
            {birVersion && `Umbra POS v${birVersion}`}
          </Typography>
          <CardMedia
            component="img"
            image={illustrationPos}
            alt="login"
            sx={{ maxWidth: '80%', margin: '0 auto' }}
          />
        </SectionStyle>
      </MHidden>
      <Container maxWidth="sm">
        <ContentStyle>
          <Stack sx={{ mb: 5 }}>
            <Typography variant="h4" gutterBottom>
              Sign in
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>Enter your details below.</Typography>
          </Stack>
          <LoginForm />
        </ContentStyle>
      </Container>
    </RootStyle>
  );
}
