import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Select, { components } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { customSelectStyles } from "../designs";
var vars = require("../variables");
const UserSelect = ({
    label,
    users,
    onUpdate,
    isMulti = true,
    includeCompany = false,
    includeBlackhole = false,
    limit = undefined,
    style = {},
    userList = undefined,
    disabled = false,
    allowSelectAll = false,
}) => {
    const { t: tr } = useTranslation();
    const [memberMap, setMemberMap] = useState({});
    const [options, setOptions] = useState([]);
    userList = userList !== undefined ? userList : vars.members;
    useEffect(() => {
        let memberMap = {};
        memberMap[-1000] = {
            userid: -1000,
            name: vars.dhconfig.name,
        };
        memberMap[-1005] = {
            userid: -1005,
            name: tr("blackhole"),
        };
        for (let i = 0; i < userList.length; i++) {
            memberMap[userList[i].userid !== null ? userList[i].userid : userList[i].uid] = userList[i];
        }
        setMemberMap(memberMap);
        let options = userList.map((user) => ({
            value: user.userid !== null ? user.userid : user.uid,
            label: `${user.name} (${user.userid !== null ? user.userid : `UID: ${user.uid}`})`,
        }));
        if (includeCompany) {
            options.unshift({
                value: -1000,
                label: vars.dhconfig.name,
            });
        }
        if (includeBlackhole) {
            options.unshift({
                value: -1005,
                label: tr("blackhole"),
            });
        }
        setOptions(options);
    }, []);
    const [selectedUsers, setSelectedUsers] = useState([]);
    useEffect(() => {
        let formattedInit = [];
        for (let i = 0; i < users.length; i++) {
            formattedInit.push({
                value: users[i].userid !== null ? users[i].userid : users[i].uid,
                label: `${users[i].name} (${users[i].userid !== null ? users[i].userid : `UID: ${users[i].uid}`})`,
            });
        }
        if (selectedUsers !== formattedInit) {
            setSelectedUsers(formattedInit);
        }
    }, [users, selectedUsers]);
    const handleInputChange = (val) => {
        if (limit !== undefined && limit > 0 && !isNaN(limit)) val = val.splice(0, limit);
        setSelectedUsers(val);
        if (isMulti) onUpdate(val.map((item) => memberMap[item.value]));
        else onUpdate(memberMap[val.value]);
    };
    const handleSelectAll = () => {
        setSelectedUsers(options);
        onUpdate(options.map((item) => memberMap[item.value]));
    };
    const DropdownIndicator = (props) => {
        return (
            components.DropdownIndicator && (
                <components.DropdownIndicator {...props}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <components.DownChevron {...props} />
                        {allowSelectAll && (
                            <FontAwesomeIcon
                                icon={faCheckSquare}
                                onClick={handleSelectAll}
                                style={{
                                    marginLeft: "5px",
                                }}
                            />
                        )}
                    </div>
                </components.DropdownIndicator>
            )
        );
    };
    const theme = useTheme();
    return (
        <div style={style}>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                isMulti={isMulti}
                name="colors"
                options={options}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={selectedUsers}
                onChange={handleInputChange}
                menuPortalTarget={document.body}
                isDisabled={disabled}
                components={{
                    DropdownIndicator,
                }}
            />
        </div>
    );
};
export default UserSelect;
