import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// iconify
import { Icon } from '@iconify/react';
import BackSpaceIcon from '@iconify/icons-eva/backspace-fill';
// material
import { styled } from '@mui/material/styles';
import { Box, Grid, TextField, Typography } from '@mui/material';
// components
import { fNumber } from '../../../../utils/formatNumber';

// ----------------------------------------------------------------------

const KEY_PAD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'backspace', 0, 'enter'];

// ----------------------------------------------------------------------

const RootBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(3)
}));

const BoxNumPad = styled(Box)({
  maxWidth: '100%'
});

const CardNum = styled(Box)(({ theme }) => ({
  height: 'calc(100px - 4px)',
  width: 'calc(100% - 4px)',
  textAlign: 'center',
  fontSize: 36,
  fontWeight: 600,
  borderRadius: 8,
  margin: '2px',
  lineHeight: '100px',
  border: `1px solid ${theme.palette.grey[200]}`,
  color: theme.palette.text.primary,
  cursor: 'pointer',
  backgroundColor: theme.palette.grey[300],
  transition: 'all .15s linear'
}));

// ----------------------------------------------------------------------

CashMethodWthKeyPad.propTypes = {
  total: PropTypes.number.isRequired
};

// ----------------------------------------------------------------------

export default function CashMethodWthKeyPad({ total }) {
  const [value, setValue] = useState('0');
  const [change, setChange] = useState(0);
  const [cashValue, setCashValue] = useState(0);

  // eslint-disable-next-line consistent-return
  const handlePad = (val) => {
    // backspace
    if (val === 'backspace') {
      // backspace
      if (value !== 0 && value.length > 0) {
        setValue((value) => fNumber(value.substring(0, value.length - 1)));
      }
      return false;
    }

    // submit
    if (val === 'enter') {
      // submit
      const cash = parseInt(value.replaceAll(',', ''), 10);
      if (cash < total) {
      } else {
        setCashValue(fNumber(cash));
        setChange(fNumber(cash - total));
        setValue('0');
      }
      return false;
    }

    setValue((value) => fNumber(String(value) + String(val)));
  };

  // listen to key press
  function NumKeyDown(evt) {
    const key = evt.keyCode;

    switch (key) {
      case 48:
      case 96:
        handlePad(0);
        break;
      case 49:
      case 97:
        handlePad(1);
        break;
      case 50:
      case 98:
        handlePad(2);
        break;
      case 51:
      case 99:
        handlePad(3);
        break;
      case 52:
      case 100:
        handlePad(4);
        break;
      case 53:
      case 101:
        handlePad(5);
        break;
      case 54:
      case 102:
        handlePad(6);
        break;
      case 55:
      case 103:
        handlePad(7);
        break;
      case 56:
      case 104:
        handlePad(8);
        break;
      case 57:
      case 105:
        handlePad(9);
        break;
      case 8:
        handlePad('backspace');
        break;
      case 13:
        handlePad('enter');
        break;
      default:
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', (evt) => NumKeyDown(evt));
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', (evt) => NumKeyDown(evt));
    };
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <TextField
            fullWidth
            label="Total Amound Due"
            value={fNumber(total)}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={4}>
          <TextField fullWidth label="Cash" value={cashValue} InputProps={{ readOnly: true }} />
        </Grid>
        <Grid item xs={4}>
          <TextField fullWidth value={change} label="Change" InputProps={{ readOnly: true }} />
        </Grid>
      </Grid>
      <RootBox>
        <Typography variant="h2" textAlign="right" lineHeight="100px">
          {value}
        </Typography>
        <BoxNumPad>
          <Grid container>
            {KEY_PAD.map((pad, index) => (
              <Grid item xs={4} key={`pad_${index}`} onClick={() => handlePad(pad)}>
                {!Number.isNaN(+pad) ? (
                  <CardNum>{pad}</CardNum>
                ) : (
                  <CardNum
                    sx={
                      pad === 'enter'
                        ? {
                            fontSize: 14,
                            backgroundColor: 'primary.main',
                            color: 'common.white'
                          }
                        : {
                            color: 'error.main'
                          }
                    }
                  >
                    {pad === 'enter' ? 'ENTER' : <Icon icon={BackSpaceIcon} />}
                  </CardNum>
                )}
              </Grid>
            ))}
          </Grid>
        </BoxNumPad>
      </RootBox>
    </>
  );
}
