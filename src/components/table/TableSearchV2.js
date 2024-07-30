import { Box, InputAdornment, OutlinedInput } from '@mui/material';
import React from 'react';
import { Icon } from '@iconify/react';
import searchFill from '@iconify/icons-eva/search-fill';
import styled from '@emotion/styled';

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 320,
  paddingTop: 3,
  paddingBottom: 3,
  '&.Mui-focused': { boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`
  }
}));

const TableSearchV2 = (props) => {
  const { onChange, value, searchLabel } = props;

  return (
    <SearchStyle
      size="small"
      value={value}
      onChange={onChange}
      // onKeyDown={onSearch}
      placeholder={searchLabel || 'Search'}
      startAdornment={
        <InputAdornment position="start">
          <Box component={Icon} icon={searchFill} sx={{ color: 'text.disabled' }} />
        </InputAdornment>
      }
      // endAdornment={
      //   <InputAdornment position="end">
      //     <StyledButton size="small" variant="outlined" color="secondary" onClick={onSearch}>
      //       Search
      //     </StyledButton>
      //   </InputAdornment>
      // }
    />
  );
};

export default TableSearchV2;
