import { createStore } from 'redux';
import { DashboardReducer } from './reducer';

export const dashboardStore = createStore(DashboardReducer);
