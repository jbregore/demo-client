const initialState = {
  isError: false,
  errorMessage: ''
};

export function CommonReducer(state = initialState, action) {
  switch (action.type) {
    case 'setIsError':
      return {
        ...state,
        isError: action.isError
      };
    case 'setErrorMessage':
      return {
        ...state,
        errorMessage: action.errorMessage
      };
    default:
      return state;
  }
}
