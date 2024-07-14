import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AppContext } from '../context';

import { Typography, useTheme } from '@mui/material';
import Select from 'react-select';
import { customSelectStyles } from '../designs';

import { checkUserPerm } from '../functions';

const RoleSelect = ({ label, initialRoles, onUpdate, showAllRoles = false, isMulti = true, style = {} }) => {
    const { allRoles, curUser, curUserPerm, divisions } = useContext(AppContext);
    const theme = useTheme();

    const getRole = useCallback((roleId) => {
        if (allRoles[roleId] !== undefined) {
            return allRoles[roleId];
        } else {
            let roleIds = Object.keys(allRoles);
            let lastRole = roleIds[roleIds.length - 1];
            return { "name": `Unknown Role (${roleId})`, id: roleId, order_id: allRoles[lastRole].order_id + 1 };
        }
    }, [allRoles]);

    let roleIds = Object.keys(allRoles);
    const userHighestRole = useMemo(() => {
        let highestRole = undefined;
        for (let i = 0; i < curUser.roles.length; i++) {
            if (highestRole === undefined || getRole(curUser.roles[i]).order_id < highestRole) {
                highestRole = getRole(curUser.roles[i]).order_id;
            }
        }
        return highestRole;
    }, [curUser.roles]);

    let divisionRoles = useMemo(() => {
        const result = [];
        let divisionIds = Object.keys(divisions);
        for (let i = 0; i < divisionIds.length; i++) {
            result.push(divisions[divisionIds[i]].role_id);
        }

        return result;
    }, [divisions]);
    let divisionOnly = useMemo(() => (checkUserPerm(curUserPerm, ["manage_divisions"]) && !checkUserPerm(curUserPerm, ["administrator", "update_roles"])), [curUserPerm]);

    const formattedInit = useMemo(() => {
        let result = [];
        for (let i = 0; i < initialRoles.length; i++) {
            result.push({
                value: parseInt(initialRoles[i]),
                label: getRole(initialRoles[i]).name,
                orderId: getRole(initialRoles[i]).order_id,
                isFixed: !showAllRoles && (!divisionOnly ? getRole(initialRoles[i]).order_id <= userHighestRole : !divisionRoles.includes(parseInt(initialRoles[i])))
            });
        }
        return result;
    }, [initialRoles, divisionOnly, showAllRoles, userHighestRole, divisionRoles]);

    const [selectedRoles, setSelectedRoles] = useState(formattedInit !== undefined ? formattedInit : []);

    const handleInputChange = (val) => {
        if (isMulti) {
            setSelectedRoles(val
                .sort((roleA, roleB) => roleA.orderId - roleB.orderId));
            onUpdate(val.map((item) => (allRoles[item.value])));
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
                    .map((roleId) => ({
                        value: parseInt(roleId),
                        label: getRole(roleId).name,
                        orderId: getRole(roleId).order_id,
                        isFixed: !showAllRoles && (!divisionOnly ? getRole(roleId).order_id <= userHighestRole : !divisionRoles.includes(parseInt(roleId))),
                        isDisabled: !showAllRoles && (!divisionOnly ? getRole(roleId).order_id <= userHighestRole : !divisionRoles.includes(parseInt(roleId)))
                    }))}
                isClearable={selectedRoles.some((v) => v.isFixed)}
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
