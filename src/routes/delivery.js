import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Chip, Card, CardContent, Typography, LinearProgress, IconButton, useTheme } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { LocalShippingRounded, InfoRounded, ChecklistRounded, FlagRounded, CloseRounded, GavelRounded, TollRounded, DirectionsBoatRounded, TrainRounded, CarCrashRounded, BuildRounded, LocalGasStationRounded, FlightTakeoffRounded, SpeedRounded } from '@mui/icons-material';
import SimpleBar from 'simplebar-react/dist';

import UserCard from '../components/usercard';
import ListModal from '../components/listmodal';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, ConvertUnit, CalcInterval } from '../functions';
import '../App.css';

var vars = require("../variables");

const EVENT_ICON = { "job.started": <LocalShippingRounded />, "job.delivered": <FlagRounded />, "job.cancelled": <CloseRounded />, "fine": <GavelRounded />, "tollgate": <TollRounded />, "ferry": <DirectionsBoatRounded />, "train": <TrainRounded />, "collision": <CarCrashRounded />, "repair": <BuildRounded />, "refuel": <LocalGasStationRounded />, "teleport": <FlightTakeoffRounded />, "speeding": <SpeedRounded /> };
const EVENT_COLOR = { "job.started": "lightgreen", "job.delivered": "lightgreen", "job.cancelled": "lightred", "fine": "orange", "tollgate": "lightblue", "ferry": "lightblue", "train": "lightblue", "collision": "orange", "repair": "lightblue", "refuel": "lightblue", "teleport": "lightblue", "speeding": "orange" };
const EVENT_NAME = { "job.started": "Job Started", "job.delivered": "Job Delivered", "job.cancelled": "Job Cancelled", "fine": "Fine", "tollgate": "Toll Gate", "ferry": "Ferry", "train": "Train", "collision": "Collision", "repair": "Repair", "refuel": "Refuel", "teleport": "Teleport", "speeding": "Speeding" };
const FINE_DESC = { "crash": "Crashed a vehicle", "red_singal": "Ran a red light", "speeding_camera": "Speeding camera", "speeding": "Speeding", "wrong_way": "Wrong way", "no_lights": "No lights", "avoid_sleeping": "Fatigue driving", "avoid_weighing": "Avoided weighing", "damaged_vehicle_usage": "Damaged vehicle usage", "illegal_border_crossing": "Crossed border illegally", "illegal_trailer": "Attached illegal trailer", "avoid_inspection": "Avoided inspection", "hard_shoulder_violation": "Violated hard shoulder" };

const CURRENCY_UNIT = { "eut2": "€", "ats": "$" };
function bool2int(b) { return b ? 1 : 0; }
const YES_NO = { 0: "No", 1: "Yes" };
const MARKET = { "cargo_market": "Cargo Market", "freight_market": "Freight Market", "external_contracts": "External Contracts", "quick_job": "Quick Job", "external_market": "External Market" };
const COUNTRY_FLAG = {
    "uk": "🇬🇧",
    "germany": "🇩🇪",
    "france": "🇫🇷",
    "netherlands": "🇳🇱",
    "poland": "🇵🇱",
    "norway": "🇳🇴",
    "italy": "🇮🇹",
    "lithuania": "🇱🇹",
    "switzerland": "🇨🇭",
    "sweden": "🇸🇪",
    "czech": "🇨🇿",
    "portugal": "🇵🇹",
    "austria": "🇦🇹",
    "denmark": "🇩🇰",
    "finland": "🇫🇮",
    "belgium": "🇧🇪",
    "romania": "🇷🇴",
    "russia": "🇷🇺",
    "slovakia": "🇸🇰",
    "turkey": "🇹🇷",
    "hungary": "🇭🇺",
    "bulgaria": "🇧🇬",
    "latvia": "🇱🇻",
    "estonia": "🇪🇪",
    "ireland": "🇮🇪",
    "croatia": "🇭🇷",
    "greece": "🇬🇷",
    "serbia": "🇷🇸",
    "ukraine": "🇺🇦",
    "slovenia": "🇸🇮",
    "malta": "🇲🇹",
    "andorra": "🇦🇩",
    "macedonia": "🇲🇰",
    "jordan": "🇯🇴",
    "egypt": "🇪🇬",
    "israel": "🇮🇱",
    "montenegro": "🇲🇪",
    "australia": "🇦🇺"
};
function GetCountryFlag(val) {
    if (Object.keys(COUNTRY_FLAG).includes(val)) {
        return COUNTRY_FLAG[val];
    } else {
        return val;
    }
}
function GetTrailerModel(trailers) {
    let trailerString = "";
    for (let i = 0; i < trailers.length; i++) {
        const trailer = trailers[i];
        if (trailer.brand === null && trailer.name === "") trailerString += "Unknown";
        else if (trailer.brand === null && trailer.name !== "") trailerString += trailer.name;
        else trailerString += `${trailer.brand.name} ${trailer.name}`;
        if (i < trailers.length - 1) {
            trailerString += " - ";
        }
    }
    return trailerString;
}
function GetTrailerPlate(trailers) {
    let trailerString = "";
    for (let i = 0; i < trailers.length; i++) {
        const trailer = trailers[i];
        trailerString += `${GetCountryFlag(trailer.license_plate_country.unique_id)} ${trailer.license_plate}`;
        if (i < trailers.length - 1) {
            trailerString += " - ";
        }
    }
    return trailerString;
}

