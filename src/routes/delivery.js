import React from 'react';
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

import Podium from "../components/podium";
import { makeRequestsAuto, getMonthUTC } from '../functions';

var vars = require("../variables");

function formatID(str) {
    const formattedStr = str.replace('_', ' ');
    const capitalizedStr = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
    return capitalizedStr;
  }

const Deliveries = () => {
    const [detailStats, setDetailStats] = useState({});

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [detailS] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/statistics/details?after=` + getMonthUTC() / 1000, auth: true },
            ]);

            setDetailStats(detailS);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    return <>
        {detailStats.truck !== undefined && <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Trucks"} first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Cargos"} first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Plate Countries"} first={{ name: detailStats.plate_country[0].name, stat: detailStats.plate_country[0].count }} second={{ name: detailStats.plate_country[1].name, stat: detailStats.plate_country[1].count }} third={{ name: detailStats.plate_country[2].name, stat: detailStats.plate_country[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Source Cities"} first={{ name: detailStats.source_city[0].name, stat: detailStats.source_city[0].count }} second={{ name: detailStats.source_city[1].name, stat: detailStats.source_city[1].count }} third={{ name: detailStats.source_city[2].name, stat: detailStats.source_city[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Destination Cities"} first={{ name: detailStats.destination_city[0].name, stat: detailStats.destination_city[0].count }} second={{ name: detailStats.destination_city[1].name, stat: detailStats.destination_city[1].count }} third={{ name: detailStats.destination_city[2].name, stat: detailStats.destination_city[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Ferry Routes"} first={{ name: detailStats.ferry[0].name, stat: detailStats.ferry[0].count }} second={{ name: detailStats.ferry[1].name, stat: detailStats.ferry[1].count }} third={{ name: detailStats.ferry[2].name, stat: detailStats.ferry[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Source Companies"} first={{ name: detailStats.source_company[0].name, stat: detailStats.source_company[0].count }} second={{ name: detailStats.source_company[1].name, stat: detailStats.source_company[1].count }} third={{ name: detailStats.source_company[2].name, stat: detailStats.source_company[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Destination Companies"} first={{ name: detailStats.destination_company[0].name, stat: detailStats.destination_company[0].count }} second={{ name: detailStats.destination_company[1].name, stat: detailStats.destination_company[1].count }} third={{ name: detailStats.destination_company[2].name, stat: detailStats.destination_company[2].count }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={4}>
                <Podium title={"Top Fines"} first={{ name: formatID(detailStats.fine[0].name), stat: detailStats.fine[0].sum }} second={{ name: formatID(detailStats.fine[1].name), stat: detailStats.fine[1].sum }} third={{ name: formatID(detailStats.fine[2].name), stat: detailStats.fine[2].sum }} />
            </Grid>
        </Grid>
        }
    </>;
}

export default Deliveries