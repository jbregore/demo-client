import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
// material
import { styled } from '@mui/material/styles';
import { Stack, Box, Typography } from '@mui/material';
// icons
import { Icon } from '@iconify/react';
import RemoveIcon from '@iconify/icons-eva/trash-outline';
import EditIcon from '@iconify/icons-eva/edit-2-outline';
// utils
import { v4 as uuidv4 } from 'uuid';
import { capitalCase, titleCase } from 'text-case';
import { fCurrency } from '../../../utils/formatNumber';
// components
import Scrollbar from '../../Scrollbar';
import { SupervisorAuthorization, ChangeQuantityModal } from '../reports';
// redux
import { store } from '../../../redux/cart/store';
import {
  removeItem,
  removeSpecsDiscount,
  removeOrderDiscount,
  updateAmounts,
  removePackage,
  updatePackageAmountDue,
  clearCart,
} from '../../../redux/cart/action';
// functions
import addUserActivityLog from '../../../functions/common/addUserActivityLog';
import useNetwork from '../../../functions/common/useNetwork';
import { Endpoints } from '../../../enum/Endpoints';

// ----------------------------------------------------------------------

const ItemBox = styled(Box)(({ theme }) => ({
  width: '100%',
  '& section': {
    paddingRight: 16,
    '& h6': {
      fontSize: 12
    },
    '& p': {
      fontSize: 11,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase'
    },
    '& span': {
      fontSize: 11,
      color: theme.palette.text.secondary,
      display: 'block',
      textTransform: 'uppercase'
    }
  }
}));

const PriceBox = styled(Box)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 700,
  paddingRight: 4,
  color: theme.palette.text.primary,
  '& h6': {
    fontSize: 12
  }
}));

const RemoveItemIcon = styled(Box)(({ theme }) => ({
  padding: 8,
  paddingInline: 4,
  lineHeight: '14px',
  cursor: 'pointer',

  '& svg': {
    fontSize: 14,
    color: theme.palette.error.main
  }
}));

const EditItemIcon = styled(Box)(({ theme }) => ({
  padding: 8,
  paddingInline: 8,
  lineHeight: '14px',
  cursor: 'pointer',

  '& svg': {
    fontSize: 14,
    color: theme.palette.success.main
  }
}));

// ----------------------------------------------------------------------

CartItemList.propTypes = {
  maxHeight: PropTypes.number.isRequired
};

// ----------------------------------------------------------------------

