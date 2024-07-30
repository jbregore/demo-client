const Endpoints = {
    LOGIN: `${process.env.REACT_APP_API_URL}/login`,
    ELECTRON: `${process.env.REACT_APP_API_URL}/electron`,
    SETTINGS: `${process.env.REACT_APP_API_URL}/settings`,
    EMPLOYEE: `${process.env.REACT_APP_API_URL}/employee`,
    REPORTS: `${process.env.REACT_APP_API_URL}/reports`,
    ACTIVITY: `${process.env.REACT_APP_API_URL}/activity`,
    PROMO: `${process.env.REACT_APP_API_URL}/promo-code`,
    INVENTORY: `${process.env.REACT_APP_API_URL}/inventory`,
    ORDER: `${process.env.REACT_APP_API_URL}/order`,
    TRANSACTION: `${process.env.REACT_APP_API_URL}/transaction`,
    ACCREDITATION: `${process.env.REACT_APP_API_URL}/accreditation`,
};


module.exports = {
    Endpoints
};