const Delivery = () => {
    const { logid } = useParams();
    const [dlog, setDlog] = useState({});
    const [dlogDetail, setDlogDetail] = useState({});
    const [replayProgress, setReplayProgress] = useState(0);

    const [listModalItems, setListModalItems] = useState([]);
    const [listModalOpen, setListModalOpen] = useState(false);

    function handleDetail() {
        setListModalOpen(true);
    }
    function handleCloseDetail() {
        setListModalOpen(false);
    }

    const theme = useTheme();

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [dlogD] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/${logid}`, auth: true },
            ]);
            setDlog(dlogD);
            setDlogDetail(dlogD.detail.data.object);

            const data = dlogD;
            const detail = dlogD.detail.data.object;
            const TRACKER = { "tracksim": "TrackSim", "navio": "Navio" };

            let fine = 0;
            let autoLoad = false;
            let autoPark = false;
            for (let i = 0; i < detail.events.length; i++) {
                if (detail.events[i].type === "fine") {
                    fine += detail.events[i].meta.amount;
                }
                if (detail.events[i].type === "job.started") {
                    autoLoad = detail.events[i].meta.autoLoaded;
                }
                if (detail.events[i].type === "job.delivered") {
                    autoPark = detail.events[i].meta.autoParked;
                }
            }

            const lmi = [{ "name": "Log ID", "value": logid },
            { "name": `${TRACKER[data.tracker]} ID`, "key": "id" },
            { "name": "Time Submitted", "value": <TimeAgo timestamp={data.timestamp * 1000} /> },
            { "name": "Time Spent", "value": CalcInterval(new Date(detail.start_time), new Date(detail.stop_time)) },
            { "name": "Status", "value": data.detail.type === "job.delivered" ? <span style={{ color: theme.palette.success.main }}>Delivered</span> : <span style={{ color: theme.palette.error.main }}>Cancelled</span> },
            { "name": "Delivery Route", "value": data.telemetry !== "" && data.telemetry !== null ? <span style={{ color: theme.palette.success.main }}>Available</span> : <span style={{ color: theme.palette.error.main }}>Unavailable</span> },
            { "name": "Division", "value": data.division !== null ? vars.divisions[data.division].name : "/" },
            {},
            { "name": "Driver", "value": <UserCard user={data.user} inline={true} /> },
            { "name": "Truck Model", "value": <>{detail.truck.brand.name}&nbsp;{detail.truck.name} <span style={{ color: "grey" }}>({detail.truck.unique_id})</span></> },
            { "name": "Truck Plate", "value": <>{GetCountryFlag(detail.truck.license_plate_country.unique_id)}&nbsp;{detail.truck.license_plate}</> },
            { "name": "Truck Odometer", "value": <>{ConvertUnit("km", detail.truck.initial_odometer)} {'->'} {ConvertUnit("km", detail.truck.odometer)}</> },
            { "name": "Trailer Model", "value": GetTrailerModel(detail.trailers) },
            { "name": "Trailer Plate", "value": GetTrailerPlate(detail.trailers) },
            {},
            { "name": "Cargo", "value": <>{detail.cargo.name} <span style={{ color: "grey" }}>({detail.cargo.unique_id})</span></> },
            { "name": "Cargo Mass", "value": ConvertUnit("kg", detail.cargo.mass) },
            { "name": "Cargo Damage", "value": <span style={{ "color": detail.cargo.damage <= 0.01 ? theme.palette.success.main : (detail.cargo.damage <= 0.05 ? theme.palette.warning.main : theme.palette.error.main) }} > {(detail.cargo.damage * 100).toFixed(1)}%</span > },
            {},
            { "name": "Planned Distance", "value": ConvertUnit("km", detail.planned_distance) },
            { "name": "Logged Distance", "value": ConvertUnit("km", detail.driven_distance) },
            { "name": "Reported Distance", "value": ConvertUnit("km", detail.events[detail.events.length - 1].meta.distance) },
            {},
            { "name": "Source Company", "value": <>{detail.source_company.name} <span style={{ color: "grey" }}>({detail.source_company.unique_id})</span></> },
            { "name": "Source City", "value": <>{detail.source_city.name} <span style={{ color: "grey" }}>({detail.source_city.unique_id})</span></> },
            { "name": "Destination Company", "value": <>{detail.destination_company.name} <span style={{ color: "grey" }}>({detail.destination_company.unique_id})</span></> },
            { "name": "Destination City", "value": <>{detail.destination_city.name} <span style={{ color: "grey" }}>({detail.destination_city.unique_id})</span></> },
            { "name": "Fuel Used", "value": ConvertUnit("l", detail.fuel_used, 2) },
            { "name": "Avg. Fuel", "value": ConvertUnit("l", (detail.fuel_used / detail.driven_distance * 100).toFixed(2), 2) + "/100km" },
            { "name": "AdBlue Used", "value": ConvertUnit("l", detail.adblue_used, 2) },
            { "name": "Max. Speed", "value": ConvertUnit("km", detail.truck.top_speed * 3.6) + "/h" },
            { "name": "Avg. Speed", "value": ConvertUnit("km", detail.truck.average_speed * 3.6) + "/h" },
            {},
            { "name": "Revenue", "value": detail.events[detail.events.length - 1].meta.revenue + CURRENCY_UNIT[detail.game.short_name] },
            { "name": "Fine", "value": fine + CURRENCY_UNIT[detail.game.short_name] },
            {},
            { "name": "Is Special Transport?", "value": YES_NO[bool2int(detail.is_special)] },
            { "name": "Is Late?", "value": <span style={{ color: detail.is_late === false ? theme.palette.success.main : theme.palette.error.main }}>{YES_NO[bool2int(detail.is_late)]}</span> },
            { "name": "Had Police Enabled?", "value": <span style={{ color: detail.game.had_police_enabled === true ? theme.palette.success.main : theme.palette.error.main }}>{YES_NO[bool2int(detail.game.had_police_enabled)]}</span> },
            { "name": "Market", "value": MARKET[detail.market] },
            { "name": "Mode", "value": detail.multiplayer === null ? "Single Player" : (detail.multiplayer === "truckersmp" ? "TruckersMP" : "SCS Convoy") },
            { "name": "Automation", "value": <>{autoLoad ? <Chip label={"Auto Load"} sx={{ borderRadius: "5px" }}></Chip> : <></>} {autoPark ? <Chip label={"Auto Park"} sx={{ borderRadius: "5px" }}></Chip> : <></>}</> }];
            setListModalItems(lmi);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [logid, theme]);

    return (<>
        {dlog.logid === undefined &&
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <LocalShippingRounded />&nbsp;&nbsp;Delivery #{logid}
                </Typography>
            </div>}
        {dlog.logid !== undefined && <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <LocalShippingRounded />&nbsp;&nbsp;Delivery #{logid}&nbsp;&nbsp;
                    <IconButton size="medium" color="inherit" onClick={handleDetail}>
                        <InfoRounded />
                    </IconButton>
                </Typography>
                <Typography variant="h5"><UserCard user={dlog.user} inline={true} /></Typography>
            </div>
            <div style={{ display: 'flex', marginTop: "10px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={3} lg={3}>
                        <Card>
                            <CardContent style={{ textAlign: 'center' }}>
                                <Typography variant="h6" component="div">
                                    <b>{dlogDetail.source_company.name}</b>
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="div">
                                    {dlogDetail.source_city.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <Typography variant="body1" component="div" sx={{ marginTop: "4px" }}>
                                {`${dlogDetail.cargo.name} (${ConvertUnit("kg", dlogDetail.cargo.mass)})`}
                            </Typography>

                            <LinearProgress
                                variant="determinate"
                                value={replayProgress}
                                color="primary"
                                sx={{
                                    width: '90%',
                                    margin: '4px',
                                    '& .MuiLinearProgress-barColorPrimary': {
                                        backgroundColor: '#2196f3',
                                    },
                                }}
                            />

                            <Typography variant="body2" component="div" style={{ textAlign: 'center' }}>
                                {ConvertUnit("km", dlogDetail.driven_distance)}<br />
                                {CalcInterval(new Date(dlogDetail.start_time), new Date(dlogDetail.stop_time))}
                            </Typography>
                        </div>
                    </Grid>

                    <Grid item xs={12} sm={12} md={3} lg={3}>
                        <Card>
                            <CardContent style={{ textAlign: 'center' }}>
                                <Typography variant="h6" component="div">
                                    <b>{dlogDetail.destination_company.name}</b>
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="div">
                                    {dlogDetail.destination_city.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            <div style={{ display: 'flex', marginTop: "20px" }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={8}>

                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Card sx={{ paddingBottom: "15px" }}>
                            <CardContent style={{ textAlign: 'center' }}>
                                <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    <ChecklistRounded />&nbsp;&nbsp;Events
                                </Typography>
                            </CardContent>
                            <SimpleBar style={{ minHeight: "380px", height: "50vh" }}>
                                <Timeline position="alternate">
                                    {dlogDetail.events.map((e, idx) => {
                                        let desc = null;
                                        if (e.type === "fine") {
                                            desc = <>{FINE_DESC[e.meta.offence]}</>;
                                            if (e.meta.offence === "speeding" || e.meta.offence === "speeding_camera") {
                                                desc = <>{desc}<br />Speed: {ConvertUnit("km", e.meta.speed * 3.6)}/h<br />Limit: {ConvertUnit("km", e.meta.speed_limit * 3.6)}/h</>;
                                            }
                                            desc = <>{desc}<br />Paid {CURRENCY_UNIT[dlogDetail.game.short_name]}{e.meta.amount}</>;
                                        } else if (e.type === "tollgate") {
                                            desc = <>Paid {CURRENCY_UNIT[dlogDetail.game.short_name]}{e.meta.cost}</>
                                        } else if (e.type === "ferry" || e.type === "train") {
                                            desc = <>From {e.meta.source_name}<br />To {e.meta.target_name}<br />Paid {CURRENCY_UNIT[dlogDetail.game.short_name]}{e.meta.cost}</>
                                        } else if (e.type === "refuel") {
                                            desc = <>Paid {CURRENCY_UNIT[dlogDetail.game.short_name]}{parseInt(e.meta.amount)}</>
                                        } else if (e.type === "speeding") {
                                            desc = <>Max. Speed: {ConvertUnit("km", e.meta.max_speed * 3.6)}/h<br />Limit: {ConvertUnit("km", e.meta.speed_limit * 3.6)}/h</>
                                        }
                                        return (
                                            <TimelineItem key={idx}>
                                                <TimelineSeparator>
                                                    <TimelineConnector />
                                                    <TimelineDot variant="outlined" sx={{ color: EVENT_COLOR[e.type] }}>
                                                        {EVENT_ICON[e.type]}
                                                    </TimelineDot>
                                                    <TimelineConnector />
                                                </TimelineSeparator>
                                                <TimelineContent sx={{ py: '12px', px: 2 }}>
                                                    <Typography variant="h6" component="span">
                                                        {EVENT_NAME[e.type]}
                                                    </Typography>
                                                    <Typography>{desc !== null ? <>{desc}<br /></> : <></>}<span style={{ color: "grey" }}>{CalcInterval(new Date(dlogDetail.events[0].real_time), new Date(e.real_time))}</span></Typography>
                                                </TimelineContent>
                                            </TimelineItem>
                                        )
                                    })}
                                </Timeline>
                            </SimpleBar>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            {listModalItems.length !== 0 && <ListModal title={"Delivery Log"} items={listModalItems} data={dlogDetail} open={listModalOpen} onClose={handleCloseDetail} />}
        </div>}
    </>
    );
};

export default Delivery;