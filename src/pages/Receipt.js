// material
import {
  Stack,
  Container,
  Typography,
} from '@mui/material';
import Page from '../components/Page';
import Forbidden from '../components/Forbidden';
import ReceiptsTable from '../components/admin/dashboard/tables/ReceiptsTable';

export default function Receipts() {
  const { user } = JSON.parse(localStorage.getItem('userData'));

  if (user.role === 'cashier') return <Forbidden />;

  return (
    <Page title="Activity Logs">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Print Receipts
          </Typography>
        </Stack>

        <ReceiptsTable />
       </Container>
    </Page>
  );
}
