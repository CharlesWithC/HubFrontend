import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';

var vars = require("../variables");

const customStyles = (theme) => ({
    control: (base, state) => ({
        ...base,
        backgroundColor: theme.palette.text.primary,
        borderColor: theme.palette.text.secondary
    }),
    option: (base, state) => ({
        ...base,
        color: theme.palette.background.default
    }),
    menu: (base) => ({
        ...base,
        zIndex: 10005,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 100005
    }),
});

const UserSelect = ({ label, initialUsers, onUpdate }) => {
    let formattedInit = [];
    for (let i = 0; i < initialUsers.length; i++) {
        formattedInit.push({ value: initialUsers[i].userid, label: initialUsers[i].name });
    }
    let memberMap = {};
    for (let i = 0; i < vars.members.length; i++) {
        memberMap[vars.members[i].userid] = vars.members[i];
    }

    const [selectedUsers, setSelectedUsers] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        setSelectedUsers(val);
        onUpdate(val.map((item) => (memberMap[item.value])));
    };

    const theme = useTheme();

    return (
        <div>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
                isMulti
                name="colors"
                options={vars.members.map((user) => ({ value: user.userid, label: user.name }
                ))}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customStyles(theme)}
                value={selectedUsers}
                onChange={handleInputChange}
                menuPortalTarget={document.body}
            />
        </div>
    );
};

export default UserSelect;
