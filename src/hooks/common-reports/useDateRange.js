
const useDateRange = (queryData, setQueryData, filters, setFilters, setIsRefetching) => {
  const adjustDateFilter = (filterParams) => {
    // eslint-disable-next-line
    if (filterParams.from != filters.from) {
      if (filterParams.from > filterParams.to) {
        const fromDate = new Date(filterParams.from);
        fromDate.setDate(fromDate.getDate() + 1);

        const formattedDate = fromDate.toISOString().slice(0, 10);

        setQueryData({
          ...queryData,
          from: filterParams.from,
          to: formattedDate
        });

        setFilters({
          ...filters,
          from: filterParams.from,
          to: formattedDate
        });

        setIsRefetching(true);
        return;
      }
    }

    // eslint-disable-next-line
    if (filterParams.to != filters.to) {
      if (filterParams.to < filterParams.from) {
        const toDate = new Date(filterParams.to);
        toDate.setDate(toDate.getDate() - 1);

        const formattedDate = toDate.toISOString().slice(0, 10);

        setQueryData({
          ...queryData,
          to: filterParams.to,
          from: formattedDate
        });

        setFilters({
          ...filters,
          to: filterParams.to,
          from: formattedDate
        });

        setIsRefetching(true);
        return;
      }
    }

    setIsRefetching(true);
    setQueryData({
      page: '',
      pageSize: '',
      ...filterParams
    });
  };

  return { adjustDateFilter };
};

export default useDateRange;
