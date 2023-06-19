import React from 'react';
import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';

import Podium from "../components/podium";
import CustomTable from "../components/table";
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, getMonthUTC, ConvertUnit } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'logid', label: 'ID' },
    { id: 'driver', label: 'Driver' },
    { id: 'source', label: 'Source' },
    { id: 'destination', label: 'Destination' },
    { id: 'distance', label: 'Distance' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'profit', label: 'Profit' },
    { id: 'time', label: 'Time' },
];

const PROFIT_UNIT = { 1: "€", 2: "$" };

// function formatID(str) {
//     const formattedStr = str.replace('_', ' ');
//     const capitalizedStr = formattedStr.charAt(0).toUpperCase() + formattedStr.slice(1);
//     return capitalizedStr;
// }

const Deliveries = () => {
    const [detailStats, setDetailStats] = useState({});
    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [detailS, dlogL] = [{}, {}];
            setDlogList([]);

            if (detailStats.truck === undefined) {
                [detailS, dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/statistics/details?after=` + getMonthUTC() / 1000, auth: true },
                    { url: `${vars.dhpath}/dlog/list?page=${page}&page_size=${pageSize}`, auth: true },
                ]);

                setDetailStats(detailS);
            } else {
                [dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/list?page=${page}&page_size=${pageSize}`, auth: true },
                ]);
            }

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                newDlogList.push({ logid: dlogL.list[i].logid, driver: <UserCard user={dlogL.list[i].user} inline={true} />, source: `${dlogL.list[i].source_company}, ${dlogL.list[i].source_city}`, destination: `${dlogL.list[i].destination_company}, ${dlogL.list[i].destination_city}`, distance: ConvertUnit("km", dlogL.list[i].distance), cargo: `${dlogL.list[i].cargo} (${ConvertUnit("kg", dlogL.list[i].cargo_mass)})`, profit: `${dlogL.list[i].profit}${PROFIT_UNIT[dlogL.list[i].unit]}`, time: <TimeAgo timestamp={dlogL.list[i].timestamp * 1000} /> })
            }

            setDlogList(newDlogList);
            setTotalItems(dlogL.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize]);

    return <>
        {detailStats.truck !== undefined && <>
            <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={"Top Trucks"} first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={"Top Cargos"} first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={"Top Plate Countries"} first={{ name: detailStats.plate_country[0].name, stat: detailStats.plate_country[0].count }} second={{ name: detailStats.plate_country[1].name, stat: detailStats.plate_country[1].count }} third={{ name: detailStats.plate_country[2].name, stat: detailStats.plate_country[2].count }} fixWidth={true} />
                </Grid>
                {/* <Grid item xs={12} sm={12} md={6} lg={4}>
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
            </Grid> */}
            </Grid>
            <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />
        </>
        }
    </>;
}

export default Deliveries