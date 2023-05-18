import { Link } from "react-router-dom";
import { Typography } from '@mui/material';

var vars = require("../variables");

const UserCard = (props) => {
    let { userid, name, avatar } = { userid: 0, name: "", avatar: "" };
    if (props.user !== undefined) {
        ({ userid, name, avatar } = props.user);
    } else {
        ({ userid, name, avatar } = props);
    }

    return (
        <Typography component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
            <Link to={`/member/${userid}`}>
                <img src={avatar}
                    style={{
                        borderRadius: "100%",
                        height: "20px",
                        verticalAlign: "middle"
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = vars.dhlogo;
                    }}
                    alt={name} />
                &nbsp;&nbsp;
                {name}
            </Link>
        </Typography>
    )
}

export default UserCard;