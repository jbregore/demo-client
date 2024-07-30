import axios from 'axios';
import pkg from '../../../package.json';

const getPosInfo = async () => {
    const hardwareIds = (await axios.get(`${process.env.REACT_APP_API_URL}/device/hardware-ids`)).data
      .hardwareIds;
  const posConfig = JSON.stringify(JSON.parse(localStorage.getItem('settings')));
  const posVersion = (await axios.get(`${process.env.REACT_APP_API_URL}/electron/version`)).data
    .version;
  const posVariant = pkg.build.productName;
  const isOnline = true;
  const lastOnline = new Date();
  const posDate = localStorage.getItem('transactionDate');

  return { hardwareIds, posConfig, posVersion, posVariant, isOnline, lastOnline, posDate };
};

export default getPosInfo;
