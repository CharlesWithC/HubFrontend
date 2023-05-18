import { Link } from "react-router-dom";

var vars = require("../variables");

const UserCard = (props) => {
    let { userid, name, avatar, size } = { userid: 0, name: "", avatar: "", size: "20" };
    if (props.user !== undefined) {
        ({ userid, name, avatar } = props.user);
        ({ size } = props);
    } else {
        ({ userid, name, avatar, size } = props);
    }

    if (size === undefined) {
        size = "20";
    }

    return (
        <Link to={`/member/${userid}`} style={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
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
            {name}
        </Link>
    )
}

export default UserCard;