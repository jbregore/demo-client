import { useEffect, useState } from 'react';
// material
import { styled } from '@mui/material/styles';
import { Grid, Button, Typography } from '@mui/material';
// components
import {
  VoidedSales,
  AccumulatedSales,
  DownloadableJournal,
  ScPwdReports,
  SupervisorAuthorization,
  PeriodicalZread,
  ReturnExchangeTxn,
  GenerateMwFiles,
  GenerateAyalaFiles,
  CashierSales,
  SelectCashier,
  RLCSentFilesModal,
  GenerateSMFiles,
  // OtherDiscounts,
  EodCashReportModal
} from '.';
import GenerateRobinsonFiles from './modal/GenerateRobinsonFiles';
import RefundedSales from './modal/RefundedSales';
import OtherDiscountsReports from './modal/OtherDiscountsReports';
import { MallAccrEnum, SettingsCategoryEnum } from '../../../enum/Settings';
import GenerateICMFiles from './modal/GenerateICMFiles';
import GenerateEVIAFile from './modal/GenerateEVIAFile';
import GenerateAranetaFile from './modal/GenerateAranetaFiles';

// ----------------------------------------------------------------------

const CustomGridContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(3)
}));

const CustomButton = styled(Button)(({ theme }) => ({
  '&:hover': {
    background: theme.palette.primary.main,
    color: theme.palette.common.white
  }
}));

// ----------------------------------------------------------------------

export default function SalesReports() {
  const settings = JSON.parse(localStorage.getItem('settings'));
  const { mallAccr } = settings[SettingsCategoryEnum.UnitConfig] ?? {};
  const { user } = JSON.parse(localStorage.getItem('userData'));

  const [voidedSalesModal, setVoidedSalesModal] = useState(false);
  const [refundedSalesModal, setRefundedSalesModal] = useState(false);

  const [accumulatedSalesModal, setAccumulatedSalesModal] = useState(false);
  const [journalModal, setJournalModal] = useState(false);
  const [scPwdModal, setScPwdModal] = useState(false);
  const [otherDiscountsModal, setOtherDiscountsModal] = useState(false);
  const [periodicalModal, setPeriodicalModal] = useState(false);
  const [returnExchangeModal, setReturnExchangeModal] = useState(false);
  const [generateMwcFilesModal, setGenerateMwcFilesModal] = useState(false);
  const [generateRobinsonFilesModal, setGenerateRobinsonFilesModal] = useState(false);
  const [rlcSentFilesModal, setRlcSentFilesModal] = useState(false);
  const [generateAyalaFilesModal, setGenerateAyalaFilesModal] = useState(false);
  const [generateAranetaFileModal, setGenerateAranetaFileModal] = useState(false);
  const [generateEviaFile, setGenerateEviaFile] = useState(false);
  const [generateSMFilesModal, setGenerateSMFilesModal] = useState(false);
  const [generateIcmFilesModal, setGenerateIcmFilesModal] = useState(false);
  const [cashierSalesModal, setCashierSalesModal] = useState(false);
  const [selectCashierModal, setSelectCashierModal] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState('');
  const [eodCashReportModal, setEodCashReportModal] = useState(false);

  const [supervisorAccessModal, setSupervisorAccessModal] = useState(false);
  const [toAccessFunction, setToAccessFunction] = useState('');
  const [approveFunction, setApproveFunction] = useState('');

  useEffect(() => {
    // eslint-disable-next-line default-case
    switch (approveFunction) {
      case 'accumulatedSales':
        setAccumulatedSalesModal(true);
        break;

      case 'voidedSales':
        setVoidedSalesModal(true);
        break;

      case 'downloadableJournal':
        setJournalModal(true);
        break;

      case 'refundedSales':
        setRefundedSalesModal(true);
        break;

      case 'scPwdReports':
        setScPwdModal(true);
        break;

      case 'otherDiscounts':
        setOtherDiscountsModal(true);
        break;

      case 'periodicalZread':
        setPeriodicalModal(true);
        break;

      case 'returnExchangeTxn':
        setReturnExchangeModal(true);
        break;

      case 'generateMwcFiles':
        setGenerateMwcFilesModal(true);
        break;

      case 'generateRobinsonFiles':
        setGenerateRobinsonFilesModal(true);
        break;
      case 'generateAyalaFiles':
        setGenerateAyalaFilesModal(true);
        break;

      case 'generateAranetaFile':
        setGenerateAranetaFileModal(true);
        break;
      case 'generateSMFiles':
        setGenerateSMFilesModal(true);
        break;
      case 'generateEviaFile':
        setGenerateEviaFile(true);
        break;
      case 'generateIcmFiles':
        setGenerateIcmFilesModal(true);
        break;
      case 'rlcSentFiles':
        setRlcSentFilesModal(true);
        break;
      case 'eodCashReport':
        setEodCashReportModal(true);
        break;
    }

    if (approveFunction !== '') {
      setSupervisorAccessModal(false);
    }
    setApproveFunction('');
  }, [approveFunction]);

  const handleSupervisorAccess = (toAccess) => {
    setSupervisorAccessModal(true);
    setToAccessFunction(toAccess);
  };

  return (
    <CustomGridContainer container spacing={4}>
      <Grid item xs={12}>
        <Typography variant="h5">Sales Reports</Typography>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('accumulatedSales')
              : setAccumulatedSalesModal(true)
          }
        >
          Accumulated Sales/Backend Report
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('voidedSales')
              : setVoidedSalesModal(true)
          }
        >
          Voided Sales
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('refundedSales')
              : setRefundedSalesModal(true)
          }
        >
          Refunded Sales
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('downloadableJournal')
              : setJournalModal(true)
          }
        >
          Downloadable Journal
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier' ? handleSupervisorAccess('scPwdReports') : setScPwdModal(true)
          }
        >
          SC/PWD Reports
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('otherDiscounts')
              : setOtherDiscountsModal(true)
          }
        >
          Other Discounts Reports
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('periodicalZread')
              : setPeriodicalModal(true)
          }
        >
          Periodical - Z READ
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('returnExchangeTxn')
              : setReturnExchangeModal(true)
          }
        >
          Return & Exchange Report
        </CustomButton>
      </Grid>

      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role !== 'cashier' ? setSelectCashierModal(true) : setCashierSalesModal(true)
          }
        >
          Cashier Sales
        </CustomButton>
      </Grid>
      <Grid item xs={6}>
        <CustomButton
          variant="outlined"
          size="large"
          fullWidth
          onClick={() =>
            user.role === 'cashier'
              ? handleSupervisorAccess('eodCashReport')
              : setEodCashReportModal(true)
          }
        >
          EOD Cash Report
        </CustomButton>
      </Grid>
      {mallAccr === MallAccrEnum.MegaWorld && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateMwcFiles')
                : setGenerateMwcFilesModal(true)
            }
          >
            Megaworld Files Report
          </CustomButton>
        </Grid>
      )}
      {mallAccr === MallAccrEnum.Robinson && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateRobinsonFiles')
                : setGenerateRobinsonFilesModal(true)
            }
          >
            Robinson Files Report
          </CustomButton>
        </Grid>
      )}

      {mallAccr === MallAccrEnum.Ayala && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateAyalaFiles')
                : setGenerateAyalaFilesModal(true)
            }
          >
            Ayala Files Report
          </CustomButton>
        </Grid>
      )}

