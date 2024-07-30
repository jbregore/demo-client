import { Box, Card, Stack, TablePagination } from '@mui/material';
import React, { useEffect, useState } from 'react';
import TableV2 from './TableV2';
import usePaginate from '../../hooks/table/usePaginate';
import TableSearchV2 from './TableSearchV2';
import useSearch from '../../hooks/table/useSearch';
import useFilter from '../../hooks/table/useFilter';
import TableFilterV2 from './TableFilterV2';

const BaseTableV2 = (props) => {
  //table
  const {
    pageChangeCb,
    rowsChangeCb,
    data,
    columns,
    isLoading,
    setSortState,
    withVerticalScroll,
    verticalScrollWidth,
    extraTableRows
  } = props;
  const [tableLoading, setTableLoading] = useState(isLoading);

  //pagination
  const { total, limitChoices } = props;

  //search
  const { withSearch, searchLabel, onSearchCb, onClearSearch } = props;

  //filters
  const { withFilters, initialFilters, filterOptions, filters, setFilters } = props;

  //sort
  const { onSortCb } = props;

  //filter
  const { onFilterCb, onResetFilterCb } = props;

  //pagination hook
  const { page, setPage, handlePaginationChange, limit, onLimitChange } = usePaginate();

  //search hook
  const { keyword, handleChangeSearch, handleCloseSearch } = useSearch(setPage);

  //filter hook
  const { handleChangeFilter, handleChangeSort } = useFilter(
    filters,
    setFilters,
    setPage,
    initialFilters
  );

  useEffect(() => {
    const timerId = setTimeout(() => {
      if (keyword.trim() !== '') {
        onSearchCb(keyword) 
        setTableLoading(false);
      }
    }, 1500);

    return () => clearTimeout(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  useEffect(() => {
    setTableLoading(isLoading)
  }, [isLoading])

  return (
    <Card sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Stack
          direction="row"
          alignItems="flex-end"
          justifyContent={withSearch && withFilters ? 'space-between' : 'flex-end'}
        >
          {withSearch && (
            <TableSearchV2
              searchLabel={searchLabel}
              value={keyword}
              onChange={(event) => {
                handleChangeSearch(event);
                if (event.target.value === '') {
                  onClearSearch();
                }
                setTableLoading(true);
              }}
              onSearch={() => {
                // handleSearch();
                // if (event.key === 'Enter' || event.type === 'click') {
                // onSearchCb(keyword);
                // }
              }}
              onCloseSearch={handleCloseSearch}
            />
          )}

          {withFilters && (
            <TableFilterV2
              filters={filterOptions}
              onChange={(name, value) => {
                handleChangeFilter(name, value);
                if (name === 'all' && value === 'reset') {
                  const allFilters = {};

                  for (const key in initialFilters) {
                    if (key !== 'sortBy' && key !== 'sortOrder') {
                      allFilters[key] = 'All';
                    } else {
                      allFilters[key] = initialFilters[key];
                    }
                  }

                  setFilters(allFilters);
                  onFilterCb({
                    ...allFilters
                  });
                  onResetFilterCb();
                  return;
                }

                onFilterCb({
                  ...filters,
                  [name]: value
                });
              }}
            />
          )}
        </Stack>
      </Box>

      <TableV2
        withVerticalScroll={withVerticalScroll}
        verticalScrollWidth={verticalScrollWidth}
        data={data}
        columns={columns}
        isLoading={tableLoading}
        setSortState={setSortState}
        handleChangeSort={(sortObject) => {
          handleChangeSort(sortObject);
          onSortCb(sortObject);
        }}
        extraTableRows={extraTableRows}
      />

      <TablePagination
        rowsPerPageOptions={limitChoices}
        component="div"
        count={total || 0}
        rowsPerPage={limit}
        page={page}
        onPageChange={(event, page) => {
          handlePaginationChange(page);
          pageChangeCb(page);
        }}
        onRowsPerPageChange={(event) => {
          onLimitChange(event.target.value);
          rowsChangeCb(event.target.value);
        }}
      />
    </Card>
  );
};

export default BaseTableV2;
