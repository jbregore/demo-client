import { CardMedia, Stack, Typography } from '@mui/material';
import Logo from '../Logo';
import { illustrationPos } from '../../images';

export default function IntegrationPrompt({ version, message }) {
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
      <CardMedia
        component="img"
        image={illustrationPos}
        alt="login"
        sx={{ minWidth: '300px', maxWidth: '30%', margin: '0 auto' }}
      />
      <Typography variant="subtitle2" sx={{ px: 5, mt: 10, mb: 5 }}>
        {message}
      </Typography>
    </Stack>
  );
}
