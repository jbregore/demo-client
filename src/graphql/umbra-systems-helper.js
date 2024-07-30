import axios from 'axios';
import { createApolloClient } from './apollo-client';
import {
  CREATE_POS_GRAND_ACCUMULATED_SALES_MUTATION,
  UPDATE_POS_DEVICE_MUTATION
} from './mutations';
import getPosInfo from '../functions/common/getPosInfo';

const umbraSystemsHelper = {
  updatePosDevice: async (posDeviceDetails = {}, options = {}) => {
    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
    if ((options.hasOwnProperty() && options.deviceId && options.apiKey) || (umbraSystems.deviceId && umbraSystems.apiKey)) {
      const apolloClient = createApolloClient(options.apiKey);
      const posInfo = await getPosInfo();
      delete posInfo.hardwareIds;
      try {
        await apolloClient.mutate({
          mutation: UPDATE_POS_DEVICE_MUTATION,
          variables: {
            id: umbraSystems.deviceId,
            posDevice: {
              ...posInfo,
              ...posDeviceDetails
            }
          }
        });
      } catch (err) {
        console.log(err);
      }
    }
  },
  sendPosGrandAccumulatedSales: async (posGrandAccumulatedSales = {}, options = {}) => {
    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
    if ((options.hasOwnProperty() && options.deviceId && options.apiKey) || (umbraSystems.deviceId && umbraSystems.apiKey)) {
      if (options.enqueue) {
        try {
          await axios.post(
            `${process.env.REACT_APP_API_URL}/sales/grand-accumulated-report/enqueue`,
            {
              posDeviceId: options.deviceId || umbraSystems.deviceId,
              posGrandAccumulatedSales
            }
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        const apolloClient = createApolloClient(options.apiKey);
        try {
          await apolloClient.mutate({
            mutation: CREATE_POS_GRAND_ACCUMULATED_SALES_MUTATION,
            variables: {
              posDeviceId: umbraSystems.deviceId,
              posGrandAccumulatedSales: {
                ...posGrandAccumulatedSales,
                posDeviceId: parseInt(umbraSystems.deviceId)
              }
            }
          });
        } catch (err) {
          console.log(err);
        }
      }
    }
  },
  sendSalesReport: async (data = {}, options = {}) => {
    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
    if ((options.hasOwnProperty() && options.deviceId && options.apiKey) || (umbraSystems.deviceId && umbraSystems.apiKey)) {
      try {
        const apiData = {
          apiKey: options.apiKey || umbraSystems.apiKey,
          posDeviceId: options.deviceId || umbraSystems.deviceId,
          posDate: data.posDate,
          enqueue: options.enqueue || false
        };
        await axios.post(
          `${process.env.REACT_APP_API_URL}/sales/sales-reports/send`,
          apiData
        );
      } catch (error) {
        console.log(error);
      }
    }
  },
  uploadQueue: async (options = {}) => {
    const umbraSystems = JSON.parse(localStorage.getItem('umbraSystemsConfig'));
    if ((options.hasOwnProperty() && options.deviceId && options.apiKey) || (umbraSystems.deviceId && umbraSystems.apiKey)) {
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/sales/reports-queue/upload`, {
          apiKey: options.apiKey || umbraSystems.apiKey
        });
      } catch (err) {
        console.log(err);
      }
    }
  },
};

export default umbraSystemsHelper;
