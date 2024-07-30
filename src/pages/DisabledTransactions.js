import { useContext } from "react";
import { Typography, Stack, Button } from "@mui/material";
import { AuthContext } from '../shared/context/AuthContext';
import Page from "../components/Page";

export default function DisabledTransactions() {
    const auth = useContext(AuthContext);

    return (
        <Page title="Disabled Transaction">
            <Stack direction='column' spacing={2} sx={{ height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6">Transactions resume at 9:00 A.M.</Typography>
                <Button variant='contained' color="error" onClick={() => auth.logout()}>Logout</Button>
            </Stack>
        </Page>
    )
}