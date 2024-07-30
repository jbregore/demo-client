import { useEffect, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Grid, Button, Typography } from '@mui/material';
// components
import { SupervisorAuthorization, GenerateSlcl } from '.';

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

export default function CustomReports() {
  const [generateSlclModal, setGenerateSlclModal] = useState(false);
  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');

  const { user } =
    localStorage.getItem('userData') !== null && JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    // eslint-disable-next-line default-case
    switch (approveFunction) {
      case 'generateSlcl':
        setGenerateSlclModal(true);
        break;
    }

    if (approveFunction !== '') {
      setSupervisorAccessModal(false);
    }
    setApproveFunction('');
  }, [approveFunction]);

  const handleSupervisorAccess = (toAccess) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
  };

  return (
    <CustomGridContainer container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5">Custom Reports</Typography>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('generateSlcl')
              : setGenerateSlclModal(true)
          }
        >
          Generate SLCL Report
        </CustomButton>
      </Grid>
      <GenerateSlcl open={generateSlclModal} setOpen={setGenerateSlclModal} />
      <SupervisorAuthorization
        open={supervisorAccessModal}
        setOpen={setSupervisorAccessModal}
        toAccessFunction={toAccessFunction}
        setApproveFunction={setApproveFunction}
      />
    </CustomGridContainer>
  );
}
