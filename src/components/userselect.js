import React, { useState, useRef } from 'react';
import { TextField, Popper, Paper, List, ListItem, ListItemButton } from '@mui/material';

import UserCard from './usercard';

var vars = require("../variables");

const UserSelect = ({ label, initialUsers, onUpdate }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedUsers, setSelectedUsers] = useState(initialUsers !== undefined ? initialUsers : []);
    const [showSelection, setShowSelection] = useState(false);
    const inputRef = useRef(null);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSelection(value !== '');
    };

    const handleUserSelect = (user) => {
        setSelectedUsers([...selectedUsers, user]);
        if (onUpdate !== undefined) {
            onUpdate([...selectedUsers, user]);
        }
        setInputValue('');
        setShowSelection(false);
    };

    const handleUserRemove = (user) => {
        const updatedUsers = selectedUsers.filter((selectedUser) => selectedUser.userid !== user.userid);
        setSelectedUsers(updatedUsers);
        if (onUpdate !== undefined) {
            onUpdate(updatedUsers);
        }
    };

    const renderUserSelection = () => {
        if (!showSelection) {
            return null;
        }

        const lowercaseInput = inputValue.toLowerCase();
        const matchedUsers = vars.members.filter(
            user =>
                (user.name.toLowerCase().includes(lowercaseInput) ||
                    String(user.userid).includes(lowercaseInput)) &&
                !selectedUsers.includes(user)
        ).slice(0, 5);

        return (
            <Popper open={true} anchorEl={inputRef.current} placement="bottom-start" sx={{ zIndex: "10000" }}>
                <Paper>
                    <List>
                        {matchedUsers.map(user => (
                            <ListItem key={user.userid}>
                                <ListItemButton onClick={() => handleUserSelect(user)}>
                                    <UserCard user={user} noLink={true} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </Popper>
        );
    };

    return (
        <>
            <TextField
                label={label !== undefined ? label : "Users"}
                value={inputValue}
                onChange={handleInputChange}
                inputRef={inputRef}
                fullWidth
                InputProps={{
                    startAdornment: (
                        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%', marginBottom: '5px', }}>
                            {selectedUsers.map((user) => (
                                <UserCard
                                    user={user}
                                    key={user.userid}
                                    useChip={true}
                                    noLink={true}
                                    onDelete={() => handleUserRemove(user)}
                                    style={{ marginRight: '5px', marginTop: '5px' }}
                                />
                            ))}
                        </div>
                    ),
                }}
            />
            {renderUserSelection()}
        </>
    );
};

export default UserSelect;
