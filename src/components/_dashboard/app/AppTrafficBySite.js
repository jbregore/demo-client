import { useEffect, useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Icon } from '@iconify/react';
import cashMethodIcon from '@iconify/icons-mdi/hand-coin-outline';
import creditCardMethodIcon from '@iconify/icons-ant-design/credit-card-outline';
import qrCodeMethodIcon from '@iconify/icons-ant-design/scan-outline';
import giftCardIcon from '@iconify/icons-ant-design/gift-outlined';
// material
import { Box, Grid, Card, Paper, Typography, CardHeader, CardContent } from '@mui/material';
// utils
import { fCurrency } from '../../../utils/formatNumber';

// ----------------------------------------------------------------------

SiteItem.propTypes = {
  site: PropTypes.object
};

function SiteItem({ site }) {
  const { icon, value, name } = site;

  return (
    <Grid item xs={6}>
      <Paper variant="outlined" sx={{ py: 2.5, textAlign: 'center' }}>
        <Box sx={{ mb: 0.5 }}>{icon}</Box>
        <Typography variant="h6">{fCurrency('P', value)}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {name}
        </Typography>
      </Paper>
    </Grid>
  );
}

export default function AppTrafficBySite() {
  const [cash, setCash] = useState({
    name: 'Cash',
    value: 0,
    icon: <Icon icon={cashMethodIcon} width={32} height={32} />
  });
  const [card, setCard] = useState({
    name: 'Credit/Debit Card',
    value: 0,
    icon: <Icon icon={creditCardMethodIcon} width={32} height={32} />
  });
  const [gcash, setGcash] = useState({
    name: 'Gcash',
    value: 0,
    icon: <Icon icon={qrCodeMethodIcon} width={32} height={32} />
  });
  const [gift, setGift] = useState({
    name: 'Gift Card',
    value: 0,
    icon: <Icon icon={giftCardIcon} width={32} height={32} />
  });

  useEffect(() => {
    const getTotalPaymentCash = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ssis/sales/payments/Cash`);
        const totalSalesData = res.data.data[0].total;

        setCash({
          ...cash,
          value: totalSalesData
        });

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getTotalPaymentCard = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ssis/sales/payments/Card`);
        const totalSalesData = res.data.data[0].total;

        setCard({
          ...card,
          value: totalSalesData
        });

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getTotalPaymentGcash = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ssis/sales/payments/Gcash`);
        const totalSalesData = res.data.data[0].total;

        setGcash({
          ...gcash,
          value: totalSalesData
        });

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    const getTotalPaymentGift = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/ssis/sales/payments/Gift`);
        const totalSalesData = res.data.data[0].total;

        setGift({
          ...gift,
          value: totalSalesData
        });

        // eslint-disable-next-line no-empty
      } catch (err) {}
    };

    getTotalPaymentCash();
    getTotalPaymentCard();
    getTotalPaymentGcash();
    getTotalPaymentGift();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader title="Payments Total" />
      <CardContent>
        <Grid container spacing={2}>
          <SiteItem site={cash} />
          <SiteItem site={card} />
          <SiteItem site={gcash} />
          <SiteItem site={gift} />
        </Grid>
      </CardContent>
    </Card>
  );
}
