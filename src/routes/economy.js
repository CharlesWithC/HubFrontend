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

import { Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme, Grid } from '@mui/material';

import UserCard from '../components/usercard';
import TimeAgo from '../components/timeago';
import { makeRequestsAuto, customAxios as axios, getAuthToken } from '../functions';

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

// function tabBtnProps(index, current, theme) {
//     return {
//         id: `map-tab-${index}`,
//         'aria-controls': `map-tabpanel-${index}`,
//         style: { color: current === index ? theme.palette.info.main : 'inherit' }
//     };
// }

// function TabPanel(props) {
//     const { children, value, index, ...other } = props;

//     return (
//         <div
//             role="tabpanel"
//             hidden={value !== index}
//             id={`map-tabpanel-${index}`}
//             aria-labelledby={`map-tab-${index}`}
//             {...other}
//         >
//             {value === index && (
//                 <Box sx={{ p: 3 }}>
//                     {children}
//                 </Box>
//             )}
//         </div>
//     );
// }

const Economy = () => {
    // const [tab, setTab] = React.useState(0);

    // const handleChange = (event, newValue) => {
    //     setTab(newValue);
    // };

    const theme = useTheme();

    const [dialogAction, setDialogAction] = useState("");

    const [modalGarage, setModalGarage] = useState({});
    const [modalGarageDetails, setModalGarageDetails] = useState(null);
    const handleGarageClick = useCallback(async (garage) => {
        setDialogAction("garage");
        setModalGarage(garage);
        setModalGarageDetails(null);

        let resp = await axios({ url: `${vars.dhpath}/economy/garages/${garage.id}`, method: "GET", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        setModalGarageDetails(resp.data);
    }, []);

    return <>
        {/* <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                <Tab label="Europe" {...tabBtnProps(0, tab, theme)} />
                <Tab label="US" {...tabBtnProps(1, tab, theme)} />
            </Tabs>
        </Box> */}
        {/* <TabPanel value={tab} index={0}> */}
        <CustomTileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={"Europe"} onGarageClick={handleGarageClick} />
        {/* </TabPanel> */}
        {/* <TabPanel value={tab} index={1}>
            <CustomTileMap tilesUrl={"https://map.charlws.com/ats/base/tiles"} title={"US"} />
        </TabPanel> */}
        <Dialog open={dialogAction === "garage"} onClose={() => setDialogAction("")}>
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
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Purchased At</Typography>
                            <Typography variant="body2"><TimeAgo timestamp={modalGarageDetails.purchase_timestamp * 1000} /></Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Income</Typography>
                            <Typography variant="body2">{modalGarageDetails.income} {vars.economyConfig.currency_name}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Trucks</Typography>
                            <Typography variant="body2">{modalGarageDetails.trucks}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Slots</Typography>
                            <Typography variant="body2">{modalGarageDetails.slots}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Slot Owners</Typography>
                            <Typography variant="body2">{modalGarageDetails.slot_owners}</Typography>
                        </Grid>
                    </Grid>
                </>}
                {modalGarageDetails !== null && modalGarageDetails.garage_owner === undefined && <>
                    <Typography variant="body2">
                        This garage hasn't been purchased.
                    </Typography>
                </>}
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogAction(""); }}>Close</Button>
            </DialogActions>
        </Dialog>
    </>;
};

export default Economy;