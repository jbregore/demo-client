import styled from '@emotion/styled';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    FormGroup
} from '@mui/material';
import React, { useState } from 'react';
import { grey } from '@mui/material/colors';

const GrayButton = styled(Button)(({ theme }) => ({
    color: grey[700],
    '&:hover': {
        backgroundColor: grey[200],
    },
}));

const EnabledModal = (props) => {
    const { open, setOpen, onSave } = props;
    const [resetData, setResetData] = useState(true)

    return (
        <>
            <Dialog
                open={open}
                onClose={() => { setOpen(false) }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Enabled Demo</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to enable the demo for this organization?
                    </DialogContentText>
                    <FormGroup sx={{ marginTop: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    defaultChecked
                                    id="resetData"
                                    name="resetData"
                                    value={resetData}
                                    onClick={() => setResetData(!resetData)}
                                />
                            }
                            label="Reset Data"
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    <GrayButton onClick={() => { setOpen(false) }}>Cancel</GrayButton>
                    <Button onClick={() => {
                        onSave(resetData)
                    }} color={'primary'}>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default EnabledModal