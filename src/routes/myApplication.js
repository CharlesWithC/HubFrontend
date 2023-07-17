import React, { useState, useEffect, memo } from 'react';

import { Card, CardContent, Typography, Grid, useTheme } from '@mui/material';

import CustomTable from '../components/table';
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';

import { makeRequestsAuto } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'id', label: 'ID' },
    { id: 'type', label: 'Type' },
    { id: 'submit', label: 'Submit' },
    { id: 'update', label: 'Update' },
    { id: 'staff', label: 'Staff' },
    { id: 'status', label: 'Status' }
];

const ApplicationTable = memo(({ showDetail }) => {
    const [recent, setRecent] = useState([]);
    const [applications, setApplications] = useState([]);

    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

    const theme = useTheme();
    const STATUS = { 0: <span style={{ color: theme.palette.info.main }}>Pending</span>, 1: <span style={{ color: theme.palette.success.main }}>Accepted</span>, 2: <span style={{ color: theme.palette.error.main }}>Declined</span> };

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [_latestPending, _applications] = [{}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1) {
                [_latestPending, _applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?page=1&page_size=2&order_by=submit_timestamp&order=desc`, auth: true },
                    { url: `${vars.dhpath}/applications/list?page=${myPage}&page_size=${pageSize}&order_by=submit_timestamp&order=desc`, auth: true },
                ]);
                setRecent(_latestPending.list);
            } else {
                [_applications] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/applications/list?page=${myPage}&page_size=${pageSize}&order_by=submit_timestamp&order=desc`, auth: true },
                ]);
            }
            let newApplications = [];
            for (let i = 0; i < _applications.list.length; i++) {
                let app = _applications.list[i];
                newApplications.push({ id: app.applicationid, type: vars.applicationTypes[app.type].name, submit: <TimeAgo timestamp={app.submit_timestamp * 1000} />, update: <TimeAgo timestamp={app.update_timestamp * 1000} />, staff: <UserCard user={app.last_update_staff} />, status: STATUS[app.status], application: app });
            }

            setApplications(newApplications);
            setTotalItems(_applications.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize]);

    function handleClick(data) {
        showDetail(data.application);
    }

    return <>
        {recent.length !== 0 && <Grid container spacing={2} style={{ marginBottom: "30px" }}>
            <Grid item xs={12} sm={12} md={recent.length === 2 ? 6 : 12} lg={recent.length === 2 ? 6 : 12}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                            Recent {vars.applicationTypes[recent[0].type].name} Application
                        </Typography>
                        <Typography variant="h5" component="div">
                            {STATUS[recent[0].status]}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ mt: 1 }}>
                            Last Updated: <TimeAgo timestamp={recent[0].update_timestamp * 1000} />
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            {recent.length === 2 &&
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                Recent {vars.applicationTypes[recent[1].type].name} Application
                            </Typography>
                            <Typography variant="h5" component="div">
                                {STATUS[recent[1].status]}
                            </Typography>
                            <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                Last Updated: <TimeAgo timestamp={recent[1].update_timestamp * 1000} />
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            }
        </Grid>}
        {applications.length > 0 && <CustomTable columns={columns} data={applications} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />}
    </>;
});

const MyApplication = () => {
    return <ApplicationTable></ApplicationTable>;
};

export default MyApplication;