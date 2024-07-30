// routes
import * as React from 'react';
import Router from './routes';
import axios from 'axios';
import moment from 'moment';
// theme
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
// mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Typography } from '@mui/material';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/charts/BaseOptionChart';
import IntegrationPrompt from './components/umbra-systems/IntegrationPrompt';
import CreateClientAdminAccount from './pages/CreateClientAdminAccount';
// context
import { AuthContext } from './shared/context/AuthContext';
import { useAuth } from './shared/hooks/AuthHook';
import { StatusContext } from './shared/context/StatusContext';
import { useStatus } from './shared/hooks/StatusHook';
import useNetwork from './functions/common/useNetwork';
// import usePrevious from './functions/common/usePrevious';
import RobinsonsResendFiles from './components/_dashboard/reports/alerts/RobinsonsResendFiles';
// import { fDateShort } from './utils/formatTime';
// constants
import { Endpoints } from './enum/Endpoints';
import { SettingsCategoryEnum } from './enum/Settings';
// Umbra Systems Integration
import { createApolloClient } from './graphql/apollo-client';
import { ApolloProvider } from '@apollo/client';
import { GET_DUMMY_POS_DEVICE_STATUS_QUERY } from './graphql/queries';
import { isProduction } from './utils/isProduction';
import { useLocation } from 'react-router-dom';
import Page404 from './pages/Page404';

// ----------------------------------------------------------------------

const Footer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'fixed',
  bottom: 0,
  left: 0,
  zIndex: 99999,

  '& > div': {
    backgroundColor: theme.palette.grey[700],
    height: 30,
    padding: theme.spacing(0, 1)
  },

  '& *': {
    fontSize: '12px !important',
    color: theme.palette.common.white,
    fontWeight: 600,
    textTransform: 'uppercase'
  }
}));

// ----------------------------------------------------------------------
axios.defaults.withCredentials = true;

