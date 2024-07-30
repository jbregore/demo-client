import { useState } from "react";
import { useErrorHandler } from "./useErrorHandler";

const useFormErrors = () => {
  const { errorHandler } = useErrorHandler();
  const [mainError, setMainError] = useState("");
  const [formErrors, setFormErrors] = useState([]);

  const handleFormErrors = (fieldname) => {
    const error = formErrors.errors.find(
      (error) => error.param === fieldname
    );

    if (error) {
      return error.msg;
    }

    return "";
  };

  return {
    formErrors,
    setFormErrors,
    handleFormErrors,
    errorHandler,
    mainError,
    setMainError,
  };
};

export default useFormErrors;
