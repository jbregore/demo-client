import {
  Card,
  Stack,
  Container,
  Typography,
} from '@mui/material';
import Page from '../components/Page';
import Forbidden from '../components/Forbidden';
import ActivityLogsTable from '../components/admin/dashboard/tables/ActivityLogsTable';
import CashiersOfTheDayTable from '../components/admin/dashboard/tables/CashiersOfTheDayTable';

export default function Activity() {
  const { user } = JSON.parse(localStorage.getItem('userData'));

  if (user.role === 'cashier' || user.role === 'supervisor') return <Forbidden />;

  return (
    <Page title="Activity Logs">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Cashiers Of The Day
          </Typography>
        </Stack>

        <Card sx={{ mb: 4 }}>
          <CashiersOfTheDayTable />
        </Card>

        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Activity Logs
          </Typography>
        </Stack>

        <ActivityLogsTable />
      </Container>
    </Page>
  );
}
