import { useState, useEffect, useRef, useCallback, useContext, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context";

import { Card, Box, Tabs, Tab, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, useTheme } from "@mui/material";

import UserCard from "../components/usercard";
import TileMap from "../components/tilemap";

function tabBtnProps(index, current, theme) {
    return {
        "id": `map-tab-${index}`,
        "aria-controls": `map-tabpanel-${index}`,
        "style": { color: current === index ? theme.palette.info.main : "inherit" },
    };
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`map-tabpanel-${index}`} aria-labelledby={`map-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Map = () => {
    const SERVER_ID = { 0: 2, 1: 50, 3: 10 };
    const { t: tr } = useTranslation();
    const theme = useTheme();
    const { webConfig, users, memberUIDs, dlogDetailsCache } = useContext(AppContext);
    const allMembers = memberUIDs.map(uid => users[uid]);

    const [tab, setTab] = useState(0);

    const [points, setPoints] = useState([]);
    const [boundary, setBoundary] = useState({});
    const [displayUser, setDisplayUser] = useState({});
    const [orangeOnly, setOrangeOnly] = useState(false); // orange => vtc driver
    const handleToggleVtcOnly = useCallback(() => {
        setOrangeOnly(prev => !prev);
    }, []);

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
        const memberTruckersMP = allMembers.map(member => member.truckersmpid);
        const intervalId = setInterval(async () => {
            if (SERVER_ID[tabRef.current] !== undefined && boundaryRef.current.x1 !== undefined) {
                let server_id = SERVER_ID[tabRef.current];
                const response = await fetch(`https://tracker.ets2map.com/v3/area?x1=${boundaryRef.current.x1}&y1=${boundaryRef.current.y2}&x2=${boundaryRef.current.x2}&y2=${boundaryRef.current.y1}&server=${SERVER_ID[tabRef.current]}`);
                const data = await response.json();
                if (server_id !== SERVER_ID[tabRef.current]) {
                    return;
                }
                if (data.Data !== null) {
                    const points = data.Data.map(item => ({ x: item.X, y: item.Y, color: memberTruckersMP.includes(item.MpId) ? "#f39621" : "#158CFB", info: { ...item } }));
                    setPoints(points);
                } else {
                    setPoints([]);
                }
            }
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const cityIDs = useMemo(() => {
        let ids = {};
        if (dlogDetailsCache.source_city !== undefined) {
            for (let i = 0; i < dlogDetailsCache["source_city"].length; i++) {
                ids[dlogDetailsCache["source_city"][i]["unique_id"]] = dlogDetailsCache["source_city"][i]["name"];
            }
        }
        if (dlogDetailsCache.destination_city !== undefined) {
            for (let i = 0; i < dlogDetailsCache["destination_city"].length; i++) {
                ids[dlogDetailsCache["destination_city"][i]["unique_id"]] = dlogDetailsCache["destination_city"][i]["name"];
            }
        }
        return ids;
    }, [dlogDetailsCache]);

    const companyIDs = useMemo(() => {
        let ids = {};
        if (dlogDetailsCache.source_company !== undefined) {
            for (let i = 0; i < dlogDetailsCache["source_company"].length; i++) {
                ids[dlogDetailsCache["source_company"][i]["unique_id"]] = dlogDetailsCache["source_company"][i]["name"];
            }
        }
        if (dlogDetailsCache.destination_company !== undefined) {
            for (let i = 0; i < dlogDetailsCache["destination_company"].length; i++) {
                ids[dlogDetailsCache["destination_company"][i]["unique_id"]] = dlogDetailsCache["destination_company"][i]["name"];
            }
        }
        return ids;
    }, [dlogDetailsCache]);

    const cargoIDs = useMemo(() => {
        let ids = {};
        if (dlogDetailsCache.cargo !== undefined) {
            for (let i = 0; i < dlogDetailsCache["cargo"].length; i++) {
                ids[dlogDetailsCache["cargo"][i]["unique_id"]] = dlogDetailsCache["cargo"][i]["name"];
            }
        }
        return ids;
    }, [dlogDetailsCache]);

    const handlePointClick = useCallback(data => {
        let info = data.info;
        if (info.Job !== undefined && info.Job.LoadName !== "") {
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
        for (let i = 0; i < allMembers.length; i++) {
            if (allMembers[i].truckersmpid === info.MpId) {
                setDisplayUser({ ...info, ...allMembers[i] });
                return;
            }
        }
        setDisplayUser(info);
    }, []);

    return (
        <Card>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={tab} onChange={handleChange} aria-label="map tabs" color="info" TabIndicatorProps={{ style: { backgroundColor: theme.palette.info.main } }}>
                    <Tab label={tr("ets2")} {...tabBtnProps(0, tab, theme)} />
                    <Tab label={tr("ets2_promods")} {...tabBtnProps(1, tab, theme)} />
                    <Tab label={tr("ets2_promods_classic")} {...tabBtnProps(2, tab, theme)} />
                    <Tab label={tr("ats")} {...tabBtnProps(3, tab, theme)} />
                    <Tab label={tr("ats_promods")} {...tabBtnProps(4, tab, theme)} />
                </Tabs>
            </Box>
            {tab === 0 && (
                <TabPanel value={tab} index={0}>
                    <TileMap
                        tilesUrl={"https://map.charlws.com/ets2/base/tiles"}
                        title={
                            <>
                                {tr("euro_truck_simulator_2_base_map")}
                                <br />
                                {tr("live_data_feed_truckersmp_eu_sim_1")}
                                <br />{" "}
                                <span style={{ cursor: "pointer" }} onClick={handleToggleVtcOnly}>
                                    {orangeOnly ? tr("showing_vtc_drivers_only") : tr("showing_all_players")}&nbsp;{tr("click_to_toggle")}
                                </span>
                            </>
                        }
                        points={points}
                        onBoundaryChange={setBoundary}
                        onPointClick={handlePointClick}
                        showOrangeOnly={orangeOnly}
                    />
                </TabPanel>
            )}
            {tab === 1 && (
                <TabPanel value={tab} index={1}>
                    <TileMap
                        tilesUrl={"https://map.charlws.com/ets2/promods/tiles"}
                        title={
                            <>
                                {tr("euro_truck_simulator_2_promods_map")}
                                <br />
                                {tr("live_data_feed_truckersmp_eu_pm")}
                                <br />{" "}
                                <span style={{ cursor: "pointer" }} onClick={handleToggleVtcOnly}>
                                    {orangeOnly ? tr("showing_vtc_drivers_only") : tr("showing_all_players")}&nbsp;{tr("click_to_toggle")}
                                </span>
                            </>
                        }
                        points={points}
                        onBoundaryChange={setBoundary}
                        onPointClick={handlePointClick}
                        showOrangeOnly={orangeOnly}
                    />
                </TabPanel>
            )}
            {tab === 2 && (
                <TabPanel value={tab} index={2}>
                    <TileMap
                        tilesUrl={"https://map.charlws.com/ets2/promods-classic/tiles"}
                        title={
                            <>
                                {tr("euro_truck_simulator_2_promods_classic_map")}
                                <br />
                                {tr("live_data_feed_no_data")}
                            </>
                        }
                        points={points}
                        onBoundaryChange={setBoundary}
                        onPointClick={handlePointClick}
                        showOrangeOnly={orangeOnly}
                    />
                </TabPanel>
            )}
            {tab === 3 && (
                <TabPanel value={tab} index={3}>
                    <TileMap
                        tilesUrl={"https://map.charlws.com/ats/base/tiles"}
                        title={
                            <>
                                {tr("american_truck_simulator_base_map")}
                                <br />
                                {tr("live_data_feed_truckersmp_us_sim")}
                                <br />{" "}
                                <span style={{ cursor: "pointer" }} onClick={handleToggleVtcOnly}>
                                    {orangeOnly ? tr("showing_vtc_drivers_only") : tr("showing_all_players")}&nbsp;{tr("click_to_toggle")}
                                </span>
                            </>
                        }
                        points={points}
                        onBoundaryChange={setBoundary}
                        onPointClick={handlePointClick}
                        showOrangeOnly={orangeOnly}
                    />
                </TabPanel>
            )}
            {tab === 4 && (
                <TabPanel value={tab} index={4}>
                    <TileMap
                        tilesUrl={"https://map.charlws.com/ats/promods/tiles"}
                        title={
                            <>
                                {tr("american_truck_simulator_promods_map")}
                                <br />
                                {tr("live_data_feed_no_data")}
                            </>
                        }
                        points={points}
                        onBoundaryChange={setBoundary}
                        onPointClick={handlePointClick}
                        showOrangeOnly={orangeOnly}
                    />
                </TabPanel>
            )}
            <Dialog open={displayUser.MpId !== undefined} onClose={() => setDisplayUser({})}>
                <DialogTitle>
                    {displayUser.userid === undefined ? (
                        <>{tr("truckersmp_player")}</>
                    ) : (
                        <>
                            {webConfig.name} {tr("driver")}
                        </>
                    )}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {tr("name")}
                            </Typography>
                            <Typography variant="body2">{displayUser.userid === undefined ? <>{displayUser.Name}</> : <UserCard user={displayUser} />}</Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                TruckersMP
                            </Typography>
                            <Typography variant="body2">
                                <a href={`https://truckersmp.com/user/${displayUser.MpId}`} target="_blank" rel="noreferrer">
                                    {displayUser.MpId}
                                </a>
                            </Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {tr("player_id")}
                            </Typography>
                            <Typography variant="body2">{displayUser.PlayerId}</Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                X
                            </Typography>
                            <Typography variant="body2">{displayUser.X}</Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Y
                            </Typography>
                            <Typography variant="body2">{displayUser.Y}</Typography>
                        </Grid>
                        <Grid size={4}>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                {tr("heading")}
                            </Typography>
                            <Typography variant="body2">{displayUser.Heading}</Typography>
                        </Grid>
                        {displayUser.Job !== undefined && (
                            <>
                                {displayUser.cargo === undefined && (
                                    <>
                                        <Grid size={4}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                {tr("status")}
                                            </Typography>
                                            <Typography variant="body2">{tr("free_roaming")}</Typography>
                                        </Grid>
                                    </>
                                )}
                                {displayUser.cargo !== undefined && (
                                    <>
                                        <Grid size={4}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                {tr("cargo")}
                                            </Typography>
                                            <Typography variant="body2">{displayUser.cargo}</Typography>
                                        </Grid>
                                        <Grid size={4}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                {tr("source")}
                                            </Typography>
                                            <Typography variant="body2">{displayUser.source}</Typography>
                                        </Grid>
                                        <Grid size={4}>
                                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                                {tr("destination")}
                                            </Typography>
                                            <Typography variant="body2">{displayUser.destination}</Typography>
                                        </Grid>
                                    </>
                                )}
                            </>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setDisplayUser({});
                        }}>
                        {tr("close")}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default Map;
