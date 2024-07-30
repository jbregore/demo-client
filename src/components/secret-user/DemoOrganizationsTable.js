import React, { useEffect, useState } from 'react'
import BaseTableV2 from '../table/BaseTableV2';
import { Box,  Container, Stack, Typography, styled } from '@mui/material';
import OrganizationModal from './OrganizationModal';
import useSnack from '../../hooks/useSnack';
import CustomSnack from '../CustomSnack';
import useQueryString from '../../hooks/table/useQueryString';
import useFormErrors from '../../hooks/error/useFormError';
import useTableQueries from '../../hooks/table/useTableQueries';
import axios from 'axios';
import MenuAction from '../table/MenuAction';
import editFill from '@iconify/icons-eva/edit-fill';
import trash2Outline from '@iconify/icons-eva/trash-2-outline';
import Confirmation from '../Confirmation';
import checkmarkFill from '@iconify/icons-eva/checkmark-fill';
import closeFill from '@iconify/icons-eva/close-fill';
import linkFill from "@iconify/icons-eva/link-fill"
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard';
import EnabledModal from './EnabledModal';

const initialFilters = {
    sortBy: 'name',
    sortOrder: 'asc'
};

const initialQueries = {
    page: '',
    pageSize: '',
    search: ''
};

const StatusCircle = styled('div')(({ status }) => ({
    width: '10px',
    height: '10px',
    backgroundColor: status === "Disabled" ? '#637381' : '#00AB55',
    borderRadius: '50%'
}));

