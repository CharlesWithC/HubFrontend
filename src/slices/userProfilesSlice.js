// This slice stores all profile data in an object uid=>data
// Only intended for caching purpose when displaying user profile

// NOTE: Partial data update is allowed

import { createSlice } from "@reduxjs/toolkit";

export const userProfilesSlice = createSlice({
    name: 'userProfiles',
    initialState: {},
    reducers: {
        update: (state, action) => {
            const { uid, data } = action.payload;
            if (isNaN(uid)) return;
            state[uid] = { tmpLastOnline: null, chartStats: null, overallStats: null, detailStats: null, pointStats: null, dlogList: null, dlogTotalItems: 0, dlogPage: 1, dlogPageSize: 10, ...state[uid], ...data, expiry: +new Date() + 600000 }; // data may be a reference that shouldn't be immutable
        }
    }
});

export const { update } = userProfilesSlice.actions;

export const selectUserProfiles = (state) => state.userProfiles;
export const selectUserProfileById = (uid) => (state) => state.userProfiles[uid];

export default userProfilesSlice.reducer;