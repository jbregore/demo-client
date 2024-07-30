// material
import {
  Container,
} from '@mui/material';
import Page from '../components/Page';
import Forbidden from '../components/Forbidden';
import PromoCodesTable from '../components/admin/dashboard/tables/PromoCodesTable';

export default function PromoCode() {
  const { user } = JSON.parse(localStorage.getItem('userData'));

  if (user.role === 'cashier' || user.role === 'supervisor') return <Forbidden />;

  return (
    <Page title="Promo Codes">
      <Container>
        <PromoCodesTable />
      </Container>
    </Page>
  );
}
