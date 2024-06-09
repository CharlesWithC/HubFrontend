import { useEffect, useState, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';
import debounce from 'lodash.debounce';

import { Grid, Typography, Snackbar, Alert } from '@mui/material';
import { PermContactCalendarRounded, LocalShippingRounded, RouteRounded, EuroRounded, AttachMoneyRounded, LocalGasStationRounded, WidgetsRounded, FlightTakeoffRounded, FlightLandRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag, faRightFromBracket, faTowerObservation, faTrailer } from '@fortawesome/free-solid-svg-icons';

import StatCard from '../components/statcard';
import DateTimeField from '../components/datetime';
import UserSelect from '../components/userselect';
import Podium from '../components/podium';

import { TSep, ConvertUnit, makeRequestsAuto, getTodayUTC } from '../functions';

function replaceUnderscores(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const Statistics = () => {
    const { t: tr } = useTranslation();
    const { apiPath, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback((e) => {
        setSnackbarContent("");
    }, []);

    const [startTime, setStartTime] = useState(cache.statistics.startTime);
    const [endTime, setEndTime] = useState(cache.statistics.endTime);
    const [selectedUser, setSelectedUser] = useState(cache.statistics.selectedUser);
    const [latest, setLatest] = useState(cache.statistics.latest);
    const [delta, setDelta] = useState(cache.statistics.delta);
    const [charts, setCharts] = useState(cache.statistics.charts);
    const [originalChart, setOriginalChart] = useState(cache.statistics.originalChart);
    const [xAxis, setXAxis] = useState(cache.statistics.xAxis);
    const [detailStats, setDetailStats] = useState(cache.statistics.detailStats);

    useEffect(() => {
        return () => {
            setCache(cache => ({
                ...cache,
                statistics: {
                    startTime,
                    endTime,
                    selectedUser,
                    latest,
                    delta,
                    charts,
                    originalChart,
                    xAxis,
                    detailStats
                }
            }));
        };
    }, [startTime, endTime, selectedUser, latest, delta, charts, originalChart, xAxis, detailStats]);

    useEffect(() => {
        const doLoad = debounce(async () => {
            window.loading += 1;

            let totalSeconds = endTime - startTime;
            if (totalSeconds <= 0) {
                window.loading -= 1;
                setSnackbarContent(tr("invalid_time_range"));
                setSnackbarSeverity("error");
                return;
            }
            let days = Math.ceil(totalSeconds / 86400);
            let ranges = 7, interval = 86400;
            if (days <= 1) { ranges = 72; interval = 1200; } // <= 1d | 72 data/d
            else if (days <= 3) { ranges = days * 24; interval = 3600; } // <= 3d | 24 data/d
            else if (days <= 7) { ranges = days * 6; interval = 14400; } // <= 7d | 6 data/d
            else if (days <= 14) { ranges = days * 3; interval = 28800; } // <= 14d | 3 data/d
            else if (days <= 28) { ranges = days * 2; interval = 43200; } // <= 28d | 2 data/d
            else if (days <= 100) { ranges = days; interval = 86400; } // <= 100d | 1 data/d
            else { ranges = 100; interval = Math.ceil(totalSeconds / ranges); }

            try {
                const [chartSU, detailS] = await makeRequestsAuto([
                    { url: `${apiPath}/dlog/statistics/chart?ranges=${ranges}&interval=${interval}&sum_up=true&before=${endTime}${selectedUser.userid !== -1000 ? `&userid=${selectedUser.userid}` : ``}`, auth: "prefer" },
                    { url: `${apiPath}/dlog/statistics/details?after=${startTime}&before=${endTime}${selectedUser.userid !== -1000 ? `&userid=${selectedUser.userid}` : ``}`, auth: true },
                ]);

                if (chartSU) {
                    let newLatest = { driver: chartSU[chartSU.length - 1].driver, job: chartSU[chartSU.length - 1].job.sum, distance: chartSU[chartSU.length - 1].distance.sum, fuel: chartSU[chartSU.length - 1].fuel.sum, profit_euro: chartSU[chartSU.length - 1].profit.euro, profit_dollar: chartSU[chartSU.length - 1].profit.dollar };
                    setLatest(newLatest);
                    
                    let newDelta = { driver: newLatest.driver - chartSU[0].driver, job: newLatest.job - chartSU[0].job.sum, distance: newLatest.distance - chartSU[0].distance.sum, fuel: newLatest.fuel - chartSU[0].fuel.sum, profit_euro: newLatest.profit_euro - chartSU[0].profit.euro, profit_dollar: newLatest.profit_dollar - chartSU[0].profit.dollar };
                    setDelta(newDelta);

                    let newBase = { driver: (newLatest.driver - chartSU[0].driver) / 10, job: (newLatest.job - chartSU[0].job.sum) / 10, distance: (newLatest.distance - chartSU[0].distance.sum) / 10, fuel: (newLatest.fuel - chartSU[0].fuel.sum) / 10, profit_euro: (newLatest.profit_euro - chartSU[0].profit.euro) / 10, profit_dollar: (newLatest.profit_dollar - chartSU[0].profit.dollar) / 10 };

                    let newCharts = { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] };
                    let newOriginalChart = { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] };
                    let newXAxis = [];
                    for (let i = 0; i < chartSU.length; i++) {
                        newXAxis.push({ startTime: chartSU[i].start_time, endTime: chartSU[i].end_time });
                        newOriginalChart.driver.push(chartSU[i].driver);
                        newOriginalChart.job.push(chartSU[i].job.sum);
                        newOriginalChart.distance.push(chartSU[i].distance.sum);
                        newOriginalChart.fuel.push(chartSU[i].fuel.sum);
                        newOriginalChart.profit_euro.push(chartSU[i].profit.euro);
                        newOriginalChart.profit_dollar.push(chartSU[i].profit.dollar);
                        if (i === 0) {
                            newCharts.driver.push(newBase.driver);
                            newCharts.job.push(newBase.job);
                            newCharts.distance.push(newBase.distance);
                            newCharts.fuel.push(newBase.fuel);
                            newCharts.profit_euro.push(newBase.profit_euro);
                            newCharts.profit_dollar.push(newBase.profit_dollar);
                        } else {
                            newCharts.driver.push(newBase.driver + chartSU[i].driver - chartSU[0].driver);
                            newCharts.job.push(newBase.job + chartSU[i].job.sum - chartSU[0].job.sum);
                            newCharts.distance.push(newBase.distance + chartSU[i].distance.sum - chartSU[0].distance.sum);
                            newCharts.fuel.push(newBase.fuel + chartSU[i].fuel.sum - chartSU[0].fuel.sum);
                            newCharts.profit_euro.push(newBase.profit_euro + chartSU[i].profit.euro - chartSU[0].profit.euro);
                            newCharts.profit_dollar.push(newBase.profit_dollar + chartSU[i].profit.dollar - chartSU[0].profit.dollar);
                        }
                    }
                    setCharts(newCharts);
                    setOriginalChart(newOriginalChart);
                    setXAxis(newXAxis);
                }

                if (detailS) {
                    setDetailStats(detailS);
                }
            } catch {
                setSnackbarContent(tr("an_error_occurred_while_loading_data"));
                setSnackbarSeverity("error");
            }

            window.loading -= 1;
        }, 1000);
        doLoad();
        return () => doLoad.cancel();
    }, [apiPath, startTime, endTime, selectedUser]);

    return (<>
        <Grid container spacing={2}>
            <Grid item xs={6} md={4}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("start_time")}</Typography>
                <DateTimeField
                    defaultValue={startTime}
                    onChange={(timestamp) => { setStartTime(timestamp); }}
                    fullWidth size="small"
                />
            </Grid>
            <Grid item xs={6} md={4}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("end_time")}</Typography>
                <DateTimeField
                    defaultValue={endTime}
                    onChange={(timestamp) => { setEndTime(timestamp); }}
                    fullWidth size="small"
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("user")}</Typography>
                <UserSelect users={[selectedUser]} isMulti={false} includeCompany={true} onUpdate={setSelectedUser} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<PermContactCalendarRounded />} title={tr("drivers")} latest={TSep(latest.driver).replaceAll(",", " ")} delta={TSep(delta.driver).replaceAll(",", " ")} inputs={charts.driver} originalInputs={originalChart.driver} xAxis={xAxis} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<LocalShippingRounded />} title={tr("jobs")} latest={TSep(latest.job).replaceAll(",", " ")} delta={TSep(delta.job).replaceAll(",", " ")} inputs={charts.job} originalInputs={originalChart.job} xAxis={xAxis} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<RouteRounded />} title={tr("distance")} latest={ConvertUnit(userSettings.unit, "km", latest.distance).replaceAll(",", " ")} delta={ConvertUnit(userSettings.unit, "km", delta.distance).replaceAll(",", " ")} inputs={charts.distance} originalInputs={originalChart.distance} xAxis={xAxis} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<EuroRounded />} title={tr("profit_ets2")} latest={"€" + TSep(latest.profit_euro).replaceAll(",", " ")} delta={"€" + TSep(delta.profit_euro).replaceAll(",", " ")} inputs={charts.profit_euro} originalInputs={originalChart.profit_euro} xAxis={xAxis} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<AttachMoneyRounded />} title={tr("profit_ats")} latest={"$" + TSep(latest.profit_dollar).replaceAll(",", " ")} delta={"$" + TSep(delta.profit_dollar).replaceAll(",", " ")} inputs={charts.profit_dollar} originalInputs={originalChart.profit_dollar} xAxis={xAxis} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <StatCard icon={<LocalGasStationRounded />} title={tr("fuel")} latest={ConvertUnit(userSettings.unit, "l", latest.fuel).replaceAll(",", " ")} delta={ConvertUnit(userSettings.unit, "l", delta.fuel).replaceAll(",", " ")} inputs={charts.fuel} originalInputs={originalChart.fuel} xAxis={xAxis} />
            </Grid>
            {detailStats.truck !== undefined && detailStats.truck.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <LocalShippingRounded />&nbsp;&nbsp;{tr("top_trucks")}</Typography>
                }
                    first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.trailer !== undefined && detailStats.trailer.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faTrailer} />&nbsp;&nbsp;{tr("top_trailers")}</Typography>
                } first={{ name: replaceUnderscores(detailStats.trailer[0].unique_id), stat: detailStats.trailer[0].count }} second={{ name: replaceUnderscores(detailStats.trailer[1].unique_id), stat: detailStats.trailer[1].count }} third={{ name: replaceUnderscores(detailStats.trailer[2].unique_id), stat: detailStats.trailer[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.cargo !== undefined && detailStats.cargo.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <WidgetsRounded />&nbsp;&nbsp;{tr("top_cargos")}</Typography>
                } first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.fine !== undefined && detailStats.fine.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faTowerObservation} />&nbsp;&nbsp;{tr("top_offences")}</Typography>
                } first={{ name: replaceUnderscores(detailStats.fine[0].unique_id), stat: detailStats.fine[0].count }} second={{ name: replaceUnderscores(detailStats.fine[1].unique_id), stat: detailStats.fine[1].count }} third={{ name: replaceUnderscores(detailStats.fine[2].unique_id), stat: detailStats.fine[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.ferry !== undefined && detailStats.ferry.length >= 3 && <Grid item xs={12} sm={12} md={12} lg={detailStats.fine !== undefined && detailStats.fine.length >= 3 ? 8 : 12}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFlag} />&nbsp;&nbsp;{tr("top_ferry_routes")}</Typography>
                } first={{ name: detailStats.ferry[0].name, stat: detailStats.ferry[0].count }} second={{ name: detailStats.ferry[1].name, stat: detailStats.ferry[1].count }} third={{ name: detailStats.ferry[2].name, stat: detailStats.ferry[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.source_city !== undefined && detailStats.source_city.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={detailStats.plate_country !== undefined && detailStats.plate_country.length >= 3 ? 4 : 6}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FlightTakeoffRounded />&nbsp;&nbsp;{tr("top_source_cities")}</Typography>
                } first={{ name: detailStats.source_city[0].name, stat: detailStats.source_city[0].count }} second={{ name: detailStats.source_city[1].name, stat: detailStats.source_city[1].count }} third={{ name: detailStats.source_city[2].name, stat: detailStats.source_city[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.destination_city !== undefined && detailStats.destination_city.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={detailStats.plate_country !== undefined && detailStats.plate_country.length >= 3 ? 4 : 6}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FlightLandRounded />&nbsp;&nbsp;{tr("top_destination_cities")}</Typography>
                } first={{ name: detailStats.destination_city[0].name, stat: detailStats.destination_city[0].count }} second={{ name: detailStats.destination_city[1].name, stat: detailStats.destination_city[1].count }} third={{ name: detailStats.destination_city[2].name, stat: detailStats.destination_city[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.plate_country !== undefined && detailStats.plate_country.length >= 3 && <Grid item xs={12} sm={12} md={12} lg={4}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faFlag} />&nbsp;&nbsp;{tr("top_plate_countries")}</Typography>
                } first={{ name: detailStats.plate_country[0].name, stat: detailStats.plate_country[0].count }} second={{ name: detailStats.plate_country[1].name, stat: detailStats.plate_country[1].count }} third={{ name: detailStats.plate_country[2].name, stat: detailStats.plate_country[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.source_company !== undefined && detailStats.source_company.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={6}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faRightFromBracket} flip="horizontal" />&nbsp;&nbsp;{tr("top_source_companies")}</Typography>
                } first={{ name: detailStats.source_company[0].name, stat: detailStats.source_company[0].count }} second={{ name: detailStats.source_company[1].name, stat: detailStats.source_company[1].count }} third={{ name: detailStats.source_company[2].name, stat: detailStats.source_company[2].count }} fixWidth={true} />
            </Grid>}
            {detailStats.destination_company !== undefined && detailStats.destination_company.length >= 3 && <Grid item xs={12} sm={12} md={6} lg={6}>
                <Podium title={
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        <FontAwesomeIcon icon={faRightFromBracket} />&nbsp;&nbsp;{tr("top_destination_companies")}</Typography>
                } first={{ name: detailStats.destination_company[0].name, stat: detailStats.destination_company[0].count }} second={{ name: detailStats.destination_company[1].name, stat: detailStats.destination_company[1].count }} third={{ name: detailStats.destination_company[2].name, stat: detailStats.destination_company[2].count }} fixWidth={true} />
            </Grid>}
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
    </>);
};

export default Statistics;