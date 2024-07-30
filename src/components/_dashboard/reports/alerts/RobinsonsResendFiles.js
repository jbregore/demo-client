import { Snackbar, Alert } from "@mui/material"
import { useResend } from "../../../../shared/hooks/ResendHook";

export default function RobinsonsResendFiles() {
    const [message, status, open, setOpen] = useResend()
    return (
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={open}
            autoHideDuration={5000}
            onClose={() => {
                setOpen(false)
            }}
            sx={{ zIndex: 2000 }}
        >
            <Alert
                onClose={() => {
                    setOpen(false)
                }}
                severity={status}
                sx={{ width: '100%', backgroundColor: status === 'error' ? 'darkred' : status === 'info' ? 'blue' : 'green', color: '#fff' }}
            >
                {message}
            </Alert>
        </Snackbar>
    )

}