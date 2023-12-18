import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Map, View } from 'ol';
import { Tile } from 'ol/layer';
import { XYZ } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import CircleStyle from 'ol/style/Circle';
import { Style, Fill, Stroke } from 'ol/style';
import { Projection } from 'ol/proj';
import { getVectorContext } from 'ol/render.js';

import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, Grid, Snackbar, Alert, TextField, MenuItem, ButtonGroup, IconButton, Divider, Card, CardContent } from '@mui/material';
import { Portal } from '@mui/base';

import Select from 'react-select';

import DateTimeField from '../components/datetime';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import TimeAgo from '../components/timeago';
import CustomTable from '../components/table';
import { customSelectStyles } from '../designs';
import { makeRequestsAuto, customAxios as axios, getAuthToken, TSep, checkUserPerm, ConvertUnit, downloadLocal } from '../functions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faFileExport, faLock, faMoneyBillTransfer, faPlus, faRankingStar, faTruck, faUnlock, faUserGear, faShoppingCart, faWarehouse } from '@fortawesome/free-solid-svg-icons';

var vars = require("../variables");

function calculateCenterPoint(points) {
    if (points.length === 0) {
        throw new Error(tr("empty_points_array"));
    }

    let sumX = 0;
    let sumY = 0;

    for (const [x, y] of points) {
        sumX += x;
        sumY += -y;
    }

    const centerX = sumX / points.length;
    const centerY = sumY / points.length;

    return [centerX, centerY];
}

const CustomTileMap = ({ tilesUrl, title, style, route, onGarageClick }) => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        async function doLoad({ tilesUrl, route }) {
            const infoUrl = tilesUrl.replace(/\/tiles$/, "") + "/info/TileMapInfo.json";
            const [mapInfo] = await makeRequestsAuto([
                { url: infoUrl, auth: false },
            ]);

            const tsProjection = new Projection({
                code: 'ZOOMIFY',
                units: 'pixels',
                extent: [
                    mapInfo.x1, -mapInfo.y2, mapInfo.x2, -mapInfo.y1 // x1, -y2, x2, -y1 (reverse y direction)
                ]
            });

            // Create a new OpenLayers map instance
            const map = new Map({
                target: mapContainerRef.current,
                controls: [],
                layers: [
                    // Add a tile layer with the tiled map as the source
                    new Tile({
                        source: new XYZ({
                            url: `${tilesUrl}/{z}/{x}/{y}.png`,
                            wrapX: false,
                            projection: tsProjection,
                        }),
                    }),
                ],
                view: new View({
                    center: route === undefined || route === null || route.length === 0 ? [(mapInfo.x1 + mapInfo.x2) / 2, (mapInfo.y1 + mapInfo.y2) / 2] : calculateCenterPoint(route), // Set the initial center coordinates
                    zoom: 1, // Set the initial zoom level
                    minZoom: mapInfo.minZoom,
                    maxZoom: Math.min(mapInfo.maxZoom, 3),
                    projection: tsProjection,
                    extent: tsProjection.getExtent(),
                    constrainOnlyCenter: true
                }),
            });

            const circleStyle = new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({ color: '#fcd116' }),
                    stroke: new Stroke({ color: '#a8b6ed', width: 1 }),
                }),
            });

            let features = [];
            for (let i = 0; i < vars.economyGarages.length; i++) {
                let garage = vars.economyGarages[i];
                let point = new Point([garage.x, -garage.z]);
                const circleFeature = new Feature({ 'geometry': point, 'info': garage });
                circleFeature.setStyle(circleStyle);
                features.push(circleFeature);
            }

            const vectorSource = new VectorSource({
                features: features,
                wrapX: false,
            });
            const vectorLayer = new VectorLayer({
                source: vectorSource,
                style: circleStyle,
            });

            map.addLayer(vectorLayer);

            let point = null;
            let line = null;
            const displaySnap = function (coordinate) {
                const closestFeature = vectorSource.getClosestFeatureToCoordinate(coordinate);
                if (closestFeature === null) {
                    point = null;
                    line = null;
                } else {
                    const geometry = closestFeature.getGeometry();
                    const closestPoint = geometry.getClosestPoint(coordinate);
                    if (point === null) {
                        point = new Point(closestPoint);
                    } else {
                        point.setCoordinates(closestPoint);
                    }
                }
                map.render();
            };

            map.on('pointermove', function (evt) {
                if (evt.dragging) {
                    return;
                }
                const coordinate = map.getEventCoordinate(evt.originalEvent);
                displaySnap(coordinate);
            });

            map.on('click', function (evt) {
                displaySnap(evt.coordinate);
            });

            const stroke = new Stroke({
                color: 'rgba(33, 243, 150, 0.7)',
                width: 3,
            });
            const style = new Style({
                stroke: stroke,
                image: new CircleStyle({
                    radius: 10,
                    stroke: stroke,
                }),
            });

            vectorLayer.on('postrender', function (evt) {
                const vectorContext = getVectorContext(evt);
                vectorContext.setStyle(style);
                if (point !== null) {
                    vectorContext.drawGeometry(point);
                }
                if (line !== null) {
                    vectorContext.drawGeometry(line);
                }
            });

            map.on('pointermove', function (evt) {
                if (evt.dragging) {
                    return;
                }
                const pixel = map.getEventPixel(evt.originalEvent);
                const hit = map.hasFeatureAtPixel(pixel);
                if (hit) {
                    map.getTarget().style.cursor = 'pointer';
                } else {
                    map.getTarget().style.cursor = '';
                }
            });

            map.on('click', function (evt) {
                if (evt.dragging) {
                    return;
                }
                const pixel = map.getEventPixel(evt.originalEvent);
                const hit = map.hasFeatureAtPixel(pixel);
                if (hit) {
                    map.forEachFeatureAtPixel(pixel, (feature) => {
                        const featureProperties = feature.getProperties();
                        onGarageClick(featureProperties.info);
                    });
                }
            });

            // Clean up the map instance when the component unmounts
            return () => {
                map.setTarget(null);
            };
        }

        doLoad({ tilesUrl, route });
    }, [tilesUrl, route]);

    return <div style={{ borderRadius: "10px", overflow: "hidden", height: '600px', ...style }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#484E66' }}>
            <Typography variant="body2" sx={{ position: "absolute", zIndex: 1, margin: "5px", color: "white" }}>{title}</Typography>
            {route !== undefined && route !== null && route.length === 0 && <div style={{ backgroundColor: "rgb(0,0,0,0.5)", height: "100%", width: "100%" }}></div>}
        </div >
    </div>;
};

