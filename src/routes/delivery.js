import React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, Chip, Card, CardContent, Typography, LinearProgress, IconButton, SpeedDial, SpeedDialAction, SpeedDialIcon, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, TextareaAutosize, Radio, RadioGroup, FormControlLabel, Select, MenuItem, useTheme } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { LocalShippingRounded, InfoRounded, ChecklistRounded, FlagRounded, CloseRounded, GavelRounded, TollRounded, DirectionsBoatRounded, TrainRounded, CarCrashRounded, BuildRounded, LocalGasStationRounded, FlightTakeoffRounded, SpeedRounded, RefreshRounded, WarehouseRounded, DeleteRounded } from '@mui/icons-material';
import SimpleBar from 'simplebar-react/dist';

import UserCard from '../components/usercard';
import ListModal from '../components/listmodal';
import TimeAgo from '../components/timeago';
import TileMap from '../components/tilemap';
import { makeRequestsAuto, ConvertUnit, CalcInterval, b62decode, customAxios as axios, checkUserPerm, getAuthToken } from '../functions';
import '../App.css';

var vars = require("../variables");

const EVENT_ICON = { "job.started": <LocalShippingRounded />, "job.delivered": <FlagRounded />, "job.cancelled": <CloseRounded />, "fine": <GavelRounded />, "tollgate": <TollRounded />, "ferry": <DirectionsBoatRounded />, "train": <TrainRounded />, "collision": <CarCrashRounded />, "repair": <BuildRounded />, "refuel": <LocalGasStationRounded />, "teleport": <FlightTakeoffRounded />, "speeding": <SpeedRounded /> };
const EVENT_COLOR = { "job.started": "lightgreen", "job.delivered": "lightgreen", "job.cancelled": "lightred", "fine": "orange", "tollgate": "lightblue", "ferry": "lightblue", "train": "lightblue", "collision": "orange", "repair": "lightblue", "refuel": "lightblue", "teleport": "lightblue", "speeding": "orange" };
const EVENT_NAME = { "job.started": "Job Started", "job.delivered": "Job Delivered", "job.cancelled": "Job Cancelled", "fine": "Fine", "tollgate": "Toll Gate", "ferry": "Ferry", "train": "Train", "collision": "Collision", "repair": "Repair", "refuel": "Refuel", "teleport": "Teleport", "speeding": "Speeding" };
const FINE_DESC = { "crash": "Crashed a vehicle", "red_signal": "Ran a red light", "speeding_camera": "Speeding camera", "speeding": "Speeding", "wrong_way": "Wrong way", "no_lights": "No lights", "avoid_sleeping": "Fatigue driving", "avoid_weighing": "Avoided weighing", "damaged_vehicle_usage": "Damaged vehicle usage", "illegal_border_crossing": "Crossed border illegally", "illegal_trailer": "Attached illegal trailer", "avoid_inspection": "Avoided inspection", "hard_shoulder_violation": "Violated hard shoulder" };
const STATUS = { 0: "Pending", 1: "Accepted", 2: "Declined" };

const CURRENTY_ICON = { "eut2": "€", "ats": "$" };
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
function GetCountryFlag(game, val) {
    if (game === "ats") return "🇺🇸";
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
        if (trailer.brand === null && (trailer.name === null || trailer.name === "")) trailerString += "Unknown";
        else if (trailer.brand === null && trailer.name !== null && trailer.name !== "") trailerString += trailer.name;
        else trailerString += `${trailer.brand.name} ${trailer.name}`;
        if (i < trailers.length - 1) {
            trailerString += " - ";
        }
    }
    return trailerString;
}
function GetTrailerPlate(game, trailers) {
    let trailerString = "";
    for (let i = 0; i < trailers.length; i++) {
        const trailer = trailers[i];
        trailerString += `${GetCountryFlag(game, trailer.license_plate_country.unique_id)} ${trailer.license_plate}`;
        if (i < trailers.length - 1) {
            trailerString += " - ";
        }
    }
    return trailerString;
}

