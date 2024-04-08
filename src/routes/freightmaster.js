import { useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppContext, CacheContext } from '../context';
import { useTranslation } from "react-i18next";

import { CardContent, Grid, Typography, ButtonGroup, Card, Button, Avatar } from "@mui/material";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

import UserCard from "../components/usercard";
import CustomTable from '../components/table';

import { getFormattedDate, makeRequestsWithAuth, TSep } from "../functions";

const D_LEVEL_POINT = 1000;
const A_LEVEL_POINT = 10000;

const FreightMaster = () => {
    const { t: tr } = useTranslation();
    const { webConfig, curUID, users, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const [seasonName, setSeasonName] = useState(cache.freightmaster.seasonName);
    const [startTime, setStartTime] = useState(cache.freightmaster.startTime);
    const [endTime, setEndTime] = useState(cache.freightmaster.endTime);
    // const [topRewards, setTopRewards] = useState(cache.freightmaster.topRewards);
    // const [rewards, setRewards] = useState(cache.freightmaster.rewards);

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

        const [position, lb] = await makeRequestsWithAuth([
            `https://config.chub.page/freightmaster/position?abbr=${webConfig.abbr}&uid=${curUID}`,
            `https://config.chub.page/freightmaster/${fMode}?abbr=${webConfig.abbr}&page=${page}&page_size=${pageSize}`
        ]);

        setSeasonName(position.season_name);
        setStartTime(getFormattedDate(userSettings.display_timezone, new Date(position.start_time * 1000)));
        setEndTime(getFormattedDate(userSettings.display_timezone, new Date(position.end_time * 1000)));
        setRankd(position.rankd ?? "Unranked");
        setPointd(TSep(position.pointd ?? 0));
        setRanka(position.ranka ?? "Unranked");
        setPointa(TSep(position.pointa ?? 0));

        if (pageRef.current === page) {
            let newlb = [];
            for (let i = 0; i < lb.list.length; i++) {
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
                    user: (lb.list[i].abbr === webConfig.abbr || fMode === "a") && users[lb.list[i].user.uid] ? <UserCard user={users[lb.list[i].user.uid]} /> : <>
                        <Avatar src={!userSettings.data_saver ? lb.list[i].user.avatar : ""}
                            style={{
                                width: `20px`,
                                height: `20px`,
                                verticalAlign: "middle",
                                display: "inline-flex"
                            }}
                        />
                        <span key={`user-${Math.random()}`} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginLeft: "2px" }}>{lb.list[i].user.name}</span>
                    </>,
                    points: TSep(lb.list[i].point), level: fMode === "d" ? parseInt(lb.list[i].point / D_LEVEL_POINT) + 1 : parseInt(lb.list[i].point / A_LEVEL_POINT + 1)
                });
            }
            setLeaderboard(newlb);
            setTotalItems(lb.total_items);
        }

        window.loading -= 1;
    }, [webConfig, userSettings, curUID, fMode, page, pageSize]);

    useEffect(() => {
        doLoad();
    }, [webConfig, userSettings, curUID, fMode, page, pageSize]);

    return <Grid container spacing={2}>
        <Grid item xs={12} md={6} lg={4}>
            <Typography variant="h5" fontWeight="bold">
                {seasonName}
            </Typography>
            <Typography variant="body2">
                {startTime} - {endTime}
            </Typography>
        </Grid>
        <Grid item xs={4} md={1} lg={4}></Grid>
        <Grid item xs={8} md={5} lg={4} sx={{ mt: { md: "10px" } }}>
            <ButtonGroup fullWidth>
                <Button variant="contained" color={fMode === "d" ? "info" : "secondary"} onClick={() => { setFMode("d"); setLeaderboard([]); setTotalItems(1); setPage(1); }}>Cross VTC</Button>
                <Button variant="contained" color={fMode === "a" ? "info" : "secondary"} onClick={() => { setFMode("a"); setLeaderboard([]); setTotalItems(1); setPage(1); }}>Single VTC</Button>
            </ButtonGroup>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" fontSize="30px">
                        Rank: {fMode === "d" ? rankd : ranka}
                    </Typography>
                    <Typography variant="body2" fontSize="25px">
                        Points: {fMode === "d" ? pointd : pointa}
                    </Typography>
                    <Typography variant="body2" fontSize="25px">
                        Level: {fMode === "d" ? parseInt(pointd / D_LEVEL_POINT + 1) : parseInt(pointa / A_LEVEL_POINT + 1)}
                    </Typography>
                </CardContent>
            </Card>
            <Card sx={{ mt: "10px" }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" fontSize="30px">
                        Season Rewards
                    </Typography>
                    <Typography variant="body2" fontSize="18px" color="textSecondary">
                        To be determined
                    </Typography>
                    {/* <Typography variant="body2" fontSize="16px" color="textSecondary">
                        When you finish the season at top x%, you get rewards for top finishers below and equal to x%.
                    </Typography>
                    <Typography variant="body2" fontSize="16px" color="textSecondary">
                        When you reach a level, you get the correspoding rewards for the level if exists.
                    </Typography>
                    {topRewards.map((reward) => <Typography variant="body2" fontSize="18px">
                        {reward.name} (Finishes top {reward.rank})
                    </Typography>)}
                    {rewards.map((reward) => <Typography variant="body2" fontSize="18px">
                        {reward.name} (Level {reward.level})
                    </Typography>)} */}
                </CardContent>
            </Card>
        </Grid>
        <Grid item xs={12} md={8}>
            {fMode === "d" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")} (Tracked Distance)</>} columns={[
                { id: 'rank', label: "Rank" },
                { id: 'vtc', label: "VTC" },
                { id: 'user', label: "User" },
                { id: 'points', label: "Points" },
                { id: 'level', label: "Level" }
            ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
            {fMode === "a" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")} (All Points)</>} columns={[
                { id: 'rank', label: "Rank" },
                { id: 'user', label: "User" },
                { id: 'points', label: "Points" },
                { id: 'level', label: "Level" }
            ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
        </Grid>
    </Grid>;
};

export default FreightMaster;