import React from 'react';
import { useEffect, useState } from 'react';
import { Typography, Grid, Tooltip, useTheme } from '@mui/material';
import { LocalShippingRounded, WidgetsRounded, PublicRounded, VerifiedOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import Podium from "../components/podium";
import CustomTable from "../components/table";
import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, getMonthUTC, ConvertUnit } from '../functions';

var vars = require("../variables");

const columns = [
    { id: 'display_logid', label: 'ID' },
    { id: 'driver', label: 'Driver' },
    { id: 'source', label: 'Source' },
    { id: 'destination', label: 'Destination' },
    { id: 'distance', label: 'Distance' },
    { id: 'cargo', label: 'Cargo' },
    { id: 'profit', label: 'Profit' },
    { id: 'time', label: 'Time' },
];

const PROFIT_UNIT = { 1: "€", 2: "$" };

const Deliveries = () => {
    const [detailStats, setDetailStats] = useState({});
    const [dlogList, setDlogList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);

    const theme = useTheme();

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [detailS, dlogL] = [{}, {}];

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1) {
                [detailS, dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/statistics/details?after=` + getMonthUTC() / 1000, auth: true },
                    { url: `${vars.dhpath}/dlog/list?page=${myPage}&page_size=${pageSize}`, auth: true },
                ]);

                setDetailStats(detailS);
            } else {
                [dlogL] = await makeRequestsAuto([
                    { url: `${vars.dhpath}/dlog/list?page=${myPage}&page_size=${pageSize}`, auth: true },
                ]);
            }

            let newDlogList = [];
            for (let i = 0; i < dlogL.list.length; i++) {
                let divisionCheckmark = <></>;
                if (dlogL.list[i].division.divisionid !== undefined) {
                    divisionCheckmark = <Tooltip placement="top" arrow title="Validated Division Delivery"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <VerifiedOutlined sx={{ color: theme.palette.info.main, fontSize: "18px" }} />
                    </Tooltip>;
                }
                newDlogList.push({ logid: dlogL.list[i].logid, display_logid: <Typography variant="body2" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}><span>{dlogL.list[i].logid}</span>{divisionCheckmark}</Typography>, driver: <UserCard user={dlogL.list[i].user} inline={true} />, source: `${dlogL.list[i].source_company}, ${dlogL.list[i].source_city}`, destination: `${dlogL.list[i].destination_company}, ${dlogL.list[i].destination_city}`, distance: ConvertUnit("km", dlogL.list[i].distance), cargo: `${dlogL.list[i].cargo} (${ConvertUnit("kg", dlogL.list[i].cargo_mass)})`, profit: `${dlogL.list[i].profit}${PROFIT_UNIT[dlogL.list[i].unit]}`, time: <TimeAgo timestamp={dlogL.list[i].timestamp * 1000} /> });
            }

            setDlogList(newDlogList);
            setTotalItems(dlogL.total_items);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [page, pageSize, theme]);

    const navigate = useNavigate();
    function handleClick(data) {
        navigate(`/beta/delivery/${data.logid}`);
    }

    return <>
        {detailStats.truck !== undefined && <>
            <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <LocalShippingRounded />&nbsp;&nbsp;Top Trucks
                        </Typography>
                    }
                        first={{ name: detailStats.truck[0].name, stat: detailStats.truck[0].count }} second={{ name: detailStats.truck[1].name, stat: detailStats.truck[1].count }} third={{ name: detailStats.truck[2].name, stat: detailStats.truck[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <WidgetsRounded />&nbsp;&nbsp;Top Cargos
                        </Typography>
                    } first={{ name: detailStats.cargo[0].name, stat: detailStats.cargo[0].count }} second={{ name: detailStats.cargo[1].name, stat: detailStats.cargo[1].count }} third={{ name: detailStats.cargo[2].name, stat: detailStats.cargo[2].count }} fixWidth={true} />
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={4}>
                    <Podium title={
                        <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                            <PublicRounded />&nbsp;&nbsp;Top Plate Countries
                        </Typography>
                    } first={{ name: detailStats.plate_country[0].name, stat: detailStats.plate_country[0].count }} second={{ name: detailStats.plate_country[1].name, stat: detailStats.plate_country[1].count }} third={{ name: detailStats.plate_country[2].name, stat: detailStats.plate_country[2].count }} fixWidth={true} />
                </Grid>
            </Grid>
            <CustomTable columns={columns} data={dlogList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={handleClick} />
        </>
        }
    </>;
};

export default Deliveries;