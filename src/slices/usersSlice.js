// This slice stores all users in an object uid=>data
// Only intended for caching and local data sync purpose

// NOTE: Partial data update is NOT allowed
// A full user object must be provided

import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
    name: 'users',
    initialState: {},
    reducers: {
        update: (state, action) => {
            const { uid, data } = action.payload;
            if (isNaN(uid)) return;
            state[uid] = JSON.parse(JSON.stringify(data)); // data may contain reference that shouldn't be immutable
        }
    }
});

export const { update } = usersSlice.actions;

export const selectUsers = (state) => state.users;
export const selectUserById = (uid) => (state) => state.users[uid];

export default usersSlice.reducer;