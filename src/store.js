import { configureStore } from '@reduxjs/toolkit';

import usersReducer from './slices/usersSlice';
import userProfilesReducer from './slices/userProfilesSlice';

export default configureStore({
    reducer: {
        users: usersReducer,
        userProfiles: userProfilesReducer
    },
});