export default function App() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [uid, setUid] = React.useState(localStorage.getItem('uid') || searchParams.get('uid'));
  const [uidStatus, setUidStatus] = React.useState("")

  // Umbra Systems Integration
  const [integrationStatus, setIntegrationStatus] = React.useState('loading');
  const apolloClient = createApolloClient();

  const statuses = useStatus();
  const { login, logout, user } = useAuth();
  const { online } = useNetwork();
  // const prevOnlineValue = usePrevious(online)
  const posDate = localStorage.getItem('transactionDate');
  const systemDate = localStorage.getItem('systemDate');
  const userData = JSON.parse(localStorage.getItem('userData'));
  const settings = JSON.parse(localStorage.getItem('settings'));
  // const {mallAccr} = settings[SettingsCategoryEnum.UnitConfig] ?? {}

  const [birVersion, setBirVersion] = React.useState(null);
  const [appVersion, setAppVersion] = React.useState(null);
  const [dates, setDates] = React.useState({
    posDate: '',
    systemDate: ''
  });

  const [hasManager, setHasManager] = React.useState(false);
  const [hasManagerLoading, setHasManagerLoading] = React.useState(true);

  const [step, setStep] = React.useState("");

  const getPosDate = async () => {
    const res = await axios.get(`${Endpoints.SETTINGS}/pos-date`);

    const { posDate, systemDate } = res.data;
    setDates({
      ...dates,
      posDate,
      systemDate
    });
  };

  const getSettings = async () => {
    const res = await axios.get(`${Endpoints.SETTINGS}`);

    const { unitConfiguration } = res.data.data

    if (!unitConfiguration.isConfigured) {
      setStep('settings')
    }
  }

  const initializeUmbraSystems = async () => {
    const { data: umbraSystemsConfig } = await axios.get(`${Endpoints.SETTINGS}/umbra-systems-config`);
    localStorage.setItem('umbraSystemsConfig', JSON.stringify(umbraSystemsConfig));

    const { deviceId, apiKey } = umbraSystemsConfig;
    if (!(apiKey && deviceId)) {
      setIntegrationStatus('connected:dev');
      if (step !== "settings") {
        setStep("activation")
      }
    } else {
      if (!online) {
        setIntegrationStatus(`connected:${umbraSystemsConfig.status}:offline`);
      } else {
        // check device status
        try {
          const { data } = await apolloClient.query({
            query: GET_DUMMY_POS_DEVICE_STATUS_QUERY,
            variables: { id: deviceId }
          });

          if (data.dummyPosDeviceStatus.status) {
            try {
              await axios.patch(`${Endpoints.SETTINGS}/umbra-systems-config`, {
                ...umbraSystemsConfig,
                id: umbraSystemsConfig._id,
                status: data.dummyPosDeviceStatus.status
              });

              localStorage.setItem('umbraSystemsConfig', JSON.stringify({ ...umbraSystemsConfig, status: data.dummyPosDeviceStatus.status }));
            } catch (err) {
              console.log(err);
            }

            setIntegrationStatus(`connected:${data.dummyPosDeviceStatus.status}`);
          }
        } catch (err) {
          console.log(err);
          setIntegrationStatus('error');
        }
      }
      setStep("app")
    }

  };

  // check if has manager account
  const checkHasManager = async () => {
    try {
      const res = await axios.get(`${Endpoints.EMPLOYEE}/has-manager`);
      setHasManager(res.data.hasManager);
      setHasManagerLoading(false);
      if (res.data.hasManager) {
        setStep('app')
      }
    } catch (err) {
      console.log(err);
    }
  };

  const initCollections = async () => {
    try {
      await axios.post(`${Endpoints.SETTINGS}/init`);
    } catch (err) {
      console.log("err ", err)
    }
  }

  const validateOrganization = async () => {
    try {
      const accessKey = localStorage.getItem('uid') || searchParams.get('uid')
      const organizationData = await axios.get(
        `${process.env.REACT_APP_API_URL}/demo-organization/${accessKey}`
      );
      if (organizationData.data.data.status === "Enabled") {
        localStorage.setItem('uid', uid)
        setUid(accessKey)
        setUidStatus('valid-client')
      } else {
        localStorage.removeItem('uid', uid)
        setUid(null)
      }
    } catch (err) {
      console.log("err ", err)
      localStorage.removeItem('uid', uid)
      setUid(null)
    }
  }

  React.useEffect(() => {
    const checkSoftwareKey = async () => {
      if (process.env.NODE_ENV === 'development') {
        const devOptions = await JSON.parse(localStorage.getItem("devOptions") ?? '{}');
        if (Object.keys(devOptions).length <= 0) {
          devOptions.checkKey = false;
          devOptions.umbraSysAPI = "http://localhost:4000";
          localStorage.setItem("devOptions", JSON.stringify(devOptions));
        }
        if (devOptions?.checkKey) initializeUmbraSystems();
        else setIntegrationStatus('connected:dev');
        setIntegrationStatus('connected:dev');
        setStep("app")
      } else if (isProduction()) {
        initializeUmbraSystems();
        localStorage.removeItem("devOptions");  // REDUNDANCY TO PREVENT POTENTIAL EXPOILT IF NODE_ENV IS BYPASSED 
      }

    };

    // get BIR version
    const getVersion = async () => {
      try {
        const res = await axios.get(`${Endpoints.ELECTRON}/version`);

        setAppVersion(res.data.version);
        setBirVersion(res.data.birVersion);
        // if (res.data && mallAccr === 'ayala') {
        //   await axios.post(`${Endpoints.ACCREDITATION}/ayala/new-hourly-sales-data`);
        //   axios.get(`${Endpoints.ACCREDITATION}/ayala/txnNumbers`)
        // }
      } catch (err) { }
    };

    checkSoftwareKey();
    getVersion();

    // set key down event
    const onKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.keyCode === 46) {
        localStorage.clear();
        window.location.reload(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // focus fix after alert
    const origAlert = window.alert;
    window.alert = (message) => {
      origAlert(message);
      if (window.electronAPI) {
        window.electronAPI.fixFocus();
      }
    };

    return () => {
      window.alert = origAlert;
      document.removeEventListener('keydown', onKeyDown);
    };
    // eslint-disable-next-line
  }, []);

  React.useEffect(() => {
    getSettings();
    getPosDate();
    initCollections()
    checkHasManager();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  React.useEffect(() => {
    if (uid && uid === process.env.REACT_APP_USER_SECRET) {
      localStorage.setItem('uid', uid)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  React.useEffect(() => {
    if (uid && uid !== process.env.REACT_APP_USER_SECRET) {
      validateOrganization()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  return (
    <ThemeConfig>
      <ScrollToTop />
      <GlobalStyles />
      <BaseOptionChartStyle />

      {uid ? (
        <>
          {(uid === process.env.REACT_APP_USER_SECRET || uidStatus === "valid-client") && (
            <>
              {(!hasManagerLoading && (integrationStatus.startsWith('connected:') || integrationStatus === 'error')) && (
                <StatusContext.Provider value={statuses}>
                  <AuthContext.Provider
                    value={{
                      isLoggedIn: !!user,
                      user,
                      login,
                      logout
                    }}
                  >
                    <div style={{ height: 'calc(100vh - 30px)', overflow: 'hidden' }}>
                      <ApolloProvider client={apolloClient}>
                        <div style={{ height: 'calc(100vh - 30px)', overflow: 'hidden' }}>
                          {integrationStatus.startsWith('connected:disabled') && (
                            <IntegrationPrompt
                              version={birVersion}
                              message="This POS has been disabled. Please contact your POS provider."
                            />
                          )}
                          {integrationStatus.startsWith('connected:mismatch') && (
                            <IntegrationPrompt
                              version={birVersion}
                              message="The system has detected suspicious activity. Please contact your POS provider."
                            />
                          )}
                          {(integrationStatus === 'error' || integrationStatus === 'connected:not-found') && (
                            <IntegrationPrompt
                              version={birVersion}
                              message="There was an error verifying this POS installation. Please contact your POS provider."
                            />
                          )}
                          {(integrationStatus.startsWith('connected:enabled') ||
                            integrationStatus === 'connected:dev') && (
                              <>
                                {uid === process.env.REACT_APP_USER_SECRET ? (
                                  <Router />
                                ) : (
                                  <>
                                    {hasManager ? <Router /> : <CreateClientAdminAccount onComplete={checkHasManager} />}
                                  </>
                                )}
                              </>
                            )}
                        </div>
                      </ApolloProvider>
                    </div>
                    <Footer>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={3}>
                        <Stack direction="row" alignItems="center" spacing={3}>
                          <Typography>POS Version: {birVersion}</Typography>
                          <Typography>Patch: {appVersion}</Typography>
                        </Stack>
                        {user && (
                          <Stack direction="row" alignItems="center" spacing={3}>
                            {statuses.printerStatus.status !== 'idle' && (
                              <Typography>
                                Printer:{' '}
                                <Typography
                                  display="inline"
                                  component="span"
                                  color={statuses.printerStatus.status === 'error' ? 'error' : 'normal'}
                                >
                                  {statuses.printerStatus.message}
                                </Typography>
                              </Typography>
                            )}
                            <Typography>Status: {online ? 'Online' : 'Offline'}</Typography>
                            <Typography>
                              User:{' '}
                              {userData?.user
                                ? `${userData?.user?.firstname} ${userData?.user?.lastname}`
                                : 'N/A'}
                            </Typography>
                            <Typography>Role: {userData?.user ? userData?.user?.role : 'N/A'}</Typography>
                            <Typography>POS Date: {moment(posDate).format('ll') || moment(settings?.startingDate).format('ll')}</Typography>
                            {moment(systemDate).format('ll') !== moment(posDate).format('ll') &&
                              !settings.ecomm && (
                                <Typography color="error" fontWeight={600}>
                                  System Date: {moment(systemDate).format('ll') || moment().format('ll')}
                                </Typography>
                              )}
                          </Stack>
                        )}
                        {!user && (
                          <Stack direction="row" alignItems="center" spacing={3}>
                            <Typography> POS Date: {dates.posDate} </Typography>
                            {settings?.ecomm === false && (
                              <Typography color="error" fontWeight={600}> System Date: {moment(systemDate).format('ll') || moment().format('ll')} </Typography>
                            )
                            }
                          </Stack>
                        )
                        }
                      </Stack>
                    </Footer>
                    {
                      settings?.[SettingsCategoryEnum.UnitConfig]?.mallAccr === 'robinson' && (<RobinsonsResendFiles />)
                    }
                  </AuthContext.Provider>
                </StatusContext.Provider>
              )}
            </>
          )}
        </>
      ) : (
        <Page404 />
      )}
    </ThemeConfig>
  );
}
