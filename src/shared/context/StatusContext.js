import { createContext } from 'react';

export const StatusContext = createContext({
  printerStatus: {
    status: 'idle',
    message: '',
  },
  setPrinterStatus: () => {},
});
