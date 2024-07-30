import { SettingsCategoryEnum } from '../../enum/Settings';
import roundUpAmount from '../roundUpAmount';
import uniqid from 'uniqid';

const cashTypes = ['cash', 'Payo', 'WSI', 'LBC', 'Lalamove', 'Consegnia'];
const nonCashTypes = [
  'Atome',
  'GCash',
  'GCash QR',
  'Maya',
  'Maya QR',
  'PayPal',
  'PayMongo',
  'Card (BDO Credit)',
  'Card (BDO Debit)',
  'Card (Maya Credit)',
  'Card (Maya Debit)'
];
const paymentMethodInfo = {
  cash: {
    cash: {
      paymentMethodString: 'C',
      paymentDescriptionString: 'CASH',
      tenderType: 'C',
      tenderCode: 'C',
      tenderDesc: 'CASH'
    },
    Payo: {
      paymentMethodString: 'PAYO',
      paymentDescriptionString: 'PAYO',
      tenderType: 'PAYO',
      tenderCode: 'PY',
      tenderDesc: 'PAYO'
    },
    WSI: {
      paymentMethodString: 'WSI',
      paymentDescriptionString: 'WSI',
      tenderType: 'WSI',
      tenderCode: 'WSI',
      tenderDesc: 'WSI'
    },
    LBC: {
      paymentMethodString: 'LBC',
      paymentDescriptionString: 'LBC',
      tenderType: 'LBC',
      tenderCode: 'LBC',
      tenderDesc: 'LBC'
    },
    Lalamove: {
      paymentMethodString: 'LALAMOVE',
      paymentDescriptionString: 'LALAMOVE',
      tenderType: 'LALAMOVE',
      tenderCode: 'LLM',
      tenderDesc: 'LALAMOVE'
    },
    Consegnia: {
      paymentMethodString: 'CONSEGNIA',
      paymentDescriptionString: 'CONSEGNIA',
      tenderType: 'CONSEGNIA',
      tenderCode: 'CNSGN',
      tenderDesc: 'CONSEGNIA'
    }
  },
  nonCash: {
    Atome: {
      paymentMethodString: 'ATOME',
      paymentDescriptionString: 'ATOME',
      tenderType: 'ATOME',
      tenderCode: 'ATOME',
      tenderDesc: 'ATOME'
    },
    GCash: {
      paymentMethodString: 'GCASH',
      paymentDescriptionString: 'GCASH',
      tenderType: 'GCASH',
      tenderCode: 'GX',
      tenderDesc: 'GCASH'
    },
    'GCash QR': {
      paymentMethodString: 'GCASH QR',
      paymentDescriptionString: 'GCASH QR',
      tenderType: 'GCASH QR',
      tenderCode: 'GXQR',
      tenderDesc: 'GCASH QR'
    },
    Maya: {
      paymentMethodString: 'MAYA',
      paymentDescriptionString: 'MAYA',
      tenderType: 'MAYA',
      tenderCode: 'MAYA',
      tenderDesc: 'MAYA'
    },
    'Maya QR': {
      paymentMethodString: 'MAYA QR',
      paymentDescriptionString: 'MAYA QR',
      tenderType: 'MAYA QR',
      tenderCode: 'MYQR',
      tenderDesc: 'MAYA QR'
    },
    PayPal: {
      paymentMethodString: 'PAYPAL',
      paymentDescriptionString: 'PAYPAL',
      tenderType: 'PAYPAL',
      tenderCode: 'PP',
      tenderDesc: 'PAYPAL'
    },
    PayMongo: {
      paymentMethodString: 'PAYMONGO',
      paymentDescriptionString: 'PAYMONGO',
      tenderType: 'PAYMONGO',
      tenderCode: 'PM',
      tenderDesc: 'PAYMONGO'
    },
    'Card (BDO Credit)': {
      paymentMethodString: 'CCBDO',
      paymentDescriptionString: 'BDO CREDIT',
      tenderType: 'BDO CREDIT',
      tenderCode: 'CCBDO',
      tenderDesc: 'BDO CREDIT'
    },
    'Card (BDO Debit)': {
      paymentMethodString: 'DBBDO',
      paymentDescriptionString: 'BDO DEBIT',
      tenderType: 'BDO DEBIT',
      tenderCode: 'DBBDO',
      tenderDesc: 'BDO DEBIT'
    },
    'Card (Maya Credit)': {
      paymentMethodString: 'CCMY',
      paymentDescriptionString: 'MAYA CREDIT',
      tenderType: 'MAYA CREDIT',
      tenderCode: 'CCMY',
      tenderDesc: 'MAYA CREDIT'
    },
    'Card (Maya Debit)': {
      paymentMethodString: 'DBMY',
      paymentDescriptionString: 'MAYA DEBIT',
      tenderType: 'MAYA DEBIT',
      tenderCode: 'DBMY',
      tenderDesc: 'MAYA DEBIT'
    }
  }
};