export default function CartItemList({ maxHeight, ...other }) {
  const { user } =
    localStorage.getItem('userData') !== null && JSON.parse(localStorage.getItem('userData'));
  // const settings = JSON.parse(localStorage.getItem('settings'));
  const { online } = useNetwork();

  const state = store.getState();
  const [cart, setCart] = useState(
    state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart
  );
  const [packageCart, setPackageCart] = useState(state.packageCart);

  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [changeQuantityModal, setChangeQuantityModal] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState(null);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');
  const [activeRow, setActiveRow] = useState({});
  const [activeOrder, setActiveOrder] = useState({});

  useEffect(() => {
    updateState();
    store.subscribe(updateState);
  }, []);

  useEffect(() => {
    let productCount = 0;

    if (cart.confirmOrders.length > 0) {
      cart.confirmOrders.forEach((order) => {
        order.products.forEach((product) => {
          productCount += 1;

        });
      });

      if (productCount === 0) {
        store.dispatch(clearCart());
      }
    }
  }, [cart]);

  const updateState = () => {
    const state = store.getState();
    setCart(state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart);
    setPackageCart(state.packageCart);
  };

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  const showTotalItemPrice = (price, discounts, upgrades) => {
    let totalDiscount = 0;

    if (discounts.length !== 0) {
      let totalItemDiscount = 0;

      discounts.forEach((discount) => {
        totalItemDiscount += Number(discount.amount);
      });

      if (totalItemDiscount > price) {
        totalDiscount += price;
      } else {
        totalDiscount += totalItemDiscount;
      }
    }

    if (state.cart.confirmOrders.length > 0) {
      if (Object.keys(upgrades).length !== 0) {
        price += Number(upgrades.price);

        if (upgrades.discounts) {
          let totalUpgradesDiscount = 0;

          upgrades.discounts.forEach((discount) => {
            totalUpgradesDiscount += Number(discount.amount);
          });

          if (totalUpgradesDiscount > price) {
            totalDiscount += Number(upgrades.price);
          } else {
            totalDiscount += totalUpgradesDiscount;
          }
        }
      }
    }

    if (price >= totalDiscount) {
      price -= totalDiscount;
    } else {
      price = 0;
    }

    return roundUpAmount(price);
  };

  const showTotalOrderPrice = (orders, discounts) => {
    let totalPrice = 0;
    let totalDiscount = 0;

    // eslint-disable-next-line array-callback-return
    orders.forEach((order) => {
      totalPrice += Number(order.overridedPrice || order.price);

      if (order.discounts) {
        order.discounts.forEach((discount) => {
          totalDiscount += discount.amount;
        });
      }

      if (order.upgrades) {
        totalPrice += Number(order.upgrades.price);

        if (order.upgrades.discounts) {
          order.upgrades.discounts.forEach((discount) => {
            totalDiscount += discount.amount;
          });
        }
      }
    });

    discounts.forEach((discount) => {
      totalDiscount += Number(discount.amount);
    });

    if (totalPrice >= totalDiscount) {
      totalPrice -= totalDiscount;
    } else {
      totalPrice = 0;
    }

    return roundUpAmount(totalPrice);
  };

  const setDiscountLabel = (specs) => {
    let newLabel = 'Item Discount';

    return newLabel;
  };

  const handleRemoveSpecs = async (product, order) => {
    const posDateData = localStorage.getItem('transactionDate').split(' ');
    const todayDate = new Date();
    const storedData = JSON.parse(localStorage.getItem('userData'));

    // If there is only 1 item left to cancel, then cancel the order
    const cancelOrder = order.products.length === 1 ? true : false;

    // Update product to cancelled status
    await axios.patch(`${Endpoints.ORDER}/product/cancel`, {
      poNumber: product.poNumber,
      productCode: product.productCode,
      cancelOrder,
      orderId: order.orderId
    });

    await addUserActivityLog(
      storedData.user.firstname,
      storedData.user.lastname,
      storedData.user.employeeId,
      'Transaction',
      `${capitalCase(storedData.user.firstname)} ${capitalCase(
        storedData.user.lastname
      )} has cancelled a item with an No.: ${product.poNumber}.`,
      'Cancelled Item',
      `${posDateData[0]
      } ${todayDate.getHours()}:${todayDate.getMinutes()}:${todayDate.getSeconds()}`,
      online
    );

    store.dispatch(removeItem(product, order.orderId));
    store.dispatch(updateAmounts());
  };

  const handleRemovePackage = (id) => {
    store.dispatch(removePackage(id));
    store.dispatch(updatePackageAmountDue());
  };

  const handleRemoveSpecsDiscount = (specs, discountParam, isUpgrade) => {
    try {
      if (!isUpgrade) {
        if (discountParam.prefix === 'SCD' || discountParam.prefix === 'PWD') {
          specs.discounts.forEach((discount) => {
            if (discount.prefix === 'VAT') {
              if (
                specs.discounts.filter((x) => x.prefix === 'SCD' || x.prefix === 'PWD').length < 2
              ) {
                store.dispatch(removeSpecsDiscount(specs, discount, isUpgrade));
                store.dispatch(updateAmounts());
              }
            }
          });
        } else if (discountParam.prefix === 'VAT') {
          specs.discounts
            .filter((x) => x.prefix === 'SCD' || x.prefix === 'PWD')
            .forEach((discount) => {
              store.dispatch(removeSpecsDiscount(specs, discount, isUpgrade));
              store.dispatch(updateAmounts());
            });
        }
      } else {
        const discounts = [...specs.upgrades.discounts];

        if (discountParam.prefix === 'SCD' || discountParam.prefix === 'PWD') {
          discounts.forEach((discount) => {
            if (discount.prefix === 'VAT') {
              if (discounts.filter((x) => x.prefix === 'SCD' || x.prefix === 'PWD').length < 2) {
                store.dispatch(removeSpecsDiscount(specs, discount, isUpgrade));
                store.dispatch(updateAmounts());
              }
            }
          });
        } else if (discountParam.prefix === 'VAT') {
          discounts
            .filter((x) => x.prefix === 'SCD' || x.prefix === 'PWD')
            .forEach((discount) => {
              store.dispatch(removeSpecsDiscount(specs, discount, isUpgrade));
              store.dispatch(updateAmounts());
            });
        }
      }

      store.dispatch(removeSpecsDiscount(specs, discountParam, isUpgrade));
      store.dispatch(updateAmounts());
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemoveOrderDiscount = (order, discount) => {
    store.dispatch(removeOrderDiscount(order, discount));
    store.dispatch(updateAmounts());
  };


  useEffect(() => {
    const handleApproveFunction = async () => {
      if (approveFunction === 'removeSpecs') {
        await handleRemoveSpecs(activeRow, activeOrder);
        setSupervisorAccessModal(false);
        setApproveFunction('');
        setActiveRow({});
      }
    };

    handleApproveFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveFunction]);

  const handleSupervisorAccess = (toAccess, row, order) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
    setActiveRow(row);
    setActiveOrder(order);
  };


  return (
    <Box {...other}>
      <Scrollbar
        sx={{
          height: maxHeight,
          '& .simplebar-content': {
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          },
          '& .simplebar-track.simplebar-vertical': {
            width: 8
          }
        }}
      >
        {packageCart.confirmPackages.map((specsPackage, index) => (
          <Box
            key={index}
            sx={{
              paddingBottom: (theme) => theme.spacing(2),
              paddingTop: (theme) => theme.spacing(1),
              paddingRight: (theme) => theme.spacing(1)
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" mt={1}>
                <>
                  <RemoveItemIcon onClick={() => handleRemovePackage(specsPackage.id)}>
                    <Icon icon={RemoveIcon} />
                  </RemoveItemIcon>
                  <ItemBox>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box component="section">
                        <Typography noWrap variant="subtitle2">
                          {`${titleCase(specsPackage.itemName.toLowerCase())} x${specsPackage.quantity
                            }`}
                        </Typography>
                        <Typography variant="body2">{`SKU: ${specsPackage.productCode}`}</Typography>
                      </Box>
                    </Stack>
                  </ItemBox>
                  <PriceBox>
                    <Typography variant="subtitle2">
                      {fCurrency('P', roundUpAmount(specsPackage.price * specsPackage.quantity))}
                    </Typography>
                  </PriceBox>
                </>
              </Stack>
            </Box>
          </Box>
        ))}
        {cart.confirmOrders.map((order) => (
          <Box
            key={order.orderId.toString()}
            sx={{
              paddingBottom: (theme) => theme.spacing(2),
              paddingTop: (theme) => theme.spacing(1),
              paddingRight: (theme) => theme.spacing(1)
            }}
          >
            <ItemBox>
              <Box component="section">
                <Typography noWrap variant="subtitle2">
                  {titleCase(`${order.firstName} ${order.lastName}`)}
                </Typography>
                <Typography
                  variant="body2"
                  component="span"
                >{`Order ID: ${order.orderId}`}</Typography>
              </Box>
            </ItemBox>
            {order.products.map((product, i) => (
              <Box
                key={product.poNumber + i}
                sx={{ marginBottom: (theme) => theme.spacing(3) }}
              >
                <Stack direction="row" alignItems="center" mt={1}>
                  <>
                    {state.cart.confirmOrders.length > 0 && (
                      <Stack direction="row">
                        <RemoveItemIcon
                          onClick={() =>
                            user.role === 'cashier'
                              ? handleSupervisorAccess('removeSpecs', product, order)
                              : handleRemoveSpecs(product, order)
                          }
                        >
                          <Icon icon={RemoveIcon} />
                        </RemoveItemIcon>
                        <EditItemIcon onClick={() => {
                          setChangeQuantityModal(true);
                          setSelectedSpecs(product);
                        }}>
                          <Icon icon={EditIcon} />
                        </EditItemIcon>
                      </Stack>
                    )}
                    <ItemBox ml={state.cart.confirmOrders.length < 1 && 3}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box component="section">
                          <Typography noWrap variant="subtitle2">
                            {`${titleCase((product.productName)?.toLowerCase())} x${product.quantity ? product.quantity : 1
                              }`}
                          </Typography>
                          <Typography variant="body2">{`SKU: ${product.productCode ?? ''}`}</Typography>
                        </Box>
                      </Stack>
                    </ItemBox>
                    <PriceBox>
                      <Typography variant="subtitle2">
                        {product.isFree
                          ? 'FREE'
                          : fCurrency(
                            'P',
                            product.quantity
                              ? roundUpAmount(product.price * product.quantity)
                              : product.price
                          )}
                      </Typography>
                    </PriceBox>
                  </>
                </Stack>{
                  (product.overridedPrice && product.overridedPrice !== product.price) &&
                  <ItemBox sx={{ paddingLeft: '30px' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box component="section">
                        <Typography variant="body2" component="span">
                          PRICE OVERRIDE:
                        </Typography>
                      </Box>
                      <PriceBox sx={{ color: 'text.secondary' }}>
                        <Typography variant="subtitle2">
                          {fCurrency('P', roundUpAmount(product.overridedPrice))}
                        </Typography>
                      </PriceBox>
                    </Stack>
                  </ItemBox>
                }

                {product.discounts && (
                  <>
                    {product.discounts.map((discount) => (
                      <Stack
                        direction="row"
                        alignItems="center"
                        mt={1}
                        ml={2}
                        key={uuidv4().toString()}
                      >
                        <RemoveItemIcon
                          onClick={() =>
                            discount.prefix !== 'VATEX' &&
                            handleRemoveSpecsDiscount({ ...product, orderId: order.orderId.toString() }, discount, false)
                          }
                        >
                          <Icon icon={RemoveIcon} />
                        </RemoveItemIcon>
                        <ItemBox>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Box component="section">
                              <Typography noWrap variant="subtitle2">
                                {setDiscountLabel(product)}
                              </Typography>
                              <Typography variant="body2">
                                {discount.value === 'percentage'
                                  ? `${discount.label} (${discount.percentageAmount}%)`
                                  : discount.label}
                              </Typography>
                            </Box>
                          </Stack>
                        </ItemBox>
                        <PriceBox sx={{ color: 'text.secondary' }}>
                          <Typography variant="subtitle2" noWrap>
                            -{fCurrency('P', roundUpAmount(discount.amount))}
                          </Typography>
                        </PriceBox>
                      </Stack>
                    ))}
                    {product.discounts.length !== 0 ? (
                      <PriceBox textAlign="right" mt={1}>
                        <Typography variant="subtitle2">
                          {fCurrency(
                            'P',
                            showTotalItemPrice(
                              product.overridedPrice || product.price * product.quantity,
                              product.discounts,
                              product.upgrades || {}
                            )
                          )}
                        </Typography>
                      </PriceBox>
                    ) : (
                      ''
                    )}
                  </>
                )}
                {/* {specs.upgrades && (!specs.discounts || specs.discounts.length === 0) ? (
                  <PriceBox textAlign="right" mt={1}>
                    <Typography variant="subtitle2">
                      {fCurrency(
                        'P',
                        showTotalItemPrice(
                          Number(specs.overridedPrice || specs.price * specs.quantity),
                          specs.discounts || [],
                          specs.upgrades
                        )
                      )}
                    </Typography>
                  </PriceBox>
                ) : (
                  ''
                )} */}
              </Box>
            ))}
            {order.discounts && (
              <>
                {order.discounts.map((disc) => (
                  <Stack direction="row" alignItems="center" mt={1} key={uuidv4().toString()}>
                    <RemoveItemIcon onClick={() => handleRemoveOrderDiscount(order, disc)}>
                      <Icon icon={RemoveIcon} />
                    </RemoveItemIcon>
                    <ItemBox>
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box component="section">
                          <Typography noWrap variant="subtitle2">
                            Order Discount
                          </Typography>
                          <Typography variant="body2">
                            {disc.value === 'percentage'
                              ? `${disc.label} (${disc.percentageAmount}%)`
                              : disc.label}
                          </Typography>
                        </Box>
                      </Stack>
                    </ItemBox>
                    <PriceBox sx={{ color: 'text.secondary' }}>
                      <Typography variant="subtitle2" noWrap>
                        -{fCurrency('P', disc.amount)}
                      </Typography>
                    </PriceBox>
                  </Stack>
                ))}
                {order.discounts.length !== 0 ? (
                  <PriceBox textAlign="right" mt={1}>
                    <Typography variant="subtitle2">
                      {fCurrency('P', showTotalOrderPrice(order.ordersSpecs, order.discounts))}
                    </Typography>
                  </PriceBox>
                ) : (
                  ''
                )}
              </>
            )}
          </Box>
        ))}
      </Scrollbar>
      <ChangeQuantityModal open={changeQuantityModal} setOpen={setChangeQuantityModal} specs={selectedSpecs} />
      <SupervisorAuthorization
        open={supervisorAccessModal}
        setOpen={setSupervisorAccessModal}
        toAccessFunction={toAccessFunction}
        setApproveFunction={setApproveFunction}
      />
    </Box>
  );
}
