import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, Typography, Avatar, Grid, Box } from '@mui/material';

import UserCard from '../components/usercard';
import CustomTable from '../components/table';

import { getRankName, makeRequestsAuto, getMonthUTC, TSep, getCurrentMonthName } from '../functions';

var vars = require("../variables");

const LargeUserCard = ({ user, color }) => {
    return (
        <Card sx={{ minWidth: 150 }}>
            <Link to={`/beta/member/${user.userid}`} style={{ flexGrow: 1, alignItems: "center" }}>
                <Avatar src={user.avatar} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            </Link>
            <CardContent>
                <Typography variant="h6" align="center">
                    <Link to={`/beta/member/${user.userid}`} style={{ flexGrow: 1, alignItems: "center" }}>{user.name}</Link>
                </Typography>
            </CardContent>
        </Card>
    );
};

const columns = [
    { id: 'rankorder', label: '#' },
    { id: 'member', label: 'Member' },
    { id: 'rankname', label: 'Rank' },
    { id: 'distance', label: 'Distance' },
    { id: 'challenge', label: 'Challenge' },
    { id: 'event', label: 'Event' },
    { id: 'division', label: 'Division' },
    { id: 'bonus', label: 'Bonus' },
    { id: 'total', label: 'Total' },
];

const Leaderboard = () => {
    const [monthly, setMonthly] = useState([]);
    const [allTime, setAllTime] = useState([]);

    const [leaderboard, setLeaderboard] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [_monthly, _allTime, _leaderboard] = [{}, {}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1) {
                [_monthly, _allTime, _leaderboard] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/leaderboard?page=1&page_size=3&after=` + getMonthUTC() / 1000, auth: true },
                    { url: `${vars.dhpath}/dlog/leaderboard?page=1&page_size=3`, auth: true },
                    { url: `${vars.dhpath}/dlog/leaderboard?page=${myPage}&page_size=${pageSize}`, auth: true },
                ]);
                setMonthly(_monthly.list);
                setAllTime(_allTime.list);
            } else {
                [_leaderboard] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/leaderboard?page=${myPage}&page_size=${pageSize}`, auth: true },
                ]);
            }
            let newLeaderboard = [];
            for (let i = 0; i < _leaderboard.list.length; i++) {
                let points = _leaderboard.list[i].points;
                newLeaderboard.push({ rankorder: points.rank, member: <UserCard user={_leaderboard.list[i].user} inline={true} />, rankname: getRankName(points.total), distance: TSep(points.distance), challenge: TSep(points.challenge), event: TSep(points.event), division: TSep(points.division), bonus: TSep(points.bonus), total: TSep(points.total), userid: _leaderboard.list[i].user.userid });
            }

            setLeaderboard(newLeaderboard);
            setTotalItems(_leaderboard.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/beta/member/${data.userid}`);
    }

    return <>
        {monthly.length === 3 && <>
            <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                <b>Top Members of {getCurrentMonthName()}</b>
            </Typography>
            <Box sx={{ justifyContent: 'center', display: { sm: 'none', md: 'block' } }}>
                <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[2].user} color="#CD7F32" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[0].user} color="#FFD700" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[1].user} color="#C0C0C0" />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ justifyContent: 'center', display: { sm: 'block', md: 'none' } }}>
                <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[0].user} color="#FFD700" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[1].user} color="#C0C0C0" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={monthly[2].user} color="#CD7F32" />
                    </Grid>
                </Grid>
            </Box>
        </>
        }
        {allTime.length === 3 && <>
            <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                <b>Top Members of All Time</b>
            </Typography>
            <Box sx={{ justifyContent: 'center', display: { sm: 'none', md: 'block' } }}>
                <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[2].user} color="#CD7F32" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[0].user} color="#FFD700" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[1].user} color="#C0C0C0" />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ justifyContent: 'center', display: { sm: 'block', md: 'none' } }}>
                <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[0].user} color="#FFD700" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[1].user} color="#C0C0C0" />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <LargeUserCard user={allTime[2].user} color="#CD7F32" />
                    </Grid>
                </Grid>
            </Box>
        </>
        }
        {leaderboard.length > 0 && <CustomTable columns={columns} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} style={{ marginTop: "30px" }} />}
    </>;
};

export default Leaderboard;