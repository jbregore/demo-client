const { format } = require('date-fns');

const getSiNumbers = (zReadData, type) => {
  const { from, to } = zReadData.SI_NUM;
  return type === 'from' ? from : to;
};

const getVatableSales = (zReadData) => {
  return zReadData.isNonVat ? 0 : zReadData.vat.VAT_DETAILS.vatableSales;
};

const getVatAmount = (zReadData) => {
  return zReadData.isNonVat ? 0 : zReadData.vat.VAT_DETAILS.vatAmount;
};

const getVatExemptSales = (zReadData) => {
  return zReadData.isNonVat ? 0 : zReadData.vat.VAT_DETAILS.vatExemptSales;
};

const getVatZeroRated = (zReadData) => {
  return zReadData.isNonVat ? 0 : zReadData.vat.VAT_DETAILS.vatZeroRated;
};

const getRegularDiscount = (zReadData) => {
  return zReadData.discounts.REGULAR_DISCOUNTS.total || 0;
};

const getSpecialDiscount = (zReadData) => {
  return zReadData.discounts.SPECIAL_DISCOUNTS.total || 0;
};

const getVoided = (zReadData) => {
  const cancelledAmount = zReadData.cashierAudit.VOID_TXN_AMOUNT || 0;

  return cancelledAmount;
};

const getReturned = (zReadData) => {
  const returnedAmount = Math.abs(zReadData.payments.nonCash.returns.RMES_ISSUANCE.total);

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

const fDateTimeSuffix = (date) => {
  return format(new Date(date), 'MM/dd/yyyy hh:mm a');
};

export const parsePosGrandAccumulatedSales = (preview) => {
  const { zReadData } = preview.data;

  return {
    posDate: fDateTimeSuffix(preview.transactionDate).split(' ')[0],
    beginningSi: getSiNumbers(zReadData, 'from'),
    endingSi: getSiNumbers(zReadData, 'to'),
    grandBeginning: zReadData.ACCUMULATED_SALES.old,
    grandEnding: zReadData.ACCUMULATED_SALES.new,
    salesCount: zReadData.cashierAudit.NUM_SALES_TXN,
    grossSales: zReadData.SALES.gross,
    vatableSales: getVatableSales(zReadData),
    vatAmount: getVatAmount(zReadData),
    vatExempt: getVatExemptSales(zReadData),
    zeroRated: getVatZeroRated(zReadData),
    regularDiscount: getRegularDiscount(zReadData),
    specialDiscount: getSpecialDiscount(zReadData),
    voidCount: zReadData.cashierAudit.NUM_VOID_TXN,
    voidAmount: getVoided(zReadData),
    returnCount: zReadData.payments.nonCash.returns.RMES_ISSUANCE.count,
    returnAmount: getReturned(zReadData),
    totalDeductions: getTotalDiscount(zReadData),
    vatSpecialDiscount: 0,
    others: 0,
    totalVatAdj: 0,
    vatPayable: getVatAmount(zReadData),
    netSales: getNetSales(zReadData),
    otherIncome: 0,
    salesOverrun: getSalesOverrun(zReadData),
    totalNetSales: getTotalNetSales(zReadData),
    remarks: '',
    basketSize: zReadData.cashierAudit.AVE_BASKET
  };
};
