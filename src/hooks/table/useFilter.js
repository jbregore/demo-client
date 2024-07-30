
const useFilter = (filters, setFilters, setPage, initialFilters) => {

  const handleChangeFilter = (name, value) => {
    if (name === "all" && value === "reset") {
      const allFilters = {};

      for (const key in initialFilters) {
        if (key !== "sortBy" && key !== "sortOrder") {
          allFilters[key] = "All";
        } else {
          allFilters[key] = initialFilters[key];
        }
      }

      setFilters(allFilters);

      setPage(0);
      return;
    }

    setFilters({
      ...filters,
      [name]: value,
    });

    setPage(0);
  };

  const handleChangeSort = (sortObject) => {
    setFilters({
      ...filters,
      sortBy: sortObject.sortBy,
      sortOrder: sortObject.sortOrder,
    });
    setPage(0);
  };

  return { handleChangeFilter, handleChangeSort };
};

export default useFilter;
