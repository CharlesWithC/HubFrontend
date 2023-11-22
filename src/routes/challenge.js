import React from 'react';
import { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Snackbar, Alert, FormControl, FormControlLabel, FormLabel, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction, LinearProgress, MenuItem, RadioGroup, Radio, Chip, Checkbox, Tooltip } from '@mui/material';
import { LocalShippingRounded, EmojiEventsRounded, EditRounded, DeleteRounded, CategoryRounded, InfoRounded, TaskAltRounded, DoneOutlineRounded, BlockRounded, PlayCircleRounded, ScheduleRounded, HourglassBottomRounded, StopCircleRounded, EditNoteRounded, PeopleAltRounded, RefreshRounded } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Portal } from '@mui/base';

import CreatableSelect from 'react-select/creatable';

import DateTimeField from '../components/datetime';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import CustomTable from '../components/table';
import ListModal from '../components/listmodal';
import { makeRequestsWithAuth, customAxios as axios, checkPerm, checkUserPerm, checkUserRole, getAuthToken, getFormattedDate, ConvertUnit, sortDictWithValue, removeNUEValues } from '../functions';
import RoleSelect from '../components/roleselect';
import { customSelectStyles } from '../designs';

var vars = require("../variables");

const CHALLENGE_TYPES = ["", "Personal (One-time)", "Company (One-time)", "Personal (Recurring)", "Personal (Distance-based)", "Company (Distance-based)"];
const DEFAULT_JOB_REQUIREMENTS = {
    game: "",
    market: "",
    source_city_id: "",
    source_company_id: "",
    destination_city_id: "",
    destination_company_id: "",
    minimum_distance: "-1",
    maximum_distance: "-1",
    maximum_detour_percentage: "-1",
    minimum_detour_percentage: "-1",
    minimum_seconds_spent: "-1",
    maximum_seconds_spent: "-1",
    truck_id: "",
    truck_plate_country_id: "",
    minimum_truck_wheel: "-1",
    maximum_truck_wheel: "-1",
    minimum_fuel: "-1",
    maximum_fuel: "-1",
    minimum_average_fuel: "-1",
    maximum_average_fuel: "-1",
    minimum_adblue: "-1",
    maximum_adblue: "-1",
    minimum_average_speed: "-1",
    maximum_average_speed: "-1",
    maximum_speed: "-1",
    cargo_id: "",
    minimum_cargo_mass: "-1",
    maximum_cargo_mass: "-1",
    minimum_cargo_damage: "-1",
    maximum_cargo_damage: "-1",
    minimum_profit: "-1",
    maximum_profit: "-1",
    minimum_offence: "-1",
    maximum_offence: "-1",
    minimum_xp: "-1",
    maximum_xp: "-1",
    minimum_train: "-1",
    maximum_train: "-1",
    minimum_ferry: "-1",
    maximum_ferry: "-1",
    minimum_teleport: "-1",
    maximum_teleport: "-1",
    minimum_tollgate: "-1",
    maximum_tollgate: "-1",
    minimum_toll_paid: "-1",
    maximum_toll_paid: "-1",
    minimum_collision: "-1",
    maximum_collision: "-1",
    allow_overspeed: "1",
    allow_auto_park: "1",
    allow_auto_load: "1",
    must_not_be_late: "0",
    must_be_special: "0",
    minimum_warp: "-1",
    maximum_warp: "-1",
    enabled_realistic_settings: ""
};

const columns = [
    { id: 'challengeid', label: 'ID', orderKey: 'challengeid', defaultOrder: 'desc' },
    { id: 'title', label: 'Title', orderKey: 'title', defaultOrder: 'asc' },
    { id: 'metaType', label: 'Type' },
    { id: 'reward_points', label: 'Reward', orderKey: 'reward', defaultOrder: 'desc' },
    { id: 'metaProgress', label: 'Progress', orderKey: 'delivery_count', defaultOrder: 'asc' },
    { id: 'metaStatus', label: 'Status' },
];

const staffColumns = [
    { id: 'challengeid', label: 'ID', orderKey: 'challengeid', defaultOrder: 'desc' },
    { id: 'title', label: 'Title', orderKey: 'title', defaultOrder: 'asc' },
    { id: 'metaType', label: 'Type' },
    { id: 'reward_points', label: 'Reward', orderKey: 'reward', defaultOrder: 'desc' },
    { id: 'metaProgress', label: 'Progress', orderKey: 'delivery_count', defaultOrder: 'asc' },
    { id: 'metaStatus', label: 'Status' },
    { id: 'metaControls', label: 'Operations' },
];

