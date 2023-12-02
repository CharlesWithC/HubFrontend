import { useTranslation } from 'react-i18next';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Box, Tabs, Tab, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography } from '@mui/material';

import UserCard from '../components/usercard';
import TileMap from '../components/tilemap';
import { useTheme } from '@emotion/react';

var vars = require("../variables");

function tabBtnProps(index, current, theme) {
    return {
        id: `map-tab-${index}`,
        'aria-controls': `map-tabpanel-${index}`,
        style: { color: current === index ? theme.palette.info.main : 'inherit' }
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`map-tabpanel-${index}`}
            aria-labelledby={`map-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Map = () => {
    const SERVER_ID = { 0: 2, 1: 50, 2: 10 };
    const { t: tr } = useTranslation();
    const theme = useTheme();

    const [tab, setTab] = React.useState(0);

    const [points, setPoints] = useState([]);
    const [boundary, setBoundary] = useState({});
    const [displayUser, setDisplayUser] = useState({});

    const handleChange = (event, newValue) => {
        setTab(newValue);
        setPoints([]);
    };

    const boundaryRef = useRef(boundary);
    const tabRef = useRef(tab);
    useEffect(() => {
        boundaryRef.current = boundary;
    }, [boundary]);
    useEffect(() => {
        tabRef.current = tab;
    }, [tab]);

    useEffect(() => {
        const memberTruckersMP = vars.members.map((member) => member.truckersmpid);
        const intervalId = setInterval(async () => {
            if (SERVER_ID[tabRef.current] !== undefined && boundaryRef.current.x1 !== undefined) {
                let server_id = SERVER_ID[tabRef.current];
                const response = await fetch(`https://tracker.ets2map.com/v3/area?x1=${boundaryRef.current.x1}&y1=${boundaryRef.current.y2}&x2=${boundaryRef.current.x2}&y2=${boundaryRef.current.y1}&server=${SERVER_ID[tabRef.current]}`);
                const data = await response.json();
                if (server_id !== SERVER_ID[tabRef.current]) {
                    return;
                }
                if (data.Data !== null) {
                    const points = data.Data.map(item => ({ x: item.X, y: item.Y, color: memberTruckersMP.includes(item.MpId) ? '#f39621' : '#158CFB', info: { ...item } }));
                    setPoints(points);
                } else {
                    setPoints([]);
                }
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    let cityIDs = {};
    if (vars.dlogDetails.source_city !== undefined) {
        for (let i = 0; i < vars.dlogDetails["source_city"].length; i++) {
            cityIDs[vars.dlogDetails["source_city"][i]["unique_id"]] = vars.dlogDetails["source_city"][i]["name"];
        }
    }
    if (vars.dlogDetails.destination_city !== undefined) {
        for (let i = 0; i < vars.dlogDetails["destination_city"].length; i++) {
            cityIDs[vars.dlogDetails["destination_city"][i]["unique_id"]] = vars.dlogDetails["destination_city"][i]["name"];
        }
    }
    let companyIDs = {};
    if (vars.dlogDetails.source_company !== undefined) {
        for (let i = 0; i < vars.dlogDetails["source_company"].length; i++) {
            companyIDs[vars.dlogDetails["source_company"][i]["unique_id"]] = vars.dlogDetails["source_company"][i]["name"];
        }
    }
    if (vars.dlogDetails.destination_company !== undefined) {
        for (let i = 0; i < vars.dlogDetails["destination_company"].length; i++) {
            companyIDs[vars.dlogDetails["destination_company"][i]["unique_id"]] = vars.dlogDetails["destination_company"][i]["name"];
        }
    }
    let cargoIDs = {};
    if (vars.dlogDetails.cargo !== undefined) {
        for (let i = 0; i < vars.dlogDetails["cargo"].length; i++) {
            cargoIDs[vars.dlogDetails["cargo"][i]["unique_id"]] = vars.dlogDetails["cargo"][i]["name"];
        }
    }

    const handlePointClick = useCallback((data) => {
        let info = data.info;
        if (info.Job.LoadName !== "") {
            if (cargoIDs[info.Job.LoadName.replace("cargo.", "")] !== undefined) {
                info.cargo = cargoIDs[info.Job.LoadName.replace("cargo.", "")];
            } else {
                info.cargo = info.Job.LoadName.replace("cargo.", "");
            }
            if (companyIDs[info.Job.SourceCompany.replace("company.permanent.", "")] !== undefined && cityIDs[info.Job.SourceCity.replace("city.", "")] !== undefined) {
                info.source = companyIDs[info.Job.SourceCompany.replace("company.permanent.", "")] + ", " + cityIDs[info.Job.SourceCity.replace("city.", "")];
            } else {
                info.source = info.Job.SourceCompany.replace("company.permanent.", "") + ", " + info.Job.SourceCity.replace("city.", "");
            }
            if (companyIDs[info.Job.DestinationCompany.replace("company.permanent.", "")] !== undefined && cityIDs[info.Job.DestinationCity.replace("city.", "")] !== undefined) {
                info.destination = companyIDs[info.Job.DestinationCompany.replace("company.permanent.", "")] + ", " + cityIDs[info.Job.DestinationCity.replace("city.", "")];
            } else {
                info.destination = info.Job.DestinationCompany.replace("company.permanent.", "") + ", " + info.Job.DestinationCity.replace("city.", "");
            }
        }
        for (let i = 0; i < vars.members.length; i++) {
            if (vars.members[i].truckersmpid === info.MpId) {
                setDisplayUser({ ...info, ...vars.members[i] });
                return;
            }
        }
        setDisplayUser(info);
    }, []);


    return <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={handleChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                <Tab label={tr("ets2_base")} {...tabBtnProps(0, tab, theme)} />
                <Tab label={tr("ets2_promods")} {...tabBtnProps(1, tab, theme)} />
                <Tab label={tr("ats_base")} {...tabBtnProps(2, tab, theme)} />
                <Tab label={tr("ats_promods")} {...tabBtnProps(3, tab, theme)} />
            </Tabs>
        </Box>
        {tab === 0 && <TabPanel value={tab} index={0}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/base/tiles"} title={tr("euro_truck_simulator_2_base_map")} points={points} onBoundaryChange={setBoundary} onPointClick={handlePointClick} />
        </TabPanel>}
        {tab === 1 && <TabPanel value={tab} index={1}>
            <TileMap tilesUrl={"https://map.charlws.com/ets2/promods/tiles"} title={tr("euro_truck_simulator_2_promods_map")} points={points} onBoundaryChange={setBoundary} onPointClick={handlePointClick} />
        </TabPanel>}
        {tab === 2 && <TabPanel value={tab} index={2}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/base/tiles"} title={tr("american_truck_simulator_base_map")} points={points} onBoundaryChange={setBoundary} onPointClick={handlePointClick} />
        </TabPanel>}
        {tab === 3 && <TabPanel value={tab} index={3}>
            <TileMap tilesUrl={"https://map.charlws.com/ats/promods/tiles"} title={tr("american_truck_simulator_promods_map")} points={points} onBoundaryChange={setBoundary} onPointClick={handlePointClick} />
        </TabPanel>}
        <Dialog open={displayUser.MpId !== undefined} onClose={() => setDisplayUser({})}>
            <DialogTitle>{displayUser.userid === undefined ? <>TruckersMP Player</> : <>{vars.dhconfig.name} Driver</>}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Name</Typography>
                        <Typography variant="body2">{displayUser.userid === undefined ? <>{displayUser.Name}</> : <UserCard user={displayUser} />}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>TruckersMP</Typography>
                        <Typography variant="body2"><a href={`https://truckersmp.com/user/${displayUser.MpId}`} target="_blank" rel="noreferrer">{displayUser.MpId}</a></Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Player ID</Typography>
                        <Typography variant="body2">{displayUser.PlayerId}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>X</Typography>
                        <Typography variant="body2">{displayUser.X}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Y</Typography>
                        <Typography variant="body2">{displayUser.Y}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>Heading</Typography>
                        <Typography variant="body2">{displayUser.Heading}</Typography>
                    </Grid>
                    {displayUser.cargo === undefined && <>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Status</Typography>
                            <Typography variant="body2">Free Roaming</Typography>
                        </Grid></>}
                    {displayUser.cargo !== undefined && <>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Cargo</Typography>
                            <Typography variant="body2">{displayUser.cargo}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Source</Typography>
                            <Typography variant="body2">{displayUser.source}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>Destination</Typography>
                            <Typography variant="body2">{displayUser.destination}</Typography>
                        </Grid></>}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDisplayUser({}); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
    </Card>;
};

export default Map;