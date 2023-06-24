import { Avatar, Chip } from "@mui/material";
import { Link } from "react-router-dom";

var vars = require("../variables");

const UserCard = (props) => {
    let { userid, discordid, name, avatar, size, inline, useChip } = { userid: 0, discordid: 0, name: "", avatar: "", size: "20", inline: false, useChip: false };
    if (props.user !== undefined) {
        ({ userid, discordid, name, avatar } = props.user);
        ({ size, inline, useChip } = props);
    } else {
        ({ userid, discordid, name, avatar, size, inline, useChip } = props);
    }

    if (size === undefined) {
        size = "20";
    }

    let specialColor = null;
    if (Object.keys(vars.specialRoles).includes(discordid)) {
        specialColor = vars.specialRoles[discordid];
    }

    return (
        <Link to={`/member/${userid}`} style={{ flexGrow: 1, display: !inline ? 'flex' : null, alignItems: "center" }}>
            {!useChip && <>
                <img src={avatar}
                    style={{
                        borderRadius: "100%",
                        height: `${size}px`,
                        verticalAlign: "middle"
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = vars.dhlogo;
                    }}
                    alt={name} />
                &nbsp;&nbsp;
                {specialColor === null && name}
                {specialColor !== null && <span style={{ color: specialColor }}>{name}</span>}
            </>}
            {useChip && <>
                <Chip
                    avatar={<Avatar alt={name} src={avatar} />}
                    label={name}
                    variant="outlined"
                    sx={{ margin: "3px", cursor: "pointer", ...specialColor !== null ? { color: specialColor } : {} }}
                />
            </>}
        </Link>
    )
}

export default UserCard;