const { default: styled } = require('@emotion/styled');
const { Modal, Card } = require('@mui/material');

export const StyledModal = styled(Modal)({
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

export const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

export const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 1000
}));
