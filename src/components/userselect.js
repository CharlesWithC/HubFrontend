import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import Select, { components } from 'react-select';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { customSelectStyles } from '../designs';

const UserSelect = ({ label, users, onUpdate, isMulti = true, includeCompany = false, includeBlackhole = false, limit = undefined, style = {}, userList = undefined, disabled = false, allowSelectAll = false }) => {
    const { t: tr } = useTranslation();
    const { webConfig, users: cachedUsers, memberUIDs } = useContext(AppContext);
    const theme = useTheme();

    userList = (userList !== undefined ? userList : memberUIDs.map((uid) => cachedUsers[uid]));

    const memberMap = useMemo(() => {
        const result = {};
        result[-1000] = { userid: -1000, name: webConfig.name };
        result[-1005] = { userid: -1005, name: tr("blackhole") };
        for (let i = 0; i < userList.length; i++) {
            result[userList[i].userid !== null ? userList[i].userid : userList[i].uid] = userList[i];
        }
        return result;
    }, [webConfig, userList]);

    const options = useMemo(() => {
        const result = userList.map((user) => ({ value: user.userid !== null ? user.userid : user.uid, label: `${user.name} (${user.userid !== null ? user.userid : `UID: ${user.uid}`})` }));
        if (includeCompany) {
            result.unshift({ value: -1000, label: webConfig.name });
        }
        if (includeBlackhole) {
            result.unshift({ value: -1005, label: tr("blackhole") });
        }
        return result;
    }, [userList, includeCompany, includeBlackhole]);

    const [selectedUsers, setSelectedUsers] = useState([]);
    useEffect(() => {
        let formattedInit = [];
        for (let i = 0; i < users.length; i++) {
            if (users[i] === undefined || users[i].userid === undefined) continue;
            formattedInit.push({ value: users[i].userid !== null ? users[i].userid : users[i].uid, label: `${memberMap[users[i].userid].name} ${(users[i].userid === null || users[i].userid >= 0) ? `(${users[i].userid !== null ? users[i].userid : `UID: ${users[i].uid}`})` : ``}` });
        }
        if (selectedUsers !== formattedInit) {
            setSelectedUsers(formattedInit);
        }
    }, [users, memberMap]);

    const handleInputChange = useCallback((val) => {
        if (limit !== undefined && limit > 0 && !isNaN(limit)) val = val.splice(0, limit);
        setSelectedUsers(val);
        if (isMulti) onUpdate(val.map((item) => (memberMap[item.value])));
        else onUpdate(memberMap[val.value]);
    }, [memberMap]);

    const handleSelectAll = useCallback(() => {
        setSelectedUsers(options);
        onUpdate(options.map((item) => (memberMap[item.value])));
    }, [memberMap]);

    const DropdownIndicator = props => {
        return (
            components.DropdownIndicator && (
                <components.DropdownIndicator {...props}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <components.DownChevron {...props} />
                        {allowSelectAll && <FontAwesomeIcon icon={faCheckSquare} onClick={handleSelectAll} style={{ marginLeft: "5px" }} />}
                    </div>
                </components.DropdownIndicator>
            )
        );
    };

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
                components={{ DropdownIndicator }}
            />
        </div>
    );
};

export default UserSelect;
