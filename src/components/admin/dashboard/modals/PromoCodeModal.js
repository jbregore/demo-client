import styled from '@emotion/styled';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React, { useState } from 'react';
import useFormErrors from '../../../../hooks/error/useFormError';
import axios from "axios";
import { Backdrop, StyledModal } from '../../../_dashboard/reports/modal/styles/commonModalStyles';
import { Endpoints } from '../../../../enum/Endpoints';
import { SettingsCategoryEnum } from '../../../../enum/Settings';
import addDate from '../../../../utils/addDate';
import addHoursToTime from '../../../../utils/addHoursToTime';
import compareTimes from '../../../../utils/compareTimes';

const PROMO_TYPE = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed Amount' }
];

const ModalCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  width: 700
}));


const PromoCodeModal = ({ context, record, open, setOpen, onCreateCallback, onUpdateCallback }) => {

  const { formErrors, setFormErrors, handleFormErrors, errorHandler } = useFormErrors();

  const settings = JSON.parse(localStorage.getItem('settings'));

  const initialPayload = {
    type: '',
    value: '',
    promoCode: '',
    item: false,
    transaction: false,
    dateStart: '',
    dateEnd: '',
    timeStart: '',
    timeEnd: '',
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
    storeCode: settings[SettingsCategoryEnum.UnitConfig]?.storeCode,
    isRestricted: true
  };

  const [payload, setPayload] = useState(initialPayload);

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let tempPayload = { ...payload };
    switch (name) {
      case "dateStart":
        tempPayload.dateStart = value;
        if ((new Date(tempPayload.dateStart) > new Date(value))) tempPayload.dateEnd = addDate(new Date(value), 1);
        break;
      case "dateEnd":
        let dateEnd = value;
        if (new Date(tempPayload.dateStart) > new Date(value)) dateEnd = addDate(new Date(tempPayload.dateStart), 1);
        tempPayload.dateEnd = dateEnd;
        break;
      case "timeStart":
        let time = value;
        if (compareTimes(tempPayload.timeEnd, value))
          time = {
            timeStart: value,
            timeEnd: addHoursToTime(value, 1)
          };
        if (compareTimes("22:59", value))
          time = {
            timeStart: "23:00",
            timeEnd: "23:59"
          };
        if (typeof time == 'string') tempPayload.timeStart = time;
        else tempPayload = { ...tempPayload, ...time };
        break;
      case "timeEnd":
        let endTime = value;
        if (compareTimes("22:59", tempPayload.timeStart)) tempPayload.timeStart = "23:00";
        if (compareTimes(value, tempPayload.timeStart)) endTime = addHoursToTime(tempPayload.timeStart, 1);
        tempPayload.timeEnd = endTime;
        break;
      default:
        tempPayload[name] = value;
        break;

    }
    setPayload({ ...payload, ...tempPayload });
  };

  const handleSave = () => {
    if (context === 'create') {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    const apiPayload = getApiPayload();

    setIsLoading(true);

    try {
      const result = await axios.post(
        Endpoints.PROMO,
        apiPayload
      );
      if (result.status === 201) {
        setOpen(false);
        setPayload(initialPayload);
        onCreateCallback("success", result.data.message);
      }
    } catch (err) {
      switch (err.response.status) {
        case 422:
          const errors = errorHandler(err);
          console.log(errors);
          setFormErrors(errors);
          break;
        case 401:
          const error401 = errorHandler(err);
          onCreateCallback("error", error401);
          break;
        default: 
          break;  
      }
    }
    setIsLoading(false);

  };

  const getApiPayload = () => {
    const dayActive = {
      mon: payload.isRestricted ? payload.mon : true,
      tue: payload.isRestricted ? payload.tue : true,
      wed: payload.isRestricted ? payload.wed : true,
      thu: payload.isRestricted ? payload.thu : true,
      fri: payload.isRestricted ? payload.fri : true,
      sat: payload.isRestricted ? payload.sat : true,
      sun: payload.isRestricted ? payload.sun : true
    };

    const dayArray = [];

    for (let day in dayActive) {
      if (dayActive[day]) {
        dayArray.push(day);
      }
    }

    const apiPayload = {
      type: payload.type,
      value: payload.value,
      promoCode: payload.promoCode,
      item: payload.item,
      transaction: payload.transaction,
      date: {
        start: payload.dateStart,
        end: payload.dateEnd
      },
      time: {
        start: payload.timeStart,
        end: payload.timeEnd
      },
      days: dayArray,
      storeCode: payload.storeCode,
      isRestricted: payload.isRestricted
    };

    return apiPayload;
  };

  return (
    <StyledModal open={open} onClose={() => setOpen(false)} BackdropComponent={Backdrop}>
      <ModalCard>
        <Typography variant="h6">Add Promo code</Typography>
        <Typography variant="body2">Customize your promo code below.</Typography>
        <Box mt={3}>
          <Grid container direction="row" spacing={3}>
            <Grid item xs={6}>
              <TextField
                id="type"
                name="type"
                label="Type"
                select
                fullWidth
                value={payload.type}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'type')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('type') : ''}
              >
                {PROMO_TYPE.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="value"
                name="value"
                label="Value"
                variant="outlined"
                type="number"
                fullWidth
                value={payload.value}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Box>{payload.type === 'percentage' ? '%' : '₱'}</Box>
                      </InputAdornment>
                    </>
                  )
                }}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'value')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('value') : ''}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                id="promoCode"
                name="promoCode"
                label="Promo Code"
                variant="outlined"
                type="text"
                fullWidth
                value={payload.promoCode}
                onChange={handleChange}
                error={
                  formErrors.errors
                    ? formErrors.errors.some((error) => error.param === 'promoCode')
                    : false
                }
                helperText={formErrors.errors ? handleFormErrors('promoCode') : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">Choose where to apply this promo code.</Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="item"
                      name="item"
                      value={payload.item}
                      onClick={() => setPayload({ ...payload, item: !payload.item })}
                    />
                  }
                  label="Item Discount"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      id="transaction"
                      name="transaction"
                      value={payload.transaction}
                      onClick={() => setPayload({ ...payload, transaction: !payload.transaction })}
                    />
                  }
                  label="Transaction Discount"
                />
              </FormGroup>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" mb={0}>
                Rescriction
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="isRestricted"
                      name="isRestricted"
                      checked={payload.isRestricted}
                      onClick={() =>
                        setPayload({ ...payload, isRestricted: !payload.isRestricted })
                      }
                    />
                  }
                  label="Set schedule"
                />
              </FormGroup>
            </Grid>

            {payload.isRestricted && (
              <>
                <Grid item xs={6}>
                  <TextField
                    id="dateStart"
                    name="dateStart"
                    label="Date Start"
                    variant="outlined"
                    type="date"
                    fullWidth
                    value={payload.dateStart}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="dateEnd"
                    name="dateEnd"
                    label="Date End"
                    variant="outlined"
                    type="date"
                    fullWidth
                    value={payload.dateEnd}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="timeStart"
                    name="timeStart"
                    label="Time Start"
                    variant="outlined"
                    type="time"
                    fullWidth
                    value={payload.timeStart}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="timeEnd"
                    name="timeEnd"
                    label="Time End"
                    variant="outlined"
                    type="time"
                    fullWidth
                    value={payload.timeEnd}
                    onChange={handleChange}
                    InputLabelProps={{
                      shrink: true
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[mon]"
                          checked={payload.mon}
                          onClick={(e) => setPayload({ ...payload, mon: e.target.checked })}
                        />
                      }
                      label="Monday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[tue]"
                          checked={payload.tue}
                          onClick={(e) => setPayload({ ...payload, tue: e.target.checked })}
                        />
                      }
                      label="Tuesday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[wed]"
                          checked={payload.wed}
                          onClick={(e) => setPayload({ ...payload, wed: e.target.checked })}
                        />
                      }
                      label="Wednesday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[thu]"
                          checked={payload.thu}
                          onClick={(e) => setPayload({ ...payload, thu: e.target.checked })}
                        />
                      }
                      label="Thursday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[fri]"
                          checked={payload.fri}
                          onClick={(e) => setPayload({ ...payload, fri: e.target.checked })}
                        />
                      }
                      label="Friday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[sat]"
                          checked={payload.sat}
                          onClick={(e) => setPayload({ ...payload, sat: e.target.checked })}
                        />
                      }
                      label="Saturday"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="day[sun]"
                          checked={payload.sun}
                          onClick={(e) => setPayload({ ...payload, sun: e.target.checked })}
                        />
                      }
                      label="Sunday"
                    />
                  </FormGroup>
                </Grid>
              </>
            )}
            {/* dine */}
          </Grid>
        </Box>
        <Stack direction="row" justifyContent="end" mt={2} spacing={1}>
          <LoadingButton
            size="large"
            variant="contained"
            type="submit"
            loading={isLoading}
            onClick={handleSave}
          >
            Add Promo Code
          </LoadingButton>
        </Stack>
      </ModalCard>
    </StyledModal>
  );
};

export default PromoCodeModal;
