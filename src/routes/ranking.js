import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, Snackbar, Alert, SpeedDial, SpeedDialIcon, SpeedDialAction, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Button, TextField } from '@mui/material';
import { RefreshRounded, AltRouteRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { makeRequestsWithAuth, TSep, customAxios as axios, getAuthToken, isSameDay } from '../functions';

var vars = require("../variables");

const Ranking = () => {
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [modalCRTOpen, setModalCRTOpen] = useState(false);
    const handleModalCRTClose = useCallback(() => {
        setModalCRTOpen(false);
    }, [setModalCRTOpen]);

    const [curRankTypeId, setRankTypeId] = useState(null);
    const [curRankRoles, setCurRankRoles] = useState([]);
    const [curRankPointTypes, setCurRankPointTypes] = useState([]);
    const [userPoints, setUserPoints] = useState(null);
    const [rankIdx, setRankIdx] = useState(null);
    const [bonusStreak, setBonusStreak] = useState("/");

    const handleRankTypeIdChange = useCallback((e) => {
        setRankTypeId(e.target.value);
    }, []);

    const doLoad = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        if (curRankTypeId === null) {
            for (let i = 0; i < vars.ranks.length; i++) {
                if (vars.ranks[i].default) {
                    setRankTypeId(vars.ranks[i].id);
                    setCurRankRoles(vars.ranks[i].details);
                    setCurRankPointTypes(vars.ranks[i].point_types);
                    break;
                }
            }
        }

        const [_leaderboard, _bonusHistory] = await makeRequestsWithAuth([`${vars.dhpath}/dlog/leaderboard?userids=${vars.userInfo.userid}`, `${vars.dhpath}/member/bonus/history`]);
        for (let i = _bonusHistory.length - 1; i >= 0; i--) {
            if (isSameDay(_bonusHistory[i].timestamp * 1000)) {
                setBonusStreak(`${_bonusHistory[i].streak + 1}`);
                break;
            } else if (isSameDay(_bonusHistory[i].timestamp * 1000 + 86400000)) {
                setBonusStreak(`${_bonusHistory[i].streak + 1}*`);
                break;
            }
        }
        if (_leaderboard.list.length === 0) {
            setUserPoints(0);
            setRankIdx(-1);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            return;
        }

        let points = 0;
        for (let i = 0; i < curRankPointTypes.length; i++) {
            points += _leaderboard.list[0].points[curRankPointTypes[i]];
        }
        setUserPoints(points);

        if (curRankRoles.length === 0 || points < curRankRoles[0].points) setRankIdx(-1);
        else {
            for (let i = 0; i < curRankRoles.length - 1; i++) {
                if (points > curRankRoles[i].points && points < curRankRoles[i + 1].points) {
                    setRankIdx(i);
                }
            }
            if (points > curRankRoles[curRankRoles.length - 1].points) setRankIdx(curRankRoles.length - 1);
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [curRankPointTypes, curRankRoles, curRankTypeId]);
    useEffect(() => {
        doLoad();
    }, [curRankPointTypes, curRankRoles, curRankTypeId, doLoad]);

    const getDiscordRole = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/member/roles/rank/${curRankTypeId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("You received a new rank role!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [curRankTypeId]);
    const claimDailyBonus = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/member/bonus/claim`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(`Daily bonus claimed! You got ${resp.data.bonus} points. Remember to come back tomorrow and don't break your streak!`);
            setSnackbarSeverity("success");
            doLoad();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [doLoad]);

    return <>
        {userPoints !== null && rankIdx !== null && <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            Previous Rank
                        </Typography>
                        {rankIdx >= 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx - 1]?.color }}>
                                {curRankRoles[rankIdx - 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(curRankRoles[rankIdx - 1].points)} Pts | -{TSep(userPoints - curRankRoles[rankIdx - 1].points)} Pts
                            </Typography>
                        </>}
                        {rankIdx <= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                0 Pts | -{TSep(userPoints)} Pts
                            </Typography>
                        </>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            Current Rank
                        </Typography>
                        {rankIdx >= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx]?.color, cursor: "pointer" }} onClick={getDiscordRole}>
                                {curRankRoles[rankIdx].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(userPoints)} Pts
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                Daily Bonus: {bonusStreak} Streak
                            </Typography>
                        </>}
                        {rankIdx <= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                0 Pts
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                Daily Bonus: {bonusStreak} Streak
                            </Typography>
                        </>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            Next Rank
                        </Typography>
                        {rankIdx + 1 <= curRankRoles.length - 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx + 1]?.color }}>
                                {curRankRoles[rankIdx + 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(curRankRoles[rankIdx + 1].points)} Pts | +{TSep(curRankRoles[rankIdx + 1].points - userPoints)} Pts
                            </Typography>
                        </>}
                        {rankIdx + 1 > curRankRoles.length - 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                ∞ Pts | +∞ Pts
                            </Typography>
                        </>}
                    </CardContent>
                </Card>
            </Grid >
        </Grid >}
        <Grid container spacing={2}>
            {curRankRoles.map((rank, idx) => (
                <Grid item xs={12} sm={12} md={4} lg={4} key={`rank-${idx}`}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" align="center" component="div" sx={{ ...rank.points < userPoints ? { textDecoration: "line-through" } : {}, color: rank?.color }}>
                                {rank.name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ ...rank.points < userPoints ? { color: "grey" } : {}, mt: 1 }}>
                                {TSep(rank.points)} Pts
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid >
            ))}
        </Grid>
        <Dialog open={modalCRTOpen} onClose={handleModalCRTClose}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", minWidth: "300px" }}>
                    <AltRouteRounded />&nbsp;&nbsp;Change Rank Type
                </Typography>
            </DialogTitle>
            <DialogContent>
                <TextField select
                    label="Rank Type"
                    value={`${curRankTypeId}`}
                    onChange={handleRankTypeIdChange}
                    sx={{ marginTop: "6px", height: "30px" }}
                    fullWidth size="small"
                >
                    {vars.ranks.map((ranktype, index) => (
                        <MenuItem value={`${ranktype.id}`} key={index}>{ranktype.name}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleModalCRTClose} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle="Refresh"
                onClick={() => doLoad()}
            />
            <SpeedDialAction
                key="rank_type"
                icon={<AltRouteRounded />}
                tooltipTitle="Change Rank Type"
                onClick={() => setModalCRTOpen(true)}
            />
            <SpeedDialAction
                key="bonus"
                icon={<FontAwesomeIcon icon={faCoins} />}
                tooltipTitle="Claim Daily Bonus"
                onClick={() => claimDailyBonus()}
            />
            <SpeedDialAction
                key="discord"
                icon={<FontAwesomeIcon icon={faDiscord} />}
                tooltipTitle="Get Discord Role"
                onClick={() => getDiscordRole()}
            />
        </SpeedDial>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>;
};

export default Ranking;