import { configureStore } from '@reduxjs/toolkit';

import usersReducer from './slices/usersSlice';
import userProfilesReducer from './slices/userProfilesSlice';
import memberUIDsSlice from './slices/memberUIDsSlice';

export default configureStore({
    reducer: {
        users: usersReducer,
        userProfiles: userProfilesReducer,
        memberUIDs: memberUIDsSlice
    },
});