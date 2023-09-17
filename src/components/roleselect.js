import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';

var vars = require("../variables");

const customStyles = (theme) => ({
    control: (base) => ({
        ...base,
        backgroundColor: theme.palette.text.primary,
        borderColor: theme.palette.text.secondary
    }),
    option: (base) => ({
        ...base,
        color: theme.palette.background.default
    }),
    menu: (base) => ({
        ...base,
        zIndex: 100005,
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

const RoleSelect = ({ label, initialRoles, onUpdate }) => {
    let userHighestRole = undefined;
    let roleIds = Object.keys(vars.roles);
    for (let i = 0; i < roleIds.length; i++) {
        if (userHighestRole === undefined || vars.roles[roleIds[i]].order_id < userHighestRole) {
            userHighestRole = vars.roles[roleIds[i]].order_id;
        }
    }

    let formattedInit = [];
    for (let i = 0; i < initialRoles.length; i++) {
        formattedInit.push({ value: initialRoles[i], label: vars.roles[initialRoles[i]].name, orderId: vars.roles[initialRoles[i]].order_id, isFixed: vars.roles[initialRoles[i]].order_id <= userHighestRole });
    }

    const [selectedRoles, setSelectedRoles] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        setSelectedRoles(val
            .sort((roleA, roleB) => roleA.orderId - roleB.orderId));
        onUpdate(val.map((item) => (vars.roles[item.value])));
    };

    const theme = useTheme();

    return (
        <div>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
                isMulti
                name="colors"
                options={roleIds
                    .filter((roleId) => vars.roles[roleId].order_id > userHighestRole)
                    .map((roleId) => ({
                        value: roleId,
                        label: vars.roles[roleId].name,
                        orderId: vars.roles[roleId].order_id,
                    }))}
                isClearable={selectedRoles.some((v) => !v.isFixed)}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customStyles(theme)}
                value={selectedRoles}
                onChange={handleInputChange}
                menuPortalTarget={document.body}
            />
        </div>
    );
};

export default RoleSelect;
