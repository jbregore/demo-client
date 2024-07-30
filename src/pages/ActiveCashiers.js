import Page from '../components/Page';
import {
  Container,
  Card,
  Typography,
  Stack,
} from '@mui/material';
import CashiersOfTheDayTable from '../components/admin/dashboard/tables/CashiersOfTheDayTable';

export default function ActiveCashiers() {

  return (
    <Page title="Cashiers">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Cashiers Of The Day
          </Typography>
        </Stack>
        <Card>
        <CashiersOfTheDayTable />
        </Card>
      </Container>
    </Page>
  );
}
