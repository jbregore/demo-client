import axios from 'axios';
import uniqid from 'uniqid';
import { Endpoints } from '../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../enum/Settings';

const addUserActivityLog = async (
  firstname,
  lastname,
  employeeId,
  activity,
  description,
  action,
  activityDate,
  online = false
) => {
  const settings = JSON.parse(localStorage.getItem('settings'));

  try {
    const apiData = {
      userActivityLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
      firstname,
      lastname,
      employeeId,
      activity,
      description,
      action,
      storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
      activityDate
    };

    await axios.post(Endpoints.ACTIVITY, apiData, {
      withCredentials: true
    });

    // eslint-disable-next-line no-empty
  } catch (err) { 
    console.log(err)
  }
};

export default addUserActivityLog;
