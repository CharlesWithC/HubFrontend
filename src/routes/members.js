import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Avatar, Grid } from '@mui/material';

var vars = require("../variables");

const LargeUserCard = ({ user }) => {
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={user.avatar} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3 }} />
            <CardContent>
                <Typography variant="h6" align="center">
                    <Link to={`/member/${user.userid}`} style={{ flexGrow: 1, alignItems: "center" }}>{user.name}</Link>
                </Typography>
            </CardContent>
        </Card>
    );
};

const Members = () => {
    let members = vars.members;
    let roles = Object.values(vars.roles);
    roles.sort((a, b) => a.order_id - b.order_id);

    let groups = [];
    for (let i = 0; i < roles.length; i++) {
        let group = [];
        for (let j = 0; j < members.length; j++) {
            if (members[j].roles.includes(roles[i].id)) {
                group.push(members[j]);
            }
        }
        if (group.length !== 0) {
            groups.push({ "group": roles[i].name, "users": group });
            for (let j = 0; j < group.length; j++) {
                members = members.filter(user => user.userid !== group[j].userid);
            }
        }
    }

    return (<div style={{ width: "100%" }}>
        {groups.map((group) => (<>
            <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                <b>{group.group}</b>
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} justifyContent="center">
                    {group.users.map((user) => (
                        <Grid item key={group.group} xs={6} sm={6} md={4} lg={2} sx={{ minWidth: 150 }}>
                            <LargeUserCard key={user.userid} user={user} />
                        </Grid>
                    ))}
                </Grid>
            </div>
        </>
        ))}
    </div>);
};

export default Members;