import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
// icons
import CircleIcon from '@mui/icons-material/Circle';
// utils
import { fDateShort } from '../../../utils/formatTime';
import useNetwork from '../../../functions/common/useNetwork';

// ----------------------------------------------------------------------

const Root = styled(Stack)(({ theme }) => ({
  marginTop: 5,

  p: {
    fontSize: 13,
    color: theme.palette.grey[600],

    span: {
      fontWeight: 600
    }
  }
}));

// ----------------------------------------------------------------------

TransactionDateLabel.propTypes = {
  user: PropTypes.object,
  date: PropTypes.string.isRequired
};

// ----------------------------------------------------------------------

export default function TransactionDateLabel({ user, date }) {
  const networkState = useNetwork();
  const { online } = networkState;

  return (
    <Root direction="row" alignItems="center" justifyContent="space-between">
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <CircleIcon sx={{ fontSize: 15, color: online ? 'green' : 'red' }} />
        <Typography variant="body2">
          <span>{online ? 'ONLINE: ' : 'OFFLINE: '}</span>
          {`${user?.firstname} ${user?.lastname}`}
        </Typography>
      </Box>
      <Typography variant="body2">
        <span>DATE:</span> {fDateShort(date)}
      </Typography>
    </Root>
  );
}
