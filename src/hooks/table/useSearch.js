import { useState } from 'react';

const useSearch = (setPageParam) => {
  const [keyword, setKeyword] = useState('');

  const clear = () => {
    setKeyword('');
    setPageParam(0);
  };

  const handleSearch = () => {
    // if (event.key === "Enter" || event.type === "click") {
    setKeyword(keyword);
    setPageParam(0);
    // }
  };

  const handleChangeSearch = (event) => {
    const value = event.target.value;
    if (value === '') {
      clear();
      return;
    }
    setKeyword(event.target.value);
  };

  const handleCloseSearch = () => {
    clear();
  };

  return {
    keyword,
    setKeyword,
    handleSearch,
    handleChangeSearch,
    handleCloseSearch
  };
};

export default useSearch;