export const computeGlobalDiscount = (cart, specs) => {
  let notZero = 0;
  cart.confirmOrders[0].products.forEach((product) => {
    if (product.price !== 0) {
      notZero += product.quantity * 1;
    }
  });

  const discounts = cart.discounts.reduce((x, y) => x + y.amount, 0);
  const split = (discounts / notZero) * specs.quantity;

  const result = notZero > 1 ? split : discounts;

  return specs.price > 0 ? roundUpAmount(result) : specs.price;
};

export const computeSpecsPrice = (cart, order, product, netPrice = false) => {
  const normalPrice = product.price * product.quantity;
  let computedPrice = product.overridedPrice ? product.overridedPrice : normalPrice;

  if (product.discounts) {
    let totalItemDiscount = 0;

    product.discounts.forEach((discount) => {
      const oneItemDiscount = discount.amount;

      totalItemDiscount += oneItemDiscount;
    });

    if (totalItemDiscount > computedPrice) {
      computedPrice -= computedPrice;
    } else {
      computedPrice -= totalItemDiscount;
    }
  }

  if (order.discounts) {
    let totalNumberOrderSpecs = order.ordersSpecs.length;

    let totalOrderDiscount = 0;

    order.discounts.forEach((discount) => {
      totalOrderDiscount = discount.amount;
    });

    computedPrice -= totalOrderDiscount / totalNumberOrderSpecs;
  }

  if (cart.discounts) {
    let totalNumberTransactionSpecs = 0;

    cart.confirmOrders.forEach((order) => {
      order.products.forEach((product) => {
        const price = product.overridedPrice || product.price * product.quantity;

        if (price !== 0) {
          totalNumberTransactionSpecs += netPrice ? product.quantity * 1 : 1;
        }
      });
    });

    let totalTransactionDiscount = 0;

    cart.discounts
      .filter((x) => !x.percentage)
      .forEach((discount) => {
        totalTransactionDiscount += discount.amount;
      });

    computedPrice -= netPrice
      ? (totalTransactionDiscount / totalNumberTransactionSpecs) * product.quantity
      : totalTransactionDiscount / totalNumberTransactionSpecs;

    let totalTransactionDiscountPercentage = 0;

    cart.discounts
      .filter((x) => x.percentage)
      .forEach((discount) => {
        totalTransactionDiscountPercentage += computeGlobalDiscount(cart, product);
      });

    computedPrice -= totalTransactionDiscountPercentage;
  }

  return roundUpAmount(netPrice ? computedPrice / product.quantity : computedPrice);
};

