import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// material
import { Container, Box, Typography, Button } from '@mui/material';
// context
import { AuthContext } from '../shared/context/AuthContext';
// components
import Page from './Page';

// ----------------------------------------------------------------------

export default function Forbidden() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClick = () => {
    const path =
      auth.user.role.toLowerCase() === 'admin' || auth.user.role.toLowerCase() === 'manager' ? 'transactions' : 'orders';
    navigate(`/app/${path}`, { replace: true });
  };

  return (
    <Page title="Forbidden">
      <Container maxWidth={false} sx={{ paddingRight: '0 !important' }}>
        <Box sx={{ pb: 5 }}>
          <Typography sx={{ fontSize: 18 }}>
            You do not have permission to access this page.
          </Typography>
          <Button
            sx={{ marginTop: '15px' }}
            color="primary"
            variant="contained"
            onClick={handleClick}
          >
            {`Go to ${auth.user.role.toLowerCase() === 'admin' || auth.user.role.toLowerCase() === 'manager'
                ? 'transactions'
                : 'dashboard'
              }`}
          </Button>
        </Box>
      </Container>
    </Page>
  );
}
