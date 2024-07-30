import { createStore } from 'redux';
import { OrdersReducer } from './reducer';

export const ordersStore = createStore(OrdersReducer);
