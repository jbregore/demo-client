import styled from '@emotion/styled';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import React from 'react';
import { grey } from '@mui/material/colors';

const GrayButton = styled(Button)(({ theme }) => ({
  color: grey[700],
  '&:hover': {
    backgroundColor: grey[200],
  },
}));

const Confirmation = (props) => {
  const { context, open, setOpen, title, helperText, onSave } = props;

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {setOpen(false)}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {helperText}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <GrayButton onClick={() => {setOpen(false)}}>Cancel</GrayButton>
          <Button onClick={onSave} color={context === 'delete' ? 'error' : 'primary'}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Confirmation;
