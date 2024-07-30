import { createStore } from 'redux';
import { CommonReducer } from './reducer';

export const commonStore = createStore(CommonReducer);
