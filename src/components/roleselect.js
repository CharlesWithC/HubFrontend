import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';
import { checkUserPerm } from '../functions';
import { customSelectStyles } from '../designs';

var vars = require("../variables");

const getRole = (roleId) => {
    if (vars.roles[roleId] !== undefined) {
        return vars.roles[roleId];
    } else {
        let roleIds = Object.keys(vars.roles);
        let lastRole = roleIds[roleIds.length - 1];
        return { "name": `Unknown Role (${roleId})`, id: roleId, order_id: vars.roles[lastRole].order_id + 1 };
    }
};

const RoleSelect = ({ label, initialRoles, onUpdate, style = {} }) => {
    let userHighestRole = undefined;
    let roleIds = Object.keys(vars.roles);
    for (let i = 0; i < vars.userInfo.roles.length; i++) {
        if (userHighestRole === undefined || getRole(vars.userInfo.roles[i]).order_id < userHighestRole) {
            userHighestRole = getRole(vars.userInfo.roles[i]).order_id;
        }
    }

    let divisionRoles = [];
    let divisionIds = Object.keys(vars.divisions);
    for (let i = 0; i < divisionIds.length; i++) {
        divisionRoles.push(vars.divisions[divisionIds[i]].role_id);
    }
    let divisionOnly = false;
    if (checkUserPerm(["division"]) && !checkUserPerm(["administrator", "update_roles"])) {
        divisionOnly = true;
    }

    let formattedInit = [];
    for (let i = 0; i < initialRoles.length; i++) {
        formattedInit.push({ value: initialRoles[i], label: getRole(initialRoles[i]).name, orderId: getRole(initialRoles[i]).order_id, isFixed: !divisionOnly ? getRole(initialRoles[i]).order_id <= userHighestRole : !divisionRoles.includes(initialRoles[i]) });
    }

    const [selectedRoles, setSelectedRoles] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        setSelectedRoles(val
            .sort((roleA, roleB) => roleA.orderId - roleB.orderId));
        onUpdate(val.map((item) => (vars.roles[item.value])));
    };

    const theme = useTheme();

    return (
        <div style={style}>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
                isMulti
                name="colors"
                options={roleIds
                    .filter((roleId) => !divisionOnly ? getRole(roleId).order_id > userHighestRole : divisionRoles.includes(roleId))
                    .map((roleId) => ({
                        value: roleId,
                        label: getRole(roleId).name,
                        orderId: getRole(roleId).order_id,
                        isFixed: !divisionOnly ? getRole(roleId).order_id <= userHighestRole : !divisionRoles.includes(roleId)
                    }))}
                isClearable={selectedRoles.some((v) => !v.isFixed)}
                className="basic-multi-select"
                classNamePrefix="select"
                styles={customSelectStyles(theme)}
                value={selectedRoles}
                onChange={handleInputChange}
                menuPortalTarget={document.body}
            />
        </div>
    );
};

export default RoleSelect;
