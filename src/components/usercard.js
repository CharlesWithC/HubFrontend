import { Avatar, Chip } from "@mui/material";
import { Link } from "react-router-dom";

var vars = require("../variables");

const UserCard = (props) => {
    let { userid, discordid, name, avatar, size, inline, useChip, onDelete, noLink, key, style } = { userid: 0, discordid: 0, name: "", avatar: "", size: "20", inline: false, useChip: false, onDelete: null, noLink: false, key: null, style: {} };
    if (props.user !== undefined) {
        ({ userid, discordid, name, avatar } = props.user);
        ({ size, inline, useChip, onDelete, noLink, key, style } = props);
    } else {
        ({ userid, discordid, name, avatar, size, inline, useChip, onDelete, noLink, key, style } = props);
    }

    if (size === undefined) {
        size = "20";
    }

    let specialColor = null;
    if (Object.keys(vars.specialRoles).includes(discordid)) {
        specialColor = vars.specialRoles[discordid];
    }

    let content = <>
        {!useChip && <>
            <Avatar src={avatar}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    verticalAlign: "middle",
                    display: "inline-flex"
                }} />
            &nbsp;
            {specialColor === null && <span style={{ whiteSpace: "nowrap" }}>{name}</span>}
            {specialColor !== null && <span style={{ whiteSpace: "nowrap", color: specialColor }}>{name}</span>}
        </>}
        {useChip && <>
            <Chip
                key={key}
                avatar={<Avatar alt={name} src={avatar} />}
                label={name}
                variant="outlined"
                sx={{ margin: "3px", cursor: "pointer", ...specialColor !== null ? { color: specialColor } : {}, ...style }}
                onDelete={onDelete}
            />
        </>}
    </>;

    if (noLink) return <div style={{ flexGrow: 1, whiteSpace: inline ? null : 'nowrap', alignItems: "center" }}>{content}</div>;

    return (
        <Link to={`'/beta/member/${userid}`} style={{ flexGrow: 1, whiteSpace: inline ? null : 'nowrap', alignItems: "center" }}>
            {content}
        </Link>
    );
};

export default UserCard;