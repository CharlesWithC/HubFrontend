import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardHeader, CardContent, Typography, Avatar, Grid } from '@mui/material';

const LargeUserCard = ({ user, color }) => {
    const { userSettings } = useContext(AppContext);
    return (
        <Card sx={{ minWidth: 150 }}>
            <Avatar src={!userSettings.data_saver ? user.avatar : ""} sx={{ width: 100, height: 100, margin: 'auto', marginTop: 3, border: `solid ${color}` }} />
            <CardContent>
                <Typography variant="h6" align="center" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                    <span style={{ color: color }}>{user.name}</span>
                </Typography>
            </CardContent>
        </Card>
    );
};

const Supporters = () => {
    const { t: tr } = useTranslation();
    const { specialRoles, patrons } = useContext(AppContext);

    let groups = [];
    let SPONSOR_COLOR = { "platinum_sponsor": "#e5e4e2", "gold_sponsor": "#ffd700", "silver_sponsor": "#c0c0c0", "bronze_sponsor": "#cd7f32", "server_booster": "#f47fff" };
    let tiers = ["platinum", "gold", "silver", "bronze"];

    let group = [];
    for (let i = 0; i < tiers.length; i++) {
        group = [];
        for (let j = 0; j < patrons[tiers[i]].length; j++) {
            group.push({ "name": patrons[tiers[i]][j].name, "avatar": patrons[tiers[i]][j].avatar });
        }
        if (group.length !== 0) {
            groups.push({ "group": tiers[i].charAt(0).toUpperCase() + tiers[i].slice(1) + " " + tr("sponsor") + ((group.length > 1) ? "s" : ""), "color": SPONSOR_COLOR[tiers[i] + "_sponsor"], "users": group });
        }
    }

    group = [];
    for (let j = 0; j < specialRoles["server_booster"].length; j++) {
        let avatar = specialRoles["server_booster"][j].avatar;
        if (avatar === null) {
            avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        } else if (avatar.startsWith("a_")) {
            avatar = `https://cdn.discordapp.com/avatars/${specialRoles["server_booster"][j].id}/${avatar}.gif`;
        } else {
            avatar = `https://cdn.discordapp.com/avatars/${specialRoles["server_booster"][j].id}/${avatar}.png`;
        }
        group.push({ "name": specialRoles["server_booster"][j].name, "avatar": avatar });
    }
    if (group.length !== 0) {
        groups.push({ "group": tr("discord_booster") + ((group.length > 1) ? "s" : ""), "color": SPONSOR_COLOR["server_booster"], "users": group });
    }

    return (
        <div style={{ width: "100%" }}>
            <Card>
                <CardHeader
                    title={tr("appreciation_wall")}
                    subheader={<>{tr("supporters_fueling_our_journey_with_generosity")}</>}
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
                            <Grid
                                key={`${group.group}-${index}`}
                                sx={{ minWidth: 150 }}
                                size={{
                                    xs: 6,
                                    sm: 6,
                                    md: 4,
                                    lg: 2
                                }}>
                                <LargeUserCard user={user} />
                            </Grid>
                        ))}
                    </Grid>
                </div >
            </div>
            ))
            }
        </div >
    );
};

export default Supporters;