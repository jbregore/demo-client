import { Box, Typography } from '@mui/material';
import React from 'react';
import { SettingsCategoryEnum } from '../../../../enum/Settings';

const ReceiptFooter = (props) => {
  const { vatable } = props;

  const settings = JSON.parse(localStorage.getItem('settings'));

  return (
    <>
      <Box component="section" sx={{ mt: 2, textAlign: 'center' }}>
        <Typography noWrap variant="subtitle2">
          Umbra Digital Company
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          930 unit 510 Aurora Blvd. Cubao, Quezon City, Metro Manila, Philippines
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          {`VAT REG TIN: ${settings[SettingsCategoryEnum.BirInfo].vatReg}`}
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          {`Accreditation: ${settings[SettingsCategoryEnum.BirInfo].accr} Date issued: ${
            settings[SettingsCategoryEnum.BirInfo].accrDateIssued
          }`}
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          {`PTU No. ${settings[SettingsCategoryEnum.UnitConfig].permit} Date issued: ${
            settings[SettingsCategoryEnum.UnitConfig].ptuDateIssued
          }`}
        </Typography>
      </Box>
      <Box sx={{ my: 2, textAlign: 'center' }}>
        <Typography noWrap variant="subtitle2" sx={{ mt: 1, whiteSpace: 'initial' }}>
          "Thank you for shopping"
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          Visit us at
        </Typography>
        <Typography noWrap variant="subtitle2" sx={{ whiteSpace: 'initial' }}>
          {settings[SettingsCategoryEnum.CompanyInfo].companyWebsiteLink}
        </Typography>
      </Box>
      {vatable && (
        <Box component="section" sx={{ my: 2, textAlign: 'center' }}>
          <Typography noWrap variant="subtitle2" sx={{ mt: 1, whiteSpace: 'initial' }}>
            THIS DOCUMENT IS NOT VALID FOR CLAIM OF INPUT TAX
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ReceiptFooter;
