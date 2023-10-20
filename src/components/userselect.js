import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';
import { customSelectStyles } from '../designs';

var vars = require("../variables");

const UserSelect = ({ label, initialUsers, onUpdate, isMulti = true, includeCompany = false, includeBlackhole = false }) => {
    let formattedInit = [];
    for (let i = 0; i < initialUsers.length; i++) {
        formattedInit.push({ value: initialUsers[i].userid, label: initialUsers[i].name });
    }
    let memberMap = {};
    memberMap[-1000] = { userid: -1000, name: vars.dhconfig.name };
    memberMap[-1005] = { userid: -1005, name: "Blackhole" };
    for (let i = 0; i < vars.members.length; i++) {
        memberMap[vars.members[i].userid] = vars.members[i];
    }

    let options = vars.members.map((user) => ({ value: user.userid, label: user.name }));
    if (includeCompany) {
        options.unshift({ value: -1000, label: vars.dhconfig.name });
    }
    if (includeBlackhole) {
        options.unshift({ value: -1005, label: "Blackhole" });
    }

    const [selectedUsers, setSelectedUsers] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        setSelectedUsers(val);
        if (isMulti) onUpdate(val.map((item) => (memberMap[item.value])));
        else onUpdate(memberMap[val.value]);
    };

    const theme = useTheme();

    return (
        <>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
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
        </>
    );
};

export default UserSelect;
