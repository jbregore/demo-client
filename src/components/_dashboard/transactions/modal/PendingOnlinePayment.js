import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  // Modal,
  Stack,
  Typography,
  TableContainer,
  Table,
  TableCell,
  TableBody,
  TableRow,
  TablePagination,
  IconButton
} from '@mui/material';
// icons
import CreditScoreIcon from '@mui/icons-material/CreditScore';
// utils
import { capitalCase } from 'text-case';
import { filter } from 'lodash';
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTimeSuffix } from '../../../../utils/formatTime';
// components
import Scrollbar from '../../../Scrollbar';
import SearchNotFound from '../../../SearchNotFound';
import { UserListHead } from '../../user';
import Label from '../../../Label';
import { Backdrop, StyledModal } from '../../reports/modal/styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'siNumber', label: 'SI Number', alignRight: false },
  { id: 'amount', label: 'Amount', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  {
    id: 'date',
    label: `Date`,
    alignRight: false
  },
  { id: 'action', label: '', alignRight: false }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (_order) =>
        _order.productCode.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        _order.siNumber.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 1000
}));

// ----------------------------------------------------------------------

PendingOnlinePayment.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function PendingOnlinePayment({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('product');
  // eslint-disable-next-line no-unused-vars
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pendingPayments, setPendingPayments] = useState([]);


  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = pendingPayments.map((n) => n.productCode);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - pendingPayments.length) : 0;

  const filteredOrders = applySortFilter(
    pendingPayments,
    getComparator(order, orderBy),
    filterName
  );

  const isOrderNotFound = filteredOrders.length === 0;

  const roundUpAmount = (num) => {
    // num = Math.round(num * 100) / 100;
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const handleProcessOnlinePayment = async (txnNumber) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/reports/preview/${txnNumber}`);
      const previewResponse = res.data.data;

      const storedData = JSON.parse(localStorage.getItem('userData'));
      const posDateData = localStorage.getItem('transactionDate').split(' ');
      const todayDate = new Date();
      const specsDate = `${posDateData[0]
        } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`;

      const computeSpecsPrice = (order, specs) => {
        let computedPrice = specs.overridedPrice || specs.price * specs.quantity;

        if (specs.discounts) {
          let totalItemDiscount = 0;

          specs.discounts.forEach((discount) => {
            totalItemDiscount += discount.amount;
          });

          if (totalItemDiscount > computedPrice) {
            computedPrice -= computedPrice;
          } else {
            computedPrice -= totalItemDiscount;
          }
        }

        if (specs.upgrades) {
          const upgradesPrice = specs.upgrades.price;
          computedPrice += upgradesPrice;

          if (specs.upgrades.discounts) {
            let totalUpgradesDiscount = 0;

            specs.upgrades.discounts.forEach((discount) => {
              totalUpgradesDiscount += discount.amount;
            });

            if (totalUpgradesDiscount > upgradesPrice) {
              computedPrice -= upgradesPrice;
            } else {
              computedPrice -= totalUpgradesDiscount;
            }
          }
        }

        if (order.discounts) {
          let totalNumberOrderSpecs = 0;

          order.ordersSpecs.forEach((specs) => {
            const price = specs.overridedPrice || specs.price * specs.quantity;

            if (price !== 0) {
              totalNumberOrderSpecs += 1;
            }
          });

          let totalOrderDiscount = 0;

          order.discounts.forEach((discount) => {
            totalOrderDiscount = discount.amount;
          });

          computedPrice -= totalOrderDiscount / totalNumberOrderSpecs;
        }

        if (previewResponse.data.cart.discounts) {
          let totalNumberTransactionSpecs = 0;

          previewResponse.data.cart.confirmOrders.forEach((order) => {
            order.ordersSpecs.forEach((specs) => {
              const price = specs.overridedPrice || specs.price * specs.quantity;

              if (price !== 0) {
                totalNumberTransactionSpecs += 1;
              }
            });
          });

          let totalTransactionDiscount = 0;

          previewResponse.data.cart.discounts
            .filter((x) => !x.percentage)
            .forEach((discount) => {
              totalTransactionDiscount += discount.amount;
            });

          computedPrice -= totalTransactionDiscount / totalNumberTransactionSpecs;

          let totalTransactionDiscountPercentage = 0;

          previewResponse.data.cart.discounts
            .filter((x) => x.percentage)
            .forEach((discount) => {
              totalTransactionDiscountPercentage +=
                (computedPrice * discount.percentageAmount) / 100;
            });

          computedPrice -= totalTransactionDiscountPercentage;
        }

        // return computedPrice.toFixed(2);
        return roundUpAmount(computedPrice);
      };

      previewResponse.data.cart.confirmOrders.forEach((node) => {
        node.ordersSpecs.forEach((specs) => {
          const paymentMethods = [];
          let paymentMethodString = '';
          let paymentDescriptionString = '';

          previewResponse.data.cart.payments.forEach((payment) => {
            if (!paymentMethods.includes(payment.value)) {
              if (previewResponse.data.cart.payments.length < 2) {
                paymentMethods.push(payment.value);

                if (payment.value === 'card') {
                  if (payment.cardType === 'debit-card') {
                    paymentMethodString = 'EPS';
                    paymentDescriptionString = 'DEBIT CARD';
                  } else if (payment.cardType === 'credit-card') {
                    paymentMethodString = 'CC';
                    paymentDescriptionString = 'CREDIT CARD';
                  }
                } else if (payment.value === 'cash') {
                  paymentMethodString = 'C';
                  paymentDescriptionString = 'CASH';
                }
              } else {
                paymentMethods.push(payment.value);
                if (payment.value === 'card') {
                  if (payment.cardType === 'debit-card') {
                    paymentMethodString += 'EPS, ';
                    paymentDescriptionString += 'DEBIT CARD, ';
                  } else if (payment.cardType === 'credit-card') {
                    paymentMethodString += 'CC, ';
                    paymentDescriptionString += 'CREDIT CARD, ';
                  }
                } else if (payment.value === 'cash') {
                  paymentMethodString += 'C, ';
                  paymentDescriptionString += 'CASH, ';
                }
              }
            }
          });

          const data = {
            paymentId: specs.poNumber,
            customerId: node.profileId,
            productCode: specs.productCode,
            productExtra: specs.producUpgrade || '',
            doctorCode: 'NA',
            sclerk: storedData.user.employeeId,
            labCode: 'NA',
            mobile: '',
            firstname: node.firstname,
            lastname: node.lastname,
            paymentTotal: computeSpecsPrice(node, specs),
            paymentStatus: 'SUCCESS',
            paymentMethod: paymentMethodString,
            paymentDescription: paymentDescriptionString,
            siNumber: previewResponse.data.cart.siNumber,
            salesDate: specsDate,
            item: ''
          };

          handleOnlineOrderPayment(data);
        });
      });
    } catch (err) { }
  };

  const handleOnlineOrderPayment = async (data) => {
    console.log(data);
    try {
      const config = {
        method: 'get',
        url: `${settings.onlineApiEndpoint}/payments/?client_id=87yTBK1gbliwaMuYTEA426GTH123g&company_cd=ss&branch_cd=${settings.storeCode}&payment_id=${data.paymentId}&customer_id=${data.customerId}&product_code=${data.productCode}&product_extra=${data.productExtra}&doctor_code=${data.doctorCode}&sclerk=${data.sclerk}&lab_code=${data.labCode}&mobile=${data.mobile}&first_name=${data.firstname}&last_name=${data.lastname}&payment_total=${data.paymentTotal}&payment_status=${data.paymentStatus}&payment_method=${data.paymentMethod}&payment_description=${data.paymentDescription}&si_number=${data.siNumber}&sales_date=${data.salesDate}&item=${data.item}`,
        headers: {
          'Content-Type': 'application/json',
          'oassis-api-key': '09iPyWEM541MDadeqw652435286KHYFn'
        }
      };

      axios(config)
        .then(function (response) {
          const res = response;

          if (res.status === 200) {
            const handleUpdateOnlinePaymentRemarks = async () => {
              let remarksData = {
                poNumber: data.paymentId,
                remarks: 'online - paid'
              };

              try {
                await axios.patch(
                  `${Endpoints.TRANSACTION}/online-pending-payments/update-remarks`,
                  remarksData
                );

                // eslint-disable-next-line no-empty
              } catch (err) { }
            };

            handleUpdateOnlinePaymentRemarks();

            const newPendingPayment = pendingPayments.filter((x) => x.siNumber !== data.siNumber);

            setPendingPayments(newPendingPayment);
          } else {
            throw res;
          }
        })
        .catch(function (error) {
          const handleUpdateOnlinePaymentRemarks = async () => {
            let remarksData = {
              poNumber: data.paymentId,
              remarks: 'online - pending payment'
            };

            try {
              await axios.patch(
                `${Endpoints.TRANSACTION}/online-pending-payments/update-remarks`,
                remarksData
              );

              // eslint-disable-next-line no-empty
            } catch (err) { }
          };

          handleUpdateOnlinePaymentRemarks();
        });
    } catch (err) { }
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Stack direction="row" justifyContent="space-between" px={2} mb={2}>
          <Typography variant="h6">Pending Online Payment</Typography>
        </Stack>
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <UserListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={pendingPayments.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const { siNumber, amount, txnNumber, specsDate } = row;

                    return (
                      <TableRow hover key={index} tabIndex={-1}>
                        <TableCell component="th" scope="row">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {siNumber}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{fCurrency('P', roundUpAmount(amount))}</TableCell>
                        <TableCell align="left">
                          <Label variant="ghost" color="warning">
                            {capitalCase('Pending ')}
                          </Label>
                        </TableCell>
                        <TableCell align="left">{fDateTimeSuffix(specsDate)}</TableCell>
                        <TableCell align="left">
                          <IconButton onClick={() => handleProcessOnlinePayment(txnNumber)}>
                            <CreditScoreIcon color="primary" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={12} />
                  </TableRow>
                )}
              </TableBody>
              {isOrderNotFound && (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={12} sx={{ py: 3 }}>
                      <SearchNotFound searchQuery={filterName} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </ModalCard>
    </StyledModal>
  );
}
