import { gql } from '@apollo/client';

export const GET_POS_DEVICE_STATUS_QUERY = gql`
  query GetPosDeviceStatus($id: ID!, $hardwareIds: [String!]!) {
    posDeviceStatus(id: $id, hardwareIds: $hardwareIds) {
      status
    }
  }
`;

export const GET_POS_PAYMENT_METHODS_QUERY = gql`
  query GetPosPaymentMethods {
    allPosPaymentMethods {
      id
      type
      method
      title
      label
      properties {
        isFixedAmount
        amount
        tenderType
        tenderCode
        tenderDesc
      }
      inputFields {
        label
        type
        required
      }
      key
      createdAt
      updatedAt
    }
  }
`;

export const GET_PROMO_CODES_QUERY = gql`
  query GetPromoCodes($pageInfo: PageInfoInput!) {
    promoCodes(pageInfo: $pageInfo) {
      data {
        id
        promoCodeId
        promoName
        type
        value
        expDate
        itemDiscount
        orderDiscount
        transactionDiscount
        usageLimit
        totalRequired
        dateFrom
        dateTo
        timeFrom
        timeTo
        day
        organizationId
        createdAt
        updatedAt
      }
      pageInfo {
        page
        limit
        totalPages
        totalItems
        sortBy
        sortOrder
      }
    }
  }
`;

export const GET_UMBRA_SYSTEMS_STATUS_QUERY = gql`
  query GetUmbraSystemsStatus {
    status {
      message
    }
  }
`;

export const GET_DUMMY_POS_DEVICE_STATUS_QUERY = gql`
  query GetDummyPosDeviceStatus($id: ID!) {
    dummyPosDeviceStatus(id: $id) {
      status
    }
  }
`;