const DemoOrganizationsTable = () => {
    const [openOrganizationModal, setOpenOrganizationModal] = useState(false);
    const [organizationModalContext, setOrganizationModalContext] = useState('create');

    const [organizations, setOrganizations] = useState([]);
    const [organizationsMeta, setOrganizationsMeta] = useState([]);
    const [organizationsLoading, setOrganizationsLoading] = useState(true);
    const [isRefetching, setIsRefetching] = useState(false);
    const { queryData, setQueryData, clearQueries } = useTableQueries(initialQueries);
    const [filters, setFilters] = useState(initialFilters);
    const [sortState, setSortState] = useState({
        name: 'desc'
    });

    const { objectToString } = useQueryString();

    const { snackOpen, setSnackOpen, snackSeverity, snackMessage, successSnack, errorSnack } =
        useSnack();

    const { errorHandler } = useFormErrors();

    const [openConfirmation, setOpenConfirmation] = useState(false);

    const [organizationToDelete, setOrganizationToDelete] = useState('');
    const [organizationToUpdate, setOrganizationToUpdate] = useState(null);

    const [enabledConfirmation, setEnabledConfirmation] = useState(false)
    const [disabledConfirmation, setDisabledConfirmation] = useState(false)
    const [resetData, setResetData] = useState(true);
    const { copy } = useCopyToClipboard();

    const enabledChoices = [
        {
            name: 'Copy Link',
            function: (record) => {
                const url = `${window.location.host}?uid=${record.accessKey}`
                copy(url)
                successSnack("Link copied to clipboard");
            },
            icon: linkFill
        },
        {
            name: 'Disabled',
            function: (record) => {
                setDisabledConfirmation(true);
                setOrganizationToUpdate(record._id);
            },
            icon: closeFill
        },
    ]

    const disabledChoices = [
        {
            name: 'Enabled',
            function: (record) => {
                setEnabledConfirmation(true);
                setOrganizationToUpdate(record._id);
            },
            icon: checkmarkFill
        },
    ]

    const initialChoices = [
        {
            name: 'Edit',
            function: (record) => {
                setOrganizationToUpdate(record);
                setOpenOrganizationModal(true);
                setOrganizationModalContext('update');
            },
            icon: editFill
        },
        {
            name: 'Remove',
            function: (record) => {
                setOpenConfirmation(true);
                setOrganizationToDelete(record._id);
            },
            icon: trash2Outline
        }
    ];

    const columns = [
        { label: 'Name', column: 'name', enableSort: true, sortOrder: sortState.name, sortBy: 'name' },
        { label: 'User', column: 'user' },
        { label: 'Device ID', column: 'deviceId' },
        { label: 'API Key', column: 'apiKey' },
        { label: 'Scheduled Date', column: 'date' },
        {
            label: 'Status',
            render: (data) => (
                <Stack direction="row" alignItems="center" justifyContent="flex-start" >
                    <div>
                        <StatusCircle status={data.status} />
                    </div>
                    <div style={{ marginLeft: 4 }}>
                        {data.status}
                    </div>
                </Stack>
            )
        },
        {
            label: '',
            render: (data) => (
                <>
                    {data.status === "Enabled" ? (
                        <MenuAction choices={[...enabledChoices, ...initialChoices]} record={data} />
                    ) : (
                        <MenuAction choices={[...disabledChoices, ...initialChoices]} record={data} />
                    )}
                </>
            )
        }
    ];

    const tableFilters = [];

    const fetchOrganizations = async () => {
        setOrganizationsLoading(true);
        try {
            const organizationsData = await axios.get(
                `${process.env.REACT_APP_API_URL}/demo-organization`
            );
            if (organizationsData?.data?.data) {
                setOrganizations(organizationsData?.data?.data);
                setOrganizationsMeta(organizationsData?.data?.meta);
            }
        } catch (err) {
            console.log('err ', err);
        }
        setOrganizationsLoading(false);
    };

    const refetch = async () => {
        setOrganizationsLoading(true);
        try {
            const organizationsData = await axios.get(
                `${process.env.REACT_APP_API_URL}/demo-organization?${objectToString(queryData)}`
            );
            if (organizationsData?.data?.data) {
                setOrganizations(organizationsData?.data?.data);
                setOrganizationsMeta(organizationsData?.data?.meta);
            }
        } catch (err) {
            console.log('err ', err);
        }
        setOrganizationsLoading(false);
        setIsRefetching(false);
    };

    const handleDeleteOrganization = async () => {
        try {
            const result = await axios.delete(
                `${process.env.REACT_APP_API_URL}/demo-organization/${organizationToDelete}`
            );
            if (result.status === 200) {
                successSnack(result?.data?.message);
                fetchOrganizations();
                clearQueries();
            }
        } catch (err) {
            if (err.response.status === 401) {
                const error401 = errorHandler(err);
                errorSnack(error401);
            }
            console.log('err ', err);
        }
        setOpenConfirmation(false);
    };

    const handleEnabledOrganization = async () => {
        try {
            const result = await axios.put(
                `${process.env.REACT_APP_API_URL}/demo-organization/status/${organizationToUpdate}`,
                {
                    action: 'Enabled',
                    resetData: resetData
                }
            );
            if (result.status === 200) {
                successSnack(result?.data?.message);
                fetchOrganizations();
                clearQueries();
            }
        } catch (err) {
            if (err.response.status === 401) {
                const error401 = errorHandler(err);
                errorSnack(error401);
            }
            console.log('err ', err);
        }
        setEnabledConfirmation(false);
    }

    const handleDisabledOrganization = async () => {
        try {
            const result = await axios.put(
                `${process.env.REACT_APP_API_URL}/demo-organization/status/${organizationToUpdate}`,
                {
                    action: 'Disabled'
                }
            );
            if (result.status === 200) {
                successSnack(result?.data?.message);
                fetchOrganizations();
                clearQueries();
            }
        } catch (err) {
            if (err.response.status === 401) {
                const error401 = errorHandler(err);
                errorSnack(error401);
            }
            console.log('err ', err);
        }
        setDisabledConfirmation(false);
    }

    useEffect(() => {
        fetchOrganizations();
    }, []);

    useEffect(() => {
        if (isRefetching) {
            refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRefetching]);

    return (
        <Container>
            <>
                <Box sx={{ pb: 5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4">Demo Organizations</Typography>
                        {/* <Button
                            variant="contained"
                            startIcon={<Icon icon={plusFill} />}
                            onClick={() => {
                                setOpenOrganizationModal(true);
                                setOrganizationModalContext('create');
                            }}
                        >
                            New Organization
                        </Button> */}
                    </Stack>
                </Box>

                <BaseTableV2
                    pageChangeCb={(page) => {
                        setIsRefetching(true);
                        setQueryData({
                            ...queryData,
                            page: page + 1
                        });
                    }}
                    rowsChangeCb={(size) => {
                        setIsRefetching(true);
                        setQueryData({
                            ...queryData,
                            page: '',
                            pageSize: size
                        });
                    }}
                    data={organizations || []}
                    columns={columns}
                    setSortState={setSortState}
                    isLoading={organizationsLoading}
                    total={organizationsMeta?.totalRecords}
                    limitChoices={[1, 5, 10, 20]}
                    withSearch
                    searchLabel="Search name"
                    onSearchCb={(keyword) => {
                        setIsRefetching(true);
                        setQueryData({
                            ...queryData,
                            page: '',
                            pageSize: '',
                            search: keyword
                        });
                    }}
                    onClearSearch={() => {
                        fetchOrganizations();
                        clearQueries();
                    }}
                    initialFilters={initialFilters}
                    filterOptions={tableFilters}
                    filters={filters}
                    setFilters={setFilters}
                    onSortCb={(sortObject) => {
                        setIsRefetching(true);
                        setQueryData({
                            page: '',
                            pageSize: '',
                            search: '',
                            sortBy: sortObject.sortBy,
                            sortOrder: sortObject.sortOrder
                        });
                    }}
                />

                <OrganizationModal
                    context={organizationModalContext}
                    record={organizationToUpdate}
                    open={openOrganizationModal}
                    setOpen={setOpenOrganizationModal}
                    onCreateCallback={(status, message) => {
                        if (status === 'success') {
                            successSnack(message);
                        } else {
                            errorSnack(message);
                        }
                        refetch()
                    }}
                    onUpdateCallback={(status, message) => {
                        if (status === 'success') {
                            successSnack(message);
                        } else {
                            errorSnack(message);
                        }
                        refetch()
                    }}
                />

                <Confirmation
                    context={'delete'}
                    title={'Remove Organization'}
                    helperText={'Are you sure you want to remove this organization?'}
                    open={openConfirmation}
                    setOpen={setOpenConfirmation}
                    onSave={handleDeleteOrganization}
                />

                <EnabledModal
                    open={enabledConfirmation}
                    setOpen={setEnabledConfirmation}
                    onSave={(isResetData) => {
                        setResetData(isResetData)
                        handleEnabledOrganization()
                    }}
                />

                <Confirmation
                    context={'update'}
                    title={`Disable Demo`}
                    helperText={`Are you sure you want to disable the demo for this organization?`}
                    open={disabledConfirmation}
                    setOpen={setDisabledConfirmation}
                    onSave={handleDisabledOrganization}
                />

                <CustomSnack
                    open={snackOpen}
                    setOpen={setSnackOpen}
                    severity={snackSeverity}
                    message={snackMessage}
                />
            </>
        </Container>
    )
}

export default DemoOrganizationsTable