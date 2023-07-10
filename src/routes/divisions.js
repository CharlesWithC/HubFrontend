import { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardContent, Typography, Grid, SpeedDial, SpeedDialIcon, SpeedDialAction, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Select, MenuItem, Snackbar, Alert, Pagination, IconButton } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, EuroRounded, AttachMoneyRounded, RouteRounded, LocalGasStationRounded, EmojiEventsRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import { ConvertUnit, TSep, makeRequestsWithAuth, checkUserPerm, customAxios as axios, checkPerm, getAuthToken } from '../functions';

var vars = require("../variables");

const DivisionCard = ({ division }) => {
    return (<Card>
        <CardContent>
            <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                <Typography variant="h5" sx={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {division.name}
                    </div>
                </Typography>
            </div>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PermContactCalendarRounded />&nbsp;{TSep(division.drivers)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShippingRounded />&nbsp;{TSep(division.jobs)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <RouteRounded />&nbsp;{ConvertUnit("km", division.distance)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalGasStationRounded />&nbsp;{ConvertUnit("l", division.fuel)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EuroRounded />&nbsp;{TSep(division.profit.euro)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoneyRounded />&nbsp;{TSep(division.profit.dollar)}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmojiEventsRounded />&nbsp;{TSep(division.points)}
                    </Typography>
                </Grid>
            </Grid>
        </CardContent>
    </Card>);
};

const DivisionsMemo = memo(({ doReload }) => {
    const [divisions, setDivisions] = useState([]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let urls = [
                `${vars.dhpath}/divisions`,
            ];
            let [_divisions] = await makeRequestsWithAuth(urls);
            setDivisions(_divisions);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [doReload]);

    return (<Grid container spacing={2}>
        {divisions.map((division, index) => (
            <Grid item xs={12} sm={12} md={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6} lg={divisions.length % 2 === 0 ? 6 : index === divisions.length - 1 ? 12 : 6}>
                <DivisionCard division={division} />
            </Grid>
        ))}
    </Grid>);
});

const Divisions = () => {
    return <DivisionsMemo />;
};

export default Divisions;