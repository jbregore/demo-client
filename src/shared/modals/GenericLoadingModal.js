import PropTypes from 'prop-types';
// material
import { styled } from '@mui/material/styles';
import { Card, Typography, Stack, CircularProgress } from '@mui/material';
import { Backdrop, StyledModal } from '../../components/_dashboard/reports/modal/styles/commonModalStyles';


const ModalCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    width: 600
}));

// ----------------------------------------

GenericLoadingModal.propTypes = {
    open: PropTypes.bool.isRequired,
    setOpen: PropTypes.func.isRequired,
    message: PropTypes.string.isRequired
};

// ----------------------------------------
export default function GenericLoadingModal({ open, setOpen, message }) {
    return (
        <StyledModal open={open} onClose={() => { return }} BackdropComponent={Backdrop}>
            <ModalCard>
                <Typography variant="h6">Loading</Typography>
                <Stack direction='row' mt={1} spacing={1} alignItems='center'>
                    <CircularProgress size={20} />
                    <Typography variant="body1" >{message}</Typography>
                </Stack>
            </ModalCard>
        </StyledModal>
    )
}