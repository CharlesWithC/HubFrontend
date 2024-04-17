import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AppContext } from '../context';

import { Typography, useTheme } from '@mui/material';
import Select from 'react-select';
import { customSelectStyles } from '../designs';

import { checkUserPerm } from '../functions';

const RoleSelect = ({ label, initialRoles, onUpdate, isMulti = true, style = {} }) => {
    const { allRoles, curUser, curUserPerm, divisions, loadDivisions } = useContext(AppContext);
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
    let divisionOnly = useMemo(() => (checkUserPerm(curUserPerm, ["manage_divisions"]) && !checkUserPerm(curUserPerm, ["administrator", "update_roles"])), [curUserPerm]);

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
                        isFixed: !divisionOnly ? getRole(roleId).order_id <= userHighestRole : !divisionRoles.includes(roleId),
                        isDisabled: !divisionOnly ? getRole(roleId).order_id <= userHighestRole : !divisionRoles.includes(roleId)
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
