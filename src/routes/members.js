import React from 'react';
import { Card, CardContent, Typography, Avatar, Grid, Tooltip } from '@mui/material';

import UserCard from '../components/usercard';

var vars = require("../variables");

const LargeUserCard = ({ user, color }) => {
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={user.avatar} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center">
                    <UserCard user={user} textOnly={true} />
                </Typography>
            </CardContent>
        </Card>
    );
};

const Members = () => {
    if (vars.membersTabCache !== undefined) {
        return vars.membersTabCache;
    }
    let members = vars.members;
    let roles = Object.values(vars.roles);
    roles.sort((a, b) => a.order_id - b.order_id);

    let groups = [];
    let norole_group = [];
    for (let i = 0; i < roles.length; i++) {
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
        groups.push({ "group": "No Role", "description": "These users have no role assigned.", "users": norole_group });
    }

    vars.membersTabCache = (<div style={{ width: "100%" }}>
        {groups.map((group) => (<div key={group.group}>
            <Tooltip placement="top" arrow title={group.description !== undefined ? group.description : "No description"}
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
    return vars.membersTabCache;
};

export default Members;