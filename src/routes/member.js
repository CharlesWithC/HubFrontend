import { useTranslation } from 'react-i18next';
import React from 'react';
import { Card, CardContent, Typography, Avatar, Grid, Tooltip } from '@mui/material';

import UserCard from '../components/usercard';

var vars = require("../variables");

const LargeUserCard = ({ user, color }) => {
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={!vars.userSettings.data_saver ? user.avatar : ""} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center">
                    <UserCard user={user} textOnly={true} />
                </Typography>
            </CardContent>
        </Card>
    );
};

const Members = () => {
    const { t: tr } = useTranslation();

    let members = vars.members;
    let uniqueUserIds = [];
    members = members.filter(member => {
        if (uniqueUserIds.includes(member.userid)) {
            return false;
        } else {
            uniqueUserIds.push(member.userid);
            return true;
        }
    });
    let roles = Object.values(vars.roles);
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

    let groups = [];
    let norole_group = [];
    for (let i = 0; i < roles.length; i++) {
        if (roles[i].display_order_id === -1) continue;
        let group = [];
        for (let j = 0; j < members.length; j++) {
            if (members[j].roles.includes(roles[i].id)) {
                group.push(members[j]);
            }
        }
        if (group.length !== 0) {
            groups.push({ "group": roles[i].name, "color": roles[i].color, "description": roles[i].description, "users": group });
        }
    }
    for (let i = 0; i < members.length; i++) {
        if (members[i].roles.length === 0) {
            norole_group.push(members[i]);
        }
    }
    if (norole_group.length > 0) {
        groups.push({ "group": tr("no_role"), "description": tr("these_users_have_no_role_assigned"), "users": norole_group });
    }

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
                    {group.users.map((user) => (
                        <Grid item key={`${group.group}-${user.userid}`} xs={6} sm={6} md={4} lg={2} sx={{ minWidth: 150 }}>
                            <LargeUserCard user={user} />
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