import { createStore } from 'redux';
import { CartReducer } from './reducer';


export const store = createStore(CartReducer);
