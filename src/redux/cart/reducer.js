import { filter } from 'lodash';
import { SettingsCategoryEnum } from '../../enum/Settings';

const initialState = {
  cart: {
    confirmOrders: [],
    selectedOrders: [],
    discounts: [],
    payments: [],
    amounts: {
      subtotal: 0,
      amountDue: 0,
      noPayment: 0,
      totalPayment: 0,
      cashChange: 0
    }
  },
  returnCart: {
    confirmOrders: [],
    selectedOrders: [],
    amountDue: 0
  },
  packageCart: {
    confirmPackages: [],
    amountDue: 0
  },
  transactionDate: false,
  supervisor: {
    firstname: '',
    lastname: ''
  },
  isLoading: false
};

export function CartReducer(state = initialState, action) {
  switch (action.type) {
    case 'setSupervisor': {
      return {
        ...state,
        supervisor: {
          firstname: action.firstname,
          lastname: action.lastname
        }
      };
    }
    case 'updateQuantity': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {
        order.products.forEach((product) => {
          if (product.productCode === action.productCode) {
            product.quantity = Number(product.quantity) + Number(action.quantity);
          }
        });
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'updateCustomerName': {
      const newConfirmOrders = [...state.cart.confirmOrders];
      newConfirmOrders.forEach((order) => {
        order.firstName = action.firstname;
        order.lastName = action.lastname;
        order.idNumber = action.idNumber;
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'updateSelectedOrders': {
      return {
        ...state,
        cart: {
          ...state.cart,
          selectedOrders: action.orders
        }
      };
    }
    case 'addSelectedOrders': {
      const orders = action.orders;

      orders.forEach((order) => {
        order.products.forEach((specs) => {
          if (specs.isVatable) {
            specs.discounts = [
              {
                id: 0,
                label: 'VAT',
                percentage: false,
                percentageAmount: 12,
                prefix: 'VATEX',
                receiptLabel: '(VAT)'
              }
            ]
          }
        })
      })

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: orders
        }
      };
    }
    case 'addSpecs': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order, index) => {
        if (index === 0) {
          order.products.push(action.specs);
        }
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'removeItem': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {

        if (order.orderId === action.orderId) {
          if (order.products) {
            const filteredItems = filter(
              order.products,
              (product) => product.productCode !== action.specs.productCode
            );

            if (filteredItems.length === 0) {
              order.discounts = [];
            }

            order.products = filteredItems;
          }
        }
      });

      let countEmptyOrder = 0;

      newConfirmOrders.forEach((order) => {
        if (order.products.length === 0) {
          countEmptyOrder += 1;
        }
      });

      if (countEmptyOrder === newConfirmOrders.length) {
        state.cart.discounts = [];
        state.cart.payments = [];
        state.cart.amounts = {
          subtotal: 0,
          amountDue: 0,
          noPayment: 0,
          totalPayment: 0,
          cashChange: 0
        };
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'addSpecsDiscount': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {
        if (order.orderId === action.orderId) {
          order.products.forEach((product) => {
            if (product.productCode === action.productCode) {
              if (action.isUpgrade) {
                if (product.upgrades.discounts) {
                  product.upgrades.discounts.push({
                    id: product.upgrades.discounts.length,
                    ...action.discount
                  });
                } else {
                  product.upgrades.discounts = [
                    {
                      id: 0,
                      ...action.discount
                    }
                  ];
                }
              } else if (!action.isUpgrade) {
                if (product.discounts) {
                  product.discounts.push({
                    id: product.discounts.length,
                    ...action.discount
                  });
                } else {
                  product.discounts = [
                    {
                      id: 0,
                      ...action.discount
                    }
                  ];
                }
              }
            }
          });
        }
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'removeSpecsDiscount': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {
        if (order.orderId === action.specs.orderId) {
          order.products.forEach((specs) => {
            if (specs.productCode === action.specs.productCode) {
              if (action.isUpgrade) {
                const filteredSpecs = filter(
                  specs.upgrades.discounts,
                  (_discount) => _discount.id !== action.discount.id
                );

                specs.upgrades.discounts = filteredSpecs;
              } else {
                const filteredSpecs = filter(
                  specs.discounts,
                  (_discount) => _discount.id !== action.discount.id
                );

                specs.discounts = filteredSpecs;
              }
            }
          });
        }
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'addOrder': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.push(action.order);

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'addOrderDiscount': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {
        if (order.orderId === action.orderId) {
          if (order.discounts) {
            order.discounts.push({
              id: order.discounts.length,
              ...action.discount
            });
          } else {
            order.discounts = [
              {
                id: 0,
                ...action.discount
              }
            ];
          }
        }
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'removeOrderDiscount': {
      const newConfirmOrders = [...state.cart.confirmOrders];

      newConfirmOrders.forEach((order) => {
        if (order.orderId === action.order.orderId) {
          if (order.discounts) {
            const filteredSpecs = filter(
              order.discounts,
              (_discount) => _discount.id !== action.discount.id
            );

            order.discounts = filteredSpecs;
          }
        }
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'addOverridedPrice': {
      const newConfirmOrders = [...state.cart.confirmOrders];
      const { orderId, price, productCode } = action;

      newConfirmOrders.forEach((order) => {
        if (order.orderId === orderId) {
          order.products.forEach((product) => {
            if (product.productCode === productCode) {
              product.overridedPrice = Number(price);

              if (product.discounts) {
                product.discounts = [];
              }
            }
          });
        }
      });
      return {
        ...state,
        cart: {
          ...state.cart,
          confirmOrders: newConfirmOrders
        }
      };
    }
    case 'addTransactionDiscount': {
      const newTransactionDiscounts = [...state.cart.discounts];

      newTransactionDiscounts.push({
        id: newTransactionDiscounts.length,
        ...action.discount
      });

      return {
        ...state,
        cart: {
          ...state.cart,
          discounts: newTransactionDiscounts
        }
      };
    }
    case 'removeTransactionDiscount': {
      let newTransactionDiscounts = [...state.cart.discounts];

      const filteredDiscounts = filter(
        newTransactionDiscounts,
        (discount) => discount.id !== action.discount.id
      );

      newTransactionDiscounts = filteredDiscounts;

      return {
        ...state,
        cart: {
          ...state.cart,
          discounts: newTransactionDiscounts
        }
      };
    }
    case 'addPayment': {
      const newPayments = [...state.cart.payments];

      if (action.paymentType === 'cash') {
        newPayments.push({
          id: newPayments.length,
          value: 'cash',
          label: 'Cash',
          amount: action.paymentData.cash
        });
      } else if (
        action.paymentType === 'lazada' ||
        action.paymentType === 'shoppee' ||
        action.paymentType === 'zalora'
      ) {
        newPayments.push({
          id: newPayments.length,
          value: 'cash',
          label: 'Cash',
          ecomType: action.paymentType,
          amount: action.paymentData.cash
        });
      } else if (action.paymentType === 'card') {
        newPayments.push({
          id: newPayments.length,
          value: 'card',
          label: 'Card',
          amount: Number(action.paymentData.amount),
          cardType: action.paymentData.cardType,
          digitCode: action.paymentData.digitCode,
          expDate: action.paymentData.expDate,
          slipNumber: action.paymentData.slipNumber
        });
      } else if (action.paymentType === 'gift_card') {
        const giftCardData = {
          id: newPayments.length,
          value: 'giftCard',
          label: action.paymentData.label,
          referenceNumber: action.paymentData.refNumber,
          amount: Number(action.paymentData.amount),
          type: action.paymentData.type
        };

        if (action.paymentData.gcChangeType) {
          giftCardData.changeType = action.paymentData.gcChangeType;
          giftCardData.excessCash = action.paymentData.excessCash;

          if (action.paymentData.gcChangeType === 'giftCard') {
            giftCardData.changeRefNumber = action.paymentData.gcChangeRefNumber;
            giftCardData.excessGcType = action.paymentData.excessGcType;
            giftCardData.excessGcAmount = action.paymentData.excessGcAmount;
          }
        }

        newPayments.push(giftCardData);
      } else if (action.paymentType === 'e-wallet') {
        const eTypeLabels = {
          'atome': 'Atome',
          'gcash': 'GCash',
          'maya': 'Maya',
          'paymongo': 'PayMongo',
          'paypal': 'PayPal',
          'gcashQr': 'GCash QR',
          'mayaQr': 'Maya QR',
        };

        newPayments.push({
          id: newPayments.length,
          value: 'eWallet',
          label: eTypeLabels[action.paymentData.eType],
          referenceNumber: action.paymentData.refNumber,
          amount: Number(action.paymentData.amount)
        });
      } else if (action.paymentType === 'cashOnDelivery') {
        const eTypeLabels = {
          'lbc': 'LBC',
          'wsi': 'WSI',
          'payo': 'Payo',
          'lalamove': 'Lalamove',
          'consegnia': 'Consegnia',
        };

        newPayments.push({
          id: newPayments.length,
          value: 'cashOnDelivery',
          label: eTypeLabels[action.paymentData.eType],
          referenceNumber: action.paymentData.refNumber,
          amount: Number(action.paymentData.amount)
        });
      } else if (action.paymentType === 'rmes') {
        newPayments.push({
          id: newPayments.length,
          value: 'rmes',
          label: 'RMES',
          excessRmes: action.paymentData.remainingBal,
          amount: Number(action.paymentData.rmesAmount),
          origTransactionDate: action.paymentData.origTransactionDate,
          siNumber: action.paymentData.siNumber
        });
      }
      else if (action.paymentType === 'cardNew') {
        const newCardTypeLabels = {
          'bdoCredit': 'Card (BDO Credit)',
          'bdoDebit': 'Card (BDO Debit)',
          'mayaCredit': 'Card (Maya Credit)',
          'mayaDebit': 'Card (Maya Debit)',
        };

        newPayments.push({
          id: newPayments.length,
          value: 'cardNew',
          label: newCardTypeLabels[action.paymentData.cardType],
          amount: Number(action.paymentData.amount),
          cardType: action.paymentData.cardType,
          digitCode: action.paymentData.digitCode,
          expDate: action.paymentData.expDate,
          approvalCode: action.paymentData.approvalCode
        });
      } else if (action.paymentType.startsWith('CUSTOM::')) {
        const payment = {
          id: newPayments.length,
          type: action.paymentData.type.split('_')[1],
          method: action.paymentData.id,
          value: action.paymentType,
          label: action.paymentData.label,
          referenceNumber: action.paymentData.refNumber,
          amount: Number(action.paymentData.amount),
          tenderType: action.paymentData.tenderType,
          tenderCode: action.paymentData.tenderCode,
          tenderDesc: action.paymentData.tenderDesc,
          cardType: action.paymentData.type.split('_')[1] === 'card' ? action.paymentData.method : '',
          digitCode: action.paymentData.cardNumber,
          expDate: action.paymentData.cardExpiration
        };
        newPayments.push(payment);
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          payments: newPayments
        }
      };
    }
    case 'removePayment': {
      let newPayments = [...state.cart.payments];

      const filteredPayments = filter(newPayments, (payment) => payment.id !== action.payment.id);

      newPayments = filteredPayments;

      return {
        ...state,
        cart: {
          ...state.cart,
          payments: newPayments
        }
      };
    }
    case 'updateAmounts': {
      const settings = JSON.parse(localStorage.getItem('settings'));

      let originalTotal = 0;
      let subtotal = 0;
      let amountDue = 0;
      let noPayment = 0;

      state.cart.confirmOrders.forEach((order) => {
        let orderTotalAmount = 0;
        let orderTotalDiscount = 0;

        order.products.forEach((product) => {
          const specsPrice = product.overridedPrice || product.price * product.quantity;
          orderTotalAmount += specsPrice;
          if (product.discounts && product.discounts.length > 0) {
            let totalItemDiscount = 0;

            product.discounts.forEach((discount) => {
              let itemDiscount = 0;

              if (
                discount.prefix === 'SCD' ||
                discount.prefix === 'SCD-5%' ||
                discount.prefix === 'PWD' ||
                discount.prefix === 'PNSTMD' ||
                discount.prefix === 'VAT'
              ) {
                if (settings[SettingsCategoryEnum.UnitConfig].nonVat === false) {
                  itemDiscount = specsPrice / 1.12;
                } else {
                  itemDiscount = specsPrice;
                }

                if (discount.prefix === 'VAT') {
                  itemDiscount = specsPrice - itemDiscount;
                } else {
                  itemDiscount *= discount.prefix === 'SCD-5%' ? 0.05 : 0.2;
                }
              } else if (discount.prefix === 'VATZR') {
                itemDiscount = specsPrice / discount.percentageAmount;
                itemDiscount = specsPrice - itemDiscount;
              } else if (discount.prefix === 'DPLMTS') {
                itemDiscount = specsPrice / discount.percentageAmount;
                itemDiscount = specsPrice - itemDiscount;
              } else if (discount.prefix === 'VATEX') {
                if (settings[SettingsCategoryEnum.UnitConfig].nonVat === false) {
                  itemDiscount = specsPrice / 1.12;
                } else {
                  itemDiscount = specsPrice;
                }

                itemDiscount = specsPrice - itemDiscount;
              } else {
                itemDiscount = discount.percentage
                  ? (discount.percentageAmount / 100) * (specsPrice - totalItemDiscount)
                  : discount.amount;
              }

              discount.amount = itemDiscount;
              totalItemDiscount += itemDiscount;
            });

            if (totalItemDiscount >= specsPrice) {
              orderTotalDiscount += specsPrice;
            } else {
              orderTotalDiscount += totalItemDiscount;
            }
          }
        });

        // if (order.discounts) {
        //   let totalOrderDiscount = 0;
        //   order.discounts.forEach((discount) => {
        //     let orderDiscount = 0;

        //     if (discount.percentage) {
        //       orderDiscount = (discount.percentageAmount / 100) * orderTotalAmount;
        //     } else {
        //       orderDiscount = discount.amount;
        //     }

        //     discount.amount = orderDiscount;
        //     totalOrderDiscount += orderDiscount;
        //   });

        //   if (totalOrderDiscount > orderTotalAmount) {
        //     orderTotalDiscount += orderTotalAmount;
        //   } else {
        //     orderTotalDiscount += totalOrderDiscount;
        //   }
        // }

        originalTotal += orderTotalAmount;
        noPayment += orderTotalAmount - orderTotalDiscount;

        if (orderTotalAmount >= orderTotalDiscount) {
          orderTotalAmount -= orderTotalDiscount;
        } else {
          orderTotalAmount = 0;
        }

        amountDue += orderTotalAmount;
        subtotal += orderTotalAmount;
      });

      let transactionTotalDiscount = 0;

      state.cart.discounts.forEach((discount) => {
        let transactionDiscount = 0;

        if (discount.prefix === 'SCD-5%' || discount.prefix === 'VAT') {
          if (settings[SettingsCategoryEnum.UnitConfig].nonVat === false) {
            transactionDiscount = noPayment / 1.12;
          } else {
            transactionDiscount = noPayment;
          }

          if (discount.prefix === 'VAT') {
            transactionDiscount = noPayment - transactionDiscount;
          } else {
            transactionDiscount *= discount.prefix === 'SCD-5%' ? 0.05 : 0.2;
          }
        } else if (discount.prefix === 'VATZR') {
          transactionDiscount = noPayment / discount.percentageAmount;
          transactionDiscount = noPayment - transactionDiscount;
        } else if (discount.prefix === 'DPLMTS') {
          transactionDiscount = noPayment / discount.percentageAmount;
          transactionDiscount = noPayment - transactionDiscount;
        } else {
          transactionDiscount = discount.percentage
            ? (discount.percentageAmount / 100) * (noPayment - transactionTotalDiscount)
            : discount.amount;
        }

        discount.amount = transactionDiscount;
        transactionTotalDiscount += transactionDiscount;
      });

      if (amountDue >= transactionTotalDiscount) {
        amountDue -= transactionTotalDiscount;
      } else {
        amountDue = 0;
      }

      noPayment -= transactionTotalDiscount;

      let paymentTotalAmount = 0;

      state.cart.payments.forEach((payment) => {
        paymentTotalAmount += Number(payment.amount);
      });

      if (amountDue >= paymentTotalAmount) {
        amountDue -= paymentTotalAmount;
      } else {
        amountDue = 0;
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          amounts: {
            ...state.cart.amounts,
            originalTotal,
            subtotal,
            amountDue,
            noPayment,
            totalPayment: paymentTotalAmount
          }
        }
      };
    }
    case 'clearCart':
      return {
        ...state,
        cart: {
          confirmOrders: [],
          selectedOrders: [],
          discounts: [],
          payments: [],
          amounts: {
            subtotal: 0,
            amountDue: 0,
            noPayment: 0,
            totalPayment: 0,
            cashChange: 0
          }
        }
      };
    case 'setCashChange':
      return {
        ...state,
        cart: {
          ...state.cart,
          amounts: {
            ...state.cart.amounts,
            cashChange: action.value
          }
        }
      };
    case 'setTransactionDate':
      return {
        ...state,
        transactionDate: action.value
      };
    case 'updateSelectedReturnOrders': {
      return {
        ...state,
        returnCart: {
          ...state.returnCart,
          selectedOrders: action.orders
        }
      };
    }
    case 'addSelectedReturnOrders': {
      return {
        ...state,
        returnCart: {
          ...state.returnCart,
          confirmOrders: action.orders
        }
      };
    }
    case 'updateReturnAmountDue': {
      let newAmountDue = 0;

      state.returnCart.confirmOrders.forEach((order) => {
        order.ordersSpecs.forEach((specs) => {
          newAmountDue -= specs.price;
        });
      });

      return {
        ...state,
        returnCart: {
          ...state.returnCart,
          amountDue: newAmountDue
        }
      };
    }
    case 'clearReturnCart':
      return {
        ...state,
        returnCart: {
          confirmOrders: [],
          selectedOrders: []
        }
      };
    case 'addPackage': {
      const newConfirmPackages = [...state.packageCart.confirmPackages];

      action.specsPackage.id = newConfirmPackages.length;
      newConfirmPackages.push(action.specsPackage);

      return {
        ...state,
        packageCart: {
          ...state.packageCart,
          confirmPackages: newConfirmPackages
        }
      };
    }
    case 'updatePackageAmountDue': {
      let newAmountDue = 0;

      state.packageCart.confirmPackages.forEach((specsPackage) => {
        newAmountDue += specsPackage.price * specsPackage.quantity;
      });

      return {
        ...state,
        packageCart: {
          ...state.packageCart,
          amountDue: newAmountDue
        }
      };
    }
    case 'removePackage': {
      let newConfirmPackages = [...state.packageCart.confirmPackages];

      const filteredSpecs = filter(
        newConfirmPackages,
        (_specsPackage) => _specsPackage.id !== action.id
      );

      newConfirmPackages = filteredSpecs;

      return {
        ...state,
        packageCart: {
          ...state.packageCart,
          confirmPackages: newConfirmPackages
        }
      };
    }
    case 'clearPackageCart':
      return {
        ...state,
        packageCart: {
          confirmPackages: [],
          amountDue: 0
        }
      };

    case 'setLoadingState':
      return {
        ...state,
        isLoading: action.value
      };
    default:
      return state;
  }
}
