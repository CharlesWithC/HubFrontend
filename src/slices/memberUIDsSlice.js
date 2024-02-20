// This slice stores a list of uid of members in an object uid=>data
// Only intended for caching and local data sync purpose

import { createSlice } from "@reduxjs/toolkit";
import { update as usersUpdate } from "./usersSlice";

import { makeRequestsWithAuth } from "../functions";
var vars = require("../variables");

export const memberUIDsSlice = createSlice({
    name: 'memberUIDs',
    initialState: [],
    reducers: {
        set: (state, action) => {
            const uids = action.payload;
            if (!Array.isArray(uids)) return;
            state.length = 0;
            state.push(...uids);
        },
        add: (state, action) => {
            const uid = action.payload;
            if (isNaN(uid)) return;
            if (!state.includes(uid)) state.push(uid);
        },
        remove: (state, action) => {
            const uid = action.payload;
            if (isNaN(uid)) return;
            if (state.includes(uid)) state.pop(uid);
        }
    }
});

export const initMemberUIDs = () => {
    return async (dispatch, getState) => {
        if (getState().memberUIDs.length > 0) return;

        let allMembers = [];

        let [resp] = await makeRequestsWithAuth([`${vars.dhpath}/member/list?page=1&page_size=250`]);
        let totalPages = resp.total_pages;
        allMembers = resp.list;
        if (totalPages > 1) {
            let urlsBatch = [];
            for (let i = 2; i <= totalPages; i++) {
                urlsBatch.push(`${vars.dhpath}/member/list?page=${i}&page_size=250`);
                if (urlsBatch.length === 5 || i === totalPages) {
                    let resps = await makeRequestsWithAuth(urlsBatch);
                    for (let j = 0; j < resps.length; j++) {
                        allMembers.push(...resps[j].list);
                    }
                    urlsBatch = [];
                }
            }
        }

        for (let i = 0; i < allMembers.length; i++) {
            dispatch(usersUpdate({ uid: allMembers[i].uid, data: allMembers[i] }));
        }

        let allMemberUIDs = allMembers.map((member) => member.uid);
        dispatch(memberUIDsSlice.actions.set(allMemberUIDs));
    };
};

export const { add, remove } = memberUIDsSlice.actions;

export const selectMemberUIDs = (state) => state.memberUIDs;

export default memberUIDsSlice.reducer;