import { useState, useEffect, useContext, useMemo } from 'react';
import { AppContext } from '../context';

import { Typography, useTheme } from '@mui/material';
import Select from 'react-select';
import { customSelectStyles } from '../designs';

import { checkUserPerm } from '../functions';

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

const RoleSelect = ({ label, initialRoles, onUpdate, isMulti = true, style = {} }) => {
    const { curUser, curUserPerm, divisions, loadDivisions } = useContext(AppContext);
    const theme = useTheme();

    let roleIds = Object.keys(vars.roles);
    const userHighestRole = useMemo(() => {
        let highestRole = undefined;
        for (let i = 0; i < curUser.roles.length; i++) {
            if (highestRole === undefined || getRole(curUser.roles[i]).order_id < highestRole) {
                highestRole = getRole(curUser.roles[i]).order_id;
            }
        }
        return highestRole;
    }, [curUser.roles]);

    let [divisionRoles, setDivisionRoles] = useState([]);
    useEffect(() => {
        async function loadDivisionRoles() {
            let localDivisions = divisions;
            if (divisions === null) {
                localDivisions = await loadDivisions();
            }

            const divisionRoles = [];
            let divisionIds = Object.keys(localDivisions);
            for (let i = 0; i < divisionIds.length; i++) {
                divisionRoles.push(localDivisions[divisionIds[i]].role_id);
            }
            setDivisionRoles(divisionRoles);
        }
        loadDivisionRoles();
    }, [divisions]);
    let divisionOnly = useMemo(() => (checkUserPerm(curUserPerm, ["division"]) && !checkUserPerm(curUserPerm, ["administrator", "update_roles"])), [curUserPerm]);

    const formattedInit = useMemo(() => {
        let result = [];
        for (let i = 0; i < initialRoles.length; i++) {
            result.push({
                value: initialRoles[i],
                label: getRole(initialRoles[i]).name,
                orderId: getRole(initialRoles[i]).order_id,
                isFixed: !divisionOnly ? getRole(initialRoles[i]).order_id <= userHighestRole : !divisionRoles.includes(initialRoles[i])
            });
        }
        return result;
    }, [initialRoles, divisionOnly, userHighestRole, divisionRoles]);

    const [selectedRoles, setSelectedRoles] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        if (isMulti) {
            setSelectedRoles(val
                .sort((roleA, roleB) => roleA.orderId - roleB.orderId));
            onUpdate(val.map((item) => (vars.roles[item.value])));
        }
        else {
            setSelectedRoles([val]);
            onUpdate(val.value);
        }
    };

    return (
        <div style={style}>
            {label && <Typography variant="body2">{label}</Typography>}
            <Select
                defaultValue={formattedInit}
                isMulti={isMulti}
                name="colors"
                options={roleIds
                    .filter((roleId) => !divisionOnly ? getRole(roleId).order_id > userHighestRole : divisionRoles.includes(roleId))
                    .map((roleId) => ({
                        value: parseInt(roleId),
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
