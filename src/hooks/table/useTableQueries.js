import { useState } from 'react';

const useTableQueries = (initialQueries) => {
  const [queryData, setQueryData] = useState(initialQueries);

  const clearQueries = () => {
    const allQueries = {};

    for (const key in initialQueries) {
      allQueries[key] = '';
    }

    setQueryData(allQueries);
  };

  return {
    queryData,
    setQueryData,
    clearQueries
  };
};

export default useTableQueries;
