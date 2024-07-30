import { useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal, Typography, Box, Stack, Button } from '@mui/material';
// context
import { AuthContext } from '../../../../shared/context/AuthContext';

// ----------------------------------------------------------------------

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 600
}));

// ----------------------------------------------------------------------

XReadChecker.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function XReadChecker({ open, setOpen }) {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleYes = () => {
    setOpen(false);
    navigate('/app/reports');
  };

  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6" textAlign="center">
          X - Reading
        </Typography>
        <Box mt={3}>
          <Typography textAlign="center" mt={1}>
            You are about to logout, would you like to do x read before logging out?
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ marginTop: 5 }}
            spacing={3}
          >
            <Button size="large" variant="contained" color="primary" onClick={handleYes}>
              Yes
            </Button>
            <Button size="large" variant="contained" color="error" onClick={auth.logout}>
              No, logout
            </Button>
          </Stack>
        </Box>
      </ModalCard>
    </StyledModal>
  );
}
