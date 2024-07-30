import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from '../../reports/modal/styles/commonModalStyles';

// ----------------------------------------------------------------------

const posTables = [
  {
    id: 'discountLogs',
    table: '_pos_discount_logs',
    primaryKey: 'discount_log_id'
  },
  {
    id: 'loginLogs',
    table: '_pos_login_logs',
    primaryKey: 'login_id'
  },
  {
    id: 'loyaltyPoints',
    table: '_pos_loyalty_points',
    primaryKey: 'loyalty_points_id'
  },
  {
    id: 'paymentLogs',
    table: '_pos_payment_logs',
    primaryKey: 'payment_log_id'
  },
  {
    id: 'reportsCash',
    table: '_pos_reports_cash',
    primaryKey: 'logs_id'
  },
  {
    id: 'reports_read_logs',
    table: '_pos_reports_read_logs',
    primaryKey: 'report_read_log_id'
  },
  {
    id: 'resetCountLogs',
    table: '_pos_reset_count_logs',
    primaryKey: 'reset_count_log_id'
  },
  {
    id: 'scPwdReports',
    table: '_pos_sc_pwd_reports',
    primaryKey: 'sc_pwd_report_id'
  },
  {
    id: 'specs',
    table: '_pos_specs',
    primaryKey: 'orders_specs_id'
  },
  {
    id: 'specsPackages',
    table: '_pos_specs_packages',
    primaryKey: 'specs_package_id'
  },
  {
    id: 'sunniessCl',
    table: '_pos_sunniess_cl',
    primaryKey: 'sunniess_cl_id'
  },
  {
    id: 'sunniessSl',
    table: '_pos_sunniess_sl',
    primaryKey: 'sunniess_sl_id'
  },
  {
    id: 'transactions',
    table: '_pos_transactions',
    primaryKey: 'txn_number'
  },
  {
    id: 'txnAmounts',
    table: '_pos_txn_amounts',
    primaryKey: 'txn_number'
  },
  {
    id: 'users',
    table: '_pos_users',
    primaryKey: 'employee_id'
  },
  {
    id: 'usersActivityLogs',
    table: '_pos_users_activity_logs',
    primaryKey: 'user_activity_log_id'
  }
];

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

UpdateBackupDatabase.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function UpdateBackupDatabase({ open, setOpen }) {
  const [inputValues, setInputValues] = useState({
    date: '',
    table: '',
    primaryKey: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setInputValues({
      date: '',
      table: '',
      primaryKey: ''
    });
    setIsLoading(false);
    setStatus('');
    setStatusMessage('');
  }, [open]);

  const handleUpdateBackupDatabase = async () => {
    setIsLoading(true);

    if (inputValues.date === '' || inputValues.table === '') {
      setIsLoading(false);

      return false;
    }

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/settings/update-backup-database?date=${inputValues.date}&table=${inputValues.table}&primaryKey=${inputValues.primaryKey}`
      );

      if (res.status === 200) {
        setTimeout(() => {
          setIsLoading(false);
          setStatus('success');
          setStatusMessage('Backup database table successfully updated!');
        }, 5000);
      } else {
        throw res;
      }

      // eslint-disable-next-line no-empty
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setStatus('error');

        if (err.status === 204) {
          setStatusMessage('There is no available data.');
        } else {
          setStatusMessage('Something went wrong, please try again.');
        }
      }, 5000);
    }
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Update Backup Database</Typography>
        <Box mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                id="date"
                label="Date"
                name="date"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                value={inputValues.date}
                onChange={(e) => setInputValues({ ...inputValues, date: e.target.value })}
              />
            </Grid>
          </Grid>
          <Grid item xs={12} mt={2}>
            <TextField
              fullWidth
              select
              label="Select POS Table"
              value={
                inputValues.table !== '' ? `${inputValues.table} ${inputValues.primaryKey}` : ''
              }
              onChange={(e) =>
                setInputValues({
                  ...inputValues,
                  table: e.target.value.split(' ')[0],
                  primaryKey: e.target.value.split(' ')[1]
                })
              }
            >
              {posTables.map((node) => (
                <MenuItem key={node.id} value={`${node.table} ${node.primaryKey}`}>
                  {node.table}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Box>
        {status !== '' && (
          <Typography textAlign="center" color={status === 'success' ? 'primary' : status} mt={1}>
            {statusMessage}
          </Typography>
        )}
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <Button size="large" variant="outlined" type="submit" onClick={() => setOpen(false)}>
            Close
          </Button>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleUpdateBackupDatabase}
          >
            Update Backup
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
