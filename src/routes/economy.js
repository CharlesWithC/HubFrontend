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

import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, Grid, Snackbar, Alert, TextField } from '@mui/material';
import { Portal } from '@mui/base';

import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, customAxios as axios, getAuthToken, TSep, checkUserPerm } from '../functions';

var vars = require("../variables");

function calculateCenterPoint(points) {
    if (points.length === 0) {
        throw new Error('Empty points array');
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

const Garage = () => {
    const theme = useTheme();

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogAction, setDialogAction] = useState("");
    const [dialogDisabled, setDialogDisabled] = useState(false);

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
            setSnackbarContent(`Garage purchased! Balance: ${resp.data.balance}`);
            setSnackbarSeverity("success");
            handleGarageClick(modalGarage);
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
            setSnackbarContent(`Garage transferred!`);
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
            setSnackbarContent(`Garage sold! Balance: ${resp.data.balance}`);
            setSnackbarSeverity("success");
            handleGarageClick(modalGarage);
            setDialogAction("garage");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setDialogDisabled(false);
    }, [modalGarage]);

    return <>
        <CustomTileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={"Europe"} onGarageClick={handleGarageClick} />
        <Dialog open={dialogAction === "garage"} onClose={() => setDialogAction("")} fullWidth>
            <DialogTitle>{modalGarage.name}</DialogTitle>
            <DialogContent>
                {modalGarageDetails === null && <Typography variant="body2" sx={{ color: theme.palette.info.main }}>Loading garage info...</Typography>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner !== undefined && <>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Owner</Typography>
                            <Typography variant="body2"><UserCard user={modalGarageDetails.garage_owner} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Purchased Since</Typography>
                            <Typography variant="body2"><TimeAgo timestamp={modalGarageDetails.purchase_timestamp * 1000} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Income</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.income)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Trucks</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.trucks)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Slots</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.slots)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Slot Owners</Typography>
                            <Typography variant="body2">{TSep(modalGarageDetails.slot_owners)}</Typography>
                        </Grid>
                    </Grid>
                </>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner === undefined && <>
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Price</Typography>
                            <Typography variant="body2">{TSep(modalGarage.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Base Slots</Typography>
                            <Typography variant="body2">{TSep(modalGarage.base_slots)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Slot Price</Typography>
                            <Typography variant="body2">{TSep(modalGarage.slot_price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>Close</Button>
                {modalGarageDetails !== null && modalGarageDetails.garage_owner !== undefined && <>
                    {(checkUserPerm(["admin", "economy_manager", "garage_manager"]) || modalGarageDetails.garage_owner.userid === vars.userInfo.userid) && <Button variant="contained" color="warning" onClick={() => { setDialogAction("transfer"); }} disabled={dialogDisabled}>Transfer</Button>}
                    {(checkUserPerm(["admin", "economy_manager", "garage_manager"]) || modalGarageDetails.garage_owner.userid === vars.userInfo.userid) && <Button variant="contained" color="error" onClick={() => { setDialogAction("sell"); }} disabled={dialogDisabled}>Sell</Button>}
                </>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner === undefined && <Button variant="contained" color="info" onClick={() => { purchaseGarage(); }} disabled={dialogDisabled}>Purchase</Button>}
            </DialogActions>
        </Dialog>
        {modalGarageDetails !== null && <>
            <Dialog open={dialogAction === "transfer"} onClose={() => setDialogAction("garage")} fullWidth>
                <DialogTitle>Transfer Garage - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>New garage owner</Typography>
                            <Typography variant="body2"><UserSelect initialUsers={[modalGarageDetails.garage_owner]} isMulti={false} includeCompany={true} onUpdate={setGarageOwner} /></Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("garage"); }}>Close</Button>
                    <Button variant="contained" color="warning" onClick={() => { transferGarage(); }} disabled={dialogDisabled}>Transfer</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={dialogAction === "sell"} onClose={() => setDialogAction("garage")}>
                <DialogTitle>Sell Garage - {modalGarage.name}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Purchase Price</Typography>
                            <Typography variant="body2">{TSep(modalGarage.price)} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Refund</Typography>
                            <Typography variant="body2">{TSep(parseInt(modalGarage.price * vars.economyConfig.garage_refund))} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogAction("garage"); }}>Close</Button>
                    <Button variant="contained" color="error" onClick={() => { sellGarage(); }} disabled={dialogDisabled}>Sell</Button>
                </DialogActions>
            </Dialog>
        </>}
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

const Economy = () => {
    return <Garage />;
};

export default Economy;