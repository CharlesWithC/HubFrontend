import React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Snackbar, Alert, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction, LinearProgress, Chip } from '@mui/material';
import { LocalShippingRounded, EmojiEventsRounded, EditRounded, DeleteRounded, CategoryRounded, InfoRounded, TaskAltRounded, DoneOutlineRounded, BlockRounded, PlayCircleRounded, ScheduleRounded, HourglassBottomRounded, StopCircleRounded } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';
import CustomTable from '../components/table';
import { makeRequestsWithAuth, makeRequests, getFormattedDate, customAxios as axios, checkPerm, checkUserPerm, checkUserRole, getAuthToken } from '../functions';

var vars = require("../variables");

const CHALLENGE_TYPES = ["", "Personal (One-time)", "Company (One-time)", "Personal (Recurring)", "Personal (Distance-based)", "Company (Distance-based)"];

const columns = [
    { id: 'challengeid', label: 'ID' },
    { id: 'title', label: 'Title' },
    { id: 'metaType', label: 'Type' },
    { id: 'reward_points', label: 'Reward' },
    { id: 'metaProgress', label: 'Progress' },
    { id: 'metaStatus', label: 'Status' },
];

function ParseChallenges(challenges, theme) {
    for (let i = 0; i < challenges.length; i++) {
        let challenge = challenges[i];
        const re = challenge.description.match(/^\[Image src="(.+)"\]/);
        if (re !== null) {
            const link = re[1];
            challenges[i].image = link;
        }
        challenges[i].metaType = CHALLENGE_TYPES[challenges[i].type];
        challenges[i].metaProgress = <LinearProgress variant="determinate" color="success" value={Math.min(parseInt(challenges[i].current_delivery_count / challenges[i].delivery_count * 100) + 1, 100)} sx={{ width: "100%" }} />;

        let qualified = checkUserRole(challenge.required_roles) && challenge.required_distance <= vars.userStats.distance.all.sum.tot;
        let completed = parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count);
        let statusIcon = challenge.start_time * 1000 <= Date.now() && challenge.end_time * 1000 >= Date.now()
            ? <PlayCircleRounded sx={{ color: theme.palette.success.main }} />
            : challenge.start_time * 1000 > Date.now()
                ? challenge.start_time * 1000 > Date.now() + 86400 ? <ScheduleRounded sx={{ color: theme.palette.info.main }} /> :
                    <HourglassBottomRounded sx={{ color: theme.palette.info.main }} />
                : <StopCircleRounded sx={{ color: theme.palette.error.main }} />;
        challenges[i].metaStatus = <>{statusIcon}&nbsp;
            {qualified && <>
                <DoneOutlineRounded sx={{ color: theme.palette.success.main }} />&nbsp;
            </>}
            {!qualified && <>
                <BlockRounded sx={{ color: theme.palette.error.main }} />&nbsp;
            </>}
            {completed && <>
                <TaskAltRounded sx={{ color: theme.palette.warning.main }} />&nbsp;
            </>}</>;
    }
    return challenges;
}

