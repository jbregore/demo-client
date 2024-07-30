export const useErrorHandler = () => {
    function errorHandler(err) {
      let errorMessage = null;
  
      if (err.response) {
        if (err.response.status === 422 && err.response.data.errors) {
          errorMessage =
            err.response.data?.message ??
            err.response.message ??
            err.response.statusText;
  
          return err.response.data;
        } else if (err.response.status === 401) {
          return err.response.data.message;
        }
      } else if (err.request) {
        errorMessage = "Something went wrong!";
        return "Something went wrong!";
      } else {
        // eslint-disable-next-line
        errorMessage = err.message;
        return err.message;
      }
    }
  
    return {
      errorHandler,
    };
  };
  