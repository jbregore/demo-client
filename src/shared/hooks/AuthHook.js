import { useState, useCallback, useEffect } from 'react';
// utils
import { capitalCase } from 'text-case';
// functions
import addUserActivityLog from '../../functions/common/addUserActivityLog';
import useNetwork from '../../functions/common/useNetwork';
import moment from 'moment';
import umbraSystemsHelper from '../../graphql/umbra-systems-helper';
import { isProduction } from '../../utils/isProduction';

let logoutTimer;

export const useAuth = () => {
  const [user, setUser] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const { online } = useNetwork();

  const login = useCallback(async (user, initialCash, transactionDate, expirationDate) => {
    setUser(user);
    const tokenExpirationDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 20);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        user,
        expiration: expirationDate || tokenExpirationDate.toISOString()
      })
    );

    // set initialCash in storage
    localStorage.setItem('initialCash', initialCash);

    // set transaction date
    localStorage.setItem('transactionDate', transactionDate);
    // set system date
    const systemDate = moment().format('YYYY-MM-DD HH:mm:ss');
    localStorage.setItem('systemDate', systemDate);
    // set popup warning
    const outOfSync =
      moment(systemDate).format('YYYY-MM-DD') !== moment(transactionDate).format('YYYY-MM-DD');
    localStorage.setItem('outOfSyncWarning', outOfSync);

    const devOptions = await JSON.parse(localStorage.getItem("devOptions") ?? '{}');
    if (isProduction() || devOptions?.checkKey) {
      if (online) {
        umbraSystemsHelper.uploadQueue();
      }

      const { status } = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
      if (online && status === 'enabled') {
        umbraSystemsHelper.updatePosDevice({
          isOnline: true,
          posDate: moment(transactionDate).format('YYYY-MM-DD')
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(async () => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();

    addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'System',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has logged out to the system.`,
      'Logged Out',
      `${posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
      online
    );

    setUser(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('initialCash');
    localStorage.removeItem('transactionDate');
    localStorage.removeItem('isZRead');
    localStorage.removeItem('isXRead');

    const devOptions = await JSON.parse(localStorage.getItem("devOptions") ?? '{}');
    if (isProduction() || devOptions?.checkKey) {
      const { status } = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
      if (online && status === 'enabled') {
        umbraSystemsHelper.updatePosDevice({
          isOnline: false,
          posDate: posDateData[0]
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [user, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    const initialCash = JSON.parse(localStorage.getItem('initialCash'));
    const transactionDate = localStorage.getItem('transactionDate');

    if (storedData && storedData.user && new Date(storedData.expiration) > new Date()) {
      login(storedData.user, initialCash, transactionDate, new Date(storedData.expiration));
    }
  }, [login]);

  return { login, logout, user };
};
