import { Box, Typography } from '@mui/material';
import React from 'react';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

const ReceiptHeader = (props) => {
  const { title, vatable, isReading = false } = props;

  const settings = JSON.parse(localStorage.getItem('settings'));

  if (isReading) {
    return (
      <Box component="section" sx={{ textAlign: 'center' }}>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].storeName}
        </Typography>
        <Typography noWrap variant="subtitle2">
          Owned & Operated By:
        </Typography>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].companyName}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].companyAddress1}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].companyAddress2}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].companyContactNumber ?? ''}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {`ACCR.# ${settings[SettingsCategoryEnum.UnitConfig].headerAccr ?? ''}`}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {`Permit # ${settings[SettingsCategoryEnum.UnitConfig].permit ?? ''}`}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.UnitConfig].snMin ?? ''}
        </Typography>
        <Typography noWrap variant="subtitle2" mt={2}>
          {title}
        </Typography>
        <Typography noWrap variant="subtitle2">
          {`POS # ${settings[SettingsCategoryEnum.UnitConfig].terminalNumber}`}
        </Typography>
      </Box>
    );
  }

  return (
    <Box component="section" sx={{ textAlign: 'center' }}>
      <Typography noWrap variant="subtitle2">
        {settings[SettingsCategoryEnum.CompanyInfo].storeName}
      </Typography>
      <Typography noWrap variant="subtitle2">
        Owned & Operated By:
      </Typography>
      <Typography noWrap variant="subtitle2">
        {settings[SettingsCategoryEnum.CompanyInfo].companyName}
      </Typography>
      <Typography noWrap variant="subtitle2">
        {settings[SettingsCategoryEnum.CompanyInfo].companyAddress1}
      </Typography>
      <Typography noWrap variant="subtitle2">
        {settings[SettingsCategoryEnum.CompanyInfo].companyAddress2}
      </Typography>
      <Typography noWrap variant="subtitle2">
          {settings[SettingsCategoryEnum.CompanyInfo].companyContactNumber ?? ''}
        </Typography>
      <Typography noWrap variant="subtitle2">
        {vatable
          ? `NON VATReg TIN ${settings[SettingsCategoryEnum.UnitConfig].headerVatReg}`
          : `VATReg TIN ${settings[SettingsCategoryEnum.UnitConfig].headerVatReg}`}
      </Typography>
      <Typography noWrap variant="subtitle2">
        {`ACCR.# ${settings[SettingsCategoryEnum.UnitConfig].headerAccr}`}
      </Typography>
      <Typography noWrap variant="subtitle2">
        {`Permit # ${settings[SettingsCategoryEnum.UnitConfig].permit}`}
      </Typography>
      <Typography noWrap variant="subtitle2">
        {settings[SettingsCategoryEnum.UnitConfig].snMin}
      </Typography>
      <Typography noWrap variant="subtitle2" my={2}>
        {title}
      </Typography>
    </Box>
  );
};

export default ReceiptHeader;
