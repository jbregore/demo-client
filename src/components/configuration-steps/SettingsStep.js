import React, { useEffect, useState } from 'react'
import Page from '../Page';
import { Alert, Box, Button, Container, Grid, MenuItem, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { MallAccrEnum, SettingsCategoryEnum, smSalesTypeEnum } from '../../enum/Settings';
import { Endpoints } from '../../enum/Endpoints';
import axios from 'axios';
import umbraSystemsHelper from '../../graphql/umbra-systems-helper';
import { useLazyQuery } from '@apollo/client';
import { GET_POS_PAYMENT_METHODS_QUERY } from '../../graphql/queries';
import { isProduction } from '../../utils/isProduction';
import { paymentMethodsStatic, printerData } from '../../pages/Settings';
import { LoadingButton } from '@mui/lab';
import { UpdateBackupDatabase } from '../_dashboard/settings';

const SettingsStep = ({onSaveCallback}) => {

    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
    const [appVersion, setAppVersion] = useState(null);

    const [fetchPosPaymentMethods, { loading: paymentMethodsLoading }] = useLazyQuery(
        GET_POS_PAYMENT_METHODS_QUERY
    );

    const [open, setOpen] = useState(false);
    const [openUpdateBackupDatabase, setOpenUpdateBackupDatabase] = useState(false);

    const [devOptions, setDevOptions] = useState(
        !isProduction() &&
        (JSON.parse(localStorage.getItem("devOptions") ?? "{}") ?? {
            umbraSysAPI: "http://localhost:4000",
            checkKey: false
        }));

    function setOption(name, value) {
        const tempDevOptions = { ...devOptions };
        tempDevOptions[name] = value;
        setDevOptions(tempDevOptions);
    }

    useEffect(() => {
        const getAppVersion = async () => {
            try {
                const res = await axios.get(`${Endpoints.ELECTRON}/version`);

                const version = res.data.version;
                setAppVersion(version);
            } catch (err) { }
        };

        getAppVersion();
    }, []);

    const [settingsData, setSettingsData] = useState({
        [SettingsCategoryEnum.UnitConfig]: {
            isConfigured: true,
            startingDate: '',
            storeCode: '',
            warehouseCode: '',
            printerName: '',
            printerWidth: printerData[0],
            doublePrinting: false,
            nonVat: false,
            snMin: '',
            headerVatReg: '',
            headerAccr: '',
            devMode: false,
            ecomm: false,
            mallAccr: MallAccrEnum.None,
            terminalNumber: '1',
            tenantId: '',
            permit: '',
            ptuDateIssued: '',
            companyCode: '',
            contractNumber: '',
            contractName: ''
        },
        [SettingsCategoryEnum.BirInfo]: {
            vatReg: '',
            accr: '',
            birVersion: '',
            accrDateIssued: '',
            taxCodeExempt: '',
            taxCodeRegular: '',
            taxCodeZeroRated: ''
        },
        [SettingsCategoryEnum.CompanyInfo]: {
            storeName: '',
            companyName: '',
            companyAddress1: '',
            companyAddress2: '',
            companyWebsiteLink: '',
            companyContactNumber: ''
        },
        [SettingsCategoryEnum.PaymentMethod]: paymentMethodsStatic
    });

    useEffect(() => {
        const getCompanySettings = async () => {
            try {
                const res = await axios.get(Endpoints.SETTINGS);
                const onlineSettingsData = res.data.data;

                let allMethod;
                if (onlineSettingsData[SettingsCategoryEnum.PaymentMethod].length) {
                    let newMethod = settingsData[SettingsCategoryEnum.PaymentMethod].filter(
                        (obj1) =>
                            !onlineSettingsData[SettingsCategoryEnum.PaymentMethod].some(
                                (obj2) => obj1.id === obj2.id
                            )
                    );

                    allMethod = onlineSettingsData[SettingsCategoryEnum.PaymentMethod].concat(newMethod);
                } else {
                    allMethod = settingsData[SettingsCategoryEnum.PaymentMethod];
                }

                setSettingsData({
                    ...settingsData,
                    ...{ id: onlineSettingsData._id },
                    ...onlineSettingsData,
                    ...{
                        paymentMethod: allMethod.filter((paymentMethod) => {
                            return !['eWallet', 'cashOnDelivery'].includes(paymentMethod.id);
                        })
                    },
                    [SettingsCategoryEnum.UnitConfig]: {
                        ...onlineSettingsData[SettingsCategoryEnum.UnitConfig],
                        isConfigured: true,
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.SM && {
                            smTransactionType:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].smTransactionType || '',
                            smSalesType: onlineSettingsData[SettingsCategoryEnum.UnitConfig].smSalesType || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.MegaWorld && {
                            mwcSalesTypeCode:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].mwcSalesTypeCode || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.Ayala && {
                            companyCode: onlineSettingsData[SettingsCategoryEnum.UnitConfig].companyCode || '',
                            contractName: onlineSettingsData[SettingsCategoryEnum.UnitConfig].contractName || '',
                            contractNumber:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].contractNumber || '',
                            slClPath: onlineSettingsData[SettingsCategoryEnum.UnitConfig].slClPath || '',
                            ayalaHost: onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaHost || '',
                            ayalaPort: onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaPort || 21,
                            ayalaUser: onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaUser || '',
                            ayalaPassword:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaPassword || '',
                            ayalaRootPath:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaRootPath || '',
                            ayalaDomain: onlineSettingsData[SettingsCategoryEnum.UnitConfig].ayalaDomain || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.Robinson && {
                            robinsonsFTPHost:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPHost || '',
                            robinsonsFTPUsername:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPUsername || '',
                            robinsonsFTPPassword:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPPassword || '',
                            robinsonsFTPRootPath:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPRootPath || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.ICM && {
                            icmSalesTypeCode:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].icmSalesTypeCode || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.Araneta && {
                            aranetaMallCode:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaMallCode || '',
                            aranetaContractNumber:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaContractNumber || '',
                            aranetaOutletNumber:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaOutletNumber || '',
                            aranetaSalesType:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaSalesType || '',
                            aranetaOpenField1:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaOpenField1 || '',
                            aranetaOpenField2:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].aranetaOpenField2 || ''
                        }),
                        ...(onlineSettingsData[SettingsCategoryEnum.UnitConfig].mallAccr ===
                            MallAccrEnum.EVIA && {
                            eviaSalesCode:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].eviaSalesCode || '',
                            eviaStallCode:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].eviaStallCode || '',
                            eviaLocalSavePath:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].eviaLocalSavePath || '',
                            eviaNetworkSavePath:
                                onlineSettingsData[SettingsCategoryEnum.UnitConfig].eviaNetworkSavePath || ''
                        })
                    }
                });

                // eslint-disable-next-line no-empty
            } catch (err) { }
        };

        getCompanySettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateCompanySettings = async () => {
        try {
            if (!isProduction()) localStorage.setItem("devOptions", JSON.stringify(devOptions));
            const res = await axios.patch(Endpoints.SETTINGS, settingsData, {
                withCredentials: true
            });

            if (res) {
                setOpen(true);
                onSaveCallback()
            }

            umbraSystemsHelper.updatePosDevice({
                posConfig: JSON.stringify(settingsData)
            });

            // eslint-disable-next-line no-empty
        } catch (err) { }
    };

    const handlePaymentMethod = (e, id) => {
        const elementsIndex = settingsData[SettingsCategoryEnum.PaymentMethod].findIndex(
            (element) => element.id === id
        );
        let newMethod = [...settingsData[SettingsCategoryEnum.PaymentMethod]];

        newMethod[elementsIndex] = {
            ...newMethod[elementsIndex],
            active: e.target.value
        };

        setSettingsData({ ...settingsData, [SettingsCategoryEnum.PaymentMethod]: newMethod });
    };

    const handleUpdateSettings = (section, val) => {
        setSettingsData({
            ...settingsData,
            [section]: {
                ...settingsData[section],
                ...val
            }
        });
    };

    function handleUpdatePaymentMethods(data) {
        const existingMethods = [...settingsData[SettingsCategoryEnum.PaymentMethod]];

        const customMethods = data?.allPosPaymentMethods;
        if (customMethods) {
            for (let i = 0; i < customMethods.length; i++) {
                const customMethod = customMethods[i];
                let existingMethod = existingMethods.find((element) => element.id === customMethod.id);

                if (existingMethod) {
                    existingMethod = {
                        ...existingMethod,
                        active: customMethod.active
                    };
                } else {
                    existingMethods.push({
                        ...customMethod,
                        active: false
                    });
                }
            }
        }

        setSettingsData({ ...settingsData, paymentMethod: existingMethods });
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const vertical = 'top';
    const horizontal = 'right';

    return (
        <Page title="Settings">
            <Container sx={{ paddingTop: 5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Box component="section">
                        <Typography variant="h4" gutterBottom>
                            Settings
                        </Typography>
                        <Typography variant="body" gutterBottom>
                            Source code version: v{appVersion}
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Button variant="contained" size="medium" onClick={updateCompanySettings}>
                            Save Changes
                        </Button>
                    </Stack>
                </Stack>
                <Grid container spacing={3} pb={4}>
                    {!isProduction() && <>
                        <Grid item xs={12}>
                            <Typography variant="h4">Developer Options</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                select
                                label="Umbra Systems Integration"
                                type="text"
                                value={devOptions.checkKey}
                                onChange={(e) => { setOption("checkKey", e.target.value); }}
                            >
                                <MenuItem value={true}>Yes</MenuItem>
                                <MenuItem value={false}>No</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="API Host"
                                type="text"
                                value={devOptions.umbraSysAPI}
                                onChange={(e) => { setOption("umbraSysAPI", e.target.value); }}
                            />
                        </Grid>
                    </>
                    }
                    <Grid item xs={12}>
                        <Typography variant="h4">Unit Configuration</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Starting Date"
                            type="date"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].startingDate}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    startingDate: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Store Code"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].storeCode}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    storeCode: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Warehouse Code"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].warehouseCode}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    warehouseCode: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Printer Name"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].printerName}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    printerName: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="Double Printing"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].doublePrinting}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    doublePrinting: e.target.value
                                })
                            }
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="Printer Paper Width"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig]?.printerWidth?.label}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    printerWidth: printerData.filter(({ label }) => label === e.target.value)[0]
                                })
                            }
                        >
                            {printerData.map(({ id, label }) => (
                                <MenuItem key={id} value={label}>
                                    {label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="Non VAT"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].nonVat}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    nonVat: e.target.value
                                })
                            }
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="SN / MIN"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].snMin}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    snMin: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="VAT REG"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].headerVatReg}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    headerVatReg: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="ACCR"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].headerAccr}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    headerAccr: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="Dev Mode"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].devMode}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    devMode: e.target.value
                                })
                            }
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            {/* <MenuItem value={false}>No</MenuItem> */}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="ECOMM"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].ecomm}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    ecomm: e.target.value
                                })
                            }
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            select
                            label="Mall"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].mallAccr}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    mallAccr: e.target.value
                                })
                            }
                        >
                            <MenuItem value={MallAccrEnum.None}>None</MenuItem>
                            {/* <MenuItem value={MallAccrEnum.Ayala}>Ayala</MenuItem>
                            <MenuItem value={MallAccrEnum.MegaWorld}>Megaworld</MenuItem>
                            <MenuItem value={MallAccrEnum.Robinson}>Robinson</MenuItem>
                            <MenuItem value={MallAccrEnum.SM}>SM</MenuItem>
                            <MenuItem value={MallAccrEnum.ICM}>ICM</MenuItem>
                            <MenuItem value={MallAccrEnum.Araneta}>Araneta</MenuItem>
                            <MenuItem value={MallAccrEnum.EVIA}>EVIA</MenuItem> */}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Terminal #"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].terminalNumber}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    terminalNumber: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Tenant ID"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].tenantId}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    tenantId: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="PERMIT"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].permit}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    permit: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="PTU Date Issued"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.UnitConfig].ptuDateIssued}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                    ptuDateIssued: e.target.value
                                })
                            }
                        />
                    </Grid>
                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.SM && (
                        <>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Sales Type"
                                    type="select"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].smSalesType}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            smSalesType: e.target.value
                                        })
                                    }
                                >
                                    <MenuItem value={smSalesTypeEnum.smOne}>SM01 - Regular Sales</MenuItem>
                                    <MenuItem value={smSalesTypeEnum.smTwo}>SM02 - Novelty</MenuItem>
                                    <MenuItem value={smSalesTypeEnum.smThree}>SM03 - Sublease</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Transaction Type"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].smTransactionType}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            smTransactionType: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.Araneta && (
                        <>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Mall Code"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaMallCode}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaMallCode: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Contract Number"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaContractNumber}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaContractNumber: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Open Field 1"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaOpenField1}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaOpenField1: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Open Field 2"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaOpenField2}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaOpenField2: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Outlet Number"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaOutletNumber}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaOutletNumber: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Sales Type"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].aranetaSalesType}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            aranetaSalesType: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.MegaWorld && (
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="Megaworld Sales Type Code"
                                type="text"
                                value={settingsData[SettingsCategoryEnum.UnitConfig].mwcSalesTypeCode}
                                onChange={(e) =>
                                    handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                        mwcSalesTypeCode: e.target.value
                                    })
                                }
                            />
                        </Grid>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.ICM && (
                        <Grid item xs={4}>
                            <TextField
                                fullWidth
                                label="ICM Sales Type Code"
                                type="text"
                                value={settingsData[SettingsCategoryEnum.UnitConfig].icmSalesTypeCode}
                                onChange={(e) =>
                                    handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                        icmSalesTypeCode: e.target.value
                                    })
                                }
                            />
                        </Grid>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.EVIA && (
                        <>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="EVIA Stall Code"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].eviaStallCode}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            eviaStallCode: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="EVIA Sales Code"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].eviaSalesCode}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            eviaSalesCode: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Local Save Path"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].eviaLocalSavePath}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            eviaLocalSavePath: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Network Save Path"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].eviaNetworkSavePath}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            eviaNetworkSavePath: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.Ayala && (
                        <>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Company Code"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].companyCode}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            companyCode: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Contract Number"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].contractNumber}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            contractNumber: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Contract Name"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].contractName}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            contractName: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.Ayala && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h4">Ayala Other Terminal Settings</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Host IP"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].ayalaHost}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            ayalaHost: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].ayalaUser}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            ayalaUser: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].ayalaPassword}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            ayalaPassword: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Shared Folder"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].ayalaRootPath}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            ayalaRootPath: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Domain"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].ayalaDomain}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            ayalaDomain: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}

                    {settingsData[SettingsCategoryEnum.UnitConfig].mallAccr === MallAccrEnum.Robinson && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h4">Robinsons SFTP Credentials</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="SFTP Host"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPHost}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            robinsonsFTPHost: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="SFTP Username"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPUsername}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            robinsonsFTPUsername: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="SFTP Password"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPPassword}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            robinsonsFTPPassword: e.target.value
                                        })
                                    }
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="SFTP Root Folder"
                                    type="text"
                                    value={settingsData[SettingsCategoryEnum.UnitConfig].robinsonsFTPRootPath}
                                    onChange={(e) =>
                                        handleUpdateSettings(SettingsCategoryEnum.UnitConfig, {
                                            robinsonsFTPRootPath: e.target.value
                                        })
                                    }
                                />
                            </Grid>
                        </>
                    )}
                    <Grid item xs={12}>
                        <Typography variant="h4">Company Information</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Store Name"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].storeName}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    storeName: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Company Name"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].companyName}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    companyName: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Company Address1"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].companyAddress1}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    companyAddress1: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Company Address2"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].companyAddress2}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    companyAddress2: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Store Contact Number"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].companyContactNumber}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    companyContactNumber: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            label="Company Website Link"
                            type="text"
                            value={settingsData[SettingsCategoryEnum.CompanyInfo].companyWebsiteLink}
                            onChange={(e) =>
                                handleUpdateSettings(SettingsCategoryEnum.CompanyInfo, {
                                    companyWebsiteLink: e.target.value
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h4">Payment Methods</Typography>
                    </Grid>
                    {settingsData[SettingsCategoryEnum.PaymentMethod]
                        .filter((p) => p['__typename'] !== 'PosPaymentMethod')
                        .map((method) => (
                            <Grid item xs={4} key={method.id}>
                                <TextField
                                    fullWidth
                                    select
                                    label={method.label}
                                    type="select"
                                    name={method.id}
                                    value={method.active}
                                    onChange={(e) => handlePaymentMethod(e, method.id)}
                                >
                                    <MenuItem value={true}>Enable</MenuItem>
                                    <MenuItem value={false}>Disable</MenuItem>
                                </TextField>
                            </Grid>
                        ))}
                    {umbraSystems?.deviceId && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h4">Custom Payment Methods</Typography>
                            </Grid>
                            {settingsData.paymentMethod
                                .filter((p) => p['__typename'] === 'PosPaymentMethod')
                                .map((method) => (
                                    <Grid item xs={4} key={method.id}>
                                        <TextField
                                            fullWidth
                                            select
                                            label={method.label + (method.type.startsWith('gc_') ? ' (Gift Card)' : '')}
                                            type="select"
                                            name={method.id}
                                            value={method.active}
                                            onChange={(e) => handlePaymentMethod(e, method.id)}
                                        >
                                            <MenuItem value={true}>Enable</MenuItem>
                                            <MenuItem value={false}>Disable</MenuItem>
                                        </TextField>
                                    </Grid>
                                ))}
                            <Grid item xs={12}>
                                <LoadingButton
                                    variant="contained"
                                    color="primary"
                                    onClick={() => {
                                        fetchPosPaymentMethods({
                                            onCompleted: handleUpdatePaymentMethods,
                                            notifyOnNetworkStatusChange: true,
                                            fetchPolicy: 'cache-and-network'
                                        });
                                    }}
                                    disabled={paymentMethodsLoading}
                                    loading={paymentMethodsLoading}
                                >
                                    Update Payment Methods
                                </LoadingButton>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Container>
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                autoHideDuration={4000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Successfully saved!
                </Alert>
            </Snackbar>
            <UpdateBackupDatabase open={openUpdateBackupDatabase} setOpen={setOpenUpdateBackupDatabase} />
        </Page>
    )
}

export default SettingsStep