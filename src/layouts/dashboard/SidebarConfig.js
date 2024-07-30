import { Icon } from '@iconify/react';
import pieChartOutline from '@iconify/icons-eva/pie-chart-outline';
import peopleOutline from '@iconify/icons-eva/people-outline';
// import shoppingBagOutline from '@iconify/icons-eva/shopping-bag-outline';
import shoppingCartOutline from '@iconify/icons-eva/shopping-cart-outline';
import activityOutline from '@iconify/icons-eva/activity-fill';
import giftOutline from '@iconify/icons-ant-design/gift-outline';
import transactionOutline from '@iconify/icons-fluent/payment-16-regular';
import infoOutline from '@iconify/icons-eva/info-outline';
import printerOutline from '@iconify/icons-eva/printer-outline';
import settingsOutline from '@iconify/icons-eva/settings-2-outline';
import codeOutline from '@iconify/icons-eva/code-outline';
import listOutline from '@iconify/icons-eva/list-outline';
// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={28} height={28} />;

const sidebarConfig = [
  {
    title: 'dashboard',
    path: '/app/orders',
    icon: getIcon(shoppingCartOutline),
    notAllowed: ['it_admin', 'supervisor'],
    key: 'Alt + 1'
  },
  {
    title: 'transactions',
    path: '/app/transactions',
    icon: getIcon(transactionOutline),
    notAllowed: ['it_admin'],
    key: 'Alt + 2'
  },
  // {
  //   title: 'inventory',
  //   path: '/app/inventory',
  //   icon: getIcon(shoppingBagOutline),
  //   notAllowed: [],
  //   key: 'Alt + 3'
  // },
  {
    title: 'Reports',
    path: '/app/reports',
    icon: getIcon(infoOutline),
    notAllowed: ['it_admin'],
    key: 'Alt + 3'
  },
  {
    title: 'employees',
    path: '/app/employees',
    icon: getIcon(peopleOutline),
    notAllowed: ['cashier', 'supervisor', 'it_admin'],
    key: 'Alt + 4'
  },
  {
    title: 'promo codes',
    path: '/app/promo-codes',
    icon: getIcon(giftOutline),
    notAllowed: ['cashier', 'supervisor', 'it_admin'],
    key: 'Alt + 5'
  },
  {
    title: 'sales report',
    path: '/app/dashboard',
    icon: getIcon(pieChartOutline),
    notAllowed: ['cashier', 'it_admin'],
    key: 'Alt + 6'
  },
  {
    title: 'activitiy logs',
    path: '/app/activity',
    icon: getIcon(activityOutline),
    notAllowed: ['cashier', 'supervisor', 'it_admin'],
    key: 'Alt + 7'
  },
  {
    title: 'Receipts',
    path: '/app/receipt',
    icon: getIcon(printerOutline),
    notAllowed: ['cashier', 'it_admin'],
    key: 'Alt + 8'
  },

  {
    title: 'Settings',
    path: '/app/settings',
    icon: getIcon(settingsOutline),
    notAllowed: ['cashier', 'supervisor', 'manager'],
    key: 'Alt + 9'
  },
  {
    title: 'Cashiers',
    path: '/app/cashier',
    icon: getIcon(peopleOutline),
    notAllowed: ['cashier', 'manager', 'it_admin'],
    key: 'Alt + 9'
  },
  {
    title: 'Scripts',
    path: '/app/scripts',
    icon: getIcon(codeOutline),
    notAllowed: ['cashier', 'supervisor', 'manager'],
    key: ''
  },
  // {
  //   title: 'Updates',
  //   path: '/app/updates',
  //   icon: getIcon(downloadOutline),
  //   notAllowed: ['cashier', 'supervisor', 'manager'],
  //   key: 'Alt + 0'
  // },
  // {
  //   title: 'Backups',
  //   path: '/app/backups',
  //   icon: getIcon(dbOutline),
  //   notAllowed: ['cashier', 'supervisor', 'manager'],
  //   key: ''
  // },
  {
    title: 'Info',
    path: '/app/info',
    icon: getIcon(listOutline),
    notAllowed: ['cashier', 'supervisor', 'manager'],
    key: ''
  },
  
];

export default sidebarConfig;
