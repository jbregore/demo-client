const initialState = {
  showPassword: false
};

export function LoginReducer(state = initialState, action) {
  switch (action.type) {
    case 'setShowPassword':
      return {
        ...state,
        showPassword: action.showPassword
      };
    default:
      return state;
  }
}
