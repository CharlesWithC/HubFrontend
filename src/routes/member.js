import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, Typography, Avatar, Grid, Tooltip } from '@mui/material';

import UserCard from '../components/usercard';

const LargeUserCard = ({ user, color }) => {
    const { userSettings } = useContext(AppContext);
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={!userSettings.data_saver ? user.avatar : ""} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    <UserCard user={user} textOnly={true} />
                </Typography>
            </CardContent>
        </Card>
    );
};

const Members = () => {
    const { t: tr } = useTranslation();
    const { allRoles, users, memberUIDs } = useContext(AppContext);
    const allMembers = useMemo(() => memberUIDs.map((uid) => users[uid]), [memberUIDs, users]);

    const roles = useMemo(() => {
        let roles = Object.values(allRoles);
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].display_order_id === undefined) {
                roles[i].display_order_id = roles[i].order_id;
            } else {
                roles[i].display_order_id = parseInt(roles[i].display_order_id);
            }
        }
        roles.sort((a, b) =>
            a.display_order_id - b.display_order_id ||
            a.order_id - b.order_id ||
            a.id - b.id
        );
        return roles;
    }, [allRoles]);

    const groups = useMemo(() => {
        let groups = [];
        let norole_group = [];
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].display_order_id === -1) continue;
            let group = [];
            for (let j = 0; j < allMembers.length; j++) {
                if (allMembers[j].roles.includes(roles[i].id)) {
                    group.push(allMembers[j].uid);
                }
            }
            if (group.length !== 0) {
                groups.push({ "group": roles[i].name, "color": roles[i].color, "description": roles[i].description, "uids": group });
            }
        }
        for (let i = 0; i < allMembers.length; i++) {
            if (allMembers[i].roles.length === 0) {
                norole_group.push(allMembers[i].uid);
            }
        }
        if (norole_group.length > 0) {
            groups.push({ "group": tr("no_role"), "description": tr("these_users_have_no_role_assigned"), "uids": norole_group });
        }
        return groups;
    }, [roles, allMembers]);

    return (<div style={{ width: "100%" }}>
        {groups.map((group) => (<div key={group.group}>
            <Tooltip placement="top" arrow title={group.description !== undefined ? group.description : tr("no_description")}
                PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
                <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                    <b style={group.color !== undefined ? { color: group.color } : {}}>{group.group}</b>
                </Typography>
            </Tooltip>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} justifyContent="center">
                    {group.uids.map((uid) => (
                        <Grid item key={`${group.group}-${uid}`} xs={6} sm={6} md={4} lg={2} sx={{ minWidth: 150 }}>
                            <LargeUserCard user={users[uid]} />
                        </Grid>
                    ))}
                </Grid>
            </div >
        </div>
        ))
        }
    </div >);
};

export default Members;