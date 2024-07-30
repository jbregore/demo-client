import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@mui/material';
import React from 'react';
import { visuallyHidden } from '@mui/utils';



const TableV2 = (props) => {
  //table
  const {
    data,
    columns,
    isLoading,
    handleChangeSort,
    setSortState,
    withVerticalScroll = false,
    verticalScrollWidth,
    extraTableRows
  } = props;

  const GetColumnCell = (item, col) => {
    if (col.column) {
      return item[col.column];
    }
    return col?.render(item);
  };

  return (
    <TableContainer style={{ minWidth: 800, overFlowX: 'auto' }}>
      <Table style={{ width: withVerticalScroll ? verticalScrollWidth : '100%' }}>
        <TableHead>
          <TableRow>
            {columns.map((column, index) => (
              <React.Fragment key={index}>
                {column.enableSort ? (
                  <TableCell
                    key={index}
                    align={column.alignment ? column.alignment : 'left'}
                    sortDirection={column.sortOrder}
                  >
                    <TableSortLabel
                      hideSortIcon
                      active={true}
                      direction={column.sortOrder}
                      onClick={() => {
                        if (column.sortOrder === 'asc') {
                          handleChangeSort({
                            sortBy: column.sortBy,
                            sortOrder: 'desc'
                          });
                          setSortState((prevState) => ({
                            ...prevState,
                            [column.sortBy]: 'desc'
                          }));
                        } else {
                          handleChangeSort({
                            sortBy: column.sortBy,
                            sortOrder: 'asc'
                          });
                          setSortState((prevState) => ({
                            ...prevState,
                            [column.sortBy]: 'asc'
                          }));
                        }
                      }}
                    >
                      {column.label}

                      <Box sx={{ ...visuallyHidden }}>
                        {column.sortOrder === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    </TableSortLabel>
                  </TableCell>
                ) : (
                  <TableCell align={column.alignment ? column.alignment : 'left'} key={index}>
                    {column.label}
                  </TableCell>
                )}
              </React.Fragment>
            ))}
          </TableRow>
          
        </TableHead>
        <TableBody>
          {isLoading ? (
            <>
              <TableRow>
                <TableCell align="center" colSpan={columns.length} sx={{ py: 3 }}>
                  <CircularProgress />
                  <Typography variant="body2">Loading . . .</Typography>
                </TableCell>
              </TableRow>
            </>
          ) : (
            <>
              {data && data.length ? (
                <>
                  {data?.map((row, index) => (
                    <TableRow key={index}>
                      {columns?.map((column, index) => (
                        <TableCell key={index} align={column.alignment ? column.alignment : 'left'}>
                          {GetColumnCell(row, column)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={columns.length} sx={{ py: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      There is no data available.
                    </Typography>
                    <Typography variant="body2">No data to display.</Typography>
                  </TableCell>
                </TableRow>
              )}
              {extraTableRows}
            </>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableV2;