{mallAccr === MallAccrEnum.Araneta && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateAranetaFile')
                : setGenerateAranetaFileModal(true)
            }
          >
            Araneta Z Read Report
          </CustomButton>
        </Grid>
      )}

      {mallAccr === MallAccrEnum.EVIA && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateEviaFile')
                : setGenerateEviaFile(true)
            }
          >
            EVIA Sales File Report
          </CustomButton>
        </Grid>
      )}

      {mallAccr === MallAccrEnum.Robinson && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('rlcSentFiles')
                : setRlcSentFilesModal(true)
            }
          >
            RLC Sent Files
          </CustomButton>
        </Grid>
      )}

      {mallAccr === MallAccrEnum.SM && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateSMFiles')
                : setGenerateSMFilesModal(true)
            }
          >
            Generate SM Transaction Files
          </CustomButton>
        </Grid>
      )}

      {mallAccr === MallAccrEnum.ICM && (
        <Grid item xs={6}>
          <CustomButton
            variant="outlined"
            size="large"
            fullWidth
            onClick={() =>
              user.role === 'cashier'
                ? handleSupervisorAccess('generateIcmFiles')
                : setGenerateIcmFilesModal(true)
            }
          >
            Generate ICM Files
          </CustomButton>
        </Grid>
      )}

      {returnExchangeModal && (
        <ReturnExchangeTxn open={returnExchangeModal} setOpen={setReturnExchangeModal} />
      )}
      {voidedSalesModal && <VoidedSales open={voidedSalesModal} setOpen={setVoidedSalesModal} />}
      {refundedSalesModal && (
        <RefundedSales open={refundedSalesModal} setOpen={setRefundedSalesModal} />
      )}
      {accumulatedSalesModal && (
        <AccumulatedSales open={accumulatedSalesModal} setOpen={setAccumulatedSalesModal} />
      )}
      <DownloadableJournal open={journalModal} setOpen={setJournalModal} />
      {scPwdModal && <ScPwdReports open={scPwdModal} setOpen={setScPwdModal} />}
      <OtherDiscountsReports open={otherDiscountsModal} setOpen={setOtherDiscountsModal} />
      <PeriodicalZread open={periodicalModal} setOpen={setPeriodicalModal} />
      <GenerateMwFiles open={generateMwcFilesModal} setOpen={setGenerateMwcFilesModal} />
      <GenerateRobinsonFiles
        open={generateRobinsonFilesModal}
        setOpen={setGenerateRobinsonFilesModal}
      />
      <GenerateAyalaFiles open={generateAyalaFilesModal} setOpen={setGenerateAyalaFilesModal} />
      <GenerateAranetaFile open={generateAranetaFileModal} setOpen={setGenerateAranetaFileModal} />
      <GenerateEVIAFile open={generateEviaFile} setOpen={setGenerateEviaFile} />
      <GenerateSMFiles open={generateSMFilesModal} setOpen={setGenerateSMFilesModal} />
      <GenerateICMFiles open={generateIcmFilesModal} setOpen={setGenerateIcmFilesModal} />
      <RLCSentFilesModal open={rlcSentFilesModal} setOpen={setRlcSentFilesModal} />
      <CashierSales
        open={cashierSalesModal}
        setOpen={setCashierSalesModal}
        cashierId={user.role !== 'cashier' ? selectedCashier : user.employeeId}
        setSelectedCashier={setSelectedCashier}
      />
      <SelectCashier
        open={selectCashierModal}
        setOpen={setSelectCashierModal}
        setCashierSalesModal={setCashierSalesModal}
        setSelectedCashier={setSelectedCashier}
      />
      <EodCashReportModal open={eodCashReportModal} setOpen={setEodCashReportModal} />
      <SupervisorAuthorization
        open={supervisorAccessModal}
        setOpen={setSupervisorAccessModal}
        toAccessFunction={toAccessFunction}
        setApproveFunction={setApproveFunction}
      />
    </CustomGridContainer>
  );
}
