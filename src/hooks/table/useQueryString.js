const useQueryString = () => {
  const objectToString = (obj) => {
    const keyValuePairs = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key] !== '') { 
        keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
      }
    }
    return keyValuePairs.join('&');
  }

  return { objectToString };
};

export default useQueryString;
