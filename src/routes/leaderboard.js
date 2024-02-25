import { useRef, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Avatar, Grid, Box, SpeedDial, SpeedDialAction, Dialog, DialogContent, DialogTitle, DialogActions, Button, TextField, MenuItem, SpeedDialIcon, useTheme } from '@mui/material';
import { customSelectStyles } from '../designs';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears } from '@fortawesome/free-solid-svg-icons';

import Select from 'react-select';

import DateTimeField from '../components/datetime';
import UserCard from '../components/usercard';
import CustomTable from '../components/table';
import UserSelect from '../components/userselect';

import { getRankName, makeRequestsAuto, getMonthUTC, TSep, getCurrentMonthName, removeNUEValues } from '../functions';

function replaceUnderscores(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const LargeUserCard = ({ user, color }) => {
    const { userSettings } = useContext(AppContext);
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={!userSettings.data_saver ? user.avatar : ""} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center">
                    <UserCard user={user} textOnly={true} />
                </Typography>
            </CardContent>
        </Card>
    );
};

const Leaderboard = () => {
    const { t: tr } = useTranslation();
    const { apiPath, allRanks, userSettings } = useContext(AppContext);
    const theme = useTheme();

    const columns = [
        { id: 'rankorder', label: '#' },
        { id: 'member', label: tr("member") },
        { id: 'rankname', label: tr("rank") },
        { id: 'distance', label: tr("distance") },
        { id: 'challenge', label: tr("challenge") },
        { id: 'event', label: tr("event") },
        { id: 'division', label: tr("division") },
        { id: 'bonus', label: tr("bonus") },
        { id: 'total', label: tr("total") },
    ];

    const [dialogOpen, setDialogOpen] = useState("");

    const [monthly, setMonthly] = useState([]);
    const [allTime, setAllTime] = useState([]);

    const inited = useRef(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(userSettings.default_row_per_page);
    const [tempListParam, setTempListParam] = useState({ after: undefined, before: undefined, game: 0, point_types: ["bonus", "distance", "challenge", "division", "event"], users: [] });
    const [listParam, setListParam] = useState({ userids: [], users: [] });

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let [_monthly, _allTime, _leaderboard] = [{}, {}, {}];

            let processedParam = JSON.parse(JSON.stringify(listParam));
            processedParam.userids = processedParam.users.map(user => user.userid);
            delete processedParam.users;
            processedParam = removeNUEValues(processedParam);

            if (!inited.current) {
                [_monthly, _allTime, _leaderboard] = await makeRequestsAuto([
                    { url: `${apiPath}/dlog/leaderboard?page=1&page_size=3&after=` + getMonthUTC() / 1000, auth: true },
                    { url: `${apiPath}/dlog/leaderboard?page=1&page_size=3`, auth: true },
                    { url: `${apiPath}/dlog/leaderboard?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
                setMonthly(_monthly.list);
                setAllTime(_allTime.list);
                inited.current = true;
            } else {
                [_leaderboard] = await makeRequestsAuto([
                    { url: `${apiPath}/dlog/leaderboard?page=${page}&page_size=${pageSize}&${new URLSearchParams(processedParam).toString()}`, auth: true },
                ]);
            }
            let newLeaderboard = [];
            for (let i = 0; i < _leaderboard.list.length; i++) {
                let points = _leaderboard.list[i].points;
                newLeaderboard.push({ rankorder: points.rank, member: <UserCard user={_leaderboard.list[i].user} inline={true} />, rankname: getRankName(points.total, allRanks), distance: TSep(points.distance), challenge: TSep(points.challenge), event: TSep(points.event), division: TSep(points.division), bonus: TSep(points.bonus), total: TSep(points.total), userid: _leaderboard.list[i].user.userid });
            }

            if (pageRef.current === page) {
                setLeaderboard(newLeaderboard);
                setTotalItems(_leaderboard.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, page, pageSize, listParam, allRanks]);

    return <>
        {monthly.length === 3 && <>
            <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                <b>{tr("top_members_of_month", { month: getCurrentMonthName() })}</b>
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
                <b>{tr("top_members_of_all_time")}</b>
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
        {leaderboard.length > 0 && <CustomTable columns={columns} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} style={{ marginTop: "30px" }} />}
        <Dialog open={dialogOpen === "settings"} onClose={() => { setDialogOpen(""); }} fullWidth>
            <DialogTitle><FontAwesomeIcon icon={faGears} />&nbsp;&nbsp;{tr("settings")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2">{tr("change_what_data_to_show_and_how_to_order_them")}</Typography>
                <Grid container spacing={2} sx={{ mt: "5px" }}>
                    <Grid item xs={6}>
                        <TextField
                            label={tr("minimum_points")}
                            value={tempListParam.min_point}
                            onChange={(e) => { if (!isNaN(e.target.value)) setTempListParam({ ...tempListParam, min_point: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={tr("maximum_points")}
                            value={tempListParam.max_point}
                            onChange={(e) => { if (!isNaN(e.target.value)) setTempListParam({ ...tempListParam, max_point: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("after")}
                            defaultValue={tempListParam.after}
                            onChange={(timestamp) => { setTempListParam({ ...tempListParam, after: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("before")}
                            defaultValue={tempListParam.before}
                            onChange={(timestamp) => { setTempListParam({ ...tempListParam, before: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label={tr("speed_limit_kmh")}
                            value={tempListParam.speed_limit}
                            onChange={(e) => { if (!isNaN(e.target.value)) setTempListParam({ ...tempListParam, speed_limit: e.target.value }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField select
                            label={tr("game")}
                            value={tempListParam.game}
                            onChange={(e) => { setTempListParam({ ...tempListParam, game: e.target.value }); }}
                            fullWidth
                        >
                            <MenuItem value="0">{tr("both")}</MenuItem>
                            <MenuItem value="1">{tr("ets2")}</MenuItem>
                            <MenuItem value="2">{tr("ats")}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2">{tr("point_types")}</Typography>
                        <Select
                            isMulti
                            name="colors"
                            options={["bonus", "distance", "challenge", "division", "event"].map((item) => ({ value: item, label: replaceUnderscores(item) }))}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={tempListParam.point_types.map((item) => ({ value: item, label: replaceUnderscores(item) }))}
                            onChange={(newItems) => {
                                setTempListParam({
                                    ...tempListParam,
                                    point_types: newItems.map((item) => (item.value))
                                });
                            }}
                            menuPortalTarget={document.body}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <UserSelect label={tr("users_up_to_100")} users={tempListParam.users} onUpdate={(newUsers) => { setTempListParam({ ...tempListParam, users: newUsers }); }} limit={10} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => { setListParam(tempListParam); setPage(0); }}>{tr("update")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="settings"
                tooltipTitle={tr("settings")}
                icon={<FontAwesomeIcon icon={faGears} />}
                onClick={() => { setDialogOpen("settings"); }} />
        </SpeedDial>
    </>;
};

export default Leaderboard;