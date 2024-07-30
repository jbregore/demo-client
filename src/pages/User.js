import {
  Container,
} from '@mui/material';
import Page from '../components/Page';
import Forbidden from '../components/Forbidden';
import EmployeesTable from '../components/admin/dashboard/tables/EmployeesTable';


export default function User() {
  const { user } = JSON.parse(localStorage.getItem('userData'));
  
  if (user.role === 'cashier' || user.role === 'supervisor') return <Forbidden />;

  return (
    <Page title="Employees">
      <Container>
        <EmployeesTable />
      </Container>
      
    </Page>
  );
}
