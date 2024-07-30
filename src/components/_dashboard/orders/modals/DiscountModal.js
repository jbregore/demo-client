import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Card, Modal } from '@mui/material';
// modals
import {
  ItemDiscount,
  OrderDiscount,
  FreeItem,
  PriceOverride,
  TransactionDiscount
  // Package
} from '.';

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

DiscountModal.propTypes = {
  open: PropTypes.object.isRequired,
  setOpen: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

export default function DiscountModal({ open, setOpen }) {
  const { status, type } = open;

  return (
    <StyledModal
      open={status}
      onClose={() => setOpen({ status: false, type: null })}
      BackdropComponent={Backdrop}
    >
      <ModalCard>
        {
          {
            itemDiscount: <ItemDiscount setOpen={setOpen} />,
            orderDiscount: <OrderDiscount setOpen={setOpen} />,
            freeItem: <FreeItem setOpen={setOpen} />,
            priceOverride: <PriceOverride setOpen={setOpen} />,
            transactionDiscount: <TransactionDiscount setOpen={setOpen} />
          }[type]
        }
      </ModalCard>
    </StyledModal>
  );
}
