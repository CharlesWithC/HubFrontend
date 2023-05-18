import StatCard from '../components/statcard';
import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { TSep, ConvertUnit } from '../functions';
import { PermContactCalendarRounded, LocalShippingRounded, RouteRounded, EuroRounded, AttachMoneyRounded, LocalGasStationRounded } from '@mui/icons-material';

import axios from 'axios';
const axiosRetry = require('axios-retry');
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

function getTodayUTC() {
    const today = new Date();
    const utcDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    return utcDate.getTime();
}

var vars = require("../variables");

function Overview() {
    const makeRequests = async (urls) => {
        const responses = await Promise.all(
            urls.map((url) =>
                axios({
                    url,
                })
            )
        );
        return responses.map((response) => response.data);
    };

    const [latest, setLatest] = useState({ driver: 0, job: 0, distance: 0, fuel: 0, profit_euro: 0, profit_dollar: 0 });
    const [inputs, setInputs] = useState({ driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] });

    useEffect(() => {
        async function doLoad() {
            var urlsBatch = [
                `${vars.dhpath}/dlog/statistics/chart?ranges=7&interval=86400&sum_up=false&before=` + getTodayUTC() / 1000,
                `${vars.dhpath}/dlog/statistics/chart?ranges=7&interval=86400&sum_up=true&before=` + getTodayUTC() / 1000,
            ];

            const [noSumUp, sumUp] = await makeRequests(urlsBatch);

            let newLatest = { driver: sumUp[sumUp.length - 1].driver, job: sumUp[sumUp.length - 1].job, distance: sumUp[sumUp.length - 1].distance, fuel: sumUp[sumUp.length - 1].fuel, profit_euro: sumUp[sumUp.length - 1].profit.euro, profit_dollar: sumUp[sumUp.length - 1].profit.dollar };

            let newInputs = { driver: [], job: [], distance: [], fuel: [], profit_euro: [], profit_dollar: [] };

            for (let i = 0; i < noSumUp.length; i++) {
                if (i === 0) {
                    newInputs.driver.push(noSumUp[i].driver);
                } else {
                    newInputs.driver.push(newInputs.driver[i - 1] + noSumUp[i].driver);
                }
                newInputs.job.push(noSumUp[i].job);
                newInputs.distance.push(noSumUp[i].distance);
                newInputs.fuel.push(noSumUp[i].fuel);
                newInputs.profit_euro.push(noSumUp[i].profit.euro);
                newInputs.profit_dollar.push(noSumUp[i].profit.dollar);
            }

            setLatest(newLatest);
            setInputs(newInputs);
        }
        doLoad();
    }, []);

    return (<Grid container spacing={2}>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<PermContactCalendarRounded />} title={"Drivers"} latest={TSep(latest.driver)} inputs={inputs.driver} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<LocalShippingRounded />} title={"Jobs"} latest={TSep(latest.job)} inputs={inputs.job} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<RouteRounded />} title={"Distance"} latest={ConvertUnit("km", latest.distance)} inputs={inputs.distance} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<EuroRounded />} title={"Profit (ETS2)"} latest={TSep(latest.profit_euro) + "€"} inputs={inputs.profit_euro} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<AttachMoneyRounded />} title={"Profit (ATS)"} latest={TSep(latest.profit_dollar) + "$"} inputs={inputs.profit_dollar} />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={4}>
            <StatCard icon={<LocalGasStationRounded />} title={"Fuel"} latest={ConvertUnit("l", latest.fuel)} inputs={inputs.fuel} />
        </Grid>
    </Grid>);
}

export default Overview;