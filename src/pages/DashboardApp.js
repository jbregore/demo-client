import { useEffect, useState } from 'react';
import axios from 'axios';
// material
import { Box, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
import Forbidden from '../components/Forbidden';
import { SalesAllProduct, SalesInfoCard, SalesPaymentReport } from '../components/_dashboard/app';

// ----------------------------------------------------------------------

export default function DashboardApp() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { user } = JSON.parse(localStorage.getItem('userData'));

  const [overallSales, setOverallSales] = useState(0);
  const [overallOrders, setOverallOrders] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    const branchCode = settings.unitConfiguration.storeCode;

    const getOverallSales = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/sales/overall-sales/${branchCode}`
        );
        const totalSalesData = res.data.data[0].total;

        setOverallSales(totalSalesData);

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getOverallOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/sales/overall-orders/${branchCode}`
        );
        const totalSalesData = res.data.data[0].total;

        setOverallOrders(totalSalesData);

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getTodaySales = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/sales/today-sales/${branchCode}/${localStorage.getItem(
            'transactionDate'
          )}`
        );
        const totalSalesData = res.data.data[0].total;

        setTodaySales(totalSalesData);

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getTodayOrders = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/sales/today-orders/${branchCode}/${localStorage.getItem(
            'transactionDate'
          )}`
        );
        const totalSalesData = res.data.data[0].total;

        setTotalOrders(totalSalesData);

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    getOverallSales();
    getOverallOrders();
    getTodaySales();
    getTodayOrders();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (user.role === 'cashier') return <Forbidden />;

  return (
    <Page title="Dashboard">
      <Container>
        <Box sx={{ pb: 5 }}>
          <Typography variant="h4">Sales Report</Typography>
        </Box>
         <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <SalesInfoCard label="Total Accumulated Sales" value={overallSales} type="amount" />
          </Grid>
         <Grid item xs={12} sm={6} md={3}>
            <SalesInfoCard label="Total Accumulated Orders" value={overallOrders} />
          </Grid>
            <Grid item xs={12} sm={6} md={3}>
            <SalesInfoCard label="Today Sales" value={todaySales} type="amount" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SalesInfoCard label="Today Orders" value={totalOrders} />
          </Grid>
          <Grid item xs={12}>
            <SalesAllProduct />
          </Grid>
          <Grid item xs={12}>
            <SalesPaymentReport />
          </Grid>
        </Grid> 
      </Container>
    </Page>
  );
}
