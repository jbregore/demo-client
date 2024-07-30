import { useState } from 'react';

export const useStatus = () => {
    const [printerStatus, setPrinterStatus] = useState({
        status: 'idle',
        message: '',
    });

    return {
        printerStatus,
        setPrinterStatus,
    };
}