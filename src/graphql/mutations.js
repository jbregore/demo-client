import { gql } from '@apollo/client';

export const CREATE_POS_DEVICE_MUTATION = gql`
  mutation CreatePosDevice($posDevice: CreatePosDeviceInput) {
    createPosDevice(posDevice: $posDevice) {
      success
      message
      posDevice {
        id
        name
      }
    }
  }
`;

export const UPDATE_POS_DEVICE_MUTATION = gql`
  mutation UpdatePosDevice($id: ID!, $posDevice: UpdatePosDeviceInput) {
    updatePosDevice(id: $id, posDevice: $posDevice) {
      success
      message
    }
  }
`;

export const DELETE_POS_DEVICE_MUTATION = gql`
  mutation DeletePosDevice($id: ID!) {
    deletePosDevice(id: $id) {
      success
      message
    }
  }
`;

export const CREATE_POS_PRODUCT_SALES_MUTATION = gql`
  mutation CreatePosProductSales(
    $posDeviceId: ID!
    $posProductSales: [CreatePosProductSalesInput!]!
  ) {
    batchCreatePosProductSales(posDeviceId: $posDeviceId, posProductsales: $posProductSales) {
      success
      message
    }
  }
`;

export const CREATE_POS_PAYMENT_RECORDS_MUTATION = gql`
  mutation CreatePosPaymentRecord(
    $posDeviceId: ID!
    $posPosPaymentRecords: [CreatePosPosPaymentRecordInput!]!
  ) {
    batchCreatePosPosPaymentRecords(
      posDeviceId: $posDeviceId
      posPosPaymentRecords: $posPosPaymentRecords
    ) {
      success
      message
    }
  }
`;

export const CREATE_POS_GRAND_ACCUMULATED_SALES_MUTATION = gql`
  mutation CreatePosGrandAccumulatedSales(
    $posDeviceId: ID!
    $posGrandAccumulatedSales: CreatePosGrandAccumulatedSalesInput!
  ) {
    createPosGrandAccumulatedSales(
      posDeviceId: $posDeviceId
      posGrandAccumulatedSales: $posGrandAccumulatedSales
    ) {
      success
      message
    }
  }
`;
