import { useState } from "react";

const usePaginate = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(5);

  const handlePaginationChange = (current) => {
    // eslint-disable-next-line
    if (page == current) {
    } else {
      setPage(current);
    }
  };

  const onLimitChange = (newLimit) => {
    // eslint-disable-next-line
    if (limit == newLimit) {
    } else {
      setLimit(newLimit);
      setPage(0);
    }
  };

  return {
    handlePaginationChange,
    page,
    setPage,
    limit,
    onLimitChange,
  };
};

export default usePaginate;