const Economy = () => {
    const { t: tr } = useTranslation();
    const slotColumns = [
        { id: 'slotid', label: 'ID' },
        { id: 'owner', label: tr("owner") },
        { id: 'truck', label: tr("truck") },
        { id: 'odometer', label: tr("odometer") },
        { id: 'income', label: tr("income") },
    ];
    const myTruckColumns = [
        { id: 'truck', label: tr("truck") },
        { id: 'garage', label: tr("garage") },
        { id: 'odometer', label: tr("odometer") },
        { id: 'income', label: tr("income") },
        { id: 'status', label: tr("status") },
    ];
    const leaderboardColumns = [
        { id: 'rank', label: tr("rank") },
        { id: 'user', label: tr("user") },
        { id: 'balance', label: tr("balance") },
    ];
    const truckColumns = [
        { id: 'model', label: tr("model") },
        { id: 'garage', label: tr("garage") },
        { id: 'owner', label: tr("owner") },
        { id: 'income', label: tr("income") },
    ];
    const garageColumns = [
        { id: 'location', label: tr("location") },
        { id: 'owner', label: tr("owner") },
        { id: 'income', label: tr("income") },
    ];
    const merchColumns = [
        { id: 'name', label: tr("name") },
        { id: 'value', label: tr("value") },
        { id: 'purchased', label: tr("purchased") },
    ];
    const TRUCK_STATUS = { "inactive": tr("inactive"), "active": tr("active"), "require_service": tr("service_required"), "scrapped": tr("scrapped") };

    const theme = useTheme();

    const [configLoaded, setConfigLoaded] = useState(vars.economyConfig !== null);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);
            const urlsBatch = [
                { url: `${vars.dhpath}/economy`, auth: true },
                { url: `${vars.dhpath}/economy/garages`, auth: true },
                { url: `${vars.dhpath}/economy/trucks`, auth: true },
                { url: `${vars.dhpath}/economy/merch`, auth: true },
            ];
            const [economyConfig, economyGarages, economyTrucks, economyMerch] = await makeRequestsAuto(urlsBatch);
            if (economyConfig) {
                vars.economyConfig = economyConfig;
            }
            if (economyGarages) {
                vars.economyGarages = economyGarages;
                for (let i = 0; i < economyGarages.length; i++) {
                    vars.economyGaragesMap[economyGarages[i].id] = economyGarages[i];
                }
            }
            if (economyTrucks) {
                vars.economyTrucks = economyTrucks;
            }
            if (economyMerch) {
                vars.economyMerch = economyMerch;
                for (let i = 0; i < economyMerch.length; i++) {
                    vars.economyMerchMap[economyMerch[i].id] = economyMerch[i];
                }
            }

            setConfigLoaded(true);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (vars.economyConfig === null) {
            doLoad();
        }
    }, [vars.economyConfig]);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogAction, setDialogAction] = useState("");
    const [dialogDisabled, setDialogDisabled] = useState(false);

    const [balance, setBalance] = useState("/");
    const [balanceVisibility, setBalanceVisibility] = useState("");

    const [modalGarage, setModalGarage] = useState({});
    const [modalGarageDetails, setModalGarageDetails] = useState(null);
    const handleGarageClick = useCallback(async (garage) => {
        setDialogAction("garage");
        setModalGarage(garage);
        setModalGarageDetails(null);

        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${garage.id}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        setModalGarageDetails(resp.data);
    }, []);

    const purchaseGarage = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/purchase`, data: { owner: "self" }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("garage_purchased"));
            setSnackbarSeverity("success");
            handleGarageClick(modalGarage);
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage]);

    const [garageOwner, setGarageOwner] = useState({});
    const [message, setMessage] = useState("");
    const transferGarage = useCallback(async () => {
        setDialogDisabled(true);
        let owner = garageOwner.userid;
        if (owner === -1000) owner = "company";
        else if (owner === vars.userInfo.userid) owner = "self";
        else owner = "user-" + owner;
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/transfer`, data: { owner: owner, message: message }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("garage_transferred"));
            setSnackbarSeverity("success");
            handleGarageClick(modalGarage);
            setDialogAction("garage");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage, garageOwner]);

    const sellGarage = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/sell`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("garage_sold"));
            setSnackbarSeverity("success");
            handleGarageClick(modalGarage);
            setDialogAction("garage");
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage]);

    const [slotList, setSlotList] = useState([]);
    const [slotTotal, setSlotTotal] = useState(0);
    const [slotPage, setSlotPage] = useState(1);
    const slotPageRef = useRef(1);
    const [slotPageSize, setSlotPageSize] = useState(vars.userSettings.default_row_per_page);

    const [activeSlot, setActiveSlot] = useState({});
    useEffect(() => {
        slotPageRef.current = slotPage;
    }, [slotPage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/slots/list?page=${slotPage}&page_size=${slotPageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newSlotList = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                let slot = resp.data.list[i];
                let ctxMenu = <><MenuItem onClick={() => { setActiveSlot(slot); setDialogAction("transfer-slot"); }} sx={{ color: theme.palette.warning.main }}>{tr("transfer_slot")}</MenuItem><MenuItem onClick={() => { setActiveSlot(slot); setDialogAction("sell-slot"); }} sx={{ color: theme.palette.error.main }} disabled={slot.note === "garage-owner"}>{tr("sell_slot")}</MenuItem></>;
                if (slot.truck !== null) {
                    newSlotList.push({ slotid: slot.slotid, owner: <UserCard key={`${slotPage}-i`} user={slot.slot_owner} />, truck: <a className="hover-underline" style={{ cursor: "pointer" }} onClick={() => { setTruckReferer("slot"); setActiveTruck(slot.truck); setTruckOwner(slot.truck.owner); setTruckAssignee(slot.truck.assignee); loadTruck(slot.truck); setDialogAction("truck"); }}>{slot.truck.truck.brand} {slot.truck.truck.model}</a>, odometer: TSep(slot.truck.odometer), income: TSep(slot.truck.income), contextMenu: ctxMenu });
                } else {
                    newSlotList.push({ slotid: slot.slotid, owner: <UserCard key={`${slotPage}-i`} user={slot.slot_owner} />, truck: <a className="hover-underline" style={{ cursor: "pointer" }} onClick={() => { setTruckSlotId(slot.slotid); setTruckReferer("slot"); setDialogAction("purchase-truck"); }}>{tr("empty_slot")}</a>, odometer: "/", income: "/", contextMenu: ctxMenu });
                }
            }
            if (slotPageRef.current === slotPage) {
                setSlotList(newSlotList);
                setSlotTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (dialogAction === "slot") {
            doLoad();
        }
    }, [modalGarage, dialogAction, slotPage, slotPageSize]);

    const purchaseSlot = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/slots/purchase`, data: { owner: "self" }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("slot_purchased"));
            setSnackbarSeverity("success");
            setModalGarage({ ...modalGarage, update: +new Date() });
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage]);

    const [slotOwner, setSlotOwner] = useState({});
    const transferSlot = useCallback(async () => {
        setDialogDisabled(true);
        let owner = slotOwner.userid;
        if (owner === -1000) owner = "company";
        else if (owner === vars.userInfo.userid) owner = "self";
        else owner = "user-" + owner;
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/slots/${activeSlot.slotid}/transfer`, data: { owner: owner, message: message }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("slot_transferred"));
            setSnackbarSeverity("success");
            setModalGarage({ ...modalGarage, update: +new Date() });
            setDialogAction("slot");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage, activeSlot, slotOwner]);

    const sellSlot = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${modalGarage.id}/slots/${activeSlot.slotid}/sell`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("slot_sold"));
            setSnackbarSeverity("success");
            setModalGarage({ ...modalGarage, update: +new Date() });
            setDialogAction("slot");
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage, activeSlot]);

    const [truckReferer, setTruckReferer] = useState("");
    const [activeTruck, setActiveTruck] = useState({});
    const [truckSlotId, setTruckSlotId] = useState("");
    const [truckOwner, setTruckOwner] = useState({});
    const [truckAssignee, setTruckAssignee] = useState({});
    const loadTruck = useCallback(async (truck) => {
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${truck.vehicleid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        setActiveTruck({ ...truck, ...resp.data, update: +new Date() });
        setTruckOwner(resp.data.owner);
        setTruckAssignee(resp.data.assignee);
    }, []);
    const activateTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/activate`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("truck_activated"));
            setSnackbarSeverity("success");
            setActiveTruck({ ...activeTruck, status: "active", update: +new Date() });
            loadTruck(activeTruck);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck]);
    const deactivateTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/deactivate`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("truck_deactivated"));
            setSnackbarSeverity("success");
            setActiveTruck({ ...activeTruck, status: "inactive", update: +new Date() });
            loadTruck(activeTruck);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck]);
    const relocateTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/relocate`, data: { slotid: truckSlotId }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("truck_relocated"));
            setSnackbarSeverity("success");
            loadTruck(activeTruck);
            setDialogAction("truck");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck, truckSlotId]);
    const repairTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/repair`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("truck_repaired"));
            setSnackbarSeverity("success");
            setActiveTruck({ ...activeTruck, damage: 0, repair_cost: 0, service: activeTruck.service + activeTruck.repair_cost, update: +new Date() });
            loadTruck(activeTruck);
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck]);
    const transferTruck = useCallback(async () => {
        setDialogDisabled(true);
        let owner = truckOwner.userid;
        if (owner === -1000) owner = "company";
        else if (owner === vars.userInfo.userid) owner = "self";
        else owner = "user-" + owner;
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/transfer`, data: { owner: owner, message: message }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("truck_transferred"));
            setSnackbarSeverity("success");
            setActiveTruck({ ...activeTruck, update: +new Date() });
            loadTruck(activeTruck);
            setDialogAction("truck");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck, truckOwner]);
    const reassignTruck = useCallback(async () => {
        setDialogDisabled(true);
        let assignee = truckAssignee.userid;
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/transfer`, data: { assigneeid: assignee, message: message }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("truck_reassigned"));
            setSnackbarSeverity("success");
            setActiveTruck({ ...activeTruck, update: +new Date() });
            loadTruck(activeTruck);
            setDialogAction("truck");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck, truckAssignee]);
    const sellTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/sell`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("truck_sold"));
            setSnackbarSeverity("success");
            setDialogAction("slot");
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck]);
    const scrapTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${activeTruck.vehicleid}/scrap`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("truck_scrapped"));
            setSnackbarSeverity("success");
            setDialogAction("slot");
            setBalance(resp.data.balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeTruck]);

    const [myTruckList, setMyTruckList] = useState([]);
    const [myTruckTotal, setMyTruckTotal] = useState(0);
    const [myTruckPage, setMyTruckPage] = useState(1);
    const myTruckPageRef = useRef(1);
    const [myTruckPageSize, setMyTruckPageSize] = useState(5);
    const [loadMyTruck, setLoadMyTruck] = useState(0);
    useEffect(() => {
        myTruckPageRef.current = myTruckPage;
    }, [myTruckPage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/trucks/list?owner=${vars.userInfo.userid}&page=${myTruckPage}&page_size=${myTruckPageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newTruckList = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                let truck = resp.data.list[i];
                newTruckList.push({ truck: <>{truck.truck.brand} {truck.truck.model}</>, garage: vars.economyGaragesMap[truck.garageid] !== undefined ? vars.economyGaragesMap[truck.garageid].name : tr("unknown_garage"), odometer: TSep(truck.odometer), income: TSep(truck.income), status: TRUCK_STATUS[truck.status], data: truck });
            }
            if (myTruckPageRef.current === myTruckPage) {
                setMyTruckList(newTruckList);
                setMyTruckTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, myTruckPage, myTruckPageSize, loadMyTruck]);

    const [selectedTruck, setSelectedTruck] = useState({});
    const purchaseTruck = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/trucks/${selectedTruck.truck.id}/purchase`, data: { slotid: truckSlotId }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("truck_purchased"));
            setSnackbarSeverity("success");
            setDialogAction(truckReferer);
            setLoadMyTruck(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [selectedTruck, truckSlotId, truckReferer]);

    const transferFrom = vars.userInfo;
    const [transferTo, setTransferTo] = useState({});
    const [transferAmount, setTransferAmount] = useState(0);
    const [transferMessage, setTransferMessage] = useState("");
    const transferMoney = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/transfer`, data: { from_userid: transferFrom.userid, to_userid: transferTo.userid, amount: transferAmount, message: transferMessage }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent("Transaction succeed! Balance: ${resp.data.from_balance}");
            setSnackbarSeverity("success");
            setBalance(resp.data.from_balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [transferTo, transferAmount, transferMessage]);
    useEffect(() => {
        async function doLoad() {
            let resp = await axios({ url: `${vars.dhpath}/economy/balance`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            setBalance(resp.data.balance);
            setBalanceVisibility(resp.data.visibility);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded]);
    const updateBalanceVisibility = useCallback(async (visibility) => {
        setBalanceVisibility(visibility);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/${vars.userInfo.userid}/visibility/${visibility}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 204) {
            setBalanceVisibility(visibility === "public" ? "private" : "public");
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [balanceVisibility]);

    const [manageNewBalance, setManageNewBalance] = useState("/");
    const [manageBalance, setManageBalance] = useState("/");
    const [manageBalanceVisibility, setManageBalanceVisibility] = useState("");
    const [manageTransferFrom, setManageTransferFrom] = useState({});
    const [manageTransferTo, setManageTransferTo] = useState({});
    const [manageTransferAmount, setManageTransferAmount] = useState(0);
    const [manageTransferMessage, setManageTransferMessage] = useState("");
    useEffect(() => {
        async function doLoad() {
            if (manageTransferFrom.userid !== undefined) {
                let resp = await axios({ url: `${vars.dhpath}/economy/balance/${manageTransferFrom.userid}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                setManageBalance(resp.data.balance);
                setManageBalanceVisibility(resp.data.visibility);
            }
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, manageTransferFrom]);
    const manageTransferMoney = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/transfer`, data: { from_userid: manageTransferFrom.userid, to_userid: manageTransferTo.userid, amount: manageTransferAmount, message: manageTransferMessage }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent("Transaction succeed! User balance: ${resp.data.from_balance}");
            setSnackbarSeverity("success");
            setManageBalance(resp.data.from_balance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [manageTransferFrom, manageTransferTo, manageTransferAmount, manageTransferMessage]);
    const manageUpdateBalance = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/${manageTransferFrom.userid}`, data: { amount: manageNewBalance }, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("balance_updated"));
            setSnackbarSeverity("success");
            setManageBalance(manageNewBalance);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [manageTransferFrom, manageNewBalance]);
    const updateManageBalanceVisibility = useCallback(async (visibility) => {
        setManageBalanceVisibility(visibility);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/${manageTransferFrom.userid}/visibility/${visibility}`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 204) {
            setManageBalanceVisibility(visibility === "public" ? "private" : "public");
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
    }, [manageTransferFrom, manageBalanceVisibility]);
    const [exportRange, setExportRange] = useState({ start_time: undefined, end_time: undefined });
    const exportTransaction = useCallback(async () => {
        if (exportRange.end_time - exportRange.start_time > 86400 * 90) {
            setSnackbarContent(tr("the_date_range_must_be_smaller_than_90_days"));
            setSnackbarSeverity("error");
            return;
        }
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/balance/${vars.userInfo.userid}/transactions/export?after=${parseInt(exportRange.start_time)}&before=${parseInt(exportRange.end_time)}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            downloadLocal("export.csv", resp.data);
            setSnackbarContent(tr("success"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [exportRange]);

    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardTotal, setLeaderboardTotal] = useState(0);
    const [leaderboardPage, setLeaderboardPage] = useState(1);
    const leaderboardPageRef = useRef(1);
    const [leaderboardPageSize, setLeaderboardPageSize] = useState(5);
    useEffect(() => {
        leaderboardPageRef.current = leaderboardPage;
    }, [leaderboardPage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/balance/leaderboard?page=${leaderboardPage}&page_size=${leaderboardPageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newLeaderboard = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                newLeaderboard.push({ rank: (leaderboardPage - 1) * leaderboardPageSize + i + 1, user: <UserCard key={`${leaderboardPage}-i`} user={resp.data.list[i].user} />, balance: TSep(resp.data.list[i].balance), data: resp.data.list[i].user });
            }
            if (leaderboardPageRef.current === leaderboardPage) {
                setLeaderboard(newLeaderboard);
                setLeaderboardTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, leaderboardPage, leaderboardPageSize]);

    const [truckList, setTruckList] = useState([]);
    const [truckTotal, setTruckTotal] = useState(0);
    const [truckPage, setTruckPage] = useState(1);
    const truckPageRef = useRef(1);
    const [truckPageSize, setTruckPageSize] = useState(5);
    useEffect(() => {
        truckPageRef.current = truckPage;
    }, [truckPage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/trucks/list?order_by=income&order=desc&page=${truckPage}&page_size=${truckPageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newTruckList = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                let truck = resp.data.list[i];
                newTruckList.push({ model: truck.truck.brand + " " + truck.truck.model, garage: vars.economyGaragesMap[truck.garageid] !== undefined ? <a className="hover-underline" style={{ cursor: "pointer" }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalGarage(vars.economyGaragesMap[truck.garageid]); setModalGarageDetails(null); handleGarageClick(vars.economyGaragesMap[truck.garageid]); setDialogAction("garage"); }}>{vars.economyGaragesMap[truck.garageid].name}</a> : truck.garageid, owner: <UserCard user={truck.owner} />, income: TSep(truck.income), data: truck });
            }
            if (truckPageRef.current === truckPage) {
                setTruckList(newTruckList);
                setTruckTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, truckPage, truckPageSize]);

    const [garageList, setGarageList] = useState([]);
    const [garageTotal, setGarageTotal] = useState(0);
    const [garagePage, setGaragePage] = useState(1);
    const garagePageRef = useRef(1);
    const [garagePageSize, setGaragePageSize] = useState(5);
    useEffect(() => {
        garagePageRef.current = garagePage;
    }, [garagePage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/garages/list?order_by=income&order=desc&page=${garagePage}&page_size=${garagePageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newGarageList = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                let garage = resp.data.list[i];
                newGarageList.push({ location: vars.economyGaragesMap[garage.garageid] !== undefined ? vars.economyGaragesMap[garage.garageid].name : garage.garageid, owner: <UserCard user={garage.garage_owner} />, income: TSep(garage.income), data: garage });
            }
            if (garagePageRef.current === garagePage) {
                setGarageList(newGarageList);
                setGarageTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, garagePage, garagePageSize]);

    const [merchList, setMerchList] = useState([]);
    const [merchTotal, setMerchTotal] = useState(0);
    const [merchPage, setMerchPage] = useState(1);
    const merchPageRef = useRef(1);
    const [merchPageSize, setMerchPageSize] = useState(5);
    const [loadMerch, setLoadMerch] = useState(0);
    useEffect(() => {
        merchPageRef.current = merchPage;
    }, [merchPage]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let resp = await axios({ url: `${vars.dhpath}/economy/merch/list?owner=${vars.userInfo.userid}&page=${merchPage}&page_size=${merchPageSize}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            let newMerchList = [];
            for (let i = 0; i < resp.data.list.length; i++) {
                let merch = resp.data.list[i];
                let ctxMenu = <><MenuItem onClick={() => { setActiveMerch(merch); setDialogAction("transfer-merch"); }} sx={{ color: theme.palette.warning.main }}>{tr("transfer_merch")}</MenuItem><MenuItem onClick={() => { setActiveMerch(merch); setDialogAction("sell-merch"); }} sx={{ color: theme.palette.error.main }}>{tr("sell_merch")}</MenuItem></>;
                newMerchList.push({ name: vars.economyMerchMap[merch.merchid] !== undefined ? vars.economyMerchMap[merch.merchid].name : merch.merchid, value: TSep(merch.price), purchased: <TimeAgo timestamp={merch.purchase_timestamp * 1000} />, data: merch, contextMenu: ctxMenu });
            }
            if (merchPageRef.current === merchPage) {
                setMerchList(newMerchList);
                setMerchTotal(resp.data.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (configLoaded) {
            doLoad();
        }
    }, [configLoaded, merchPage, merchPageSize, loadMerch]);
    const [activeMerch, setActiveMerch] = useState({});
    const [merchOwner, setMerchOwner] = useState({});
    const [selectedMerch, setSelectedMerch] = useState({});
    const purchaseMerch = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/merch/${selectedMerch.merch.id}/purchase`, data: { owner: "self" }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("merch_purchased"));
            setSnackbarSeverity("success");
            setBalance(resp.data.balance);
            setLoadMerch(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [selectedMerch]);
    const transferMerch = useCallback(async () => {
        setDialogDisabled(true);
        let owner = merchOwner.userid;
        if (owner === -1000) owner = "company";
        else if (owner === vars.userInfo.userid) owner = "self";
        else owner = "user-" + owner;
        let resp = await axios({ url: `${vars.dhpath}/economy/merch/${activeMerch.itemid}/transfer`, data: { owner: owner, message: message }, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("merch_transferred"));
            setSnackbarSeverity("success");
            setDialogAction("");
            setLoadMerch(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeMerch, merchOwner]);
    const sellMerch = useCallback(async () => {
        setDialogDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/economy/merch/${activeMerch.itemid}/sell`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status === 200) {
            setSnackbarContent(tr("merch_sold"));
            setSnackbarSeverity("success");
            setDialogAction("");
            setBalance(resp.data.balance);
            setLoadMerch(+new Date());
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [activeMerch]);

    return <>{configLoaded && <>
        <CustomTileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={tr("europe")} onGarageClick={handleGarageClick} />
        <Dialog open={dialogAction === "garage"} onClose={() => setDialogAction("")} fullWidth>
            <DialogTitle>{modalGarage.name}</DialogTitle>
            <DialogContent>
                {modalGarageDetails === null && <Typography variant="body2" sx={{ color: theme.palette.info.main }}>{tr("loading_garage_info")}</Typography>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner !== undefined && <>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("owner")}</Typography>
                            <Typography variant="body2"><UserCard user={modalGarageDetails.garage_owner} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchased")}</Typography>
                            <Typography variant="body2"><TimeAgo timestamp={modalGarageDetails.purchase_timestamp * 1000} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("income")}</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.income)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("trucks")}</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.trucks)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("slots")}</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.slots)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("slot_owners")}</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.slot_owners)}</Typography>
                        </Grid>
                    </Grid>
                </>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner === undefined && <>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("price")}</Typography>
                            <Typography variant="body2">{TSep(modalGarage.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("base_slots")}</Typography>
                            <Typography variant="body2">{TSep(modalGarage.base_slots)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("slot_price")}</Typography>
                            <Typography variant="body2">{TSep(modalGarage.slot_price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>{tr("close")}</Button>
                {modalGarageDetails !== null && modalGarageDetails.garage_owner !== undefined && <>
                    {(checkUserPerm(["administrator", "manage_economy", "manage_garage"]) || modalGarageDetails.garage_owner.userid === vars.userInfo.userid) && <Button variant="contained" color="error" onClick={() => { setDialogAction("sell-garage"); }}>{tr("sell")}</Button>}
                    {(checkUserPerm(["administrator", "manage_economy", "manage_garage"]) || modalGarageDetails.garage_owner.userid === vars.userInfo.userid) && <Button variant="contained" color="warning" onClick={() => { setDialogAction("transfer-garage"); }}>{tr("transfer")}</Button>}
                    <Button variant="contained" color="info" onClick={() => { setSlotList([]); setDialogAction("slot"); }}>{tr("show_slots")}</Button>
                </>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner === undefined && <Button variant="contained" color="info" onClick={() => { purchaseGarage(); }} disabled={dialogDisabled}>{tr("purchase")}</Button>}
            </DialogActions>
        </Dialog>
        {modalGarageDetails !== null && <>
            <Dialog open={dialogAction === "transfer-garage"} onClose={() => setDialogAction("garage")} fullWidth>
                <DialogTitle><>{tr("transfer_garage")}</> - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("new_garage_owner")}</Typography>
                            <Typography variant="body2"><UserSelect users={[modalGarageDetails.garage_owner]} isMulti={false} includeCompany={true} onUpdate={setGarageOwner} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("message")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("garage"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="warning" onClick={() => { transferGarage(); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "sell-garage"} onClose={() => setDialogAction("garage")}>
                <DialogTitle><>{tr("sell_garage")}</> - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchase_price")}</Typography>
                            <Typography variant="body2">{TSep(modalGarage.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("refund")}</Typography>
                            <Typography variant="body2">{TSep(parseInt(modalGarage.price * vars.economyConfig.garage_refund))} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("garage"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="error" onClick={() => { sellGarage(); }} disabled={dialogDisabled}>{tr("sell")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "slot"} onClose={() => setDialogAction("garage")} fullWidth>
                <DialogTitle><>{tr("slots")}</> - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <CustomTable columns={slotColumns} data={slotList} totalItems={slotTotal} rowsPerPageOptions={[10, 25, 50]} defaultRowsPerPage={slotPageSize} onPageChange={setSlotPage} onRowsPerPageChange={setSlotPageSize} />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("garage"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="info" onClick={() => { purchaseSlot(); }} disabled={dialogDisabled}><>{tr("purchase")}</> (<>{tr("cost")}</>: {modalGarage.slot_price})</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "transfer-slot"} onClose={() => setDialogAction("slot")} fullWidth>
                <DialogTitle><>{tr("transfer_slot")}</> #{activeSlot.slotid} - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("new_slot_owner")}</Typography>
                            <Typography variant="body2"><UserSelect users={[activeSlot.slot_owner]} isMulti={false} includeCompany={true} onUpdate={setSlotOwner} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("message")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("slot"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="warning" onClick={() => { transferSlot(); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "sell-slot"} onClose={() => setDialogAction("slot")}>
                <DialogTitle><>{tr("sell_slot")}</> #{activeSlot.slotid} - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchase_price")}</Typography>
                            <Typography variant="body2">{TSep(modalGarage.slot_price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("refund")}</Typography>
                            <Typography variant="body2">{TSep(parseInt(modalGarage.slot_price * vars.economyConfig.slot_refund))} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("slot"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="error" onClick={() => { sellSlot(); }} disabled={dialogDisabled}>{tr("sell")}</Button>
                </DialogActions>
            </Dialog>
        </>}
        {activeTruck.truck !== undefined && <>
            <Dialog open={dialogAction === "truck"} onClose={() => setDialogAction(truckReferer)}>
                <DialogTitle><>{tr("vehicle")}</> #{activeTruck.vehicleid}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("owner")}</Typography>
                            <Typography variant="body2"><UserCard user={activeTruck.owner} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("assignee")}</Typography>
                            <Typography variant="body2">{activeTruck.owner.userid === null ? <UserCard user={activeTruck.assignee} /> : tr("not_applicable")}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("parking_at")}</Typography>
                            <Typography variant="body2">{vars.economyGaragesMap[activeTruck.garageid] !== undefined ? vars.economyGaragesMap[activeTruck.garageid].name : tr("unknown_garage")}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("model")}</Typography>
                            <Typography variant="body2">{activeTruck.truck.brand} {activeTruck.truck.model}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("price")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchased")}</Typography>
                            <Typography variant="body2"><TimeAgo timestamp={activeTruck.purchase_timestamp * 1000} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("odometer")}</Typography>
                            <Typography variant="body2">{ConvertUnit("km", activeTruck.odometer)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("income")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.income)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("service_expense")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.service)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("damage")}</Typography>
                            <Typography variant="body2">{parseInt(activeTruck.damage * 100)}%</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("repair_cost")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.repair_cost)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("status")}</Typography>
                            <Typography variant="body2">{TRUCK_STATUS[activeTruck.status]}</Typography>
                        </Grid>
                    </Grid>
                    {(checkUserPerm(["administrator", "manage_economy", "manage_truck"]) || activeTruck.owner.userid === vars.userInfo.userid) && <>
                        <ButtonGroup fullWidth sx={{ mt: "10px" }}>
                            <Button variant="contained" color="success" onClick={() => { activateTruck(); }} disabled={activeTruck.status !== "inactive" || dialogDisabled}>{tr("activate")}</Button>
                            <Button variant="contained" color="warning" onClick={() => { deactivateTruck(); }} disabled={activeTruck.status !== "active" || dialogDisabled}>{tr("deactivate")}</Button>
                            <Button variant="contained" color="info" onClick={() => { setDialogAction("relocate-truck"); }} disabled={dialogDisabled}>{tr("relocate")}</Button>
                            <Button variant="contained" color="success" onClick={() => { repairTruck(); }} disabled={activeTruck.damage === 0 || dialogDisabled}>{tr("repair")}</Button>
                        </ButtonGroup>
                        <ButtonGroup fullWidth sx={{ mt: "10px" }}>
                            <Button variant="contained" color="warning" onClick={() => { setDialogAction("transfer-truck"); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
                            <Button variant="contained" color="warning" onClick={() => { setDialogAction("reassign-truck"); }} disabled={activeTruck.owner.userid !== null || dialogDisabled}>{tr("reassign")}</Button>
                            <Button variant="contained" color="error" onClick={() => { setDialogAction("sell-truck"); }} disabled={dialogDisabled}>{tr("sell")}</Button>
                            <Button variant="contained" color="error" onClick={() => { setDialogAction("scrap-truck"); }} disabled={dialogDisabled}>{tr("scrap")}</Button>
                        </ButtonGroup>
                    </>}
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction(truckReferer); }}>{tr("close")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "relocate-truck"} onClose={() => setDialogAction("truck")} fullWidth>
                <DialogTitle><>{tr("relocate_truck")}</> #{activeTruck.vehicleid} - {activeTruck.truck.brand} {activeTruck.truck.model}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("slot_id")}
                                value={truckSlotId}
                                onChange={(e) => setTruckSlotId(e.target.value)}
                                fullWidth sx={{ mt: "5px" }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("truck"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="info" onClick={() => { relocateTruck(); }} disabled={dialogDisabled}>{tr("relocate")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "transfer-truck"} onClose={() => setDialogAction("truck")} fullWidth>
                <DialogTitle><>{tr("transfer_truck")}</> #{activeTruck.vehicleid} - {activeTruck.truck.brand} {activeTruck.truck.model}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("new_truck_owner")}</Typography>
                            <Typography variant="body2"><UserSelect users={[activeTruck.owner]} isMulti={false} includeCompany={true} onUpdate={setTruckOwner} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("message")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("truck"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="warning" onClick={() => { transferTruck(); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "reassign-truck"} onClose={() => setDialogAction("truck")} fullWidth>
                <DialogTitle><>{tr("reassign_truck")}</> #{activeTruck.vehicleid} - {activeTruck.truck.brand} {activeTruck.truck.model}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("new_truck_assignee")}</Typography>
                            <Typography variant="body2"><UserSelect users={[activeTruck.assignee]} isMulti={false} includeCompany={true} onUpdate={setTruckAssignee} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("message")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("truck"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="warning" onClick={() => { reassignTruck(); }} disabled={dialogDisabled}>{tr("reassign")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "sell-truck"} onClose={() => setDialogAction("truck")}>
                <DialogTitle><>{tr("sell_truck")}</> #{activeTruck.vehicleid} - {activeTruck.truck.brand} {activeTruck.truck.model}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchase_price")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("refund")}</Typography>
                            <Typography variant="body2">{TSep(parseInt(activeTruck.price * vars.economyConfig.truck_refund))} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("truck"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="error" onClick={() => { sellTruck(); }} disabled={dialogDisabled}>{tr("sell")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "scrap-truck"} onClose={() => setDialogAction("truck")}>
                <DialogTitle><>{tr("scrap_truck")}</> #{activeTruck.vehicleid} - {activeTruck.truck.brand} {activeTruck.truck.model}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchase_price")}</Typography>
                            <Typography variant="body2">{TSep(activeTruck.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("refund")}</Typography>
                            <Typography variant="body2">{TSep(parseInt(activeTruck.price * vars.economyConfig.scrap_refund))} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("truck"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="error" onClick={() => { scrapTruck(); }} disabled={dialogDisabled}>{tr("scrap")}</Button>
                </DialogActions>
            </Dialog>
        </>}
        <Dialog open={dialogAction === "purchase-truck"} onClose={() => setDialogAction(truckReferer)} fullWidth>
            <DialogTitle>{tr("purchase_truck")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Select
                            name="colors"
                            options={vars.economyTrucks.map((truck) => ({ value: truck.id, label: truck.brand + " " + truck.model + " - " + truck.price + " " + vars.economyConfig.currency_name, truck: truck }))}
                            className="basic-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={selectedTruck}
                            onChange={(item) => { setSelectedTruck(item); }}
                            menuPortalTarget={document.body}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={tr("slot_id")}
                            value={truckSlotId}
                            onChange={(e) => setTruckSlotId(e.target.value)}
                            fullWidth sx={{ mt: "5px" }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(truckReferer); }}>{tr("close")}</Button>
                <Button variant="contained" color="info" onClick={() => { purchaseTruck(); }} disabled={selectedTruck.truck === undefined || truckSlotId === "" || dialogDisabled}>{tr("purchase")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogAction === "manage-balance"} onClose={() => setDialogAction("")} fullWidth>
            <DialogTitle><FontAwesomeIcon icon={faCoins} />&nbsp;&nbsp;{tr("manage_balance")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("user")}</Typography>
                <Typography variant="body2"><UserSelect users={[manageTransferFrom]} isMulti={false} includeCompany={true} onUpdate={setManageTransferFrom} /></Typography>
                <br />
                <Typography variant="body">{tr("current_balance")}: {TSep(manageBalance)} {vars.economyConfig.currency_name}
                    {manageBalanceVisibility === "public" && <IconButton onClick={() => { updateManageBalanceVisibility("private"); }}><FontAwesomeIcon icon={faUnlock} /></IconButton>}
                    {manageBalanceVisibility === "private" && <IconButton onClick={() => { updateManageBalanceVisibility("public"); }}><FontAwesomeIcon icon={faLock} /></IconButton>}</Typography>
                <Grid container spacing={2} sx={{ mt: "5px" }}>
                    <Grid item xs={12} sm={12} md={8} lg={8}>
                        <TextField
                            label={tr("set_balance_to")}
                            value={manageNewBalance}
                            onChange={(e) => setManageNewBalance(e.target.value)}
                            fullWidth size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4}>
                        <Button variant="contained" color="info" onClick={() => { manageUpdateBalance(); }} disabled={dialogDisabled} fullWidth>{tr("update")}</Button>
                    </Grid>
                </Grid>
                <Divider sx={{ mt: "10px", mb: "10px" }} />
                <Typography variant="h6" sx={{ fontWeight: 800, mb: "10px" }}><FontAwesomeIcon icon={faMoneyBillTransfer} />&nbsp;&nbsp;{tr("transfer")}</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("recipient")}</Typography>
                        <Typography variant="body2"><UserSelect users={[manageTransferTo]} isMulti={false} includeCompany={true} includeBlackhole={true} onUpdate={setManageTransferTo} /></Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <TextField
                            label={tr("amount")}
                            value={manageTransferAmount}
                            onChange={(e) => setManageTransferAmount(e.target.value)}
                            fullWidth size="small" sx={{ mt: { md: "18px", lg: "18px" } }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label={tr("message")}
                            value={manageTransferMessage}
                            onChange={(e) => setManageTransferMessage(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>{tr("close")}</Button>
                <Button variant="contained" color="info" onClick={() => { manageTransferMoney(); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogAction === "export-transaction"} onClose={() => setDialogAction("")}>
            <DialogTitle>{tr("export_transaction_history")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2">{tr("export_transaction_history_note")}</Typography>
                <Grid container spacing={2} style={{ marginTop: "3px" }}>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("start_time")}
                            defaultValue={exportRange.start_time}
                            onChange={(timestamp) => { setExportRange({ ...exportRange, start_time: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <DateTimeField
                            label={tr("end_time")}
                            defaultValue={exportRange.end_time}
                            onChange={(timestamp) => { setExportRange({ ...exportRange, end_time: timestamp }); }}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>{tr("cancel")}</Button>
                <Button variant="contained" color="info" onClick={() => { exportTransaction(); }} disabled={dialogDisabled}>{tr("export")}</Button>
            </DialogActions>
        </Dialog>
        {activeMerch.merchid !== undefined && <>
            <Dialog open={dialogAction === "transfer-merch"} onClose={() => setDialogAction("merch")} fullWidth>
                <DialogTitle><>{tr("transfer_merch")}</> - {vars.economyMerchMap[activeMerch.merchid] !== undefined ? vars.economyMerchMap[activeMerch.merchid].name : activeMerch.merchid}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("new_owner")}</Typography>
                            <Typography variant="body2"><UserSelect users={[activeMerch.owner]} isMulti={false} includeCompany={true} onUpdate={setMerchOwner} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("message")}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("merch"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="warning" onClick={() => { transferMerch(); }} disabled={dialogDisabled}>{tr("transfer")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "sell-merch"} onClose={() => setDialogAction("merch")}>
                <DialogTitle><>{tr("sell_merch")}</> - {vars.economyMerchMap[activeMerch.merchid] !== undefined ? vars.economyMerchMap[activeMerch.merchid].name : activeMerch.merchid}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("purchase_price")}</Typography>
                            <Typography variant="body2">{TSep(activeMerch.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("sell_price")}</Typography>
                            <Typography variant="body2">{vars.economyMerchMap[activeMerch.merchid] !== undefined ? TSep(vars.economyMerchMap[activeMerch.merchid].sell_price) : "/"} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("merch"); }}>{tr("close")}</Button>
                    <Button variant="contained" color="error" onClick={() => { sellMerch(); }} disabled={dialogDisabled}>{tr("sell")}</Button>
                </DialogActions>
            </Dialog>
        </>}
        <Dialog open={dialogAction === "purchase-merch"} onClose={() => setDialogAction("")} fullWidth>
            <DialogTitle>{tr("purchase_merch")}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Select
                            name="colors"
                            options={vars.economyMerch.map((merch) => ({ value: merch.id, label: merch.name + " - " + merch.buy_price + " " + vars.economyConfig.currency_name, merch: merch }))}
                            className="basic-select"
                            classNamePrefix="select"
                            styles={customSelectStyles(theme)}
                            value={selectedMerch}
                            onChange={(item) => { setSelectedMerch(item); }}
                            menuPortalTarget={document.body}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>{tr("close")}</Button>
                <Button variant="contained" color="info" onClick={() => { purchaseMerch(); }} disabled={selectedMerch.value === undefined || dialogDisabled}>{tr("purchase")}</Button>
            </DialogActions>
        </Dialog>
        <Grid container spacing={2} sx={{ mt: "10px" }}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <CustomTable name={<><FontAwesomeIcon icon={faRankingStar} />&nbsp;&nbsp;{tr("balance_leaderboard")}</>} columns={leaderboardColumns} data={leaderboard} totalItems={leaderboardTotal} rowsPerPageOptions={[5, 10, 25, 50]} defaultRowsPerPage={leaderboardPageSize} onPageChange={setLeaderboardPage} onRowsPerPageChange={setLeaderboardPageSize} onRowClick={checkUserPerm(["administrator", "manage_economy", "manage_balance"]) ? (row) => { setManageTransferFrom(row.data); setManageBalance(row.balance); setDialogAction("manage-balance"); } : undefined} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: "10px", display: 'flex', alignItems: 'center', marginRight: 'auto' }}><FontAwesomeIcon icon={faCoins} />&nbsp;&nbsp;{tr("balance")}</Typography>
                            <Typography variant="h6" component="div" style={{ display: 'flex', alignItems: 'center' }}>
                                {balanceVisibility === "public" && <IconButton onClick={() => { updateBalanceVisibility("private"); }}><FontAwesomeIcon icon={faUnlock} /></IconButton>}
                                {balanceVisibility === "private" && <IconButton onClick={() => { updateBalanceVisibility("public"); }}><FontAwesomeIcon icon={faLock} /></IconButton>}
                                {checkUserPerm(["administrator", "manage_economy", "manage_balance"]) && <IconButton onClick={() => { setDialogAction("manage-balance"); }}><FontAwesomeIcon icon={faUserGear} /></IconButton>}
                                {<IconButton onClick={() => { setDialogAction("export-transaction"); }}><FontAwesomeIcon icon={faFileExport} /></IconButton>}
                            </Typography>
                        </div>
                        <Typography variant="body">{tr("current_balance")}: {TSep(balance)} {vars.economyConfig.currency_name}</Typography>
                        <Divider sx={{ mt: "10px", mb: "10px" }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: "10px" }}><FontAwesomeIcon icon={faMoneyBillTransfer} />&nbsp;&nbsp;{tr("transfer")}</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <Typography variant="body2" sx={{ fontWeight: "bold" }}>{tr("recipient")}</Typography>
                                <Typography variant="body2"><UserSelect users={[transferTo]} isMulti={false} includeCompany={true} onUpdate={setTransferTo} /></Typography>
                            </Grid>
                            <Grid item xs={12} sm={12} md={6} lg={6}>
                                <TextField
                                    label={tr("amount")}
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    fullWidth size="small" sx={{ mt: { md: "18px", lg: "18px" } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label={tr("message")}
                                    value={transferMessage}
                                    onChange={(e) => setTransferMessage(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                        <Button variant="contained" color="info" fullWidth onClick={() => { transferMoney(); }} disabled={transferTo.userid === undefined || dialogDisabled} sx={{ mt: "10px" }}>{tr("transfer")}</Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <CustomTable name={<><FontAwesomeIcon icon={faWarehouse} />&nbsp;&nbsp;{tr("top_garages")}</>} columns={garageColumns} data={garageList} totalItems={garageTotal} rowsPerPageOptions={[5, 10, 25, 50]} defaultRowsPerPage={garagePageSize} onPageChange={setGaragePage} onRowsPerPageChange={setGaragePageSize} onRowClick={(row) => { if (vars.economyGaragesMap[row.data.garageid] !== undefined) { setModalGarage(vars.economyGaragesMap[row.data.garageid]); } setModalGarageDetails(row.data); setDialogAction("garage"); }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <CustomTable name={<><FontAwesomeIcon icon={faTruck} />&nbsp;&nbsp;{tr("top_trucks")}</>} columns={truckColumns} data={truckList} totalItems={truckTotal} rowsPerPageOptions={[5, 10, 25, 50]} defaultRowsPerPage={truckPageSize} onPageChange={setTruckPage} onRowsPerPageChange={setTruckPageSize} onRowClick={(row) => { setTruckReferer(""); setActiveTruck(row.data); setTruckOwner(row.data.owner); setTruckAssignee(row.data.assignee); loadTruck(row.data); setDialogAction("truck"); }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <CustomTable name={<><FontAwesomeIcon icon={faTruck} />&nbsp;&nbsp;{tr("my_trucks")}</>} nameRight={<IconButton onClick={() => { setTruckReferer(""); setDialogAction("purchase-truck"); }}><FontAwesomeIcon icon={faPlus} /></IconButton>} columns={myTruckColumns} data={myTruckList} totalItems={myTruckTotal} rowsPerPageOptions={[5, 10, 25, 50]} defaultRowsPerPage={myTruckPageSize} onPageChange={setMyTruckPage} onRowsPerPageChange={setMyTruckPageSize} onRowClick={(row) => { setTruckReferer(""); setActiveTruck(row.data); setTruckOwner(row.data.owner); setTruckAssignee(row.data.assignee); loadTruck(row.data); setDialogAction("truck"); }} />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
                <CustomTable name={<><FontAwesomeIcon icon={faShoppingCart} />&nbsp;&nbsp;{tr("owned_merchandise")}</>} nameRight={<IconButton onClick={() => { setDialogAction("purchase-merch"); }}><FontAwesomeIcon icon={faPlus} /></IconButton>} columns={merchColumns} data={merchList} totalItems={merchTotal} rowsPerPageOptions={[5, 10, 25, 50]} defaultRowsPerPage={merchPageSize} onPageChange={setMerchPage} onRowsPerPageChange={setMerchPageSize} />
            </Grid>
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
    </>}</>;
};

export default Economy;