const initialState = {
  refreshProducts: false
};

export function DashboardReducer(state = initialState, action) {
  switch (action.type) {
    case 'setRefreshProducts':
      return {
        ...state,
        refreshProducts: action.refreshProducts
      };
    case 'setRefreshCategories':
      return {
        ...state,
        refreshCategories: action.refreshCategories
      };
    default:
      return state;
  }
}
