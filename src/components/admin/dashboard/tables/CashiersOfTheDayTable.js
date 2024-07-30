import React, { useEffect, useState } from 'react';
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import styled from '@emotion/styled';
import { fCurrency } from '../../../../utils/formatNumber';
import axios from 'axios';
import { format } from 'date-fns';

const StatusCircle = styled('div')(({ xRead }) => ({
  width: '10px',
  height: '10px',
  backgroundColor: xRead ? '#637381' : '#00AB55',
  borderRadius: '50%'
}));

const StyledTableCell = styled(TableCell)(({ xRead }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  color: xRead ? '#637381' : '#00AB55'
}));

const CashiersOfTheDayTable = () => {
  const settings = JSON.parse(localStorage.getItem('settings'));

  const [cashierData, setCashierData] = useState([]);
  const [xReadCashiers, setXReadCashiers] = useState(new Set([]));
  const [cashierLoading, setCashierLoading] = useState(false);

  const fetchCashiersOfTheDay = async () => {
    setCashierLoading(true);

    const currentDate = format(new Date(localStorage.getItem('transactionDate')), 'yyyy-MM-dd');
    const storeCode = settings?.unitConfiguration?.storeCode;

    try {
      const cashiersData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/cashier/online/${storeCode}/${currentDate}`
      );

      if (cashiersData?.data?.cashierData) {
        setCashierData(cashiersData?.data?.cashierData);

        let done = new Set([...xReadCashiers]);
        if (cashiersData?.data?.xReadData) {
          cashiersData?.data?.xReadData.forEach((data) => {
            done.add(data.employee_id);
          });
        }

        setXReadCashiers(done);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setCashierLoading(false);
  };

  useEffect(() => {
    fetchCashiersOfTheDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">Name</TableCell>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Initial Cash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cashierLoading ? (
              <>
                <TableRow>
                  <TableCell align="center" colSpan={4} sx={{ py: 3 }}>
                    <CircularProgress />
                    <Typography variant="body2">Loading . . .</Typography>
                  </TableCell>
                </TableRow>
              </>
            ) : (
              <>
                {cashierData.map((cashier, index) => (
                  <TableRow key={index}>
                    <StyledTableCell
                         xRead={xReadCashiers.has(cashier.cashier_id)}
                      align="center"
                    >
                      <StatusCircle xRead={xReadCashiers.has(cashier.cashier_id)} />
                      {cashier.cashier_first_name} {cashier.cashier_last_name}
                    </StyledTableCell>
                    <TableCell align="center">{cashier.cashier_id}</TableCell>
                    <TableCell align="center">
                      {/* Active */}
                      {xReadCashiers.has(cashier.cashier_id) ? 'X Read Done' : 'Active'}
                    </TableCell>
                    <TableCell align="center">
                      {fCurrency('P', parseFloat(cashier.total))}
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default CashiersOfTheDayTable;
