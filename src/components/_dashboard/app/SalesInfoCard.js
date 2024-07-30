import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

const RootStyle = styled(Card)(({ theme }) => ({
  boxShadow: 'none',
  textAlign: 'center',
  padding: theme.spacing(5, 0),
  color: theme.palette.primary.darker,
  backgroundColor: theme.palette.primary.lighter
}));

// ----------------------------------------------------------------------

SalesInfoCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  type: PropTypes.string
};

export default function SalesInfoCard({ label, value, type }) {
  return (
    <RootStyle>
      <Typography variant="h3">
        {fCurrency(
          `${type === 'amount' ? 'P' : ''}`,
          type === 'amount' ? Number(value).toFixed(2) : value
        )}
      </Typography>
      <Typography variant="subtitle2" sx={{ opacity: 0.72 }}>
        {label}
      </Typography>
    </RootStyle>
  );
}
