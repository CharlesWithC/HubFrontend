import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback, useContext } from 'react';
import { AppContext, CacheContext } from '../context';

import { Grid, Card, CardContent, Typography, Snackbar, Alert, SpeedDial, SpeedDialIcon, SpeedDialAction, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Button, TextField } from '@mui/material';
import { RefreshRounded, AltRouteRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { makeRequestsWithAuth, TSep, customAxios as axios, getAuthToken, isSameDay } from '../functions';

const Ranking = () => {
    const { t: tr } = useTranslation();
    const { apiConfig, apiPath, allRanks, curUser } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [modalCRTOpen, setModalCRTOpen] = useState(false);
    const handleModalCRTClose = useCallback(() => {
        setModalCRTOpen(false);
    }, [setModalCRTOpen]);

    const [rankIdx, setRankIdx] = useState(null);
    const [curRankTypeId, setRankTypeId] = useState(cache.ranking.curRankTypeId);
    const [curRankRoles, setCurRankRoles] = useState([]);
    const [curRankPointTypes, setCurRankPointTypes] = useState([]);

    const [userPoints, setUserPoints] = useState(cache.ranking.userPoints);
    const [detailedPoints, setDetailedPoints] = useState(cache.ranking.detailedPoints);
    const [bonusStreak, setBonusStreak] = useState(cache.ranking.bonusStreak);

    useEffect(() => {
        return () => {
            setCache(cache => ({
                ...cache,
                ranking: {
                    userPoints,
                    detailedPoints,
                    bonusStreak,
                    curRankTypeId
                }
            }));
        };
    }, [userPoints, detailedPoints, bonusStreak, curRankTypeId]);

    const handleRankTypeIdChange = useCallback((e) => {
        setRankTypeId(e.target.value);
        for (let i = 0; i < allRanks.length; i++) {
            if (allRanks[i].id === e.target.value) {
                setCurRankRoles(allRanks[i].details);
                setCurRankPointTypes(allRanks[i].point_types);
                break;
            }
        }
    }, []);
    useEffect(() => { // init only (handle null / cached data)
        if (curRankTypeId === null) {
            for (let i = 0; i < allRanks.length; i++) {
                if (allRanks[i].default) {
                    setRankTypeId(allRanks[i].id);
                    setCurRankRoles(allRanks[i].details);
                    setCurRankPointTypes(allRanks[i].point_types);
                    break;
                }
            }
        } else {
            for (let i = 0; i < allRanks.length; i++) {
                if (allRanks[i].id === curRankTypeId) {
                    setCurRankRoles(allRanks[i].details);
                    setCurRankPointTypes(allRanks[i].point_types);
                    break;
                }
            }
        }
    }, []);

    useEffect(() => {
        let points = 0;
        for (let i = 0; i < curRankPointTypes.length; i++) {
            if (curRankPointTypes[i] === "distance" && apiConfig.distance_unit === "imperial") {
                points += parseInt(detailedPoints[curRankPointTypes[i]] * 0.621371);
            } else {
                points += detailedPoints[curRankPointTypes[i]];
            }
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
    }, [apiConfig, detailedPoints, curRankRoles, curRankPointTypes]);

    const doLoad = useCallback(async () => {
        window.loading += 1;

        const [_leaderboard, _bonusHistory] = await makeRequestsWithAuth([`${apiPath}/dlog/leaderboard?userids=${curUser.userid}`, `${apiPath}/member/bonus/history`]);

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
            setDetailedPoints({ distance: 0, challenge: 0, event: 0, division: 0, bonus: 0 });
        } else {
            setDetailedPoints(_leaderboard.list[0].points);
        }

        window.loading -= 1;
    }, [apiPath]);
    useEffect(() => {
        doLoad();
    }, [apiPath]);

    const getDiscordRole = useCallback(async () => {
        let resp = await axios({ url: `${apiPath}/member/roles/rank/${curRankTypeId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("you_received_a_new_rank_role"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [apiPath, curRankTypeId]);
    const claimDailyBonus = useCallback(async () => {
        let resp = await axios({ url: `${apiPath}/member/bonus/claim`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("daily_bonus_claimed", { amount: resp.data.bonus }));
            setSnackbarSeverity("success");
            doLoad();
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [apiPath]);

    return <>
        {(userPoints === null || rankIdx === null) && <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("previous_rank")}</Typography>
                        <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                            N/A
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                            0 {tr("pts")} | -0 {tr("pts")}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("current_rank")}</Typography>
                        <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                            N/A
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                            0 {tr("pts")}
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>{tr("daily_bonus")}: / {tr("streak")}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("next_rank")}</Typography>
                        <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                            N/A
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                            0 {tr("pts")} | +0 {tr("pts")}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>}
        {userPoints !== null && rankIdx !== null && <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("previous_rank")}</Typography>
                        {rankIdx >= 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx - 1]?.color }}>
                                {curRankRoles[rankIdx - 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(curRankRoles[rankIdx - 1].points)} {tr("pts")} | -{TSep(userPoints - curRankRoles[rankIdx - 1].points)} {tr("pts")}
                            </Typography>
                        </>}
                        {rankIdx <= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                0 {tr("pts")} | -{TSep(userPoints)} {tr("pts")}
                            </Typography>
                        </>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("current_rank")}</Typography>
                        {rankIdx >= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx]?.color, cursor: "pointer" }} onClick={getDiscordRole}>
                                {curRankRoles[rankIdx].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(userPoints)} {tr("pts")}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>{tr("daily_bonus")}: {bonusStreak} {tr("streak")}</Typography>
                        </>}
                        {rankIdx <= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                0 {tr("pts")}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>{tr("daily_bonus")}: {bonusStreak} {tr("streak")}</Typography>
                        </>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>{tr("next_rank")}</Typography>
                        {rankIdx + 1 <= curRankRoles.length - 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: curRankRoles[rankIdx + 1]?.color }}>
                                {curRankRoles[rankIdx + 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(curRankRoles[rankIdx + 1].points)} {tr("pts")} | +{TSep(curRankRoles[rankIdx + 1].points - userPoints)} {tr("pts")}
                            </Typography>
                        </>}
                        {rankIdx + 1 > curRankRoles.length - 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                ∞ {tr("pts")} | +∞ {tr("pts")}
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
                                {TSep(rank.points)} {tr("pts")}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid >
            ))}
        </Grid>
        <Dialog open={modalCRTOpen} onClose={handleModalCRTClose}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", minWidth: "300px" }}>
                    <AltRouteRounded />&nbsp;&nbsp;{tr("change_rank_type")}</Typography>
            </DialogTitle>
            <DialogContent>
                <TextField select
                    label={tr("rank_type")}
                    value={`${curRankTypeId}`}
                    onChange={handleRankTypeIdChange}
                    sx={{ marginTop: "6px", height: "30px" }}
                    fullWidth size="small"
                >
                    {allRanks.map((ranktype, index) => (
                        <MenuItem value={`${ranktype.id}`} key={index}>{ranktype.name}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleModalCRTClose} variant="contained" color="secondary" sx={{ ml: 'auto' }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle={tr("refresh")}
                onClick={() => doLoad()}
            />
            <SpeedDialAction
                key="rank_type"
                icon={<AltRouteRounded />}
                tooltipTitle={tr("change_rank_type")}
                onClick={() => setModalCRTOpen(true)}
            />
            <SpeedDialAction
                key="bonus"
                icon={<FontAwesomeIcon icon={faCoins} />}
                tooltipTitle={tr("claim_daily_bonus")}
                onClick={() => claimDailyBonus()}
            />
            <SpeedDialAction
                key="discord"
                icon={<FontAwesomeIcon icon={faDiscord} />}
                tooltipTitle={tr("get_discord_role")}
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