const ChallengeCard = ({ challenge, upcoming, onShowDetails, onUpdateDelivery, onEdit, onDelete }) => {
    const showControls = onEdit !== null && (vars.isLoggedIn && checkUserPerm(["admin", "challenge"]));
    const showButtons = onEdit !== null && (vars.isLoggedIn);

    const handleShowDetails = useCallback(() => {
        onShowDetails(challenge);
    }, [challenge, onShowDetails]);

    const handleUpdateDelivery = useCallback(() => {
        onUpdateDelivery(challenge);
    }, [challenge, onUpdateDelivery]);

    const handleEdit = useCallback(() => {
        onEdit(challenge);
    }, [challenge, onEdit]);

    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (challenge) => {
            if (challenge.keyCode === 16) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (challenge) => {
            if (challenge.keyCode === 16) {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleDelete = useCallback(() => {
        onDelete(challenge, isShiftPressed);
    }, [challenge, onDelete, isShiftPressed]);

    let description = challenge.description.replace(`[Image src="${challenge.image}"]`, "").trimStart();

    return (
        <Card>
            <CardMedia component="img" src={challenge.image} alt=" " />
            {upcoming !== true && <>{challenge.metaProgress}</>}
            <CardContent>
                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                    <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {challenge.metaStatus}
                            {challenge.title}
                        </div>
                    </Typography>
                    {showButtons && <>
                        <IconButton size="small" aria-label="Details" onClick={handleShowDetails}><InfoRounded /></IconButton >
                        {showControls && <>
                            <IconButton size="small" aria-label="Update Deliveries" onClick={handleUpdateDelivery}><LocalShippingRounded /></IconButton >
                            <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                            <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                        </>}
                    </>}
                </div>
                <Grid container>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CategoryRounded />&nbsp;&nbsp;{CHALLENGE_TYPES[challenge.type]}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmojiEventsRounded />&nbsp;&nbsp;{challenge.reward_points}
                        </Typography>
                    </Grid>
                </Grid>
                <Typography variant="body2" sx={{ marginTop: "20px" }}>
                    <MarkdownRenderer>{description}</MarkdownRenderer>
                </Typography>
            </CardContent>
        </Card >
    );
};

const ChallengesMemo = memo(({ challengeList, setChallengeList, upcomingChallenges, setUpcomingChallenges, activeChallenges, setActiveChallenges, onShowDetails, onUpdateDelivery, onEdit, onDelete, doReload }) => {
    const [page, setPage] = useState(-1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const theme = useTheme();

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let myPage = page;
            if (myPage === -1) {
                myPage = 1;
            } else {
                myPage += 1;
            }

            if (page === -1 || +new Date() - doReload <= 1000) {
                let urls = [
                    `${vars.dhpath}/challenges/list?page_size=2&page=1&start_after=${parseInt(+new Date() / 1000)}`,
                    `${vars.dhpath}/challenges/list?page_size=250&page=1&start_before=${parseInt(+new Date() / 1000)}&end_after=${parseInt(+new Date() / 1000)}`,
                    `${vars.dhpath}/challenges/list?page_size=${pageSize}&page=${myPage}&order_by=end_time&order=desc`,
                ];
                let [_upcomingChallenges, _activeChallenges, _challengeList] = await makeRequestsWithAuth(urls);
                setUpcomingChallenges(ParseChallenges(_upcomingChallenges.list, theme));
                setActiveChallenges(ParseChallenges(_activeChallenges.list, theme));
                setChallengeList(ParseChallenges(_challengeList.list, theme));
                setTotalItems(_challengeList.total_items);
            } else {
                let urls = [
                    `${vars.dhpath}/challenges/list?page_size=${pageSize}&page=${myPage}&order_by=end_time&order=desc`,
                ];
                let [_challengeList] = await makeRequestsWithAuth(urls);
                setChallengeList(ParseChallenges(_challengeList.list, theme));
                setTotalItems(_challengeList.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [doReload, setUpcomingChallenges, setActiveChallenges, pageSize, page, setChallengeList, theme]);

    return <>
        <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
            {upcomingChallenges.length !== 0 && <>
                <Grid item xs={upcomingChallenges.length === 2 ? 6 : 12}>
                    <ChallengeCard challenge={upcomingChallenges[0]} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} upcoming={true} />
                </Grid>
                {upcomingChallenges.length === 2 && <Grid item xs={6}>
                    <ChallengeCard challenge={upcomingChallenges[1]} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} upcoming={true} />
                </Grid>}
            </>}
            {activeChallenges.map((challenge, index) => <Grid item xs={activeChallenges.length % 2 === 1 && index === activeChallenges.length - 1 ? 12 : 6}>
                <ChallengeCard challenge={challenge} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} />
            </Grid>)}
        </Grid>
        {challengeList.length !== 0 && <CustomTable columns={columns} data={challengeList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={onShowDetails} />}
    </>;
});

const Challenges = () => {
    const [challengeList, setChallengeList] = useState([]);
    const [upcomingChallenges, setUpcomingChallenges] = useState([]);
    const [activeChallenges, setActiveChallenges] = useState([]);
    const [doReload, setDoReload] = useState(0);

    return <ChallengesMemo challengeList={challengeList} setChallengeList={setChallengeList} upcomingChallenges={upcomingChallenges} setUpcomingChallenges={setUpcomingChallenges} activeChallenges={activeChallenges} setActiveChallenges={setActiveChallenges} doReload={doReload} />;
};

export default Challenges;