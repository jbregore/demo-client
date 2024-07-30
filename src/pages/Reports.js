// material
import { Card, Stack, Typography, Container, Box } from '@mui/material';
// components
import Page from '../components/Page';
import { StandardReports, SalesReports } from '../components/_dashboard/reports';

// ----------------------------------------------------------------------

export default function Reports() {
  return (
    <Page title="Reports">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Reports
          </Typography>
        </Stack>
        <Box>
          <Card>
            <StandardReports />
          </Card>
        </Box>
        <Box mt={2}>
          <Card>
            <SalesReports />
          </Card>
        </Box>
      </Container>
    </Page>
  );
}
