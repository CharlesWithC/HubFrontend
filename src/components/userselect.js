import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';
import { customSelectStyles } from '../designs';

var vars = require("../variables");

const UserSelect = ({ label, users, onUpdate, isMulti = true, includeCompany = false, includeBlackhole = false, limit = undefined, style = {} }) => {
    const [memberMap, setMemberMap] = useState({});
    const [options, setOptions] = useState([]);

    useEffect(() => {
        let memberMap = {};
        memberMap[-1000] = { userid: -1000, name: vars.dhconfig.name };
        memberMap[-1005] = { userid: -1005, name: "Blackhole" };
        for (let i = 0; i < vars.members.length; i++) {
            memberMap[vars.members[i].userid] = vars.members[i];
        }
        setMemberMap(memberMap);

        let options = vars.members.map((user) => ({ value: user.userid, label: user.name }));
        if (includeCompany) {
            options.unshift({ value: -1000, label: vars.dhconfig.name });
        }
        if (includeBlackhole) {
            options.unshift({ value: -1005, label: "Blackhole" });
        }
        setOptions(options);
    }, []);

    const [selectedUsers, setSelectedUsers] = useState([]);
    useEffect(() => {
        let formattedInit = [];
        for (let i = 0; i < users.length; i++) {
            formattedInit.push({ value: users[i].userid, label: users[i].name });
        }
        if (selectedUsers !== formattedInit) {
            setSelectedUsers(formattedInit);
        }
    }, [users, selectedUsers]);

    const handleInputChange = (val) => {
        if (limit !== undefined && limit > 0 && !isNaN(limit)) val = val.splice(0, limit);
        setSelectedUsers(val);
        if (isMulti) onUpdate(val.map((item) => (memberMap[item.value])));
        else onUpdate(memberMap[val.value]);
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
            />
        </div>
    );
};

export default UserSelect;
