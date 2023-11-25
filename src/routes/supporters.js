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
    // if (vars.supportersTabCache !== undefined) {
    //     return vars.supportersTabCache;
    // }
    let supporters = vars.specialRoles;
    let supporterRoles = Object.keys(supporters);

    let groups = [];
    let SPONSOR_COLOR = { "platinum_sponsor": "#e5e4e2", "gold_sponsor": "#ffd700", "silver_sponsor": "#c0c0c0", "bronze_sponsor": "#cd7f32", "server_booster": "#f47fff" };
    let SPONSOR_NAME = { "platinum_sponsor": "Platinum Sponsor", "gold_sponsor": "Gold Sponsor", "silver_sponsor": "Silver Sponsor", "bronze_sponsor": "Bronze Sponsor", "server_booster": "Server Booster" };
    for (let i = 0; i < supporterRoles.length; i++) {
        let role = supporterRoles[i];
        if (!["platinum_sponsor", "gold_sponsor", "silver_sponsor", "bronze_sponsor", "server_booster"].includes(role)) {
            continue;
        }
        let group = [];
        for (let j = 0; j < supporters[role].length; j++) {
            let avatar = supporters[role][j].avatar;
            if (avatar === null) {
                avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
            } else if (avatar.startsWith("a_")) {
                avatar = `https://cdn.discordapp.com/avatars/${supporters[role][j].id}/${avatar}.gif`;
            } else {
                avatar = `https://cdn.discordapp.com/avatars/${supporters[role][j].id}/${avatar}.png`;
            }
            group.push({ "name": supporters[role][j].name, "discordid": supporters[role][j].id, "avatar": avatar });
        }
        if (group.length !== 0) {
            groups.push({ "group": SPONSOR_NAME[role], "color": SPONSOR_COLOR[role], "users": group });
        }
    }

    vars.supportersTabCache = (<div style={{ width: "100%" }}>
        <Card>
            <CardHeader
                title="Supporters"
                subheader={<>Fueling Our Journey with Generosity</>}
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
                    {group.users.map((user) => (
                        <Grid item key={`${group.group}-${user.discordid}`} xs={6} sm={6} md={4} lg={2} sx={{ minWidth: 150 }}>
                            <LargeUserCard user={user} />
                        </Grid>
                    ))}
                </Grid>
            </div >
        </div>
        ))
        }
    </div >);
    return vars.supportersTabCache;
};

export default Supporters;