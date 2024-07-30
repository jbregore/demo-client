import { useContext } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import Login from './pages/Login';
import DashboardApp from './pages/DashboardApp';
// import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Transactions from './pages/Transactions';
import PromoCodes from './pages/PromoCodes';
import User from './pages/User';
import Activity from './pages/Activity';
import NotFound from './pages/Page404';
import Reports from './pages/Reports';
import Receipt from './pages/Receipt';
import Settings from './pages/Settings';
import ActiveCashiers from './pages/ActiveCashiers';
import Scripts from './pages/Scripts';
import Info from './pages/Info';
import DisabledTransactions from './pages/DisabledTransactions';
// context
import { AuthContext } from './shared/context/AuthContext';
import moment from 'moment';
import { SettingsCategoryEnum } from './enum/Settings';
import DemoOrganizations from './pages/DemoOrganizations';

// ----------------------------------------------------------------------

export default function Router() {
  const authContext = useContext(AuthContext);
  const isZRead = localStorage.getItem('isZRead');
  const isSupervisor = authContext.user?.role === 'supervisor';
  const settings = JSON.parse(localStorage.getItem('settings'))
  const posDate = localStorage.getItem('transactionDate');
  const sysDate = localStorage.getItem('systemDate');

  const disabledTransactions = (() => {
    if (!authContext.isLoggedIn) return false
    if (settings[SettingsCategoryEnum.UnitConfig]?.mallAccr === 'robinson' && authContext.user.role === 'cashier') {
      if (posDate.split(' ')[0] === sysDate.split(' ')[0] && moment().hour() < 9) return true
      else return false
    }

    return false
  })()

  return useRoutes([
    {
      path: '/app',
      element: authContext.isLoggedIn ? (disabledTransactions ? <DisabledTransactions /> : <DashboardLayout />) : <Navigate to="/login" />,
      children: [
        { element: <Navigate to="/app/orders" replace /> },
        {
          path: 'orders',
          element: !isZRead && !isSupervisor ? (
            authContext.user?.username === 'umbra_admin' ||
              authContext.user?.username === 'sunnies_tech' ? (
              <Navigate to="/app/settings" replace />
            ) : (
              <Orders />
            )
          ) : (
            <Navigate to="/app/reports" replace />
          )
        },
        {
          path: 'transactions',
          element: !isZRead ? <Transactions /> : <Navigate to="/app/reports" replace />
        },
        { path: 'dashboard', element: <DashboardApp /> },
        { path: 'employees', element: <User /> },
        { path: 'promo-codes', element: <PromoCodes /> },
        // { path: 'inventory', element: <Inventory /> },
        { path: 'activity', element: <Activity /> },
        { path: 'reports', element: <Reports /> },
        { path: 'receipt', element: <Receipt /> },
        { path: 'settings', element: <Settings /> },
        { path: 'cashier', element: <ActiveCashiers /> },
        {
          path: 'scripts',
          element: ['it_admin'].includes(authContext.user?.role) ? (
            <Scripts />
          ) : (
            <Navigate to="/app/orders" replace />
          )
        },
        {
          path: 'info',
          element: ['manager', 'it_admin'].includes(authContext.user?.role) ? (
            <Info />
          ) : (
            <Navigate to="/app/orders" replace />
          )
        },
        {
          path: 'organization',
          element: ['it_admin'].includes(authContext.user?.role) ? (
            <DemoOrganizations />
          ) : (
            <Navigate to="/app/orders" replace />
          )
        },
      ]
    },
    {
      path: '/',
      element: authContext.isLoggedIn ? <Navigate to="/app/orders" /> : <LogoOnlyLayout />,
      children: [
        {
          path: 'login',
          element: <Login />
        },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/app/orders" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },
    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
