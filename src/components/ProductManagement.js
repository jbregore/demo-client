import { Container } from '@mui/material';
import Page from './Page';
import CategoriesTable from './admin/dashboard/tables/CategoriesTable';
import ProductsTable from './admin/dashboard/tables/ProductsTable';

export default function ProductManagement() {
  return (
    <Page title="Products">
      <Container>
        <CategoriesTable />

        <br />
        <ProductsTable />
      </Container>
    </Page>
  );
}
