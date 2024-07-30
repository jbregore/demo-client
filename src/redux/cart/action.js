export const setSupervisor = (firstname, lastname) => ({
  type: 'setSupervisor',
  firstname,
  lastname
});

export const updateQuantity = (productCode, quantity) => ({
  type: 'updateQuantity',
  productCode,
  quantity
});

export const updateCustomerName = (firstname, lastname, idNumber) => ({
  type: 'updateCustomerName',
  firstname,
  lastname,
  idNumber
});

export const updateSelectedOrders = (orders) => ({
  type: 'updateSelectedOrders',
  orders
});

export const addSelectedOrders = (orders) => ({
  type: 'addSelectedOrders',
  orders
});

export const addSpecs = (order, specs) => ({
  type: 'addSpecs',
  order,
  specs
});

export const removeItem = (specs, orderId) => ({
  type: 'removeItem',
  specs,
  orderId
});

export const addSpecsDiscount = (orderId, productCode, discount, isUpgrade) => ({
  type: 'addSpecsDiscount',
  orderId,
  productCode,
  discount,
  isUpgrade
});

export const removeSpecsDiscount = (specs, discount, isUpgrade) => ({
  type: 'removeSpecsDiscount',
  specs,
  discount,
  isUpgrade
});

export const addOrder = (order) => ({
  type: 'addOrder',
  order
});

export const addOrderDiscount = (orderId, discount) => ({
  type: 'addOrderDiscount',
  orderId,
  discount
});

export const removeOrderDiscount = (order, discount) => ({
  type: 'removeOrderDiscount',
  order,
  discount
});

export const addOverridedPrice = (orderId, productCode, price) => ({
  type: 'addOverridedPrice',
  orderId,
  productCode,
  price
});

export const addTransactionDiscount = (discount) => ({
  type: 'addTransactionDiscount',
  discount
});

export const removeTransactionDiscount = (discount) => ({
  type: 'removeTransactionDiscount',
  discount
});

export const addPayment = (paymentType, paymentData) => ({
  type: 'addPayment',
  paymentType,
  paymentData
});

export const removePayment = (payment) => ({
  type: 'removePayment',
  payment
});

export const updateAmounts = () => ({
  type: 'updateAmounts'
});

export const clearCart = () => ({
  type: 'clearCart'
});

export const setCashChange = (value) => ({
  type: 'setCashChange',
  value
});

export const setTransactionDate = (value) => ({
  type: 'setTransactionDate',
  value
});

export const updateSelectedReturnOrders = (orders) => ({
  type: 'updateSelectedReturnOrders',
  orders
});

export const addSelectedReturnOrders = (orders) => ({
  type: 'addSelectedReturnOrders',
  orders
});

export const updateReturnAmountDue = () => ({
  type: 'updateReturnAmountDue'
});

export const clearReturnCart = () => ({
  type: 'clearReturnCart'
});

export const addPackage = (specsPackage) => ({
  type: 'addPackage',
  specsPackage
});

export const updatePackageAmountDue = () => ({
  type: 'updatePackageAmountDue'
});

export const removePackage = (id) => ({
  type: 'removePackage',
  id
});

export const clearPackageCart = () => ({
  type: 'clearPackageCart'
});

export const setLoadingState = (value) => ({
  type: 'setLoadingState',
  value
});