const ControlButtons = ({ challenge, onUpdateDelivery, onEdit, onDelete }) => {
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
        <IconButton size="small" aria-label="Update Deliveries" onClick={handleUpdateDelivery}><LocalShippingRounded /></IconButton >
        <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
        <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
    </>;
};

function ParseChallenges(challenges, theme, onUpdateDelivery, onEdit, onDelete) {
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
            ? <Tooltip key={`ongoing-status`} placement="top" arrow title="Ongoing"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <PlayCircleRounded sx={{ color: theme.palette.success.main }} />
            </Tooltip>
            : challenge.start_time * 1000 > Date.now()
                ? challenge.start_time * 1000 > Date.now() + 86400 ? <Tooltip key={`upcoming-status`} placement="top" arrow title="Upcoming"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <ScheduleRounded sx={{ color: theme.palette.info.main }} />
                </Tooltip> :
                    <Tooltip key={`upcoming-status`} placement="top" arrow title="Upcoming"
                        PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                        <HourglassBottomRounded sx={{ color: theme.palette.info.main }} />
                    </Tooltip>
                : <Tooltip key={`ended-status`} placement="top" arrow title="Ended"
                    PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                    <StopCircleRounded sx={{ color: theme.palette.error.main }} />
                </Tooltip>;
        challenges[i].metaStatus = <>{statusIcon}&nbsp;
            {qualified && <Tooltip key={`qualified-status`} placement="top" arrow title="Qualified"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <DoneOutlineRounded sx={{ color: theme.palette.success.main }} />&nbsp;
            </Tooltip>}
            {!qualified && <Tooltip key={`not-qualified-status`} placement="top" arrow title="Not Qualified"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <BlockRounded sx={{ color: theme.palette.error.main }} />&nbsp;
            </Tooltip>}
            {completed && <Tooltip key={`completed-status`} placement="top" arrow title="Completed"
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <TaskAltRounded sx={{ color: theme.palette.warning.main }} />&nbsp;
            </Tooltip>}</>;

        challenges[i].metaControls = <ControlButtons challenge={challenges[i]} onUpdateDelivery={onUpdateDelivery} onEdit={onEdit} onDelete={onDelete} />;
    }
    return challenges;
}

const ChallengeCard = ({ challenge, upcoming, onShowDetails, onUpdateDelivery, onEdit, onDelete }) => {
    const showControls = onEdit !== undefined && (vars.isLoggedIn && checkUserPerm(["administrator", "manage_challenges"]));
    const showButtons = onEdit !== undefined && (vars.isLoggedIn);

    const handleShowDetails = useCallback(() => {
        onShowDetails(challenge);
    }, [challenge, onShowDetails]);

    if (challenge.description === undefined) { return <></>; }

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
                        <IconButton size="small" aria-label="Details" onClick={handleShowDetails}><InfoRounded /></IconButton >
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
};

