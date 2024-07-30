import PropTypes from 'prop-types';
// material
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string
};

export default function SearchNotFound({ searchQuery, ...other }) {
  return (
    <Paper {...other}>
      <Typography gutterBottom align="center" variant="subtitle1">
        {searchQuery === '' ? 'There is no data available.' : 'Not found'}
      </Typography>
      <Typography variant="body2" align="center">
        {searchQuery !== ''
          ? `No results found for "${searchQuery}". Try checking for typos or using complete words.`
          : 'No data to display.'}
      </Typography>
    </Paper>
  );
}
