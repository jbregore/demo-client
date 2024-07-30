import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// material
import { Grid, TextField, Button, MenuItem } from '@mui/material';
// price or value formatter
import { fNumber } from '../../../../utils/formatNumber';
// redux
import { store } from '../../../../redux/cart/store';
import { addPayment, updateAmounts, setCashChange } from '../../../../redux/cart/action';

// ----------------------------------------------------------------------

const GIFT_CARDS = [
  { id: 'S100', label: 'Sodexo 100', type: 'Sodexo', value: 100 },
  { id: 'S350', label: 'Sodexo 350', type: 'Sodexo', value: 350 },
  { id: 'S400', label: 'Sodexo 400', type: 'Sodexo', value: 400 },
  { id: 'S500', label: 'Sodexo 500', type: 'Sodexo', value: 500 },
  { id: 'S1000', label: 'Sodexo 1000', type: 'Sodexo', value: 1000 },
  { id: 'E100', label: 'E-coupon 100', type: 'E-coupon', value: 100 },
  { id: 'E200', label: 'E-coupon 200', type: 'E-coupon', value: 200 },
  { id: 'E500', label: 'E-coupon 500', type: 'E-coupon', value: 500 },
  { id: 'DGC', label: 'Digital GC', type: 'Digital GC', value: 0 }
];

const GIFT_CARD_CHANGE_TYPES = [
  { id: 'cash', label: 'Cash' },
  { id: 'giftCard', label: 'Gift Card' }
];

// ----------------------------------------------------------------------

GiftCardMethod.propTypes = {
  setOpen: PropTypes.func.isRequired
};

// ----------------------------------------------------------------------

