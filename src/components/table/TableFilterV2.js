import React, { useState } from 'react';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import { FilterAltOutlined, KeyboardArrowDownOutlined } from '@mui/icons-material';
import styled from '@emotion/styled';

const StyledButton = styled(Button)(({ theme }) => ({
  borderWidth: `1px !important`,
  borderColor: `${theme.palette.grey[500_32]} !important`,
  color: `${theme.palette.grey[600]} !important`,
  paddingTop: 8,
  paddingBottom: 8
}));

const TableFilterV2 = (props) => {
  const { filters, onChange } = props;

  const [filterOpen, setFilterOpen] = useState(false);

  const [error, setError] = useState({})

  return (
    <Box>
      <Box sx={{ position: 'relative', display: 'inline-block' }}>
        <StyledButton
          variant="outlined"
          color="secondary"
          startIcon={<FilterAltOutlined />}
          size="medium"
          endIcon={<KeyboardArrowDownOutlined />}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          Filters
        </StyledButton>
        {filterOpen && (
          <Paper
            elevation={8}
            sx={{
              padding: 2,
              position: 'absolute',
              zIndex: 20,
              top: '100%',
              right: 0,
              width: '385px'
            }}
          >
            <Box>
              {filters.map((filter, i) => {
                return filter.type === 'select' ? (
                  <Box sx={{ marginBottom: 3 }} key={i}>
                    <TextField
                      id={filter.name}
                      size="small"
                      placeholder={filter.placeholder}
                      name={filter.name}
                      label={filter.label}
                      variant="outlined"
                      select
                      fullWidth
                      value={filter.value}
                      onChange={(event) => {
                        onChange(filter.name, event.target.value);
                      }}
                    >
                      {filter.options.map((option, index) => (
                        <MenuItem value={option.value} key={index}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                ) : (
                  <Box sx={{ marginBottom: 3 }} key={i}>
                    <TextField
                      type="date"
                      size="small"
                      label={filter.label}
                      InputLabelProps={{
                        shrink: true
                      }}
                      helperText={error.key === i && error.message !== "" && 'Invalid Date'}
                      error={error.key === i && error.message !== ""}
                      fullWidth
                      value={filter.value}
                      onChange={(event) => {
                        try{
                            onChange(filter.name, event.target.value);
                            setError({
                              key: i,
                              message: ""
                            })
                        }catch(err){
                          setError({
                            key: i,
                            message: 'Invalid Date'
                          })
                          console.log("err ", err)
                        }
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
            <Typography
              color="#555"
              variant="subtitle2"
              onClick={() => onChange('all', 'reset')}
              align="right"
              sx={{
                '&:hover': { cursor: 'pointer', textDecoration: 'underline #555' }
              }}
            >
              Reset Filters
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default TableFilterV2;