const DeliveryDetail = memo(({ doReload, divisionMeta, setDoReload, setDivisionStatus, setNewDivisionStatus, setDivisionMeta, setSelectedDivision, handleDivision, setDeleteOpen }) => {
    const { logid } = useParams();
    const [dlog, setDlog] = useState({});
    const [dlogDetail, setDlogDetail] = useState({});
    const [dlogRoute, setDlogRoute] = useState([]);
    const [dlogMap, setDlogMap] = useState(null);
    // const [replayProgress, setReplayProgress] = useState(0);

    const [localDivisionStatus, setLocalDivisionStatus] = useState(-1);

    const [listModalItems, setListModalItems] = useState([]);
    const [listModalOpen, setListModalOpen] = useState(false);
    function handleDetail() {
        setListModalOpen(true);
    }
    function handleCloseDetail() {
        setListModalOpen(false);
    }
    function handleDeleteOpen() {
        setDeleteOpen(true);
    }

    const theme = useTheme();
    const navigate = useNavigate();

    const handleReloadRoute = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        await axios({ url: `${vars.dhpath}/tracksim/update/route`, data: { logid: logid }, method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` } });

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);

        setDoReload(+new Date());
    }, [logid, setDoReload]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let [dlogD, divisionM] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/${logid}`, auth: "prefer" },
                { url: `${vars.dhpath}/dlog/${logid}/division`, auth: true },
            ]);
            if (dlogD.error !== undefined) {
                navigate(`/delivery`);
            }
            setDlog(dlogD);
            setDlogDetail(dlogD.detail.data.object);

            if (divisionM.divisionid === null) divisionM.divisionid = -1;
            if (divisionM.status === null) divisionM.status = -1;
            if (!vars.isLoggedIn || vars.userInfo.userid === null || vars.userInfo.userid < 0) {
                setDivisionMeta(null);
            } else {
                if (divisionM.error === undefined) {
                    setDivisionStatus(divisionM.status);
                    setNewDivisionStatus(divisionM.status);
                    setLocalDivisionStatus(divisionM.status);
                    setSelectedDivision(divisionM.divisionid);
                    setDivisionMeta(divisionM);
                } else {
                    setSelectedDivision(vars.userDivisionIDs[0]);
                }
            }

            const data = dlogD;
            const detail = dlogD.detail.data.object;
            const TRACKER = { "navio": "Navio", "tracksim": "TrackSim", "trucky": "Trucky" };

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

            let isPromods = (JSON.stringify(data).toLowerCase().indexOf("promods") !== -1);
            if (detail.game.short_name === "eut2") {
                if (isPromods) {
                    setDlogMap("https://map.charlws.com/ets2/promods/tiles");
                }
                else {
                    setDlogMap("https://map.charlws.com/ets2/base/tiles");
                }
            } else if (detail.game.short_name === "ats") {
                if (isPromods) {
                    setDlogMap("https://map.charlws.com/ats/promods/tiles");
                }
                else {
                    setDlogMap("https://map.charlws.com/ats/base/tiles");
                }
            }

            let points = [];
            let telemetry = data.telemetry.split(";");;
            let basic = telemetry[0].split(",");
            let tver = 1;
            if (basic[0].startsWith("v2")) tver = 2;
            else if (basic[0].startsWith("v3")) tver = 3;
            else if (basic[0].startsWith("v4")) tver = 4;
            else if (basic[0].startsWith("v5")) tver = 5;
            else tver = -1;
            if (tver !== -1) {
                basic[0] = basic[0].slice(2);
                let game = basic[0];
                let mods = basic[1];
                let route = telemetry.slice(1);
                let lastx = 0;
                let lastz = 0;
                if (tver <= 4) {
                    for (let i = 0; i < route.length; i++) {
                        if (tver === 4) {
                            if (route[i].split(",") === 1 && route[i].startsWith("idle")) {
                                let idlecnt = parseInt(route[i].split("e")[1]);
                                for (let j = 0; j < idlecnt; j++) {
                                    points.push([lastx, lastz]);
                                }
                                continue;
                            }
                        }
                        let p = route[i].split(",");
                        if (p.length < 2) continue;
                        if (tver === 1) points.push([p[0], p[2]]); // x, z
                        else if (tver === 2) points.push([b62decode(p[0]), b62decode(p[1])]);
                        else if (tver >= 3) {
                            let relx = b62decode(p[0]);
                            let relz = b62decode(p[1]);
                            points.push([lastx + relx, lastz + relz]);
                            lastx = lastx + relx;
                            lastz = lastz + relz;
                        }
                    }
                } else if (tver === 5) {
                    let nroute = "";
                    for (let i = 0; i < route.length; i++) {
                        nroute += route[i] + ";";
                    }
                    route = nroute;
                    for (let i = 0, j = 0; i < route.length; i++) {
                        let x = route[i];
                        if (x === "^") {
                            for (j = i + 1; j < route.length; j++) {
                                if (route[j] === "^") {
                                    let c = parseInt(route.substr(i + 1, j - i - 1));
                                    for (let k = 0; k < c; k++) {
                                        points.push([lastx, lastz]);
                                    }
                                    break;
                                }
                            }
                            i = j;
                        } else if (x === ";") {
                            let cx = 0;
                            let cz = 0;
                            for (j = i + 1; j < route.length; j++) {
                                if (route[j] === ",") {
                                    cx = route.substr(i + 1, j - i - 1);
                                    break;
                                }
                            }
                            i = j;
                            for (j = i + 1; j < route.length; j++) {
                                if (route[j] === ";") {
                                    cz = route.substr(i + 1, j - i - 1);
                                    break;
                                }
                            }
                            i = j;
                            if (cx === 0 && cz === 0) {
                                continue;
                            }
                            let relx = b62decode(cx);
                            let relz = b62decode(cz);
                            points.push([lastx + relx, lastz + relz]);
                            lastx = lastx + relx;
                            lastz = lastz + relz;
                        } else {
                            let st = "ZYXWVUTSRQPONMLKJIHGFEDCBA0abcdefghijklmnopqrstuvwxyz";
                            if (i + 1 >= route.length) break;
                            let z = route[i + 1];
                            let relx = st.indexOf(x) - 26;
                            let relz = st.indexOf(z) - 26;
                            points.push([lastx + relx, lastz + relz]);
                            lastx = lastx + relx;
                            lastz = lastz + relz;
                            i += 1;
                        }
                    }
                }
                setDlogRoute(points);

                let isPromods = (mods === "promods" || JSON.stringify(data).toLowerCase().indexOf("promods") !== -1);
                if (game === "1") {
                    if (isPromods) {
                        setDlogMap("https://map.charlws.com/ets2/promods/tiles");
                    }
                    else {
                        setDlogMap("https://map.charlws.com/ets2/base/tiles");
                    }
                } else if (game === "2") {
                    if (isPromods) {
                        setDlogMap("https://map.charlws.com/ats/promods/tiles");
                    }
                    else {
                        setDlogMap("https://map.charlws.com/ats/base/tiles");
                    }
                }
            }

            const lmi = [{ "name": "Log ID", "value": logid },
            { "name": `Tracker`, "value": TRACKER[data.tracker] },
            { "name": `Tracker Job ID`, "key": "id" },
            { "name": "Time Submitted", "value": <TimeAgo key={`${+new Date()}`} timestamp={data.timestamp * 1000} /> },
            { "name": "Time Spent", "value": CalcInterval(new Date(detail.start_time), new Date(detail.stop_time)) },
            { "name": "Status", "value": data.detail.type === "job.delivered" ? <span style={{ color: theme.palette.success.main }}>Delivered</span> : <span style={{ color: theme.palette.error.main }}>Cancelled</span> },
            {
                "name": "Delivery Route", "value":
                    points !== undefined && points !== null && points.length !== 0 ?
                        <span style={{ color: theme.palette.success.main }}>Available</span> :
                        <Typography variant="span" sx={{ flexGrow: 1, display: 'flex', alignItems: "center", color: theme.palette.error.main }}>Unavailable&nbsp;&nbsp;{data.telemetry === "" && <IconButton onClick={handleReloadRoute}>
                            <RefreshRounded />
                        </IconButton>}</Typography>
            },
            { "name": "Division", "value": data.division !== null ? vars.divisions[data.division].name : "/" },
            {},
            { "name": "Driver", "value": <UserCard user={data.user} inline={true} /> },
            { "name": "Truck Model", "value": <>{detail.truck.brand.name}&nbsp;{detail.truck.name} <span style={{ color: "grey" }}>({detail.truck.unique_id})</span></> },
            { "name": "Truck Plate", "value": <>{detail.truck.license_plate_country !== null ? `${GetCountryFlag(detail.game.short_name, detail.truck.license_plate_country.unique_id)} ${detail.truck.license_plate}` : `N/A`}</> },
            { "name": "Truck Odometer", "value": <>{ConvertUnit("km", detail.truck.initial_odometer)} {'->'} {ConvertUnit("km", detail.truck.odometer)}</> },
            { "name": "Trailer Model", "value": GetTrailerModel(detail.trailers) },
            { "name": "Trailer Plate", "value": <>{detail.trailers[0].license_plate_country !== null ? `${GetTrailerPlate(detail.game.short_name, detail.trailers)}` : `N/A`}</> },
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
            { "name": "Revenue", "value": detail.events[detail.events.length - 1].meta.revenue !== undefined ? CURRENTY_ICON[detail.game.short_name] + detail.events[detail.events.length - 1].meta.revenue : "/" },
            { "name": "Fine", "value": CURRENTY_ICON[detail.game.short_name] + fine },
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
    }, [logid, theme, doReload, handleReloadRoute, setDivisionStatus, setNewDivisionStatus, setDivisionMeta, setSelectedDivision, navigate]);

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
                                value={0}
                                color="primary"
                                sx={{
                                    width: '90%',
                                    margin: '4px',
                                    backgroundColor: theme.palette.text.secondary
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
                        {dlogMap !== null && <TileMap title={dlogRoute !== undefined && dlogRoute !== null && dlogRoute.length !== 0 ? "Delivery Route" : <><span style={{ color: theme.palette.error.main }}>Delivery Route NOT AVAILABLE</span>{dlog.telemetry === "" && <><br />You may try to reload it in detailed info modal.</>}</>} tilesUrl={dlogMap} route={dlogRoute} style={{ height: "100%", minHeight: "380px" }} />}
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={4}>
                        <Card sx={{ paddingBottom: "15px" }}>
                            <CardContent style={{ textAlign: 'center' }}>
                                <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                                    <ChecklistRounded />&nbsp;&nbsp;Events
                                </Typography>
                            </CardContent>
                            <SimpleBar style={{ minHeight: "380px", height: "calc(100vh - 360px)" }}>
                                <Timeline position="alternate">
                                    {dlogDetail.events.map((e, idx) => {
                                        let desc = null;
                                        if (e.type === "fine") {
                                            desc = <>{FINE_DESC[e.meta.offence]}</>;
                                            if (e.meta.offence === "speeding" || e.meta.offence === "speeding_camera") {
                                                desc = <>{desc}<br />Speed: {ConvertUnit("km", e.meta.speed * 3.6)}/h<br />Limit: {ConvertUnit("km", e.meta.speed_limit * 3.6)}/h</>;
                                            }
                                            desc = <>{desc}<br />Paid {CURRENTY_ICON[dlogDetail.game.short_name]}{e.meta.amount}</>;
                                        } else if (e.type === "tollgate") {
                                            desc = <>Paid {CURRENTY_ICON[dlogDetail.game.short_name]}{e.meta.cost}</>;
                                        } else if (e.type === "ferry" || e.type === "train") {
                                            desc = <>From {e.meta.source_name}<br />To {e.meta.target_name}<br />Paid {CURRENTY_ICON[dlogDetail.game.short_name]}{e.meta.cost}</>;
                                        } else if (e.type === "refuel") {
                                            desc = <>Paid {CURRENTY_ICON[dlogDetail.game.short_name]}{parseInt(e.meta.amount)}</>;
                                        } else if (e.type === "speeding") {
                                            desc = <>Max. Speed: {ConvertUnit("km", e.meta.max_speed * 3.6)}/h<br />Limit: {ConvertUnit("km", e.meta.speed_limit * 3.6)}/h</>;
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
                                        );
                                    })}
                                </Timeline>
                            </SimpleBar>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            {listModalItems.length !== 0 && <ListModal title={"Delivery Log"} items={listModalItems} data={dlogDetail} open={listModalOpen} onClose={handleCloseDetail} />}
            <SpeedDial
                ariaLabel="Controls"
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key="details"
                    tooltipTitle="Details"
                    icon={<InfoRounded />}
                    onClick={handleDetail} />
                {divisionMeta !== null && ((checkUserPerm(["admin", "division"]) && localDivisionStatus !== -1) || (dlog.user.userid === vars.userInfo.userid && vars.userDivisionIDs.length !== 0)) && <SpeedDialAction
                    key="division"
                    tooltipTitle="Division"
                    icon={<WarehouseRounded />}
                    onClick={handleDivision}
                />}
                {(checkUserPerm(["admin", "hrm", "delete_dlog"])) &&
                    <SpeedDialAction
                        key="delete"
                        tooltipTitle="Delete"
                        icon={<DeleteRounded />}
                        onClick={handleDeleteOpen}
                    />}
            </SpeedDial>
        </div>}
    </>
    );
});

