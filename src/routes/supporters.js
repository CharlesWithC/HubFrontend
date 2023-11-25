import React from 'react';
import { Card, CardHeader, CardContent, Typography, Avatar, Grid } from '@mui/material';

var vars = require("../variables");

const LargeUserCard = ({ user, color }) => {
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={!vars.userSettings.data_saver ? user.avatar : ""} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center">
                    <span style={{ color: color }}>{user.name}</span>
                </Typography>
            </CardContent>
        </Card>
    );
};

const Supporters = () => {
    let groups = [];
    let SPONSOR_COLOR = { "platinum_sponsor": "#e5e4e2", "gold_sponsor": "#ffd700", "silver_sponsor": "#c0c0c0", "bronze_sponsor": "#cd7f32", "server_booster": "#f47fff" };
    let tiers = ["platinum", "gold", "silver", "bronze"];

    let group = [];
    for (let i = 0; i < tiers.length; i++) {
        group = [];
        for (let j = 0; j < vars.patrons[tiers[i]].length; j++) {
            group.push({ "name": vars.patrons[tiers[i]][j].name, "avatar": vars.patrons[tiers[i]][j].avatar });
        }
        if (group.length !== 0) {
            groups.push({ "group": tiers[i].charAt(0).toUpperCase() + tiers[i].slice(1) + " Sponsor" + ((group.length > 1) ? "s" : ""), "color": SPONSOR_COLOR[tiers[i] + "_sponsor"], "users": group });
        }
    }

    group = [];
    for (let j = 0; j < vars.specialRoles["server_booster"].length; j++) {
        let avatar = vars.specialRoles["server_booster"][j].avatar;
        if (avatar === null) {
            avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        } else if (avatar.startsWith("a_")) {
            avatar = `https://cdn.discordapp.com/avatars/${vars.specialRoles["server_booster"][j].id}/${avatar}.gif`;
        } else {
            avatar = `https://cdn.discordapp.com/avatars/${vars.specialRoles["server_booster"][j].id}/${avatar}.png`;
        }
        group.push({ "name": vars.specialRoles["server_booster"][j].name, "avatar": avatar });
    }
    if (group.length !== 0) {
        groups.push({ "group": "Discord Booster" + ((group.length > 1) ? "s" : ""), "color": SPONSOR_COLOR["server_booster"], "users": group });
    }

    return (<div style={{ width: "100%" }}>
        <Card>
            <CardHeader
                title="Appreciation Wall"
                subheader={<>Supporters fueling Our Journey with Generosity</>}
                titleTypographyProps={{ align: 'center', mb: "10px" }}
                subheaderTypographyProps={{ align: 'center' }}
            />
        </Card>
        {groups.map((group) => (<div key={group.group}>
            <Typography variant="h5" align="center" sx={{ margin: '16px 0' }}>
                <b style={group.color !== undefined ? { color: group.color } : {}}>{group.group}</b>
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Grid container spacing={2} justifyContent="center">
                    {group.users.map((user, index) => (
                        <Grid item key={`${group.group}-${index}`} xs={6} sm={6} md={4} lg={2} sx={{ minWidth: 150 }}>
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

export default Supporters;