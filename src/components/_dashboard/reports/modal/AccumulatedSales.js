import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Card,
  Modal,
  Stack,
  Typography,
  Button,
} from '@mui/material';
// icons
import { Icon } from '@iconify/react';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
import { fDateTimeSuffix } from '../../../../utils/formatTime';
// components
import Scrollbar from '../../../Scrollbar';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import BaseTableV2 from '../../../table/BaseTableV2';
import useTableQueries from '../../../../hooks/table/useTableQueries';
import useQueryString from '../../../../hooks/table/useQueryString';

const StyledModal = styled(Modal)({
  position: 'fixed',
  zIndex: 1300,
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const Backdrop = styled('div')({
  zIndex: '-1px',
  position: 'fixed',
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
});

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: '95vw'
}));

AccumulatedSales.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

const initialQueries = {
  page: '',
  pageSize: '',
  search: ''
};

export default function AccumulatedSales({ open, setOpen }) {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const storeCode = settings[SettingsCategoryEnum.UnitConfig].storeCode;
  
  const [salesReports, setSalesReports] = useState([]);
  const [salesReportsMeta, setSalesReportsMeta] = useState([]);
  const [salesReportsLoading, setSalesReportsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const { queryData, setQueryData } = useTableQueries(initialQueries);

  const { objectToString } = useQueryString();

  const columns = [
    {
      label: 'Date',
      render: (data) => <>{fDateTimeSuffix(data.transactionDate).split(' ')[0]}</>
    },
    {
      label: 'Beginning SI No.',
      render: (data) => <>{getSiNumbers(data.data.zReadData, 'from')}</>
    },
    {
      label: 'Ending SI No.',
      render: (data) => <>{getSiNumbers(data.data.zReadData, 'to')}</>
    },
    {
      label: 'Grand Accum. Sales Beginning Balance',
      render: (data) => (
        <>{fCurrency('', roundUpAmount(data.data.zReadData.ACCUMULATED_SALES.old))}</>
      )
    },
    {
      label: 'Grand Accum. Sales Ending Balance',
      render: (data) => (
        <>{fCurrency('', roundUpAmount(data.data.zReadData.ACCUMULATED_SALES.new))}</>
      )
    },

    {
      label: 'Sales Count',
      render: (data) => <>{data.data.zReadData.cashierAudit.NUM_SALES_TXN}</>
    },
    {
      label: 'Gross Sales From POS',
      render: (data) => <> {fCurrency('', roundUpAmount(data.data.zReadData.SALES.gross))}</>
    },

    {
      label: 'VATable Sales',
      render: (data) => <> {fCurrency('', roundUpAmount(getVatableSales(data.data.zReadData)))}</>
    },
    {
      label: 'VAT Amount',
      render: (data) => <> {fCurrency('', roundUpAmount(getVatAmount(data.data.zReadData)))}</>
    },

    {
      label: 'VAT-Exempt Sales',
      render: (data) => <>  {fCurrency('', roundUpAmount(getVatExemptSales(data.data.zReadData)))}</>
    },
    {
      label: 'Zero Rated Sales',
      render: (data) => <> {fCurrency('', roundUpAmount(getVatZeroRated(data.data.zReadData)))}</>
    },

    {
      label: 'Regular Discount',
      render: (data) => <>   {fCurrency('', roundUpAmount(getRegularDiscount(data.data.zReadData)))}</>
    },
    {
      label: 'Special Discount (SC/PWD)',
      render: (data) => <> {fCurrency('', roundUpAmount(getSpecialDiscount(data.data.zReadData)))}</>
    },

    {
      label: 'Void Count',
      render: (data) => <>  {data.data.zReadData.cashierAudit.NUM_VOID_TXN}</>
    },
    {
      label: 'Voided',
      render: (data) => <> {fCurrency('', roundUpAmount(getVoided(data.data.zReadData)))}</>
    },

    {
      label: 'Return Count',
      render: (data) => <>  {data.data.zReadData.payments.nonCash.returns.RMES_ISSUANCE.count}</>
    },
    {
      label: 'Returned',
      render: (data) => <> {fCurrency('', roundUpAmount(getReturned(data.data.zReadData)))}</>
    },
    {
      label: 'Refund Count',
      render: (data) => <> {data.data.zReadData.cashierAudit.NUM_REFUND_TXN}</>
    },
    {
      label: 'Refunded',
      render: (data) => <> {fCurrency('', Math.abs(data.data.zReadData.cashierAudit.REFUND_TXN_AMOUNT))}</>
    },
    {
      label: 'Total Deductions',
      render: (data) => <>  {fCurrency('', roundUpAmount(getTotalDiscount(data.data.zReadData)))}</>
    },
    {
      label: 'VAT on Special Discount',
      render: (data) => <>0.00 </>
    },

    {
      label: 'Others',
      render: (data) => <>0.00 </>
    },
    {
      label: 'Total VAT Adj.',
      render: (data) => <>0.00 </>
    },

    {
      label: 'VAT Payable',
      render: (data) => <>{fCurrency('', roundUpAmount(getVatAmount(data.data.zReadData)))} </>
    },
    {
      label: 'Net Sales',
      render: (data) => <>{fCurrency('', roundUpAmount(getNetSales(data.data.zReadData)))}</>
    },

    {
      label: 'Other Income',
      render: (data) => <>0.00 </>
    },
    {
      label: 'Sales Overrun/Overflow',
      render: (data) => <>{fCurrency('', roundUpAmount(getSalesOverrun(data.data.zReadData)))}</>
    },

    {
      label: 'Total Net Sales',
      render: (data) => <> {fCurrency('', roundUpAmount(getTotalNetSales(data.data.zReadData)))}</>
    },
    {
      label: 'Remarks',
      render: (data) => <></>
    }
  ];

  const fetchSales = async () => {
    setSalesReportsLoading(true);

    try {
      const salesReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/accumulated-sales/${storeCode}`
      );
      if (salesReportsData?.data?.data) {
        setSalesReports(salesReportsData?.data?.data);
        setSalesReportsMeta(salesReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setSalesReportsLoading(false);
  };

  const refetch = async () => {
    setSalesReportsLoading(true);

    try {
      const salesReportsData = await axios.get(
        `${process.env.REACT_APP_API_URL}/reports/accumulated-sales/${storeCode}?${objectToString(
          queryData
        )}`
      );
      if (salesReportsData?.data?.data) {
        setSalesReports(salesReportsData?.data?.data);
        setSalesReportsMeta(salesReportsData?.data?.meta);
      }
    } catch (err) {
      console.log('err ', err);
    }
    setSalesReportsLoading(false);
    setIsRefetching(false);
  };
  
  const getSiNumbers = (zReadData, type) => {
    const { from, to } = zReadData.SI_NUM;
    return type === 'from' ? from : to;
  };

  const getVatableSales = (zReadData) => {
    return zReadData.isNonVat
      ? 0
      : zReadData.vat.VAT_DETAILS.vatableSales;
  };

  const getVatAmount = (zReadData) => {
    return zReadData.isNonVat
      ? 0
      : zReadData.vat.VAT_DETAILS.vatAmount;
  };

  const getVatExemptSales = (zReadData) => {
    return zReadData.isNonVat
      ? 0
      : zReadData.vat.VAT_DETAILS.vatExemptSales;
  };

  const getVatZeroRated = (zReadData) => {
    return zReadData.isNonVat
      ? 0
      : zReadData.vat.VAT_DETAILS.vatZeroRated;
  };

  const getRegularDiscount = (zReadData) => {
    return zReadData.discounts.REGULAR_DISCOUNTS.total;
  };

  const getSpecialDiscount = (zReadData) => {
    return zReadData.discounts.SPECIAL_DISCOUNTS.total;
  };

  const getVoided = (zReadData) => {
    const cancelledAmount = zReadData.cashierAudit.VOID_TXN_AMOUNT;

    return cancelledAmount;
  };

  const getReturned = (zReadData) => {
    const returnedAmount = Math.abs(
      zReadData.payments.nonCash.returns.RMES_ISSUANCE.total
    );
    return returnedAmount;
  };

  const getTotalDiscount = (zReadData) => {
    const totalDiscount =
      getRegularDiscount(zReadData) +
      getSpecialDiscount(zReadData) +
      getVoided(zReadData) +
      getReturned(zReadData);

    return totalDiscount;
  };

  const getNetSales = (zReadData) => {
    return zReadData.SALES.net;
  };

  const getSalesOverrun = (zReadData) => {
    const salesOverrun = zReadData.OVER_SHORT;

    return salesOverrun > 0 ? salesOverrun : 0;
  };

  const getTotalNetSales = (zReadData) => {
    const t = Number(getNetSales(zReadData)) + Number(getSalesOverrun(zReadData));

    return t;
  };

  const roundUpAmount = (num) => {
    // num = Math.round(num * 100) / 100;
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const handlePrintCsv = async () => {
    const posDateData = localStorage.getItem('transactionDate').split(' ');

    try {
      const apiData = {
        transactions: salesReports
      };

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/reports/accumulated-sales/export-excel`,
        apiData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (res) {
        window.location.assign(
          `${process.env.REACT_APP_API_URL}/reports/journal/download-accumulated?transactionDate=${posDateData[0]}`
        );

      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isRefetching) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefetching]);

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Stack direction="row" justifyContent="space-between" px={2} mb={5}>
          <Typography variant="h6">Accumulated Sales/Backend Report</Typography>
          <Button
            variant="contained"
            startIcon={<Icon icon="fa-solid:file-csv" />}
            onClick={handlePrintCsv}
          >
            Download CSV
          </Button>
        </Stack>
        <Scrollbar>
          <BaseTableV2
            pageChangeCb={(page) => {
              setIsRefetching(true);
              setQueryData({
                ...queryData,
                page: page + 1
              });
            }}
            rowsChangeCb={(size) => {
              setIsRefetching(true);
              setQueryData({
                ...queryData,
                page: '',
                pageSize: size
              });
            }}
            data={salesReports || []}
            columns={columns}
            isLoading={salesReportsLoading}
            total={salesReportsMeta?.totalRecords}
            limitChoices={[5, 10, 20]}
          />
        </Scrollbar>
      </ModalCard>
    </StyledModal>
  );
}
