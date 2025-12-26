import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppContext, CacheContext } from '../context';
import { useTranslation } from "react-i18next";

import { CardContent, Grid, Typography, ButtonGroup, Card, Button, Avatar } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

import UserCard from "../components/usercard";
import CustomTable from '../components/table';
import TimeDelta from "../components/timedelta";

import { makeRequestsWithAuth, TSep } from "../functions";

const D_LEVEL_POINT = 1000;
const A_LEVEL_POINT = 10000;

const FreightMaster = () => {
    const { t: tr } = useTranslation();
    const { fmRewards, webConfig, curUID, users, userSettings, memberUIDs } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const positionLoaded = useRef(false);
    const loadingBarPreserved = useRef(false);

    const [seasonName, setSeasonName] = useState(cache.freightmaster.seasonName);
    const [startTime, setStartTime] = useState(cache.freightmaster.startTime);
    const [endTime, setEndTime] = useState(cache.freightmaster.endTime);

    const [rankd, setRankd] = useState(cache.freightmaster.rankd);
    const [pointd, setPointd] = useState(cache.freightmaster.pointd);
    const [ranka, setRanka] = useState(cache.freightmaster.ranka);
    const [pointa, setPointa] = useState(cache.freightmaster.pointa);

    const [leaderboard, setLeaderboard] = useState([]);
    const [page, setPage] = useState(cache.freightmaster.page);
    const pageRef = useRef(cache.freightmaster.page);
    const [pageSize, setPageSize] = useState(cache.freightmaster.pageSize === null ? userSettings.default_row_per_page : cache.freightmaster.pageSize);
    const [totalItems, setTotalItems] = useState(cache.freightmaster.totalItems);
    useEffect(() => {
        pageRef.current = page;
    }, [page]);

    const [fMode, setFMode] = useState(cache.freightmaster.fMode);

    useEffect(() => {
        return () => {
            setCache(cache => ({ ...cache, freightmaster: { seasonName, startTime, endTime, rankd, pointd, ranka, pointa, page, pageSize, totalItems, fMode } }));
        };
    }, [seasonName, startTime, endTime, rankd, pointd, ranka, pointa, page, pageSize, totalItems, fMode]);

    const doLoad = useCallback(async () => {
        window.loading += 1;

        let [position, lb] = [null, null];
        if (!positionLoaded.current) {
            [position, lb] = await makeRequestsWithAuth([
                `https://config.chub.page/freightmaster/position?abbr=${webConfig.abbr}&uid=${curUID}`,
                `https://config.chub.page/freightmaster/${fMode}?abbr=${webConfig.abbr}&page=${page}&page_size=${pageSize}`
            ]);
            setSeasonName(position.season_name);
            setStartTime(<TimeDelta timestamp={position.start_time * 1000} rough={true} />);
            setEndTime(<TimeDelta timestamp={position.end_time * 1000} rough={true} />);
            setRankd(position.rankd ?? tr("unranked"));
            setPointd(position.pointd ?? 0);
            setRanka(position.ranka ?? tr("unranked"));
            setPointa(position.pointa ?? 0);
            positionLoaded.current = true;
        } else {
            [lb] = await makeRequestsWithAuth([
                `https://config.chub.page/freightmaster/${fMode}?abbr=${webConfig.abbr}&page=${page}&page_size=${pageSize}`
            ]);
        }

        if (memberUIDs.length === 0) {
            loadingBarPreserved.current = true;
            return; // preserve loading bar
        }

        if (loadingBarPreserved.current) {
            window.loading = 1;
            loadingBarPreserved.current = false; // reduce loading counter
        }

        if (pageRef.current === page && memberUIDs.length > 0) {
            let newlb = [];
            for (let i = 0; i < (lb.list ? lb.list.length : 0); i++) {
                newlb.push({
                    rank: lb.list[i].rank,
                    vtc: <>
                        <Avatar src={!userSettings.data_saver ? "https://cdn.chub.page/assets/" + lb.list[i].abbr + "/logo.png" : ""}
                            style={{
                                width: `20px`,
                                height: `20px`,
                                verticalAlign: "middle",
                                display: "inline-flex"
                            }}
                        />
                        <span key={`user-${Math.random()}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginLeft: "2px" }}>{lb.list[i].vtc}</span>
                    </>,
                    user: <UserCard user={(!lb.list[i].abbr || lb.list[i].abbr === webConfig.abbr) && users[lb.list[i].user.uid] !== undefined ? users[lb.list[i].user.uid] : { ...lb.list[i].user, uid: `${lb.list[i].abbr}-${lb.list[i].user.uid}`, userid: `${lb.list[i].abbr}-${lb.list[i].user.userid}` }} />,
                    points: TSep(lb.list[i].point), level: fMode === "d" ? parseInt(lb.list[i].point / D_LEVEL_POINT) + 1 : parseInt(lb.list[i].point / A_LEVEL_POINT + 1)
                });
            }
            setLeaderboard(newlb);
            setTotalItems(lb.total_items);
        }

        window.loading -= 1;
    }, [webConfig, userSettings, curUID, fMode, page, pageSize, memberUIDs]);

    useEffect(() => {
        doLoad();
    }, [webConfig, userSettings, curUID, fMode, page, pageSize, memberUIDs]);

    return (
        <Grid container spacing={2}>
            <Grid
                size={{
                    xs: 12,
                    md: 6,
                    lg: 4
                }}>
                <Typography variant="h5" fontWeight="bold">
                    {seasonName}
                </Typography>
                <Typography variant="body2">
                    {startTime} - {endTime}
                </Typography>
            </Grid>
            <Grid
                size={{
                    xs: 4,
                    md: 1,
                    lg: 4
                }}></Grid>
            <Grid
                sx={{ mt: { md: "10px" } }}
                size={{
                    xs: 8,
                    md: 5,
                    lg: 4
                }}>
                <ButtonGroup fullWidth>
                    <Button variant="contained" color={fMode === "d" ? "info" : "secondary"} onClick={() => { setFMode("d"); setLeaderboard([]); setTotalItems(1); setPage(1); }}>{tr("cross_vtc")}</Button>
                    <Button variant="contained" color={fMode === "a" ? "info" : "secondary"} onClick={() => { setFMode("a"); setLeaderboard([]); setTotalItems(1); setPage(1); }}>{tr("single_vtc")}</Button>
                </ButtonGroup>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" fontSize="30px">{tr("rank")} {fMode === "d" ? rankd : ranka}
                        </Typography>
                        <Typography variant="body2" fontSize="25px">{tr("points")} {TSep(fMode === "d" ? pointd : pointa)}
                        </Typography>
                        <Typography variant="body2" fontSize="25px">{tr("level")} {fMode === "d" ? parseInt(pointd / D_LEVEL_POINT + 1) : parseInt(pointa / A_LEVEL_POINT + 1)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ mt: "10px" }}>
                    <CardContent>
                        <Typography variant="h5" fontWeight="bold" fontSize="30px">{tr("season_rewards")}</Typography>
                        <Typography variant="body2" fontSize="15px" color="grey" sx={{ mb: "5px" }}>{tr("only_applies_to_crossvtc_ranking")}</Typography>
                        <Typography variant="body2" fontWeight="bold" fontSize="15px">{tr("player_title")}</Typography>
                        {fmRewards.filter((reward) => reward.reward_type === "title" && reward.active).map((reward) =>
                            <Typography variant="body2" fontSize="15px">
                                {reward.reward_value}
                                {reward.qualify_type === "percentage" && <> ({reward.finisher_reward ? `Finishes` : `Been`} {reward.qualify_value.substring(0, 2) == "==" ? "at" : "top"} {parseFloat(reward.qualify_value.substring(2)) * 100}%)</>}
                                {reward.qualify_type === "rank" && <> ({reward.finisher_reward ? `Finishes` : `Been`} {reward.qualify_value.substring(0, 2) == "==" ? "at" : "top"} {reward.qualify_value.substring(2)})</>}
                                {/* we only care about == and <= */}
                            </Typography>)}
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 12,
                    md: 8
                }}>
                {fMode === "d" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")}{tr("tracked_distance")}</>} columns={[
                    { id: 'rank', label: tr("rank") },
                    { id: 'vtc', label: tr("vtc") },
                    { id: 'user', label: tr("user") },
                    { id: 'points', label: tr("points") },
                    { id: 'level', label: tr("level") }
                ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
                {fMode === "a" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")}{tr("all_points")}</>} columns={[
                    { id: 'rank', label: tr("rank") },
                    { id: 'user', label: tr("user") },
                    { id: 'points', label: tr("points") },
                    { id: 'level', label: tr("level") }
                ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
            </Grid>
        </Grid>
    );
};

export default FreightMaster;