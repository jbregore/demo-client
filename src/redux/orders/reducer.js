const sessionCat = sessionStorage.getItem('localCategory');

const initialState = {
  category: (sessionCat) ? sessionCat : -1,
  products: [],
  isLoadingProducts: false,
  searchParams: '',
};

export function OrdersReducer(state = initialState, action) {
  switch (action.type) {
    case 'setCategory':
      sessionStorage.setItem("localCategory", action.category);
      return {
        ...state,
        category: action.category,
      };
    case 'setProducts':
      return {
        ...state,
        products: action.products,
        isLoadingProducts: false,
      };
    case 'setIsLoadingProducts':
      return {
        ...state,
        isLoadingProducts: action.isLoadingProducts
      };
    case 'setSearchParams': {
      return {
        ...state,
        searchParams: action.searchParams
      };
    }
    // case 'setSearchProductsLength':
    //   return {
    //     ...state,
    //     searchProductsLength: action.searchProductsLength
    //   };
    default:
      return state;
  }
}