export const computeVatDetails = (cart, settings) => {
  let vatableSale = 0;
  let vatAmount = 0;
  let vatExempt = 0;
  let vatZeroRated = 0;
  const nonVatable = cart.isNonVat ? cart.amounts.noPayment : 0;

  if (
    cart.discounts.filter(
      (x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'SCD-5%'
    ).length > 0
  ) {
    vatExempt += cart.amounts.subtotal;

    cart.discounts
      .filter((x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS')
      .forEach((discount) => {
        vatExempt -= discount.amount;
      });
  } else if (cart.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
    vatZeroRated += cart.amounts.subtotal;

    cart.discounts
      .filter((x) => x.prefix === 'VATZR')
      .forEach((discount) => {
        vatZeroRated -= discount.amount;
      });
  } else {
    cart.confirmOrders.forEach((order) => {
      order.products.forEach((product, specsIndex) => {
        let productPrice = product.overridedPrice || product.price * product.quantity;

        if (specsIndex === 0) {
          if (cart.discounts) {
            cart.discounts.forEach((discount) => {
              productPrice -= discount.amount;
            });
          }
        }

        if (product.discounts) {
          if (
            product.discounts.filter(
              (x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'VATEX'
            ).length > 0
          ) {
            vatExempt += productPrice;

            product.discounts
              .filter((x) => x.prefix === 'VAT' || x.prefix === 'DPLMTS' || x.prefix === 'VATEX')
              .forEach((discount) => {
                vatExempt -= discount.amount;
              });
          } else if (product.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
            vatZeroRated += productPrice;

            product.discounts
              .filter((x) => x.prefix === 'VATZR')
              .forEach((discount) => {
                vatZeroRated -= discount.amount;
              });
          } else if (product.discounts.filter((x) => x.prefix === 'PNSTMD').length > 0) {
            let pnstmdDiscountAmount = 0;
            product.discounts
              .filter((x) => x.prefix === 'PNSTMD')
              .forEach((discount) => {
                productPrice =
                  settings[SettingsCategoryEnum.UnitConfig].mallAccr === 'sm'
                    ? productPrice
                    : productPrice - discount.amount;
                pnstmdDiscountAmount += discount.amount;
              });

            if (settings[SettingsCategoryEnum.UnitConfig].mallAccr === 'sm') {
              vatAmount = productPrice - productPrice / 1.12;
              vatableSale = productPrice - vatAmount - pnstmdDiscountAmount;
            } else {
              vatAmount = productPrice - productPrice / 1.12;
              vatableSale += productPrice / 1.12;
            }
          } else {
            product.discounts
              .filter((x) => x.prefix !== 'VAT' && x.prefix !== 'SCD' && x.prefix !== 'PWD')
              .forEach((discount) => {
                productPrice -= discount.amount;
              });
            vatAmount -= productPrice / 1.12 - productPrice;
            vatableSale += productPrice / 1.12;
          }
        } else {
          vatableSale += productPrice / 1.12;
          vatAmount += productPrice - productPrice / 1.12;
        }
      });
    });
  }

  vatableSale = cart.isNonVat ? 0 : vatableSale;
  vatAmount = cart.isNonVat ? 0 : vatAmount;
  vatExempt = cart.isNonVat ? 0 : vatExempt;
  vatZeroRated = cart.isNonVat ? 0 : vatZeroRated;

  return {
    vatableSale: roundUpAmount(vatableSale),
    vatAmount: roundUpAmount(vatAmount),
    vatExempt: roundUpAmount(vatExempt),
    vatZeroRated: roundUpAmount(vatZeroRated),
    nonVatable: roundUpAmount(nonVatable),
    totalAmount: roundUpAmount(vatableSale + vatAmount + vatExempt + vatZeroRated + nonVatable)
  };
};

export const formatCartPayments = (cart) => {
  let subtotal = cart.amounts.subtotal;

  cart.payments.forEach((payment, index) => {
    let tenderType = '';
    let tenderCode = '';
    let tenderDesc = '';
    let paymentAmount = payment.amount;

    if (payment.value === 'cash' && payment.amount > subtotal) {
      paymentAmount -= cart.amounts.cashChange;
    }

    subtotal -= paymentAmount;

    if (payment.value === 'card') {
      if (payment.cardType === 'debit-card') {
        tenderType = 'EPS';
        tenderCode = 'DC';
        tenderDesc = 'DEBIT CARD';
      } else if (payment.cardType === 'credit-card') {
        tenderType = 'CC';
        tenderCode = 'CC';
        tenderDesc = 'DEBIT CARD';
      }
    } else if (payment.value === 'cash') {
      tenderType = 'C';
      tenderCode = 'C';
      tenderDesc = 'CASH';

      if (payment.ecomType === 'lazada') {
        tenderType = 'LZDP';
        tenderCode = 'LZDP';
        tenderDesc = 'LZDP';
      } else if (payment.ecomType === 'shoppee') {
        tenderType = 'SHPP';
        tenderCode = 'SHPP';
        tenderDesc = 'SHPP';
      } else if (payment.ecomType === 'zalora') {
        tenderType = 'ZLR';
        tenderCode = 'ZLR';
        tenderDesc = 'ZLR';
      }
    } else if (payment.value === 'eWallet') {
      tenderType = paymentMethodInfo.nonCash[payment.label].tenderType;
      tenderDesc = paymentMethodInfo.nonCash[payment.label].tenderDesc;
      tenderCode = paymentMethodInfo.nonCash[payment.label].tenderCode;
    } else if (payment.value === 'cashOnDelivery' && cashTypes.includes(payment.label)) {
      tenderType = paymentMethodInfo.cash[payment.label].tenderType;
      tenderDesc = paymentMethodInfo.cash[payment.label].tenderDesc;
      tenderCode = paymentMethodInfo.cash[payment.label].tenderCode;
    } else if (payment.value === 'giftCard') {
      if (payment.type === 'Sodexo') {
        tenderType = 'GC';
        tenderCode = 'SDX';
        tenderDesc = 'SODEXO';
      } else if (payment.type === 'E-coupon') {
        tenderType = 'GC';
        tenderCode = 'ECPN';
        tenderDesc = 'ECOUPON';
      } else if (payment.type === 'Digital GC') {
        tenderType = 'GC';
        tenderCode = 'DGC';
        tenderDesc = 'DIGITALGC';
      } else {
        tenderType = 'GC';
        tenderCode = 'GIFTCARD';
        tenderDesc = 'GIFTCARD';
      }
    } else if (payment.value === 'rmes') {
      /* eslint-disable */
      tenderType = 'REDEMPTION';
      tenderCode = 'RD';
      tenderDesc = 'REDEMPTION';
      /* eslint-enable */
    }

    let refNum;

    if (payment.slipNumber) {
      refNum = payment.slipNumber;
    } else if (payment.referenceNumber) {
      refNum = payment.referenceNumber;
    } else if (payment.siNumber) {
      refNum = payment.siNumber;
    } else {
      // eslint-disable-next-line
      refNum = '';
    }
  });

  return cart;
};

export const getOrdersToUpdate = (cart, posDate, settings, productDate, cashierId) => {
  let ordersToUpdate = [];
  let posDiscountOrderLog = [];
  let posDiscountItemLog = [];
  let posSCPWDReport = []

  cart.confirmOrders.forEach(async (order) => {
    if (order.discounts) {
      order.discounts.forEach((discount) => {
        posDiscountOrderLog.push({
          discountLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
          discount: discount.prefix,
          amount: roundUpAmount(discount.amount),
          orderId: order.orderId,
          isUpgrade: 'n',
          cashierId: cashierId,
          storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
          discountDate: productDate
        });
      });
    }

    let updatedProducts = [];
    order.products.forEach((product) => {
      if (product.discounts) {
        product.discounts.forEach((discount) => {
          posDiscountItemLog.push({
            discountLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
            discount: discount.prefix,
            amount: roundUpAmount(discount.amount),
            poNumber: product.poNumber,
            receiptLabel: discount.receiptLabel,
            percentageAmount: discount.percentageAmount || 0,
            isUpgrade: 'n',
            cashierId: cashierId,
            storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
            discountDate: productDate
          })
        });

        product.discounts.forEach((discount) => {
          if (discount.prefix === 'SCD' || discount.prefix === 'PWD') {
            posSCPWDReport.push({
              scPwdReportId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
              firstname: order.firstName,
              lastname: order.lastName,
              idNumber: discount.idNumber,
              type: discount.prefix === 'SCD' ? 'Senior Citizen' : 'PWD',
              grossSales: product.price,
              discountAmount: discount.amount,
              reportDate: productDate,
              storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode
            })
          }
        });
      }

      let isVatable = true;
      let isVatZeroRated = true;
      if (cart.discounts.filter((x) => x.prefix === 'VAT' || x.prefix === 'VATEX').length > 0) {
        isVatable = false;
      } else if (cart.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
        isVatZeroRated = false;
      }

      if (product.discounts) {
        if (
          product.discounts.filter((x) => x.prefix === 'VAT' || x.prefix === 'VATEX').length > 0
        ) {
          isVatable = false;
        } else if (product.discounts.filter((x) => x.prefix === 'VATZR').length > 0) {
          isVatable = false;
        }
      }

      const isNonVat = settings[SettingsCategoryEnum.UnitConfig].nonVat;
      const newPrice = product.price !== 0 ? computeSpecsPrice(cart, order, product) : 0;
      const updatedProduct = {
        ...product,
        price: newPrice,
        origPrice: product.price,
        status: 'paid',
        isVatable: isNonVat ? false : isVatable,
        isVatZeroRated,
        vatAmount: product.price !== 0 ? Math.abs(newPrice / 1.12 - newPrice) : 0
      };

      updatedProducts.push(updatedProduct);

      const paymentMethods = [];
      /* eslint-disable */
      let paymentMethodString = '';
      let paymentDescriptionString = '';
      /* eslint-enable */

      cart.payments.forEach((payment) => {
        if (!paymentMethods.includes(payment.value)) {
          if (cart.payments.length < 2) {
            paymentMethods.push(payment.value);

            if (payment.value === 'card') {
              if (payment.cardType === 'debit-card') {
                paymentMethodString = 'EPS';
                paymentDescriptionString = 'DEBIT CARD';
              } else if (payment.cardType === 'credit-card') {
                paymentMethodString = 'CC';
                paymentDescriptionString = 'CREDIT CARD';
              }
            } else if (payment.value === 'eWallet' && nonCashTypes.includes(payment.label)) {
              paymentMethodString = paymentMethodInfo.nonCash[payment.label].paymentMethodString;
              paymentDescriptionString =
                paymentMethodInfo.nonCash[payment.label].paymentDescriptionString;
            } else if (payment.value === 'cashOnDelivery' && cashTypes.includes(payment.label)) {
              paymentMethodString = paymentMethodInfo.cash[payment.label].paymentMethodString;
              paymentDescriptionString =
                paymentMethodInfo.cash[payment.label].paymentDescriptionString;
            } else if (payment.value === 'cash') {
              paymentMethodString = 'C';
              paymentDescriptionString = 'CASH';
            } else if (payment.value === 'rmes') {
              paymentMethodString = 'RD';
              paymentDescriptionString = 'REDEMPTION';
            } else if (payment.value === 'b2b') {
              paymentMethodString = 'B2BAR';
              paymentDescriptionString = 'B2B AR';
            }
          } else {
            paymentMethods.push(payment.value);
            if (payment.value === 'card') {
              if (payment.cardType === 'debit-card') {
                paymentMethodString += 'EPS, ';
                paymentDescriptionString += 'DEBIT CARD, ';
              } else if (payment.cardType === 'credit-card') {
                paymentMethodString += 'CC, ';
                paymentDescriptionString += 'CREDIT CARD, ';
              }
            } else if (payment.value === 'eWallet' && nonCashTypes.includes(payment.label)) {
              paymentMethodString +=
                paymentMethodInfo.nonCash[payment.label].paymentMethodString + ', ';
              paymentDescriptionString +=
                paymentMethodInfo.nonCash[payment.label].paymentDescriptionString + ', ';
            } else if (payment.value === 'cashOnDelivery' && cashTypes.includes(payment.label)) {
              paymentMethodString +=
                paymentMethodInfo.cash[payment.label].paymentMethodString + ', ';
              paymentDescriptionString +=
                paymentMethodInfo.cash[payment.label].paymentDescriptionString + ', ';
            } else if (payment.value === 'cash') {
              paymentMethodString += 'C, ';
              paymentDescriptionString += 'CASH, ';
            } else if (payment.value === 'rmes') {
              paymentMethodString += 'RD, ';
              paymentDescriptionString += 'REDEMPTION';
            } else if (payment.value === 'b2b') {
              paymentMethodString += 'B2BAR, ';
              paymentDescriptionString += 'B2B AR, ';
            }
          }
        }
      });
    });

    ordersToUpdate.push({
      products: updatedProducts,
      orderId: order.orderId,
      transactionDate: posDate,
      total: cart.amounts.noPayment
    });
  });

  return { ordersToUpdate, posDiscountOrderLog, posDiscountItemLog, posSCPWDReport };
};

export const getPaymentLogsToInsert = (cart, productDate, settings, cashierId) => {
  let paymentLogArray = [];

  let subtotal = cart.amounts.subtotal;
  cart.payments.forEach((payment) => {
    let paymentAmount = payment.amount;
    let paymentMethod = payment.label;

    if ((payment.value === 'cash' || payment.value.startsWith('CUSTOM::c_')) && payment.amount > subtotal) {
      paymentAmount -= cart.amounts.cashChange;
    }

    subtotal -= paymentAmount;

    if (payment.value === 'card') {
      if (payment.cardType === 'debit-card') {
        paymentMethod += ' (EPS)';
      } else {
        paymentMethod += ' (Mastercard)';
      }
    }

    paymentLogArray.push({
      paymentLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
      customPaymentKey: payment.value,
      type: payment.type || '',
      amount: paymentAmount,
      excessGcType: payment.excessGcType || '',
      excessGcAmount: payment.excessGcAmount || 0,
      excessCash: payment.excessCash || 0,
      excessRmes: payment.excessRmes || 0,
      currency: 'php',
      status: 'success',
      method: paymentMethod,
      cashierId: cashierId,
      storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
      paymentDate: productDate
    });
  });

  return paymentLogArray;
};

export const getSCPWDDiscounts = (cart, productDate, settings) => {
  let scPwdDiscountArray = [];

  cart.discounts.forEach((discount) => {
    let customerFirstname = '';
    let customerLastname = '';

    cart.confirmOrders.forEach((order) => {
      customerFirstname = order.firstname;
      customerLastname = order.lastname;
    });

    if (discount.prefix === 'SCD-5%') {
      scPwdDiscountArray.push({
        scPwdReportId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
        firstname: customerFirstname,
        lastname: customerLastname,
        idNumber: discount.idNumber,
        type: discount.prefix === 'SCD-5%' ? 'Senior Citizen' : 'PWD',
        grossSales: cart.amounts.noPayment,
        discountAmount: discount.amount,
        reportDate: productDate,
        storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode
      });
    }
  });

  return scPwdDiscountArray;
};

export const getPosDiscountTransactions = (cart, productDate, settings, cashierId) => {
  let posDiscountTransactionArray = [];

  cart.discounts.forEach((discount) => {
    posDiscountTransactionArray.push({
      discountLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storeCode),
      discount: discount.prefix,
      amount: roundUpAmount(discount.amount),
      // txnNumber,
      receiptLabel: discount.receiptLabel,
      percentageAmount: discount.percentageAmount || 0,
      isUpgrade: 'n',
      cashierId: cashierId,
      storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode,
      discountDate: productDate
    })
  });

  return posDiscountTransactionArray
}

export const getPromoCodeLogs = (cart, settings) => {
  let promoCodeLogArray = [];

  cart.discounts.forEach((discount) => {
    if (discount.promoCodeId) {
      promoCodeLogArray.push({
        promoCodeLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storedCode),
        promoCodeId: discount.promoCodeId,
        promoType: discount.promoType,
        value: discount.promoValue,
        discountType: 'transaction',
        storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode
      })
    }
  });

  cart.confirmOrders.forEach((order) => {
    if (order.discounts) {
      order.discounts.forEach((discount) => {
        if (discount.promoCodeId) {
          promoCodeLogArray.push({
            promoCodeLogId: uniqid(settings[SettingsCategoryEnum.UnitConfig].storedCode),
            promoCodeId: discount.promoCodeId,
            promoType: discount.promoType,
            value: discount.promoValue,
            discountType: 'order',
            storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode
          })
        }
      });
    }

    order.products.forEach((product) => {
      if (product.discounts) {
        product.discounts.forEach((discount) => {
          if (discount.promoCodeId) {
            promoCodeLogArray.push({
              promoCodeLogId: uniqid(
                settings[SettingsCategoryEnum.UnitConfig].storedCode
              ),
              promoCodeId: discount.promoCodeId,
              promoType: discount.promoType,
              value: discount.promoValue,
              discountType: 'item',
              storeCode: settings[SettingsCategoryEnum.UnitConfig].storeCode
            })
          }
        });
      }
    });
  });

  return promoCodeLogArray
}