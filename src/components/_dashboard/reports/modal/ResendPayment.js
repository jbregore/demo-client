import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Papa from 'papaparse';
// material
import { styled } from '@mui/material/styles';
import { Box, Card, Grid, Stack, TextField, Typography, MenuItem } from '@mui/material';
// utils
import { LoadingButton } from '@mui/lab';
import { Backdrop, StyledModal } from './styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 500
}));

// ----------------------------------------------------------------------

ResendPayment.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function ResendPayment({ open, setOpen, setErrorMessage, setIsError }) {
  const { activeCategory, localApiEndpoint, onlineApiEndpoint, storeCode } = JSON.parse(
    localStorage.getItem('settings')
  );

  const [resendType, setResendType] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [csvFile, setCsvFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  let companyCode;
  switch (activeCategory) {
    case 'SUN':
      companyCode = 'SS';
      break;

    case 'FACE':
      companyCode = 'SF';
      break;

    case 'OPTICAL':
      companyCode = 'SP';
      break;

    case 'OPTICALINT':
      companyCode = 'SP';
      break;

    default:
      companyCode = 'UDC';
      break;
  }

  useEffect(() => {
    if (open && ['OPTICAL', 'OPTICALINT'].includes(activeCategory)) {
      setResendType('poNumber');
    }
  }, [open, activeCategory]);

  const handleResend = () => {
    if (resendType === 'poNumber') {
      handleResendPaymentPoNumber();
    } else if (resendType === 'csv') {
      handleResendPaymentCsv();
    }
  };

  const processResendPaymentLocal = (order) => {
    const config = {
      method: 'get',
      url: `${localApiEndpoint}/order/payment_status/?client_secret=SDFE2346HTYUN123fgFQ123LOI125&client_id=87yTBK1gbliwaMuYTEA426GTH123g&payment_id=${order.payment_id}&customer_id=${order.customer_id}&frame=${order.frame}&lens=${order.lens}&doctor_code=NA&sclerk=${order.sclerk}&lab_code=NA&company_cd=${companyCode}&branch_cd=${order.origin_branch}&mobile=NA&first_name=${order.first_name}&mi_name=NA&last_name=${order.last_name}&payment_total=${order.payment_total}&payment_status=SUCCESS&payment_method=${order.payment_method}&payment_description=${order.payment_method}&si_number=${order.si_number}&sales_date=${order.sales_date}&item=${order.frame}&curency=${order.currency}`,
      headers: {
        'Content-Type': 'application/json',
        'oassis-api-key': '09iPyWEM541MDadeqw652435286KHYFn'
      }
    };
    axios(config)
      .then(function () {
        setPoNumber('');
        setCsvFile('');
        setResendType('');
      })
      .catch(function (error) {
        setIsError(true);
        setErrorMessage(error.response.data.message ?? 'Something went wrong');
      });
  };

  const processResendPaymentOnline = (order) => {
    return new Promise((resolve, reject) => {
      const config = {
        method: 'get',
        url: `${onlineApiEndpoint}/payments/?client_id=87yTBK1gbliwaMuYTEA426GTH123g&company_cd=${companyCode}&branch_cd=${storeCode}&payment_id=${order.payment_id}&customer_id=${order.customer_id}&product_code=${order.frame}&product_extra=${order.product_extra}&doctor_code=NA&sclerk=${order.sclerk}&lab_code=NA&mobile=&first_name=${order.first_name}&last_name=${order.last_name}&payment_total=${order.payment_total}&payment_status=SUCCESS&payment_method=${order.payment_method}&payment_description=${order.payment_description}&si_number=${order.si_number}&sales_date=${order.sales_date}&item=`,
        headers: {
          'Content-Type': 'application/json',
          'oassis-api-key': '09iPyWEM541MDadeqw652435286KHYFn'
        }
      };

      axios(config)
        .then(async function (response) {
          const res = response;

          if (res.status === 200) {
            let remarksData = {
              poNumber: order.payment_id,
              remarks: 'online - paid'
            };

            try {
              await axios.patch(
                `${Endpoints.TRANSACTION}/online-pending-payments/update-remarks`,
                remarksData
              );

              // eslint-disable-next-line no-empty
            } catch (err) { }

            setPoNumber('');
            setCsvFile('');
            setResendType('');
            resolve();
          } else {
            setIsError(true);
            setErrorMessage('Failed to update payment online');
            reject(new Error('Failed to update payment online'));
          }
        })
        .catch(async function (error) {
          let remarksData = {
            poNumber: order.payment_id,
            remarks: 'online - pending payment'
          };

          try {
            await axios.patch(
              `${Endpoints.TRANSACTION}/online-pending-payments/update-remarks`,
              remarksData
            );

            // eslint-disable-next-line no-empty
          } catch (err) {
            setIsError(true);
            setErrorMessage(error.response.data.message ?? 'Something went wrong');
            reject(new Error('Failed to update payment online'));
          }
        });
    });
  };

  const handleResendPaymentPoNumber = async () => {
    setIsLoading(true);

    if (['OPTICAL', 'OPTICALINT'].includes(activeCategory)) {
      try {
        const resendingURL = `${process.env.REACT_APP_API_URL}/order/resend-payment/po_number/${poNumber}`;

        const res = await axios.get(resendingURL);

        const { order } = res.data;
        processResendPaymentLocal(order);
        setIsLoading(false);
        setOpen(false);
      } catch (err) {
        setIsError(true);
        setIsLoading(false);
        setErrorMessage(err.response.data.message || 'Something went wrong');
      }
    } else if (['SUN', 'FACE'].includes(activeCategory)) {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/order/resend-payment/po_number/${poNumber}`
        );

        const { order } = res.data;
        processResendPaymentOnline(order);
        setIsLoading(false);
        setOpen(false);
      } catch (err) {
        setIsError(true);
        setIsLoading(false);
        setErrorMessage(err.response.data.message || 'Something went wrong');
      }
    }
  };

  const handleResendPaymentCsv = async () => {
    setIsLoading(true);
    if (csvFile) {
      Papa.parse(csvFile, {
        complete: (result) => {
          const poNumbers = result.data.map((row) => row[0]);

          axios
            .post(`${process.env.REACT_APP_API_URL}/order/resend-payment/upload-csv`, {
              poNumbers
            })
            .then((response) => {
              if (response.data) {
                const requests = response.data.po_number.map((row) =>
                  processResendPaymentOnline(row)
                );

                // Use Promise.all to wait for all promises to resolve
                Promise.all(requests)
                  .then(() => {
                    // All requests completed successfully
                    setIsLoading(false);
                    setOpen(false);
                  })
                  .catch((error) => {
                    // Handle errors from any of the requests
                    setIsError(true);
                    setIsLoading(false);
                    setErrorMessage(
                      error.response?.data?.message || 'Something went wrong while uploading file.'
                    );
                  });
              } else {
                // No data in response
                setIsLoading(false);
                setIsError(true);
                setErrorMessage('No data found.');
              }
            })
            .catch((error) => {
              setIsError(true);
              setIsLoading(false);
              setErrorMessage(
                error.response?.data?.message || 'Something went wrong while uploading file.'
              );
            });
        },
        header: false
      });
    } else {
      setIsError(true);
      setIsLoading(false);
      setErrorMessage('Please upload csv file.');
    }
  };

  const handleChangeType = (e) => {
    setCsvFile('');
    setPoNumber('');
    setResendType(e.target.value);
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Resend Payment Online</Typography>
        <Box mt={3}>
          <Grid container>
            {activeCategory !== 'OPTICAL' && (
              <Grid item xs={12} mt={2}>
                <TextField
                  fullWidth
                  select
                  label="Select Update Type"
                  value={resendType}
                  onChange={handleChangeType}
                >
                  <MenuItem value="poNumber">PO Number</MenuItem>
                  <MenuItem value="csv">Upload CSV</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} mt={2}>
              {resendType === 'csv' && (
                <TextField
                  fullWidth
                  type="file"
                  label="Upload CSV File"
                  InputLabelProps={{
                    shrink: true
                  }}
                  inputProps={{ accept: '.csv' }}
                  onChange={(e) => setCsvFile(e.target.files[0] ? e.target.files[0] : '')}
                />
              )}
              {resendType === 'poNumber' && (
                <TextField
                  id="poNumber"
                  label="PO Number"
                  name="poNumber"
                  variant="outlined"
                  fullWidth
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                />
              )}
            </Grid>
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleResend}
          >
            Resend
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
