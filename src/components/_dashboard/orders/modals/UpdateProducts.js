import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import {
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Modal,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import { Endpoints } from '../../../../enum/Endpoints';
import { ordersStore } from '../../../../redux/orders/store';
import { setCategory } from '../../../../redux/orders/action';
import downloadCsv from 'download-csv';
// ----------------------------------------------------------------------

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
  width: 500
}));

const LinkTypography = styled(Typography)({
  color: "#005ce6",
  '&:hover': {
      cursor: 'pointer',
      textDecoration: 'underline',
  },
});

// ----------------------------------------------------------------------

UpdateProducts.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
};

// ----------------------------------------------------------------------

export default function UpdateProducts({ open, setOpen, activeCategory }) {
  const [updateType, setUpdateType] = useState('');
  const [csvFile, setCsvFile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const settings = JSON.parse(localStorage.getItem('settings'));

  const handleUpdateProducts = () => {
    if (updateType === 'online') {
      handleupdateProductsOnline();
    } else if (updateType === 'csv') {
      handleupdateProductsCsv();
    }
  };

  const handleupdateProductsOnline = async () => {
    setIsLoading(true);

    let isMarketPlace = '';
    // eslint-disable-next-line
    if (settings[SettingsCategoryEnum.UnitConfig].ecomm == true) isMarketPlace = 'mp';
    try {
      const config = {
        method: 'get',
        url: `http://api.sunniessystems.com/sis_mini/poll51/synched/?client_id=87yTBK1gbliwaMuYTEA426GTH123g&staff_id=6&t=${activeCategory.params}${isMarketPlace}&t_row=${activeCategory.params}${isMarketPlace}`,
        headers: {
          'oassis-api-key': '09iPyWEM541MDadeqw652435286KHYFn'
        }
      };
      axios(config)
        .then(function (response) {
          const res = response.data.data;

          const handleRemoveProducts = async (products) => {
            try {
              const res = await axios.get(
                `${Endpoints.INVENTORY}/remove-products`
              );

              if (res.status === 200) {
                const formData = new FormData();
                const half = Math.ceil(products.length / 2);

                formData.append('products', JSON.stringify(products.slice(0, half)));
                formData.append('products1', JSON.stringify(products.slice(half)));

                try {
                  const res = await axios.post(
                    `${Endpoints.INVENTORY}/update-products-online`,
                    formData,
                    {
                      withCredentials: true,
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    }
                  );

                  if (res.status === 200) {
                    setTimeout(() => {
                      setIsLoading(false);
                      setStatus('success');
                      setStatusMessage('Products successfully updated!');
                    }, 5000);

                    ordersStore.dispatch(setCategory(-1));
                  } else {
                    throw res;
                  }
                  // eslint-disable-next-line no-empty
                } catch (err) {
                  setTimeout(() => {
                    setIsLoading(false);
                    setStatus('error');
                    setStatusMessage('Something went wrong, please try again!');
                  }, 5000);
                }
              } else {
                throw res;
              }

              // eslint-disable-next-line no-empty
            } catch (err) {
              setTimeout(() => {
                setIsLoading(false);
                setStatus('error');
                setStatusMessage('Something went wrong, please try again!');
              }, 5000);
            }
          };

          handleRemoveProducts(res);
        })
        .catch(function (error) {
          setTimeout(() => {
            setIsLoading(false);
            setStatus('error');
            setStatusMessage('Something went wrong, please try again!');
          }, 5000);
        });
    } catch (err) {
      setTimeout(() => {
        setIsLoading(false);
        setStatus('error');
        setStatusMessage('Something went wrong, please try again!');
      }, 5000);
    }
  };

  const handleupdateProductsCsv = async () => {
    setIsLoading(true);

    if (csvFile === '') {
      setIsLoading(false);
      setStatus('');
      setStatusMessage('');

      return false;
    }

    const data = new FormData();
    data.append('file', csvFile);
    // data.append('table', activeCategory);

    try {
      await axios.post(`${Endpoints.INVENTORY}/update-products-csv`, data, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      await ordersStore.dispatch(setCategory(-1));

      setIsLoading(false);
      setStatus('success');
      setStatusMessage('Products successfully updated!');

    } catch (err) {
      setIsLoading(false);
      setStatus('error');
      setStatusMessage('Something went wrong, please try again!');
    }
  };

  const handleDownloadTemplate = () => {
    const columns = {
        name: 'Name',
        code: 'Product Code',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        stock: 'Stocks',
        size: 'Size',
        color: 'Color',
        availability: 'Availability',
        vatable: 'Vatable',
      };

      const sampleData  = [{
        name: 'Running Shoes ',
        code: 'RS001',
        description: 'Lightweight running shoes with cushioned sole.',
        price: 80,
        category: 'Sports',
        stock: 200,
        size: 9,
        color: 'Black',
        availability: 'TRUE',
        vatable: 'TRUE',
      }]


    downloadCsv(sampleData, columns, `product-import-template`);
}


  return (
    <StyledModal open={open} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Update Products</Typography>
        <Box mt={3}>
          <Grid item xs={12} mt={2}>
            <TextField
              fullWidth
              select
              label="Select Update Type"
              value={updateType}
              onChange={(e) => setUpdateType(e.target.value)}
            >
              <MenuItem value="online">Update Online</MenuItem>
              <MenuItem value="csv">Import CSV</MenuItem>
            </TextField>
          </Grid>
          {updateType === 'csv' && (
            <Grid item xs={12} mt={2}>
              <TextField
                fullWidth
                type="file"
                label="Upload CSV File"
                InputLabelProps={{
                  shrink: true
                }}
                onChange={(e) => setCsvFile(e.target.files[0])}
              />

<LinkTypography mt={2} onClick={handleDownloadTemplate}>
                        Download Template
                    </LinkTypography>

            </Grid>
          )}
        </Box>
        {status !== '' && (
          <Typography textAlign="center" color={status === 'success' ? 'primary' : status} mt={1}>
            {statusMessage}
          </Typography>
        )}
        <Stack direction="row" justifyContent="end" alignItems="center" mt={2} spacing={1}>
          <Button size="large" variant="outlined" type="submit" onClick={() => setOpen(false)}>
            Close
          </Button>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleUpdateProducts}
          >
            Update Products
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
}
