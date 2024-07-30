import { createStore } from 'redux';
import { LoginReducer } from './reducer';

export const loginStore = createStore(LoginReducer);