const ChallengeManagers = memo(() => {
    let managers = [];
    for (let i = 0; i < vars.members.length; i++) {
        if (checkPerm(vars.members[i].roles, ["administrator", "manage_challenges"])) {
            managers.push(vars.members[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const ChallengesMemo = memo(({ challengeList, setChallengeList, upcomingChallenges, setUpcomingChallenges, activeChallenges, setActiveChallenges, onShowDetails, onUpdateDelivery, onEdit, onDelete, doReload }) => {
    const inited = useRef(false);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const pageRef = useRef(1);
    const [pageSize, setPageSize] = useState(10);
    const [listParam, setListParam] = useState({ order_by: "challengeid", order: "desc" });

    const theme = useTheme();

    useEffect(() => {
        pageRef.current = page;
    }, [page]);
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let processedParam = removeNUEValues(listParam);

            let [_upcomingChallenges, _activeChallenges, _challengeList] = [{}, {}, {}];
            if (!inited.current || +new Date() - doReload <= 1000) {
                let urls = [
                    `${vars.dhpath}/challenges/list?page_size=2&page=1&start_after=${parseInt(+new Date() / 1000)}`,
                    `${vars.dhpath}/challenges/list?page_size=250&page=1&start_before=${parseInt(+new Date() / 1000)}&end_after=${parseInt(+new Date() / 1000)}`,
                    `${vars.dhpath}/challenges/list?page_size=${pageSize}&page=${page}&${new URLSearchParams(processedParam).toString()}`,
                ];
                [_upcomingChallenges, _activeChallenges, _challengeList] = await makeRequestsWithAuth(urls);
                setUpcomingChallenges(ParseChallenges(_upcomingChallenges.list, theme, onUpdateDelivery, onEdit, onDelete));
                setActiveChallenges(ParseChallenges(_activeChallenges.list, theme, onUpdateDelivery, onEdit, onDelete));
                inited.current = true;
            } else {
                let urls = [
                    `${vars.dhpath}/challenges/list?page_size=${pageSize}&page=${page}&${new URLSearchParams(processedParam).toString()}`,
                ];
                [_challengeList] = await makeRequestsWithAuth(urls);
            }

            if (pageRef.current === page) {
                setChallengeList(ParseChallenges(_challengeList.list, theme, onUpdateDelivery, onEdit, onDelete));
                setTotalItems(_challengeList.total_items);
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [doReload, setUpcomingChallenges, setActiveChallenges, pageSize, page, setChallengeList, theme, onUpdateDelivery, onEdit, onDelete, listParam]);

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
        {challengeList.length !== 0 && <CustomTable columns={checkUserPerm(["administrator", "manage_challenges"]) ? staffColumns : columns} order={listParam.order} orderBy={listParam.order_by} onOrderingUpdate={(order_by, order) => { setListParam({ ...listParam, order_by: order_by, order: order }); }} data={challengeList} totalItems={totalItems} rowsPerPageOptions={[10, 25, 50, 100, 250]} defaultRowsPerPage={pageSize} onPageChange={setPage} onRowsPerPageChange={setPageSize} onRowClick={onShowDetails} pstyle={{ marginRight: "60px" }} />}
    </>;
});

const Challenges = () => {
    const theme = useTheme();

    const [challengeList, setChallengeList] = useState([]);
    const [upcomingChallenges, setUpcomingChallenges] = useState([]);
    const [activeChallenges, setActiveChallenges] = useState([]);
    const [doReload, setDoReload] = useState(0);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState("Create Challenge");
    const [dialogButton, setDialogButton] = useState("Create");
    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);
    const [modalChallenge, setModalChallenge] = useState({ title: "", description: "", start_time: undefined, end_time: undefined, type: 1, delivery_count: 1, required_roles: [], required_distance: 0, reward_points: 750, public_details: false, orderid: 0, is_pinned: false, job_requirements: DEFAULT_JOB_REQUIREMENTS });

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

    const showChallengeDetails = useCallback(async (challenge) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        [challenge] = await makeRequestsWithAuth([`${vars.dhpath}/challenges/${challenge.challengeid}`]);

        setListModalChallenge(challenge);

        let progress = <LinearProgress variant="determinate" color="success" value={Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100) + 1, 100)} sx={{ width: "100%" }} />;

        let qualified = checkUserRole(challenge.required_roles) && challenge.required_distance <= vars.userStats.distance.all.sum.tot;
        let qualifiedStatus = <>
            {qualified && <>
                <Chip color="success" sx={{ borderRadius: "5px" }} label="Qualified"></Chip>&nbsp;
            </>}
            {!qualified && <>
                <Chip color="secondary" sx={{ borderRadius: "5px" }} label="Not Qualified"></Chip>&nbsp;
            </>}</>;
        let completed = parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count);
        let statusIcon = challenge.start_time * 1000 <= Date.now() && challenge.end_time * 1000 >= Date.now()
            ? <Chip color="success" sx={{ borderRadius: "5px" }} label="Ongoing"></Chip>
            : challenge.start_time * 1000 > Date.now()
                ? <Chip color="info" sx={{ borderRadius: "5px" }} label="Upcoming"></Chip>
                : <Chip color="error" sx={{ borderRadius: "5px" }} label="Ended"></Chip>;
        let status = <>{statusIcon}&nbsp;
            {completed && <>
                <Chip color="warning" sx={{ borderRadius: "5px" }} label="Completed"></Chip>&nbsp;
            </>}</>;

        let required_roles = challenge.required_roles.map((role) => {
            return vars.roles[role].name + ` (${role})  `;
        });

        let completed_users = "";
        let completed_users_cnt = {};
        let completed_user_info = {};
        let completed_user_point = {};
        for (let i = 0; i < challenge.completed.length; i++) {
            if (completed_users_cnt[challenge.completed[i].user.userid] === undefined) completed_users_cnt[challenge.completed[i].user.userid] = 1;
            else completed_users_cnt[challenge.completed[i].user.userid] += 1;
            completed_user_info[challenge.completed[i].user.userid] = challenge.completed[i];
            completed_user_point[challenge.completed[i].user.userid] = parseInt(challenge.completed[i].points);
        }
        let d = sortDictWithValue(completed_user_point);
        for (let i = 0; i < d.length; i++) {
            let extrainfo = "";
            if (challenge.type === 2) extrainfo = ` ${completed_user_info[d[i][0]].points} Points`;
            else if (challenge.type === 3) extrainfo = ` x${completed_users_cnt[d[i][0]]}`;
            else if (challenge.type === 5) extrainfo = ` ${ConvertUnit("km", completed_user_point[d[i][0]])}`;
            completed_users = <>{completed_users} <UserCard user={completed_user_info[d[i][0]].user} inline={true} /> <Chip color="secondary" size="small" label={extrainfo}></Chip></>;
        }

        const lmi = [
            { "name": "Type", "value": CHALLENGE_TYPES[challenge.type] },
            { "name": "Reward Points", "key": "reward_points" },
            { "name": "Start Time", "value": getFormattedDate(new Date(challenge.start_time * 1000)) },
            { "name": "End Time", "value": getFormattedDate(new Date(challenge.end_time * 1000)) },
            { "name": "Status", "value": status },
            {},
            { "name": "Deliveries", "key": "delivery_count" },
            { "name": "Current Deliveries", "key": "current_delivery_count" },
            { "name": "Progress", "value": progress },
            {},
            { "name": "Required Roles", "value": required_roles },
            { "name": "Required Distance Driven", "value": ConvertUnit("km", challenge.required_distance) },
            { "name": "Qualification", "value": qualifiedStatus },
            {},
            { "name": "Completed Members", "value": completed_users }];
        setListModalItems(lmi);
        setListModalOpen(true);

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, []);

    const updateDlog = useCallback((challenge) => {
        setUpdateDlogChallenge(challenge);
        setModalUpdateDlogOpen(true);
    }, []);
    const addDlog = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/challenges/${updateDlogChallenge.challengeid}/delivery/${dlogID}`, method: "PUT", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
        if (resp.status === 204) {
            setDoReload(+new Date());
            setSnackbarContent("Delivery added!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [updateDlogChallenge.challengeid, dlogID, modalChallenge]);
    const removeDlog = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        let resp = await axios({ url: `${vars.dhpath}/challenges/${updateDlogChallenge.challengeid}/delivery/${dlogID}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
        if (resp.status === 204) {
            setDoReload(+new Date());
            setSnackbarContent("Delivery deleted!");
            setSnackbarSeverity("success");
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }
        setSubmitLoading(false);
    }, [updateDlogChallenge.challengeid, dlogID, modalChallenge]);

    const clearModal = useCallback(() => {
        setModalChallenge({ title: "", description: "", start_time: undefined, end_time: undefined, type: 1, delivery_count: 1, required_roles: [], required_distance: 0, reward_points: 750, public_details: false, orderid: 0, is_pinned: false, job_requirements: DEFAULT_JOB_REQUIREMENTS });
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        if (editId === null) {
            let resp = await axios({ url: `${vars.dhpath}/challenges`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
            if (resp.status === 200) {
                setDoReload(+new Date());
                setSnackbarContent("Challenge posted!");
                setSnackbarSeverity("success");
                clearModal();
                setDialogOpen(false);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
        } else {
            let resp = await axios({ url: `${vars.dhpath}/challenges/${editId}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` }, data: modalChallenge });
            if (resp.status === 204) {
                setDoReload(+new Date());
                setSnackbarContent("Challenge updated!");
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
    }, [editId, modalChallenge, clearModal]);

    const formatFieldName = (key) => {
        const fieldNames = {
            game: "Game",
            market: "Market",
            source_city_id: "Source City ID",
            source_company_id: "Source Company ID",
            destination_city_id: "Destination City ID",
            destination_company_id: "Destination Company ID",
            minimum_distance: "Minimum Distance",
            maximum_distance: "Maximum Distance",
            maximum_detour_percentage: "Maximum Detour Percentage",
            minimum_detour_percentage: "Minimum Detour Percentage",
            minimum_seconds_spent: "Minimum Seconds Spent",
            maximum_seconds_spent: "Maximum Seconds Spent",
            truck_id: "Truck ID",
            truck_plate_country_id: "Truck Plate Country ID",
            minimum_truck_wheel: "Minimum Truck Wheel",
            maximum_truck_wheel: "Maximum Truck Wheel",
            minimum_fuel: "Minimum Fuel",
            maximum_fuel: "Maximum Fuel",
            minimum_average_fuel: "Minimum Average Fuel",
            maximum_average_fuel: "Maximum Average Fuel",
            minimum_adblue: "Minimum Adblue",
            maximum_adblue: "Maximum Adblue",
            minimum_average_speed: "Minimum Average Speed",
            maximum_average_speed: "Maximum Average Speed",
            maximum_speed: "Maximum Speed",
            cargo_id: "Cargo ID",
            minimum_cargo_mass: "Minimum Cargo Mass",
            maximum_cargo_mass: "Maximum Cargo Mass",
            minimum_cargo_damage: "Minimum Cargo Damage",
            maximum_cargo_damage: "Maximum Cargo Damage",
            minimum_profit: "Minimum Profit",
            maximum_profit: "Maximum Profit",
            minimum_offence: "Minimum Offence",
            maximum_offence: "Maximum Offence",
            minimum_xp: "Minimum XP Earned",
            maximum_xp: "Maximum XP Earned",
            minimum_train: "Minimum Train Took",
            maximum_train: "Maximum Train Took",
            minimum_ferry: "Minimum Ferry Took",
            maximum_ferry: "Maximum Ferry Took",
            minimum_teleport: "Minimum Teleport Took",
            maximum_teleport: "Maximum Teleport Took",
            minimum_tollgate: "Minimum Tollgate Passed",
            maximum_tollgate: "Maximum Tollgate Passed",
            minimum_toll_paid: "Minimum Toll Paid",
            maximum_toll_paid: "Maximum Toll Paid",
            minimum_collision: "Minimum Collision Times",
            maximum_collision: "Maximum Collision Times",
            allow_overspeed: "Allow Overspeed",
            allow_auto_park: "Allow Auto Park",
            allow_auto_load: "Allow Auto Load",
            must_not_be_late: "Must Not Be Late",
            must_be_special: "Must Be Special",
            minimum_warp: "Minimum Warp",
            maximum_warp: "Maximum Warp",
            enabled_realistic_settings: "Enabled Realistic Settings (Trucky)"
        };

        return fieldNames[key] || key;
    };

    const createChallenge = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle("Create Challenge");
        setDialogButton("Create");
        setDialogOpen(true);
    }, [editId, clearModal]);

    const editChallenge = useCallback(async (challenge) => {
        clearModal();

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        [challenge] = await makeRequestsWithAuth([`${vars.dhpath}/challenges/${challenge.challengeid}`]);

        setModalChallenge(challenge);
        setEditId(challenge.challengeid);

        setDialogTitle("Edit Challenge");
        setDialogButton("Edit");
        setDialogOpen(true);

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [clearModal]);

    const deleteChallenge = useCallback(async (challenge, isShiftPressed) => {
        if (isShiftPressed === true || challenge.confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${vars.dhpath}/challenges/${challenge.challengeid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setDoReload(+new Date());
                setSnackbarContent("Challenge deleted!");
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
    }, []);

    return <>
        <ChallengesMemo challengeList={challengeList} setChallengeList={setChallengeList} upcomingChallenges={upcomingChallenges} setUpcomingChallenges={setUpcomingChallenges} activeChallenges={activeChallenges} setActiveChallenges={setActiveChallenges} doReload={doReload} onShowDetails={showChallengeDetails} onUpdateDelivery={updateDlog} onEdit={editChallenge} onDelete={deleteChallenge} />
        {listModalItems.length !== 0 && <ListModal title={listModalChallenge.title} items={listModalItems} data={listModalChallenge} open={listModalOpen} onClose={handleCloseDetail} additionalContent={<Typography variant="body2" sx={{ marginTop: "20px" }}>
            <MarkdownRenderer>{listModalChallenge.description}</MarkdownRenderer>
        </Typography>} />}
        <Dialog open={modalUpdateDlogOpen} onClose={() => setModalUpdateDlogOpen(false)}>
            <DialogTitle>Update Deliveries</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>Please enter the ID of the delivery log to be added / removed from the challenge:</Typography>
                <TextField
                    label="Delivery Log ID"
                    value={dlogID}
                    onChange={(e) => setDlogID(e.target.value)}
                    fullWidth
                    sx={{ marginBottom: "15px" }}
                />
                <ChallengeCard challenge={{ ...updateDlogChallenge, description: "" }} />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setModalUpdateDlogOpen(false); }}>Cancel</Button>
                <Button variant="contained" color="error" onClick={removeDlog} disabled={submitLoading}>Remove</Button>
                <Button variant="contained" color="success" onClick={addDlog} disabled={submitLoading}>Add</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Title"
                                value={modalChallenge.title}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, title: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description (Markdown)"
                                multiline
                                value={modalChallenge.description}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, description: e.target.value })}
                                fullWidth
                                minRows={4}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label="Start Time"
                                defaultValue={modalChallenge.start_time}
                                onChange={(timestamp) => { setModalChallenge({ ...modalChallenge, start_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label="End Time"
                                defaultValue={modalChallenge.end_time}
                                onChange={(timestamp) => { setModalChallenge({ ...modalChallenge, end_time: timestamp }); }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Challenge Type</FormLabel>
                                <TextField
                                    select size="small"
                                    value={modalChallenge.type}
                                    onChange={(e) => setModalChallenge({ ...modalChallenge, type: e.target.value })}
                                    sx={{ marginTop: "6px", height: "30px" }}
                                >
                                    <MenuItem value={1}>Personal (One-time)</MenuItem>
                                    <MenuItem value={2}>Company (One-time)</MenuItem>
                                    <MenuItem value={3}>Personal (Recurring)</MenuItem>
                                    <MenuItem value={4}>Personal (Distance-based)</MenuItem>
                                    <MenuItem value={5}>Company (Distance-based)</MenuItem>
                                </TextField>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Public Job Requirements?</FormLabel>
                                <RadioGroup
                                    value={String(modalChallenge.public_details)} row
                                    onChange={(e) => setModalChallenge({ ...modalChallenge, public_details: e.target.value === true })}
                                >
                                    <FormControlLabel value={true} control={<Radio />} label="Yes" />
                                    <FormControlLabel value={false} control={<Radio />} label="No" />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Delivery Count"
                                type="text"
                                value={modalChallenge.delivery_count}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, delivery_count: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6} style={{ paddingTop: 0 }}>
                            <RoleSelect initialRoles={modalChallenge.required_roles} onUpdate={(newRoles) => setModalChallenge({ ...modalChallenge, required_roles: newRoles.map((role) => (role.id)) })} label="Required Roles" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Required Distance"
                                type="text"
                                value={modalChallenge.required_distance}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, required_distance: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Reward Points"
                                type="text"
                                value={modalChallenge.reward_points}
                                onChange={(e) => setModalChallenge({ ...modalChallenge, reward_points: e.target.value })}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Order ID"
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
                                            name="Pin"
                                            checked={modalChallenge.is_pinned}
                                            onChange={() => setModalChallenge({ ...modalChallenge, is_pinned: e.target.value === true })}
                                        />
                                    }
                                    label="Pin"
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
                {/* Job Requirements section */}
                <Typography variant="h6" style={{ marginTop: "20px", marginBottom: "5px" }}>
                    Job Requirements
                </Typography>
                <Grid container spacing={2}>
                    {Object.entries(modalChallenge.job_requirements).map(([key, value]) => (<>
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
                            <Grid item xs={12} sm={6} key={key} style={{ paddingTop: "5px" }}>
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
                        {!["source_city_id", "destination_city_id", "source_company_id", "destination_company_id", "cargo_id"].includes(key) &&
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
                    </>))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); clearModal(); }}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>
                    {dialogButton}
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
            <DialogTitle>Delete Challenge</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>Are you sure you want to delete this challenge?</Typography>
                <ChallengeCard challenge={toDelete !== null ? toDelete : {}} />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogDelete(false); }}>Cancel</Button>
                <Button variant="contained" color="error" onClick={() => { deleteChallenge({ ...toDelete, confirmed: true }); }} disabled={submitLoading}>Delete</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>Challenge Managers</DialogTitle>
            <DialogContent>
                <ChallengeManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>Close</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel="Controls"
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            {checkUserPerm(["administrator", "manage_challenges"]) && <SpeedDialAction
                key="create"
                icon={<EditNoteRounded />}
                tooltipTitle="Create"
                onClick={() => createChallenge()}
            />}
            {vars.userInfo.userid !== -1 && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle="Managers"
                onClick={() => setDialogManagers(true)}
            />}
            <SpeedDialAction
                key="refresh"
                icon={<RefreshRounded />}
                tooltipTitle="Refresh"
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