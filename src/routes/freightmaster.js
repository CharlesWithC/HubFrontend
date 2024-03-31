import { useContext, useState, useRef } from "react";
import { CacheContext } from '../context';
import { useTranslation } from "react-i18next";

import { CardContent, Grid, Typography, ButtonGroup, Card, Button } from "@mui/material";
import CustomTable from '../components/table';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

const FreightMaster = () => {
    const { t: tr } = useTranslation();
    const { cache, setCache } = useContext(CacheContext);

    const [seasonName, setSeasonName] = useState(cache.freightmaster.seasonName);
    const [startTime, setStartTime] = useState(cache.freightmaster.startTime);
    const [endTime, setEndTime] = useState(cache.freightmaster.endTime);
    // const [topRewards, setTopRewards] = useState(cache.freightmaster.topRewards);
    // const [rewards, setRewards] = useState(cache.freightmaster.rewards);

    const [rank, setRank] = useState(cache.freightmaster.rank);
    const [points, setPoints] = useState(cache.freightmaster.points);
    const [level, setLevel] = useState(cache.freightmaster.level);

    const [leaderboard, setLeaderboard] = useState([]);
    const [page, setPage] = useState(cache.freightmaster.page);
    const pageRef = useRef(cache.freightmaster.page);
    const [pageSize, setPageSize] = useState(cache.freightmaster.pageSize === null ? userSettings.default_row_per_page : cache.freightmaster.pageSize);
    const [totalItems, setTotalItems] = useState(cache.freightmaster.totalItems);

    const [fMode, setFMode] = useState("d");

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
                <Button variant="contained" color={fMode === "d" ? "info" : "secondary"} onClick={() => { setFMode("d"); }}>Cross VTC</Button>
                <Button variant="contained" color={fMode === "a" ? "info" : "secondary"} onClick={() => { setFMode("a"); }}>Single VTC</Button>
            </ButtonGroup>
        </Grid>
        <Grid item xs={12} md={4}>
            <Card>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" fontSize="35px">
                        Rank: {rank}
                    </Typography>
                    <Typography variant="body2" fontSize="25px">
                        Points: {points}
                    </Typography>
                    <Typography variant="body2" fontSize="25px">
                        Level: {level}
                    </Typography>
                </CardContent>
            </Card>
            <Card sx={{ mt: "10px" }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" fontSize="35px">
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
            {fMode === "d" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")}</>} columns={[
                { id: 'rank', label: "Rank" },
                { id: 'vtc', label: "VTC" },
                { id: 'user', label: "User" },
                { id: 'points', label: "Points" },
                { id: 'level', label: "Level" }
            ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
            {fMode === "a" && <CustomTable page={page} name={<><FontAwesomeIcon icon={faCrown} />&nbsp;&nbsp;{tr("leaderboard")}</>} columns={[
                { id: 'rank', label: "Rank" },
                { id: 'user', label: "User" },
                { id: 'points', label: "Points" },
                { id: 'level', label: "Level" }
            ]} data={leaderboard} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} />}
        </Grid>
    </Grid>;
};

export default FreightMaster;