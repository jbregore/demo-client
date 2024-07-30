import React, { useState } from 'react';
import {
  CashTakeoutReceipt,
  InitialCashReceipt,
  PackageReceipt,
  RefundReceipt,
  RegularReceipt,
  ReturnReceipt,
  VoidReceipt,
  XReadReceipt,
  ZReadReceipt
} from '../../components/_dashboard/reports';

const useReceiptsModal = () => {
  const [transactionType, setTransactionType] = useState('');

  const [previewInitialData, setPreviewInitialData] = useState({});
  const [previewInitialOpen, setPreviewInitialOpen] = useState(false);
  const [previewTakeoutData, setPreviewTakeoutData] = useState({});
  const [previewTakeoutOpen, setPreviewTakeoutOpen] = useState(false);
  const [previewRegularData, setPreviewRegularData] = useState({});
  const [previewRegularOpen, setPreviewRegularOpen] = useState(false);
  const [previewReturnData, setPreviewReturnData] = useState({});
  const [previewReturnOpen, setPreviewReturnOpen] = useState(false);
  const [previewVoidData, setPreviewVoidData] = useState({});
  const [previewVoidOpen, setPreviewVoidOpen] = useState(false);
  const [previewRefundData, setPreviewRefundData] = useState({});
  const [previewRefundOpen, setPreviewRefundOpen] = useState(false);
  const [previewPackageData, setPreviewPackageData] = useState({});
  const [previewPackageOpen, setPreviewPackageOpen] = useState(false);
  const [previewXReadData, setPreviewXReadData] = useState({});
  const [previewXReadOpen, setPreviewXReadOpen] = useState(false);
  const [previewZReadData, setPreviewZReadData] = useState({});
  const [previewZReadOpen, setPreviewZReadOpen] = useState(false);

  const handleShowPreview = (type, data) => {
    setTransactionType(type);
    data.preview = false;

    if (type === 'initial cash') {
      setPreviewInitialData(data);
      setPreviewInitialOpen(true);
    } else if (type === 'cash takeout') {
      setPreviewTakeoutData(data);
      setPreviewTakeoutOpen(true);
    } else if (type === 'regular') {
      setPreviewRegularData(data);
      setPreviewRegularOpen(true);
    } else if (type === 'return') {
      setPreviewReturnData(data);
      setPreviewReturnOpen(true);
    } else if (type === 'void') {
      setPreviewVoidData(data);
      setPreviewVoidOpen(true);
    } else if (type === 'refund') {
      setPreviewRefundData(data);
      setPreviewRefundOpen(true);
    } else if (type === 'package') {
      setPreviewPackageData(data);
      setPreviewPackageOpen(true);
    } else if (type === 'x-read') {
      setPreviewXReadData(data);
      setPreviewXReadOpen(true);
    } else if (type === 'z-read') {
      data.preview = true;
      setPreviewZReadData(data);
      setPreviewZReadOpen(true);
    }
  };

  const getPreview = () => {
    return (
      <>
        {transactionType === 'initial cash' && (
          <InitialCashReceipt
            open={previewInitialOpen}
            setOpen={setPreviewInitialOpen}
            closeMainModal={() => ''}
            data={previewInitialData?.data}
          />
        )}

        {transactionType === 'cash takeout' && (
          <CashTakeoutReceipt
            open={previewTakeoutOpen}
            setOpen={setPreviewTakeoutOpen}
            closeMainModal={() => ''}
            data={previewTakeoutData?.data}
          />
        )}
        {transactionType === 'regular' && (
          <RegularReceipt
            open={previewRegularOpen}
            setOpen={setPreviewRegularOpen}
            data={previewRegularData?.data}
            doublePrinting={false}
          />
        )}

        {transactionType === 'void' && (
          <VoidReceipt
            open={previewVoidOpen}
            setOpen={setPreviewVoidOpen}
            fullData={previewVoidData}
          />
        )}

        {transactionType === 'refund' && (
          <RefundReceipt
            open={previewRefundOpen}
            setOpen={setPreviewRefundOpen}
            fullData={previewRefundData}
          />
        )}
        {transactionType === 'return' && (
          <ReturnReceipt
            open={previewReturnOpen}
            setOpen={setPreviewReturnOpen}
            fullData={previewReturnData}
          />
        )}

        {transactionType === 'x-read' && (
          <XReadReceipt
            open={previewXReadOpen}
            setOpen={setPreviewXReadOpen}
            data={previewXReadData?.data}
            zRead={() => ''}
            setOpenMainModal={() => ''}
          />
        )}

        {transactionType === 'z-read' && (
          <ZReadReceipt
            open={previewZReadOpen}
            setOpen={setPreviewZReadOpen}
            data={previewZReadData?.data}
            zRead={() => ''}
            setOpenMainModal={() => ''}
          />
        )}

        {/* TODO: BELOW */}
        {transactionType === 'package' && (
          <PackageReceipt
            open={previewPackageOpen}
            setOpen={setPreviewPackageOpen}
            data={previewPackageData}
            doublePrinting={false}
          />
        )}
      </>
    );
  };

  return { handleShowPreview, getPreview };
};

export default useReceiptsModal;
