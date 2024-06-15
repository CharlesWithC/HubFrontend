import { useRef, useState, useEffect, useCallback, useContext, useMemo, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext, CacheContext } from '../context';

import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Snackbar, Alert, FormControl, FormControlLabel, FormLabel, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction, LinearProgress, MenuItem, RadioGroup, Radio, Chip, Checkbox, Tooltip, Collapse, useTheme } from '@mui/material';
import { LocalShippingRounded, EmojiEventsRounded, EditRounded, DeleteRounded, CategoryRounded, InfoRounded, TaskAltRounded, DoneOutlineRounded, BlockRounded, PlayCircleRounded, ScheduleRounded, HourglassBottomRounded, StopCircleRounded, EditNoteRounded, PeopleAltRounded, RefreshRounded, ExpandMoreRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';
import { customSelectStyles } from '../designs';

import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

import DateTimeField from '../components/datetime';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import CustomTable from '../components/table';
import ListModal from '../components/listmodal';
import RoleSelect from '../components/roleselect';
import TimeDelta from '../components/timedelta';

import { makeRequestsWithAuth, customAxios as axios, checkPerm, checkUserPerm, checkUserRole, getAuthToken, ConvertUnit, removeNUEValues } from '../functions';

const DEFAULT_JOB_REQUIREMENTS = { game: "", market: "", source_city_id: "", source_company_id: "", destination_city_id: "", destination_company_id: "", minimum_distance: "-1", maximum_distance: "-1", maximum_detour_percentage: "-1", minimum_detour_percentage: "-1", minimum_seconds_spent: "-1", maximum_seconds_spent: "-1", truck_id: "", truck_plate_country_id: "", minimum_truck_wheel: "-1", maximum_truck_wheel: "-1", minimum_fuel: "-1", maximum_fuel: "-1", minimum_average_fuel: "-1", maximum_average_fuel: "-1", minimum_adblue: "-1", maximum_adblue: "-1", minimum_average_speed: "-1", maximum_average_speed: "-1", maximum_speed: "-1", cargo_id: "", minimum_cargo_mass: "-1", maximum_cargo_mass: "-1", minimum_cargo_damage: "-1", maximum_cargo_damage: "-1", minimum_profit: "-1", maximum_profit: "-1", minimum_offence: "-1", maximum_offence: "-1", minimum_xp: "-1", maximum_xp: "-1", minimum_train: "-1", maximum_train: "-1", minimum_ferry: "-1", maximum_ferry: "-1", minimum_teleport: "-1", maximum_teleport: "-1", minimum_tollgate: "-1", maximum_tollgate: "-1", minimum_toll_paid: "-1", maximum_toll_paid: "-1", minimum_collision: "-1", maximum_collision: "-1", allow_overspeed: "1", allow_auto_park: "1", allow_auto_load: "1", must_not_be_late: "0", must_be_special: "0", minimum_warp: "-1", maximum_warp: "-1", enabled_realistic_settings: "" };

const jobReqGroups = { "job": ["game", "market", "source_city_id", "source_company_id", "destination_city_id", "destination_company_id", "minimum_distance", "maximum_distance", "maximum_detour_percentage", "minimum_detour_percentage", "minimum_seconds_spent", "maximum_seconds_spent", "minimum_xp", "maximum_xp", "minimum_profit", "maximum_profit", "minimum_offence", "maximum_offence"], "truck": ["truck_id", "truck_plate_country_id", "minimum_truck_wheel", "maximum_truck_wheel", "minimum_fuel", "maximum_fuel", "minimum_average_fuel", "maximum_average_fuel", "minimum_adblue", "maximum_adblue", "minimum_average_speed", "maximum_average_speed", "maximum_speed"], "cargo": ["cargo_id", "minimum_cargo_mass", "maximum_cargo_mass", "minimum_cargo_damage", "maximum_cargo_damage"], "route": ["minimum_train", "maximum_train", "minimum_ferry", "maximum_ferry", "minimum_teleport", "maximum_teleport", "minimum_tollgate", "maximum_tollgate", "minimum_toll_paid", "maximum_toll_paid", "minimum_collision", "maximum_collision"], "misc": ["minimum_warp", "maximum_warp", "enabled_realistic_settings", "allow_overspeed", "allow_auto_park", "allow_auto_load", "must_not_be_late", "must_be_special"] };

const TRUCKY_REALISTIC_SETTINGS = ["police", "detours", "fatigue", "detected", "road_events", "fuel_simulation", "hud_speed_limit", "traffic_enabled", "bad_weather_factor", "parking_difficulty", "hardcore_simulation", "simple_parking_doubles", "trailer_advanced_coupling"];

function replaceUnderscores(str) {
    return str.split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

const ControlButtons = memo(({ challenge, onUpdateDelivery, onEdit, onDelete }) => {
    const { t: tr } = useTranslation();

    const handleUpdateDelivery = useCallback((e) => {
        e.stopPropagation();
        onUpdateDelivery(challenge);
    }, [challenge, onUpdateDelivery]);

    const handleEdit = useCallback((e) => {
        e.stopPropagation();
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

    const handleDelete = useCallback((e) => {
        e.stopPropagation();
        onDelete(challenge, isShiftPressed);
    }, [challenge, onDelete, isShiftPressed]);

    return <>
        <IconButton size="small" aria-label={tr("update_deliveries")} onClick={handleUpdateDelivery}><LocalShippingRounded /></IconButton >
        <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
        <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
    </>;
});

const ParseChallenges = (curUser, userDrivenDistance, CHALLENGE_TYPES, tr, challenges, theme, onUpdateDelivery, onEdit, onDelete) => {
    for (let i = 0; i < challenges.length; i++) {
        let challenge = challenges[i];
        const re = challenge.description.match(/^\[Image src="(.+)"\]/);
        if (re !== null) {
            const link = re[1];
            challenges[i].image = link;
        }
        challenges[i].metaType = CHALLENGE_TYPES[challenges[i].type];
        challenges[i].metaProgress = <LinearProgress variant="determinate" color="success" value={Math.min(parseInt(challenges[i].current_delivery_count / challenges[i].delivery_count * 100) + 1, 100)} sx={{ width: "100%" }} />;

        let qualified = checkUserRole(curUser, challenge.required_roles) && challenge.required_distance <= userDrivenDistance;
        let completed = parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count);
        let statusIcon = challenge.start_time * 1000 <= Date.now() && challenge.end_time * 1000 >= Date.now()
            ? <Tooltip key={`ongoing-status`} placement="top" arrow title={tr("ongoing")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <PlayCircleRounded sx={{ color: theme.palette.success.main }} />
            </Tooltip>
            : challenge.start_time * 1000 > Date.now()
                ? challenge.start_time * 1000 > Date.now() + 86400 ? <Tooltip key={`upcoming-status`} placement="top" arrow title={tr("upcoming")}
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <ScheduleRounded sx={{ color: theme.palette.info.main }} />
                </Tooltip> :
                    <Tooltip key={`upcoming-status`} placement="top" arrow title={tr("upcoming")}
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <HourglassBottomRounded sx={{ color: theme.palette.info.main }} />
                    </Tooltip>
                : <Tooltip key={`ended-status`} placement="top" arrow title={tr("ended")}
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <StopCircleRounded sx={{ color: theme.palette.error.main }} />
                </Tooltip>;
        challenges[i].metaStatus = <>{statusIcon}&nbsp;
            {userDrivenDistance !== -1 && qualified && <Tooltip key={`qualified-status`} placement="top" arrow title={tr("qualified")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <DoneOutlineRounded sx={{ color: theme.palette.success.main }} />
            </Tooltip>}&nbsp;
            {userDrivenDistance !== -1 && !qualified && <Tooltip key={`not-qualified-status`} placement="top" arrow title={tr("not_qualified")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <BlockRounded sx={{ color: theme.palette.error.main }} />
            </Tooltip>}&nbsp;
            {completed && <Tooltip key={`completed-status`} placement="top" arrow title={tr("completed")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <TaskAltRounded sx={{ color: theme.palette.warning.main }} />
            </Tooltip>}&nbsp;</>;

        challenges[i].metaControls = <ControlButtons challenge={challenges[i]} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} />;
    }
    return challenges;
};

const ChallengeCard = memo(({ challenge, upcoming, onShowDetails, onUpdateDelivery, onEdit, onDelete }) => {
    if (challenge.description === undefined) { return <></>; }

    const { t: tr } = useTranslation();
    const { curUID, curUserPerm } = useContext(AppContext);

    const CHALLENGE_TYPES = ["", tr("personal_onetime"), tr("company_onetime"), tr("personal_recurring"), tr("personal_distancebased"), tr("company_distancebased")];

    const showControls = onEdit !== undefined && (curUID !== null && checkUserPerm(curUserPerm, ["administrator", "manage_challenges"]));
    const showButtons = onEdit !== undefined && (curUID !== null);

    const handleShowDetails = useCallback(() => {
        onShowDetails(challenge);
    }, [challenge, onShowDetails]);

    let description = challenge.description.replace(`[Image src="${challenge.image}"]`, "").trimStart();

    return (
        <Card>
            <CardMedia component="img" src={challenge.image} alt="" />
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
                        <IconButton size="small" aria-label={tr("details")} onClick={handleShowDetails}><InfoRounded /></IconButton >
                        {showControls && <ControlButtons challenge={challenge} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} />}
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
});

const ChallengeManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = useMemo(() => (memberUIDs.map((uid) => users[uid])), [memberUIDs, users]);
    const managers = useMemo(() => {
        const result = [];
        for (let i = 0; i < allMembers.length; i++) {
            if (checkPerm(allMembers[i].roles, ["administrator", "manage_challenges"], allPerms)) {
                result.push(allMembers[i]);
            }
        }
        return result;
    }, [allMembers]);

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const ChallengesMemo = memo(({ userDrivenDistance, challengeList, setChallengeList, upcomingChallenges, setUpcomingChallenges, activeChallenges, setActiveChallenges, onShowDetails, onUpdateDelivery, onEdit, onDelete, doReload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, curUserPerm, userSettings } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);

    const CHALLENGE_TYPES = useMemo(() => (["", tr("personal_onetime"), tr("company_onetime"), tr("personal_recurring"), tr("personal_distancebased"), tr("company_distancebased")]), []);

    const columns = useMemo(() => ([
        { id: 'challengeid', label: 'ID', orderKey: 'challengeid', defaultOrder: 'desc' },
        { id: 'title', label: tr("title"), orderKey: 'title', defaultOrder: 'asc' },
        { id: 'metaType', label: tr("type") },
        { id: 'reward_points', label: tr("reward"), orderKey: 'reward', defaultOrder: 'desc' },
        { id: 'metaProgress', label: tr("progress"), orderKey: 'delivery_count', defaultOrder: 'asc' },
        { id: 'metaStatus', label: tr("status") },
    ]), []);
    const staffColumns = useMemo(() => ([
        { id: 'challengeid', label: 'ID', orderKey: 'challengeid', defaultOrder: 'desc' },
        { id: 'title', label: tr("title"), orderKey: 'title', defaultOrder: 'asc' },
        { id: 'metaType', label: tr("type") },
        { id: 'reward_points', label: tr("reward"), orderKey: 'reward', defaultOrder: 'desc' },
        { id: 'metaProgress', label: tr("progress"), orderKey: 'delivery_count', defaultOrder: 'asc' },
        { id: 'metaStatus', label: tr("status") },
        { id: 'metaControls', label: tr("operations") },
    ]), []);

    const inited = useRef(false);

    const [page, setPage] = useState(cache.challenge.page);
    const pageRef = useRef(cache.challenge.page);
    const [pageSize, setPageSize] = useState(cache.challenge.pageSize === null ? userSettings.default_row_per_page : cache.challenge.pageSize);
    const [totalItems, setTotalItems] = useState(cache.challenge.totalItems);
    const [listParam, setListParam] = useState(cache.challenge.listParam);

    const [rawUpcomingChallenges, setRawUpcomingChallenges] = useState(cache.challenge.rawUpcomingChallenges);
    const [rawActiveChallenges, setRawActiveChallenges] = useState(cache.challenge.rawActiveChallenges);
    const [rawChallengeList, setRawChallengeList] = useState(cache.challenge.rawChallengeList);

    useEffect(() => {
        return () => {
            // Challenge may overwrite the data so we need to use the latest data
            setCache(cache => ({ ...cache, challenge: { ...cache.challenge, page, pageSize, totalItems, listParam, rawUpcomingChallenges, rawActiveChallenges, rawChallengeList } }));
        };
    }, [page, pageSize, totalItems, listParam, rawUpcomingChallenges, rawActiveChallenges, rawChallengeList]);

    const theme = useTheme();

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let processedParam = removeNUEValues(listParam);

            let [_upcomingChallenges, _activeChallenges, _challengeList] = [{}, {}, {}];
            if (!inited.current || +new Date() - doReload <= 1000) {
                let urls = [
                    `${apiPath}/challenges/list?page_size=2&page=1&start_after=${parseInt(+new Date() / 1000)}`,
                    `${apiPath}/challenges/list?page_size=250&page=1&start_before=${parseInt(+new Date() / 1000)}&end_after=${parseInt(+new Date() / 1000)}`,
                    `${apiPath}/challenges/list?page_size=${pageSize}&page=${page}&${new URLSearchParams(processedParam).toString()}`,
                ];
                [_upcomingChallenges, _activeChallenges, _challengeList] = await makeRequestsWithAuth(urls);
                setRawUpcomingChallenges(_upcomingChallenges.list);
                setRawActiveChallenges(_activeChallenges.list);
                inited.current = true;
            } else {
                let urls = [
                    `${apiPath}/challenges/list?page_size=${pageSize}&page=${page}&${new URLSearchParams(processedParam).toString()}`,
                ];
                [_challengeList] = await makeRequestsWithAuth(urls);
            }

            if (pageRef.current === page) {
                setRawChallengeList(_challengeList.list);
                setTotalItems(_challengeList.total_items);
            }

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, doReload, pageSize, page, theme, listParam]);

    useEffect(() => {
        setUpcomingChallenges(ParseChallenges(curUser, userDrivenDistance, CHALLENGE_TYPES, tr, rawUpcomingChallenges, theme, onUpdateDelivery, onEdit, onDelete));
        setActiveChallenges(ParseChallenges(curUser, userDrivenDistance, CHALLENGE_TYPES, tr, rawActiveChallenges, theme, onUpdateDelivery, onEdit, onDelete));
        setChallengeList(ParseChallenges(curUser, userDrivenDistance, CHALLENGE_TYPES, tr, rawChallengeList, theme, onUpdateDelivery, onEdit, onDelete));
    }, [rawUpcomingChallenges, rawActiveChallenges, rawChallengeList, theme]);

    return <>
        <Grid container spacing={2} sx={{ marginBottom: "15px" }}>
            {upcomingChallenges.length !== 0 && <>
                <Grid item xs={upcomingChallenges.length === 2 ? 6 : 12} key={`challenge-${upcomingChallenges[0].challengeid}`}>
                    <ChallengeCard challenge={upcomingChallenges[0]} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} upcoming={true} />
                </Grid>
                {upcomingChallenges.length === 2 && <Grid item xs={6} key={`challenge-${upcomingChallenges[1].challengeid}`}>
                    <ChallengeCard challenge={upcomingChallenges[1]} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} upcoming={true} />
                </Grid>}
            </>}
            {activeChallenges.map((challenge, index) => <Grid item xs={activeChallenges.length % 2 === 1 && index === activeChallenges.length - 1 ? 12 : 6} key={`challenge-${index}`}>
                <ChallengeCard challenge={challenge} onShowDetails={onShowDetails} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} />
            </Grid>)}
        </Grid>
        {challengeList.length !== 0 && <CustomTable page={page} columns={checkUserPerm(curUserPerm, ["administrator", "manage_challenges"]) ? staffColumns : columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={challengeList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={onShowDetails} pstyle={{ marginRight: "60px" }} />}
    </>;
});

const Challenges = () => {
    const { t: tr } = useTranslation();
    const { apiPath, allRoles, curUser, curUserPerm, userSettings, dlogDetailsCache } = useContext(AppContext);
    const { cache, setCache } = useContext(CacheContext);
    const theme = useTheme();

    const CHALLENGE_TYPES = ["", tr("personal_onetime"), tr("company_onetime"), tr("personal_recurring"), tr("personal_distancebased"), tr("company_distancebased")];

    const [challengeList, setChallengeList] = useState(cache.challenge.challengeList);
    const [upcomingChallenges, setUpcomingChallenges] = useState(cache.challenge.upcomingChallenges);
    const [activeChallenges, setActiveChallenges] = useState(cache.challenge.activeChallenges);
    const [doReload, setDoReload] = useState(0);

    useEffect(() => {
        return () => {
            // ChallengeMemo may overwrite the data so we need to use the latest data
            setCache(cache => ({ ...cache, challenge: { ...cache.challenge, challengeList, upcomingChallenges, activeChallenges } }));
        };
    }, [challengeList, upcomingChallenges, activeChallenges]);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState(tr("create_challenge"));
    const [dialogButton, setDialogButton] = useState(tr("create"));
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);
    const [modalChallenge, setModalChallenge] = useState({ title: "", description: "", start_time: undefined, end_time: undefined, type: 1, delivery_count: 1, required_roles: [], required_distance: 0, reward_points: 750, public_details: false, orderid: 0, is_pinned: false, job_requirements: DEFAULT_JOB_REQUIREMENTS });
    const [expandedGroups, setExpandedGroups] = useState([]);

    const [modalUpdateDlogOpen, setModalUpdateDlogOpen] = useState(false);
    const [updateDlogChallenge, setUpdateDlogChallenge] = useState({});
    const [dlogID, setDlogID] = useState("");

    const [editId, setEditId] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [listModalOpen, setListModalOpen] = useState(false);
    const handleCloseDetail = useCallback(() => {
        setListModalItems([]);
        setListModalOpen(false);
    }, []);
    const [listModalChallenge, setListModalChallenge] = useState({});
    const [listModalItems, setListModalItems] = useState([]);

    const [userDrivenDistance, setUserDrivenDistance] = useState(-1);
    useEffect(() => {
        async function loadDrivenDistance() {
            const [resp] = await makeRequestsWithAuth([`${apiPath}/dlog/statistics/summary?userid=${curUser.userid}`]);
            setUserDrivenDistance(resp.distance.all.sum.tot);
        }
        loadDrivenDistance();
    }, [apiPath, curUser]);

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

    const cargoMarkets = useMemo(() => {
        let result = {};
        if (dlogDetailsCache.cargo_market !== undefined) {
            for (let i = 0; i < dlogDetailsCache["cargo_market"].length; i++) {
                if (dlogDetailsCache["cargo_market"][i]["unique_id"] === "") continue;
                result[dlogDetailsCache["cargo_market"][i]["unique_id"]] = replaceUnderscores(dlogDetailsCache["cargo_market"][i]["name"]);
            }
        }
        return result;
    }, [dlogDetailsCache]);

    const truckIDs = useMemo(() => {
        let ids = {};
        if (dlogDetailsCache.truck !== undefined) {
            for (let i = 0; i < dlogDetailsCache["truck"].length; i++) {
                ids[dlogDetailsCache["truck"][i]["unique_id"]] = dlogDetailsCache["truck"][i]["name"];
            }
        }
        return ids;
    }, [dlogDetailsCache]);

    const countryIDs = useMemo(() => {
        let ids = {};
        if (dlogDetailsCache.plate_country !== undefined) {
            for (let i = 0; i < dlogDetailsCache["plate_country"].length; i++) {
                ids[dlogDetailsCache["plate_country"][i]["unique_id"]] = dlogDetailsCache["plate_country"][i]["name"];
            }
        }
        return ids;
    }, [dlogDetailsCache]);

    const showChallengeDetails = useCallback(async (challenge) => {
        window.loading += 1;

        [challenge] = await makeRequestsWithAuth([`${apiPath}/challenges/${challenge.challengeid}`]);

        setListModalChallenge(challenge);

        let progress = <LinearProgress variant="determinate" color="success" value={Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100) + 1, 100)} sx={{ width: "100%" }} />;

        let qualified = checkUserRole(curUser, challenge.required_roles) && challenge.required_distance <= userDrivenDistance;
        let qualifiedStatus = userDrivenDistance !== -1 ? <>
            {qualified && <>
                <Chip color="success" sx={{ borderRadius: "5px" }} label={tr("qualified")}></Chip>&nbsp;
            </>}
            {!qualified && <>
                <Chip color="secondary" sx={{ borderRadius: "5px" }} label={tr("not_qualified")}></Chip>&nbsp;
            </>}</> : <></>;
        let completed = parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count);
        let statusIcon = challenge.start_time * 1000 <= Date.now() && challenge.end_time * 1000 >= Date.now()
            ? <Chip color="success" sx={{ borderRadius: "5px" }} label={tr("ongoing")}></Chip>
            : challenge.start_time * 1000 > Date.now()
                ? <Chip color="info" sx={{ borderRadius: "5px" }} label={tr("upcoming")}></Chip>
                : <Chip color="error" sx={{ borderRadius: "5px" }} label={tr("ended")}></Chip>;
        let status = <>{statusIcon}&nbsp;
            {completed && <>
                <Chip color="warning" sx={{ borderRadius: "5px" }} label={tr("completed")}></Chip>&nbsp;
            </>}</>;

        let required_roles = challenge.required_roles.map((role) => {
            return allRoles[role].name + ` (${role})  `;
        });

        let completed_users = "";
        for (let i = 0; i < challenge.record.length; i++) {
            let extrainfo = `${challenge.record[i].job_count} Jobs / ${ConvertUnit(userSettings.unit, "km", challenge.record[i].job_distance)}`;
            if (challenge.record[i].is_completed) extrainfo += ` / ${challenge.record[i].points} Pts`;
            completed_users = <>{completed_users} <UserCard user={challenge.record[i].user} inline={true} /> <Chip color="secondary" size="small" label={extrainfo}></Chip><br /></>;
        }

        const lmi = [
            { "name": tr("type"), "value": CHALLENGE_TYPES[challenge.type] },
            { "name": tr("reward_points"), "key": "reward_points" },
            { "name": tr("start_time"), "value": <TimeDelta timestamp={challenge.start_time * 1000} /> },
            { "name": tr("end_time"), "value": <TimeDelta timestamp={challenge.end_time * 1000} /> },
            { "name": tr("status"), "value": status },
            {},
            { "name": tr("deliveries"), "key": "delivery_count" },
            { "name": tr("current_deliveries"), "key": "current_delivery_count" },
            { "name": tr("progress"), "value": progress },
            {},
            { "name": tr("required_roles"), "value": required_roles },
            { "name": tr("required_distance_driven"), "value": ConvertUnit(userSettings.unit, "km", challenge.required_distance) },
            { "name": tr("qualification"), "value": qualifiedStatus },
            {},
            { "name": tr("completed_members"), "value": completed_users }];
        setListModalItems(lmi);
        setListModalOpen(true);

        window.loading -= 1;
    }, [apiPath]);

    const updateDlog = useCallback((challenge) => {
        setUpdateDlogChallenge(challenge);
        setModalUpdateDlogOpen(true);
    }, []);
    const addDlog = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/challenges/${updateDlogChallenge.challengeid}/delivery/${dlogID}`, method: "PUT", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
        if (resp.status === 204) {
            setDoReload(+new Date());
            setSnackbarContent(tr("delivery_added"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [apiPath, updateDlogChallenge.challengeid, dlogID, modalChallenge]);
    const removeDlog = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        let resp = await axios({ url: `${apiPath}/challenges/${updateDlogChallenge.challengeid}/delivery/${dlogID}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
        if (resp.status === 204) {
            setDoReload(+new Date());
            setSnackbarContent(tr("delivery_deleted"));
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [apiPath, updateDlogChallenge.challengeid, dlogID, modalChallenge]);

    const clearModal = useCallback(() => {
        setModalChallenge({ title: "", description: "", start_time: undefined, end_time: undefined, type: 1, delivery_count: 1, required_roles: [], required_distance: 0, reward_points: 750, public_details: false, orderid: 0, is_pinned: false, job_requirements: DEFAULT_JOB_REQUIREMENTS });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${apiPath}/challenges`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
            if (resp.status === 200) {
                setDoReload(+new Date());
                setSnackbarContent(tr("challenge_posted"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${apiPath}/challenges/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
            if (resp.status === 204) {
                setDoReload(+new Date());
                setSnackbarContent(tr("challenge_updated"));
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
                setEditId(null);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        }
        setSubmitLoading(false);
    }, [apiPath, editId, modalChallenge]);

    const formatFieldName = useCallback((key) => {
        const fieldNames = {
            game: tr("game"),
            market: tr("market"),
            source_city_id: tr("source_city_id"),
            source_company_id: tr("source_company_id"),
            destination_city_id: tr("destination_city_id"),
            destination_company_id: tr("destination_company_id"),
            minimum_distance: tr("minimum_distance"),
            maximum_distance: tr("maximum_distance"),
            maximum_detour_percentage: tr("maximum_detour_percentage"),
            minimum_detour_percentage: tr("minimum_detour_percentage"),
            minimum_seconds_spent: tr("minimum_seconds_spent"),
            maximum_seconds_spent: tr("maximum_seconds_spent"),
            minimum_xp: tr("minimum_xp_earned"),
            maximum_xp: tr("maximum_xp_earned"),
            minimum_profit: tr("minimum_profit"),
            maximum_profit: tr("maximum_profit"),
            minimum_offence: tr("minimum_offence"),
            maximum_offence: tr("maximum_offence"),

            truck_id: tr("truck_id"),
            truck_plate_country_id: tr("truck_plate_country_id"),
            minimum_truck_wheel: tr("minimum_truck_wheel"),
            maximum_truck_wheel: tr("maximum_truck_wheel"),
            minimum_fuel: tr("minimum_fuel"),
            maximum_fuel: tr("maximum_fuel"),
            minimum_average_fuel: tr("minimum_average_fuel"),
            maximum_average_fuel: tr("maximum_average_fuel"),
            minimum_adblue: tr("minimum_adblue"),
            maximum_adblue: tr("maximum_adblue"),
            minimum_average_speed: tr("minimum_average_speed"),
            maximum_average_speed: tr("maximum_average_speed"),
            maximum_speed: tr("maximum_speed"),

            cargo_id: tr("cargo_id"),
            minimum_cargo_mass: tr("minimum_cargo_mass"),
            maximum_cargo_mass: tr("maximum_cargo_mass"),
            minimum_cargo_damage: tr("minimum_cargo_damage"),
            maximum_cargo_damage: tr("maximum_cargo_damage"),

            minimum_train: tr("minimum_train_took"),
            maximum_train: tr("maximum_train_took"),
            minimum_ferry: tr("minimum_ferry_took"),
            maximum_ferry: tr("maximum_ferry_took"),
            minimum_teleport: tr("minimum_teleport_took"),
            maximum_teleport: tr("maximum_teleport_took"),
            minimum_tollgate: tr("minimum_tollgate_passed"),
            maximum_tollgate: tr("maximum_tollgate_passed"),
            minimum_toll_paid: tr("minimum_toll_paid"),
            maximum_toll_paid: tr("maximum_toll_paid"),
            minimum_collision: tr("minimum_collision_times"),
            maximum_collision: tr("maximum_collision_times"),

            allow_overspeed: tr("allow_overspeed"),
            allow_auto_park: tr("allow_auto_park"),
            allow_auto_load: tr("allow_auto_load"),
            must_not_be_late: tr("must_not_be_late"),
            must_be_special: tr("must_be_special"),
            minimum_warp: tr("minimum_warp") + " (Trucky)",
            maximum_warp: tr("maximum_warp") + " (Trucky)",
            enabled_realistic_settings: tr("enabled_realistic_settings_trucky")
        };

        return fieldNames[key] || key;
    }, []);

    const createChallenge = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle(tr("create_challenge"));
        setDialogButton(tr("create"));
        setDialogOpen(true);
    }, [editId]);

    const editChallenge = useCallback(async (challenge) => {
        clearModal();

        window.loading += 1;

        [challenge] = await makeRequestsWithAuth([`${apiPath}/challenges/${challenge.challengeid}`]);

        setModalChallenge(challenge);
        setEditId(challenge.challengeid);

        setDialogTitle(tr("edit_challenge"));
        setDialogButton(tr("edit"));
        setDialogOpen(true);

        window.loading -= 1;
    }, [apiPath]);

    const deleteChallenge = useCallback(async (challenge, isShiftPressed) => {
        if (isShiftPressed === true || challenge.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${apiPath}/challenges/${challenge.challengeid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setDoReload(+new Date());
                setSnackbarContent(tr("challenge_deleted"));
                setSnackbarSeverity("success");
                setDialogDelete(false);
                setToDelete(null);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
            setSubmitLoading(false);
        } else {
            setDialogDelete(true);
            setToDelete(challenge);
        }
    }, [apiPath]);

    return <>
        <ChallengesMemo userDrivenDistance={userDrivenDistance} challengeList={challengeList} setChallengeList={setChallengeList} upcomingChallenges={upcomingChallenges} setUpcomingChallenges={setUpcomingChallenges} activeChallenges={activeChallenges} setActiveChallenges={setActiveChallenges} doReload={doReload} onShowDetails={showChallengeDetails} onUpdateDelivery={updateDlog} onEdit={editChallenge} onDelete={deleteChallenge} />
        {listModalItems.length !== 0 && <ListModal title={listModalChallenge.title} items={listModalItems} data={listModalChallenge} open={listModalOpen} onClose={handleCloseDetail} additionalContent={<Typography variant="body2" sx={{ marginTop: "20px" }}>
            <MarkdownRenderer>{listModalChallenge.description}</MarkdownRenderer>
        </Typography>} />}
        <Dialog open={modalUpdateDlogOpen} onClose={() => setModalUpdateDlogOpen(false)}>
            <DialogTitle>{tr("update_deliveries")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("challenge_enter_delivery_log_id")}</Typography>
                <TextField
                    label={tr("delivery_log_id")}
                    value={dlogID}
                    onChange={(e) => setDlogID(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: "15px" }}
                />
                <ChallengeCard challenge={{ ...updateDlogChallenge, description: "" }} />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setModalUpdateDlogOpen(false); }}>{tr("cancel")}</Button>
                <Button variant="contained" color="error" onClick={removeDlog} disabled={submitLoading}>{tr("remove")}</Button>
                <Button variant="contained" color="success" onClick={addDlog} disabled={submitLoading}>{tr("add")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("title")}
                                value={modalChallenge.title}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, title: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("description_markdown")}
                                multiline
                                value={modalChallenge.description}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, description: e.target.value })}
                                fullWidth
                                minRows={4}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label={tr("start_time")}
                                defaultValue={modalChallenge.start_time}
                                onChange={(timestamp) => { setModalChallenge({ ...modalChallenge, start_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label={tr("end_time")}
                                defaultValue={modalChallenge.end_time}
                                onChange={(timestamp) => { setModalChallenge({ ...modalChallenge, end_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{tr("challenge_type")}</FormLabel>
                                <TextField
                                    select size="small"
                                    value={modalChallenge.type}
                                    onChange={(e) => setModalChallenge({ ...modalChallenge, type: e.target.value })}
                                    sx={{ marginTop: "6px", height: "30px" }}
                                >
                                    <MenuItem value={1}>{tr("personal_onetime")}</MenuItem>
                                    <MenuItem value={2}>{tr("company_onetime")}</MenuItem>
                                    <MenuItem value={3}>{tr("personal_recurring")}</MenuItem>
                                    <MenuItem value={4}>{tr("personal_distancebased")}</MenuItem>
                                    <MenuItem value={5}>{tr("company_distancebased")}</MenuItem>
                                </TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{tr("public_job_requirements")}</FormLabel>
                                <RadioGroup
                                    value={String(modalChallenge.public_details)} row
                                    onChange={(e) => setModalChallenge({ ...modalChallenge, public_details: e.target.value === true })}
                                >
                                    <FormControlLabel value={true} control={<Radio />} label={tr("yes")} />
                                    <FormControlLabel value={false} control={<Radio />} label={tr("no")} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("delivery_count")}
                                type="text"
                                value={modalChallenge.delivery_count}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, delivery_count: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} style={{ paddingTop: 0 }}>
                            <RoleSelect initialRoles={modalChallenge.required_roles} onUpdate={(newRoles) => setModalChallenge({ ...modalChallenge, required_roles: newRoles.map((role) => (role.id)) })} label={tr("required_roles")} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("required_distance")}
                                type="text"
                                value={modalChallenge.required_distance}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, required_distance: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("reward_points")}
                                type="text"
                                value={modalChallenge.reward_points}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, reward_points: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("order_id")}
                                type="text"
                                value={modalChallenge.orderid}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, orderid: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset" sx={{ mb: "10px" }}>
                                <FormControlLabel
                                    key="pin"
                                    control={
                                        <Checkbox
                                            name={tr("pin")}
                                            checked={modalChallenge.is_pinned}
                                            onChange={() => setModalChallenge({ ...modalChallenge, is_pinned: e.target.value === true })}
                                        />
                                    }
                                    label={tr("pin")}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
                {/* Job Requirements section */}
                <Typography variant="h6" style={{ marginTop: "20px", marginBottom: "5px" }}>{tr("job_requirements")}</Typography>
                {Object.entries(jobReqGroups).map(([group, keys]) => {
                    if (!expandedGroups.includes(group))
                        return <Typography variant="body2" fontWeight="bold" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedGroups(expandedGroups => ([...expandedGroups, group]))}>
                            <div style={{ flexGrow: 1 }}>{replaceUnderscores(group)}</div>
                            <IconButton style={{ transition: 'transform 0.2s', transform: expandedGroups.includes(group) ? 'rotate(180deg)' : 'none' }}>
                                <ExpandMoreRounded />
                            </IconButton>
                        </Typography>;
                    return <>
                        <Typography variant="body2" fontWeight="bold" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedGroups(expandedGroups => expandedGroups.filter(item => item != group))}>
                            <div style={{ flexGrow: 1 }}>{replaceUnderscores(group)}</div>
                            <IconButton style={{ transition: 'transform 0.2s', transform: expandedGroups.includes(group) ? 'rotate(180deg)' : 'none' }}>
                                <ExpandMoreRounded />
                            </IconButton>
                        </Typography>
                        {group === "misc" && <Typography variant="body2" sx={{ mb: "15px" }}>
                            - Warp refers to game speed (not truck speed). Value above 1 refers to game being sped up, and value below 1 refers to game being slowed down. This attribute only applies to jobs tracked with Trucky. When set, jobs not tracked with Trucky will not be considered a valid challenge job.<br />
                            - Enabled realistic settings is also exclusive to Trucky. When set, jobs not tracked with Trucky will not be considered a valid challenge job.
                        </Typography>}
                        {expandedGroups.includes(group) && <Collapse in={expandedGroups.includes(group)}>
                            <Grid container spacing={2}>
                                {keys.map((key) => {
                                    const value = modalChallenge.job_requirements[key];
                                    return (<>
                                        {key === "game" && <>
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <Select isMulti
                                                    options={[{ value: "eut2", label: "ETS2" }, { value: "ats", label: "ATS" }]}
                                                    className="basic-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((game) => ({ value: game, label: game === "eut2" ? "ETS2" : "ATS" }))}
                                                    onChange={(newItems) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newItems.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        </>}
                                        {key === "market" && <>
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect isMulti
                                                    options={Object.keys(cargoMarkets).map((marketID) => ({ value: marketID, label: cargoMarkets[marketID] }))}
                                                    className="basic-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((item) => ({ value: item, label: cargoMarkets[item] }))}
                                                    onChange={(newItems) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newItems.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        </>}
                                        {["source_city_id", "destination_city_id"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect
                                                    defaultValue={value.split(",").splice(Number(value === "")).map((cityID) => ({ value: cityID, label: cityIDs[cityID] !== undefined ? `${cityIDs[cityID]} (${cityID})` : cityID }))}
                                                    isMulti
                                                    name="colors"
                                                    options={Object.keys(cityIDs).map((cityID) => ({ value: cityID, label: `${cityIDs[cityID]} (${cityID})` }))}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((cityID) => ({ value: cityID, label: cityIDs[cityID] !== undefined ? `${cityIDs[cityID]} (${cityID})` : cityID }))}
                                                    onChange={(newIDs) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newIDs.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        }
                                        {["source_company_id", "destination_company_id"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect
                                                    defaultValue={value.split(",").splice(Number(value === "")).map((companyID) => ({ value: companyID, label: companyIDs[companyID] !== undefined ? `${companyIDs[companyID]} (${companyID})` : companyID }))}
                                                    isMulti
                                                    name="colors"
                                                    options={Object.keys(companyIDs).map((companyID) => ({ value: companyID, label: `${companyIDs[companyID]} (${companyID})` }))}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((companyID) => ({ value: companyID, label: companyIDs[companyID] !== undefined ? `${companyIDs[companyID]} (${companyID})` : companyID }))}
                                                    onChange={(newIDs) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newIDs.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        }
                                        {["cargo_id"].includes(key) &&
                                            <Grid item xs={12} sm={12} key={key} style={{ paddingTop: "5px" }}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect
                                                    defaultValue={value.split(",").splice(Number(value === "")).map((cargoID) => ({ value: cargoID, label: cargoIDs[cargoID] !== undefined ? `${cargoIDs[cargoID]} (${cargoID})` : cargoID }))}
                                                    isMulti
                                                    name="colors"
                                                    options={Object.keys(cargoIDs).map((cargoID) => ({ value: cargoID, label: `${cargoIDs[cargoID]} (${cargoID})` }))}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((cargoID) => ({ value: cargoID, label: cargoIDs[cargoID] !== undefined ? `${cargoIDs[cargoID]} (${cargoID})` : cargoID }))}
                                                    onChange={(newIDs) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newIDs.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        }
                                        {["truck_id"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect
                                                    defaultValue={value.split(",").splice(Number(value === "")).map((truckID) => ({ value: truckID, label: truckIDs[truckID] !== undefined ? `${truckIDs[truckID]} (${truckID})` : truckID }))}
                                                    isMulti
                                                    name="colors"
                                                    options={Object.keys(truckIDs).map((truckID) => ({ value: truckID, label: `${truckIDs[truckID]} (${truckID})` }))}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((truckID) => ({ value: truckID, label: truckIDs[truckID] !== undefined ? `${truckIDs[truckID]} (${truckID})` : truckID }))}
                                                    onChange={(newIDs) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newIDs.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        }
                                        {["truck_plate_country_id"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect
                                                    defaultValue={value.split(",").splice(Number(value === "")).map((countryID) => ({ value: countryID, label: countryIDs[countryID] !== undefined ? `${countryIDs[countryID]} (${countryID})` : countryID }))}
                                                    isMulti
                                                    name="colors"
                                                    options={Object.keys(countryIDs).map((countryID) => ({ value: countryID, label: `${countryIDs[countryID]} (${countryID})` }))}
                                                    className="basic-multi-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((countryID) => ({ value: countryID, label: countryIDs[countryID] !== undefined ? `${countryIDs[countryID]} (${countryID})` : countryID }))}
                                                    onChange={(newIDs) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newIDs.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        }
                                        {["allow_overspeed", "allow_auto_park", "allow_auto_load", "must_not_be_late", "must_be_special"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <TextField select
                                                    label={formatFieldName(key)}
                                                    defaultValue={value}
                                                    onChange={(e) =>
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: e.target.value },
                                                        })
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem key={1} value={1}>Yes</MenuItem>
                                                    <MenuItem key={0} value={0}>No</MenuItem>
                                                </TextField>
                                            </Grid>
                                        }
                                        {key === "enabled_realistic_settings" && <>
                                            <Grid item xs={12} sm={12} key={key}>
                                                <Typography variant="body2">{formatFieldName(key)}</Typography>
                                                <CreatableSelect isMulti
                                                    options={TRUCKY_REALISTIC_SETTINGS.map((item) => ({ value: item, label: replaceUnderscores(item) }))}
                                                    className="basic-select"
                                                    classNamePrefix="select"
                                                    styles={customSelectStyles(theme)}
                                                    value={value.split(",").splice(Number(value === "")).map((item) => ({ value: item, label: replaceUnderscores(item) }))}
                                                    onChange={(newItems) => {
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: newItems.map((item) => (item.value)).join(",") },
                                                        });
                                                    }}
                                                    menuPortalTarget={document.body}
                                                />
                                            </Grid>
                                        </>}
                                        {!["game", "market", "source_city_id", "destination_city_id", "source_company_id", "destination_company_id", "cargo_id", "truck_id", "truck_plate_country_id", "allow_overspeed", "allow_auto_park", "allow_auto_load", "must_not_be_late", "must_be_special", "enabled_realistic_settings"].includes(key) &&
                                            <Grid item xs={12} sm={6} key={key}>
                                                <TextField
                                                    label={formatFieldName(key)}
                                                    defaultValue={value !== DEFAULT_JOB_REQUIREMENTS[key] && value !== parseInt(DEFAULT_JOB_REQUIREMENTS[key]) ? value : ""}
                                                    onChange={(e) =>
                                                        setModalChallenge({
                                                            ...modalChallenge,
                                                            job_requirements: { ...modalChallenge.job_requirements, [key]: e.target.value },
                                                        })
                                                    }
                                                    fullWidth
                                                />
                                            </Grid>}
                                    </>);
                                })}
                            </Grid>
                        </Collapse>}
                    </>;
                })}
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); clearModal(); }}>{tr("cancel")}</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>
                    {dialogButton}
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
            <DialogTitle>{tr("delete_challenge")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("delete_challenge_confirm")}</Typography>
                <ChallengeCard challenge={toDelete !== null ? toDelete : {}} />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogDelete(false); }}>{tr("cancel")}</Button>
                <Button variant="contained" color="error" onClick={() => { deleteChallenge({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>{tr("delete")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>{tr("challenge_managers")}</DialogTitle>
            <DialogContent>
                <ChallengeManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            {checkUserPerm(curUserPerm, ["administrator", "manage_challenges"]) && <SpeedDialAction
                key="create"
                icon={<EditNoteRounded />}
                tooltipTitle={tr("create")}
                onClick={() => createChallenge()}
            />}
            {!isNaN(curUser.userid) && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle={tr("managers")}
                onClick={() => setDialogManagers(true)}
            />}
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle={tr("refresh")}
                onClick={() => setDoReload(+new Date())}
            />
        </SpeedDial>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                sx={{ zIndex: 99999 }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>;
};

export default Challenges;