export default function GiftCardMethod({ setOpen }) {
  const state = store.getState();
  const [cart] = useState(state.cart.confirmOrders.length === 0 ? state.returnCart : state.cart);

  const [giftCards, setGiftCards] = useState([]);

  // payment states
  const [gcRefNum, setGcRefNum] = useState('');
  const [gcValue, setGcValue] = useState('');
  const [gcLabel, setGcLabel] = useState('');
  const [gcType, setGcType] = useState('');
  const [value, setValue] = useState('');
  const [gcChangeType, setGcChangeType] = useState(GIFT_CARD_CHANGE_TYPES[0].id);
  const [gcChangeRefNumber, setGcChangeRefNumber] = useState('');

  const [excessGcType, setExcessGcType] = useState('');

  // eslint-disable-next-line consistent-return
  const applyGiftCard = () => {
    if (gcRefNum === '' || gcValue === undefined || value === 0) {
      alert('Invalid gift card!');
      return false;
    }

    handleAddPayment();
  };

  // remove gift card function
  const removeGiftCard = () => {
    setGcRefNum('');
    setValue(giftCards[0].value);
    setGcValue(giftCards[0].id);
    setGcLabel(giftCards[0].label);
    setGcType(giftCards[0].type);
  };

  // handle add payment function
  const handleAddPayment = () => {
    if (
      gcChangeType === 'giftCard' &&
      giftCards.filter((x) => value - cart.amounts.amountDue >= x.value).length === 0
    ) {
      alert('Invalid gift card!');

      return false;
    }

    if (value > 0) {
      const paymentData = {
        amount: value,
        label: gcLabel,
        refNumber: gcRefNum,
        type: gcType
      };

      if (value > cart.amounts.amountDue) {
        paymentData.gcChangeType = gcChangeType;

        if (
          gcChangeType === 'giftCard' &&
          giftCards.filter((x) => value - cart.amounts.amountDue >= x.value).length > 0
        ) {
          paymentData.gcChangeRefNumber = gcChangeRefNumber;
          paymentData.excessGcType = giftCards.filter((x) => x.id === excessGcType)[0].type;
          paymentData.excessGcAmount = giftCards.filter((x) => x.id === excessGcType)[0].value;
          paymentData.excessCash =
            giftCards.filter((x) => x.id === gcValue)[0].value -
            cart.amounts.amountDue -
            giftCards.filter((x) => x.id === excessGcType)[0].value;
        } else {
          paymentData.excessCash = value - cart.amounts.amountDue;
        }
      }

      if (paymentData.excessCash) {
        if (paymentData.excessCash !== 0) {
          store.dispatch(setCashChange(roundUpAmount(paymentData.excessCash)));
        }
      }

      store.dispatch(addPayment('gift_card', paymentData));
      store.dispatch(updateAmounts());
      setOpen(false);
    }

    return true;
  };

  // handle change gift card value function
  const handleChange = (evt) => setGcRefNum(evt.target.value);

  const roundUpAmount = (num) => {
    num = Number(num);
    num = Number(num) !== 0 ? Number(num.toFixed(3)).toFixed(2) : '0.00';

    return num;
  };

  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('settings'));

    const customGiftCards = settings.paymentMethod
      .filter((p) => p.active && p.type?.startsWith('gc_'))
      .map((gc) => ({
        id: gc.key,
        label: gc.title,
        type: gc.method,
        value: gc.properties.amount
      }));
    const allGiftCards = [...GIFT_CARDS, ...customGiftCards];

    setGiftCards(allGiftCards);

    setGcValue(allGiftCards[0].id);
    setGcLabel(allGiftCards[0].label);
    setGcType(allGiftCards[0].type);
    setValue(allGiftCards[0].value);

    setExcessGcType(
      allGiftCards.filter((x) => value - cart.amounts.amountDue >= x.value).length > 0
        ? allGiftCards.filter((x) => value - cart.amounts.amountDue >= x.value)[0].id
        : ''
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Gift Card Type"
            value={gcValue}
            onChange={(e) => {
              setGcValue(e.target.value);
              setGcLabel(giftCards.filter((x) => x.id === e.target.value)[0].label);
              setValue(giftCards.filter((x) => x.id === e.target.value)[0].value);
              setGcType(giftCards.filter((x) => x.id === e.target.value)[0].type);
            }}
          >
            {giftCards.map((gc) => (
              <MenuItem key={gc.id} value={gc.id} name={gc.value}>
                {gc.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            id="giftCardValue"
            label="Amount"
            value={gcValue !== 'DGC' ? fNumber(value) : value}
            inputProps={{
              readOnly:
                (gcValue !== 'DGC' &&
                  !(gcValue.startsWith('CUSTOM::gc_') && gcType === 'Digital Gift Card')) ||
                (gcValue.startsWith('CUSTOM::gc_') && value !== 0)
            }}
            onChange={(e) => setValue(e.target.value.replace(/,/, ''))}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            id="giftCard"
            label="Gift Card Reference Number"
            value={gcRefNum}
            type="text"
            onChange={(e) => handleChange(e)}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        {value - cart.amounts.amountDue > 0 && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              id="giftCardValue"
              label="Excess Gift Card Amount"
              value={roundUpAmount(value - cart.amounts.amountDue)}
              inputProps={{ readOnly: true }}
            />
          </Grid>
        )}
        {value > cart.amounts.amountDue && (
          <>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Gift Card Change Type"
                value={gcChangeType}
                onChange={(e) => {
                  setGcChangeType(
                    GIFT_CARD_CHANGE_TYPES.filter((x) => x.id === e.target.value)[0].id
                  );
                }}
              >
                {GIFT_CARD_CHANGE_TYPES.map((gc) => (
                  <MenuItem key={gc.id} value={gc.id}>
                    {gc.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {gcChangeType === 'giftCard' &&
              giftCards.filter((x) => value - cart.amounts.amountDue >= x.value).length > 0 && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="giftCard"
                      label="Gift Card Change Reference Number"
                      value={gcChangeRefNumber}
                      type="text"
                      onChange={(e) => setGcChangeRefNumber(e.target.value)}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                      disabled={
                        giftCards.filter((x) => value - cart.amounts.amountDue >= x.value)
                          .length === 0
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Gift Card Change Amount"
                      value={excessGcType}
                      onChange={(e) =>
                        setExcessGcType(giftCards.filter((x) => x.id === e.target.value)[0].id)
                      }
                      disabled={
                        giftCards.filter((x) => value - cart.amounts.amountDue >= x.value)
                          .length === 0
                      }
                    >
                      {giftCards
                        .filter((x) => x.id !== 'DGC' && value - cart.amounts.amountDue >= x.value)
                        .map((gc) => (
                          <MenuItem key={gc.id} value={gc.id} name={gc.value}>
                            {gc.label}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                </>
              )}
          </>
        )}

        <Grid item xs={12} textAlign="right">
          <Button
            variant="contained"
            color="error"
            size="large"
            sx={{ minWidth: 150, mr: 2 }}
            onClick={() => removeGiftCard()}
          >
            Discard
          </Button>
          <Button
            variant="contained"
            size="large"
            sx={{ minWidth: 150 }}
            onClick={() => applyGiftCard()}
          >
            Apply Gift Card
          </Button>
        </Grid>
      </Grid>
    </>
  );
}
