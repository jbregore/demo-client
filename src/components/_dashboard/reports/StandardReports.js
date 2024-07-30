import { useEffect, useState } from 'react';
import axios from 'axios';
import { capitalCase } from 'text-case';
// material
import { styled } from '@mui/material/styles';
import { Grid, Button, Typography } from '@mui/material';
import { SettingsCategoryEnum } from '../../../enum/Settings';
// components
import {
  InitialCashModal,
  CashTakeoutModal,
  XReadModal,
  ZReadModal,
  PreviewTransactions,
  SupervisorAuthorization
} from '.';
// functions
import addUserActivityLog from '../../../functions/common/addUserActivityLog';
import useNetwork from '../../../functions/common/useNetwork';
import { Endpoints } from '../../../enum/Endpoints';

// ----------------------------------------------------------------------

const CustomGridContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3)
}));

const CustomButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  }
}));

// ----------------------------------------------------------------------

export default function StandardReports() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { user } = JSON.parse(localStorage.getItem('userData'));
  const isCashier = user.role === 'cashier';
  const isSupervisor = user.role === 'supervisor';
  const initialCashDone = JSON.parse(localStorage.getItem('initialCash'));
  const isZRead = localStorage.getItem('isZRead') === 'true';
  const { online } = useNetwork();

  const [initialCashModal, setInitialCashModal] = useState(false);
  const [cashTakeoutModal, setCashTakeoutModal] = useState(false);
  const [xReadModal, setXReadModal] = useState(false);
  const [zReadModal, setZReadModal] = useState(false);
  const [previewTransaction, setPreviewTransaction] = useState(false);
  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');

  useEffect(() => {
    if (approveFunction === 'openDrawer') {
      const testMode = settings[SettingsCategoryEnum.UnitConfig].devMode;

      if (!testMode) {
        setOpenDrawer();
      }
    } else if (approveFunction === 'zRead') {
      setZReadModal(true);
    }

    if (approveFunction !== '') {
      setSupervisorAccessModal(false);
    }
    setApproveFunction('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  const handleSupervisorAccess = (toAccess) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
  };

  // open drawer
  const setOpenDrawer = async () => {
    try {
      const posDateData = localStorage.getItem('transactionDate').split(' ');
      const todayDate = new Date();
      const { user } = JSON.parse(localStorage.getItem('userData'));

      addUserActivityLog(
        user.firstname,
        user.lastname,
        user.employeeId,
        'Cashier Drawer',
        `${capitalCase(user.firstname)} ${capitalCase(
          user.lastname
        )} has opened the cashier drawer.`,
        'Open Drawer',
        `${posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
        online
      );

      await axios.post(`${Endpoints.REPORTS}/open-drawer`, {
        withCredentials: true
      });

      // eslint-disable-next-line no-empty
    } catch (err) { }

    return true;
  };

  return (
    <CustomGridContainer container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5">Standard Reports</Typography>
      </Grid>
      {(isCashier || isSupervisor) && !initialCashDone && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            disabled={isZRead || isSupervisor}
            fullWidth
            onClick={() => setInitialCashModal(true)}
          >
            Initial cash
          </CustomButton>
        </Grid>
      )}
      {isCashier || isSupervisor ? (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            disabled={isZRead || isSupervisor}
            fullWidth
            onClick={() => setCashTakeoutModal(true)}
          >
            Cash takeout
          </CustomButton>
        </Grid>
      ) : (
        ''
      )}
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          disabled={isZRead || isSupervisor}
          fullWidth
          onClick={() => setXReadModal(true)}
        >
          Cashier's Reading - X READ
        </CustomButton>
      </Grid>
      {user.role !== 'manager' && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              isCashier ? handleSupervisorAccess('openDrawer') : setOpenDrawer()
            }
          >
            Open drawer
          </CustomButton>
        </Grid>
      )}
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          disabled={isZRead || isSupervisor}
          fullWidth
          onClick={() =>
            isCashier ? handleSupervisorAccess('zRead') : setZReadModal(true)
          }
        >
          Terminal Reading - Z READ
        </CustomButton>
      </Grid>
      <InitialCashModal open={initialCashModal} setOpen={setInitialCashModal} user={user} report />
      <CashTakeoutModal open={cashTakeoutModal} setOpen={setCashTakeoutModal} />
      <XReadModal open={xReadModal} setOpen={setXReadModal} zRead={setZReadModal} />
      <ZReadModal open={zReadModal} setOpen={setZReadModal} />
      <PreviewTransactions open={previewTransaction} setOpen={setPreviewTransaction} />
      <SupervisorAuthorization
        open={supervisorAccessModal}
        setOpen={setSupervisorAccessModal}
        toAccessFunction={toAccessFunction}
        setApproveFunction={setApproveFunction}
      />
    </CustomGridContainer>
  );
}