const Delivery = memo(() => {
    const { logid } = useParams();
    const [doReload, setDoReload] = useState(0);

    const [divisionStatus, setDivisionStatus] = useState(-1);
    const [newDivisionStatus, setNewDivisionStatus] = useState(0);
    const [newDivisionMessage, setNewDivisionMessage] = useState("");
    const [divisionMeta, setDivisionMeta] = useState({});
    const [divisionModalOpen, setDivisionModalOpen] = useState(false);
    function handleDivision() {
        setDivisionModalOpen(true);
    }
    function handleCloseDivisionModal() {
        setDivisionModalOpen(false);
    }
    const handleNewDivisionMessage = (event) => {
        setNewDivisionMessage(event.target.value);
    };
    const [selectedDivision, setSelectedDivision] = useState("-1");
    const handleDivisionChange = (event) => {
        setSelectedDivision(event.target.value);
    };
    const handleRDVSubmit = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        await axios({ url: `${vars.dhpath}/dlog/${logid}/division/${selectedDivision}`, method: "POST", headers: { "Authorization": `Bearer ${getAuthToken()}` } });

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);

        setDoReload(+new Date());
    }, [logid, selectedDivision]);
    const handleDVUpdate = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        await axios({ url: `${vars.dhpath}/dlog/${logid}/division/${selectedDivision}`, data: { status: newDivisionStatus, message: newDivisionMessage }, method: "PATCH", headers: { "Authorization": `Bearer ${getAuthToken()}` } });

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);

        setDoReload(+new Date());
    }, [logid, selectedDivision, newDivisionStatus, newDivisionMessage]);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const navigate = useNavigate();
    function handleDeleteClose() {
        setDeleteOpen(false);
    };
    const handleDelete = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        await axios({ url: `${vars.dhpath}/dlog/${logid}`, method: "DELETE", headers: { "Authorization": `Bearer ${getAuthToken()}` } });

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);

        navigate(`/delivery`);
    }, [logid, navigate]);

    return (<>
        <DeliveryDetail doReload={doReload} divisionMeta={divisionMeta} setDoReload={setDoReload} setDivisionStatus={setDivisionStatus} setNewDivisionStatus={setNewDivisionStatus} setDivisionMeta={setDivisionMeta} setSelectedDivision={setSelectedDivision} handleDivision={handleDivision} setDeleteOpen={setDeleteOpen} />
        {divisionMeta !== null && <Dialog open={divisionModalOpen} onClose={handleCloseDivisionModal}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <WarehouseRounded />&nbsp;&nbsp;Division
                </Typography>
            </DialogTitle>
            <DialogContent>
                {(vars.userDivisionIDs.length !== 0 && divisionStatus === -1) && <>
                    <Typography variant="body">To request division validation, please select a division:</Typography>
                    <Select
                        value={`${selectedDivision}`}
                        onChange={handleDivisionChange}
                        sx={{ marginTop: "6px", height: "30px" }}
                        fullWidth
                    >
                        {vars.userDivisionIDs.map((divisionID, index) => (
                            <MenuItem value={`${divisionID}`} key={index}>{vars.divisions[divisionID].name}</MenuItem>
                        ))}
                    </Select>
                </>}
                {(divisionStatus !== -1) && <>
                    <Typography variant="body">Division validation request submitted <b><TimeAgo key={`${+new Date()}`} timestamp={divisionMeta.request_timestamp * 1000} lower={true} /></b>.</Typography><br />
                    <Typography variant="body">Division: <b>{vars.divisions[divisionMeta.divisionid].name}</b></Typography><br />
                    <Typography variant="body">Current status: <b>{STATUS[divisionStatus]}</b></Typography>
                    {divisionMeta.update_timestamp !== -1 && <>
                        <br /><Typography variant="body">Updated <b><TimeAgo key={`${+new Date()}`} timestamp={divisionMeta.update_timestamp * 1000} lower={true} /></b></Typography>
                        <br /><Typography variant="body">Updated by: <b><UserCard user={divisionMeta.update_staff} inline={true} /></b></Typography>
                        {divisionMeta.update_message !== "" && <><br /><Typography variant="body">Message: {divisionMeta.update_message}</Typography></>}
                    </>}
                </>}
                {(checkUserPerm(["admin", "division"]) && divisionStatus !== -1) && <>
                    <hr />
                    <Typography variant="body"><b>Update validation result</b></Typography>
                    <br />
                    <FormControl fullWidth>
                        <Select
                            value={`${selectedDivision}`}
                            onChange={handleDivisionChange}
                            sx={{ marginTop: "6px", height: "30px" }}
                            fullWidth
                        >
                            {Object.keys(vars.divisions).map((divisionID, index) => (
                                <MenuItem value={`${divisionID}`} key={index}>{vars.divisions[divisionID].name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={newDivisionStatus} row
                            onChange={(e) => setNewDivisionStatus(e.target.value)}
                        >
                            <FormControlLabel value="0" control={<Radio />} label="Pending" />
                            <FormControlLabel value="1" control={<Radio />} label="Accepted" />
                            <FormControlLabel value="2" control={<Radio />} label="Declined" />
                        </RadioGroup>
                    </FormControl>
                    <TextareaAutosize
                        rows={2}
                        value={newDivisionMessage}
                        onChange={handleNewDivisionMessage}
                        placeholder="Message (Optional)"
                        style={{ width: '100%', resize: 'none' }}
                    />
                </>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDivisionModal} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
                {(checkUserPerm(["admin", "division"]) && divisionStatus !== -1) &&
                    <Button onClick={handleDVUpdate} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                        Update
                    </Button>}
                {(vars.userDivisionIDs.length !== 0 && divisionStatus === -1) &&
                    <Button onClick={handleRDVSubmit} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                        Submit
                    </Button>
                }
            </DialogActions>
        </Dialog>}
        <Dialog open={deleteOpen} onClose={handleDeleteClose}>
            <DialogTitle>
                <Typography variant="h6" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                    <DeleteRounded />&nbsp;&nbsp;Delete Delivery
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body">Are you sure you want to delete delivery #{logid}? This cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleDeleteClose} variant="contained" color="secondary" sx={{ ml: 'auto' }}>
                    Close
                </Button>
                <Button onClick={handleDelete} variant="contained" color="error" sx={{ ml: 'auto' }}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    </>);
});

export default Delivery;