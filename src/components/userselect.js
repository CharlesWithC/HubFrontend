import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';

var vars = require("../variables");

const customSelectStyles = (theme) => ({
    control: (base) => ({
        ...base,
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.text.secondary
    }),
    option: (base) => ({
        ...base,
        color: '#3c3c3c'
    }),
    menu: (base) => ({
        ...base,
        zIndex: 10005,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 100005
    }),
    multiValue: (base, state) => {
        return state.data.isFixed ? { ...base, backgroundColor: 'gray' } : base;
    },
    multiValueLabel: (base, state) => {
        return state.data.isFixed
            ? { ...base, fontWeight: 'bold', color: 'white', paddingRight: 6 }
            : base;
    },
    multiValueRemove: (base, state) => {
        return state.data.isFixed ? { ...base, display: 'none' } : base;
    },
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
        <>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
                isMulti
                name="colors"
                options={vars.members.map((user) => ({ value: user.userid, label: user.name }
                ))}
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
