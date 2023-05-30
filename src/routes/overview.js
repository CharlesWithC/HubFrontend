import { memo, useEffect, useState } from 'react';
import { Grid, Table, TableHead, TableRow, TableBody, TableCell, Card, CardContent, Typography } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, RouteRounded, EuroRounded, AttachMoneyRounded, LocalGasStationRounded, LeaderboardRounded, DirectionsRunRounded, EmojiPeopleRounded } from '@mui/icons-material';
import SimpleBar from 'simplebar-react';

import { TSep, ConvertUnit, timeAgo, makeRequestsAuto } from '../functions';
import StatCard from '../components/statcard';
import UserCard from '../components/usercard';

function getTodayUTC() {
    const today = new Date();
    const utcDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    return utcDate.getTime();
}

function getMonthUTC() {
    const today = new Date();
    const utcDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
    return utcDate.getTime();
}

var vars = require("../variables");

const Overview = () => {
    const [latest, setLatest] = useState({ driver: 0, job: 0, distance: 0, fuel: 0, profit_euro: 0, profit_dollar: 0 });
    const [charts, setCharts] = useState({ driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] });
    const [leaderboard, setLeaderboard] = useState([]);
    const [recentVisitors, setRecentVisitors] = useState([]);
    const [newestMember, setNewestMember] = useState([]);
    const [latestDelivery, setLatestDelivery] = useState([]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [chartNSU, chartSU, lboard, rvisitors, nmember, ldelivery] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/statistics/chart?ranges=7&interval=86400&sum_up=false&before=` + getTodayUTC() / 1000, auth: false },
                { url: `${vars.dhpath}/dlog/statistics/chart?ranges=7&interval=86400&sum_up=true&before=` + getTodayUTC() / 1000, auth: false },
                { url: `${vars.dhpath}/dlog/leaderboard?page=1&page_size=5&after=` + getMonthUTC() / 1000, auth: true },
                { url: `${vars.dhpath}/member/list?page=1&page_size=5&order_by=last_seen&order=desc`, auth: true },
                { url: `${vars.dhpath}/member/list?page=1&page_size=1&order_by=join_timestamp&order=desc`, auth: true },
                { url: `${vars.dhpath}/dlog/list?page=1&page_size=1&order=desc`, auth: true }
            ]);

            let newLatest = { driver: chartSU[chartSU.length - 1].driver, job: chartSU[chartSU.length - 1].job.sum, distance: chartSU[chartSU.length - 1].distance.sum, fuel: chartSU[chartSU.length - 1].fuel.sum, profit_euro: chartSU[chartSU.length - 1].profit.euro, profit_dollar: chartSU[chartSU.length - 1].profit.dollar };
            setLatest(newLatest);

            let newCharts = { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] };
            for (let i = 0; i < chartNSU.length; i++) {
                if (i === 0) {
                    newCharts.driver.push(chartNSU[i].driver);
                } else {
                    newCharts.driver.push(newCharts.driver[i - 1] + chartNSU[i].driver);
                }
                newCharts.job.push(chartNSU[i].job.sum);
                newCharts.distance.push(chartNSU[i].distance.sum);
                newCharts.fuel.push(chartNSU[i].fuel.sum);
                newCharts.profit_euro.push(chartNSU[i].profit.euro);
                newCharts.profit_dollar.push(chartNSU[i].profit.dollar);
            }
            setCharts(newCharts);

            if (lboard.list !== undefined) {
                let newLeaderboard = [];
                for (let i = 0; i < lboard.list.length; i++) {
                    let row = lboard.list[i];
                    newLeaderboard.push({ "user": <UserCard user={row.user} />, "points": row.points.total, "total_points": row.points.total_no_limit, "rank": row.points.rank, "total_rank": row.points.rank_no_limit });
                }
                setLeaderboard(newLeaderboard);
            }

            if (rvisitors.list !== undefined) {
                let newRecentVisitors = [];
                for (let i = 0; i < rvisitors.list.length; i++) {
                    let row = rvisitors.list[i];
                    newRecentVisitors.push({ "user": <UserCard user={row} />, "timestamp": row.activity.last_seen });
                }
                setRecentVisitors(newRecentVisitors);
            }

            if (nmember.list !== undefined) {
                setNewestMember(nmember.list[0]);
            }
            if (ldelivery.list !== undefined) {
                setLatestDelivery(ldelivery.list[0]);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    return (<Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<PermContactCalendarRounded />} title={"Drivers"} latest={TSep(latest.driver).replaceAll(",", " ")} inputs={charts.driver} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<LocalShippingRounded />} title={"Jobs"} latest={TSep(latest.job).replaceAll(",", " ")} inputs={charts.job} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<RouteRounded />} title={"Distance"} latest={ConvertUnit("km", latest.distance).replaceAll(",", " ")} inputs={charts.distance} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<EuroRounded />} title={"Profit (ETS2)"} latest={TSep(latest.profit_euro).replaceAll(",", " ") + "€"} inputs={charts.profit_euro} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<AttachMoneyRounded />} title={"Profit (ATS)"} latest={TSep(latest.profit_dollar).replaceAll(",", " ") + "$"} inputs={charts.profit_dollar} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<LocalGasStationRounded />} title={"Fuel"} latest={ConvertUnit("l", latest.fuel).replaceAll(",", " ")} inputs={charts.fuel} />
        </Grid>
        {vars.isLoggedIn &&
            <><Grid item xs={12} sm={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                <EmojiPeopleRounded />&nbsp;&nbsp;Newest Member
                            </Typography>
                        </div>
                        <br></br>
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                <UserCard size="40" user={newestMember} />
                                --- Joined {timeAgo(newestMember.join_timestamp * 1000).toLowerCase()}
                            </Typography>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
                <Grid item xs={12} sm={12} md={6} lg={8}>
                    <Card>
                        <CardContent>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    <LocalShippingRounded />&nbsp;&nbsp;Latest Delivery
                                </Typography>
                            </div>
                            <br></br>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    {latestDelivery.cargo}: {latestDelivery.source_city} {'->'} {latestDelivery.destination_city} ({ConvertUnit("km", latestDelivery.distance)})
                                </Typography>
                                <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", maxWidth: "fit-content" }}>
                                    --- By&nbsp;&nbsp;<UserCard size="40" user={latestDelivery.user} />
                                </Typography>
                            </div>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={8}>
                    <Card>
                        <CardContent>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    <LeaderboardRounded />&nbsp;&nbsp;Leaderboard
                                </Typography>
                            </div>
                            <SimpleBar style={{ overflowY: "hidden" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Driver</TableCell>
                                            <TableCell align="right">Points</TableCell>
                                            <TableCell align="left">Rank (1 month)</TableCell>
                                            <TableCell align="right">Points</TableCell>
                                            <TableCell align="left">Rank (all time)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {leaderboard.map((row, idx) => {
                                            return (<TableRow key={`leaderboard-${idx}`}>
                                                <TableCell>{row.user}</TableCell>
                                                <TableCell align="right">{row.points}</TableCell>
                                                <TableCell align="left">#{row.rank}</TableCell>
                                                <TableCell align="right">{row.total_points}</TableCell>
                                                <TableCell align="left">#{row.total_rank}</TableCell>
                                            </TableRow>);
                                        })}
                                    </TableBody>
                                </Table>
                            </SimpleBar>
                        </CardContent>
                    </Card >
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Card>
                        <CardContent>
                            <div style={{ display: "flex", flexDirection: "row" }}>
                                <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    <DirectionsRunRounded />&nbsp;&nbsp;Recent Visitors
                                </Typography>
                            </div>
                            <SimpleBar style={{ overflowY: "hidden" }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell align="right">Last Seen</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {recentVisitors.map((row, idx) => {
                                            return (<TableRow key={`recent-visitors-${idx}`}>
                                                <TableCell>{row.user}</TableCell>
                                                <TableCell align="right">{timeAgo(row.timestamp * 1000)}</TableCell>
                                            </TableRow>);
                                        })}
                                    </TableBody>
                                </Table>
                            </SimpleBar>
                        </CardContent>
                    </Card >
                </Grid></>
        }
    </Grid>);
};

export default memo(Overview);