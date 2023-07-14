import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Card, CardContent, Typography, Snackbar, Alert } from '@mui/material';
import { Portal } from '@mui/base';

import { makeRequestsWithAuth, TSep, customAxios as axios, getAuthToken } from '../functions';

var vars = require("../variables");

const Ranking = () => {
    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [userPoints, setUserPoints] = useState(null);
    const [rankIdx, setRankIdx] = useState(null);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [_leaderboard] = await makeRequestsWithAuth([`${vars.dhpath}/dlog/leaderboard?userids=${vars.userInfo.userid}`]);
            if (_leaderboard.list.length === 0) {
                setUserPoints(0);
                setRankIdx(-1);
                const loadingEnd = new CustomEvent('loadingEnd', {});
                window.dispatchEvent(loadingEnd);
                return;
            }
            setUserPoints(_leaderboard.list[0].points.total);

            let points = _leaderboard.list[0].points.total;
            if (points < vars.ranks[0].points) setRankIdx(-1);
            for (let i = 0; i < vars.ranks.length - 1; i++) {
                if (points > vars.ranks[i].points && points < vars.ranks[i + 1].points) {
                    setRankIdx(i);
                }
            }
            if (points > vars.ranks[vars.ranks.length - 1].points) setRankIdx(vars.ranks.length - 1);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    const getDiscordRole = useCallback(async () => {
        let resp = await axios({ url: `${vars.dhpath}/member/roles/rank`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent("You received a new rank role!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, []);

    return <>
        {userPoints !== null && <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={4} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="subtitle2" align="center" gutterBottom>
                            Previous Rank
                        </Typography>
                        {rankIdx >= 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: vars.ranks[rankIdx - 1]?.color }}>
                                {vars.ranks[rankIdx - 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(vars.ranks[rankIdx - 1].points)} Pts | -{TSep(userPoints - vars.ranks[rankIdx - 1].points)} Pts
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
                            <Typography variant="h5" align="center" component="div" sx={{ color: vars.ranks[rankIdx]?.color, cursor: "pointer" }} onClick={getDiscordRole}>
                                {vars.ranks[rankIdx].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(userPoints)} Pts
                            </Typography>
                        </>}
                        {rankIdx <= 0 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: "grey" }}>
                                N/A
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                0 Pts
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
                        {rankIdx + 1 <= vars.ranks.length - 1 && <>
                            <Typography variant="h5" align="center" component="div" sx={{ color: vars.ranks[rankIdx + 1]?.color }}>
                                {vars.ranks[rankIdx + 1].name}
                            </Typography>
                            <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                {TSep(vars.ranks[rankIdx + 1].points)} Pts | +{TSep(vars.ranks[rankIdx + 1].points - userPoints)} Pts
                            </Typography>
                        </>}
                        {rankIdx + 1 > vars.ranks.length - 1 && <>
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
        <br />
        <Grid container spacing={2}>
            {vars.ranks.map((rank) => (
                <Grid item xs={12} sm={12} md={4} lg={4}>
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