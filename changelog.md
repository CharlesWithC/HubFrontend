# Changelog

## TODO

1. Check and remove unnecessary `memo` quote and imports  
2. Merge setSnackbarContent and setSnackbarSeverity, also move things like these to Context API to be handled by root wrapper
3. Optimize "Members" tab to display/re-render data in multiple sections
4. Optimize other pre-loading like member list - make them background loading
5. Optimize memory consumption and performance with useMemo being used correctly
6. Optimize page switch loading with useTransition
7. Dedicated Statistics page for comprehensive chart and statistics information
8. Provide pre-generated list of cities/cargos for Special Guest and Premium Plan
9. Add loading placeholder effect
10. Simplebar for profile popover (brief)
11. Privacy settings
12. Support API config update real-time reflection
13. Add economy transaction list

## v3.4.1

1. Added inputable page number in tables
2. Added debounce in table page change to reduce unnecessary API calls
3. Improved challenge job requirements input (added select with choices)
4. Optimized challenge edit dialog render speed

## v3.4.0

**Breaking changes included in this update replacing `vars.xxx` with Redux store for better state management, making the Drivers Hub a better Single Page Application with less need to refresh to reload data.**

1. Replaced `vars.users` with Context API `users`, and reworked `UserCard` component, thus:
   - Supported user data update sync across components (real-time update)
   - Supported user data cache for faster data display (user profile popover)
   - Improved performance with reduced API calls
   - Removed unnecessary logic to further improve performance
2. Replaced `vars.members` with Context API `memberUIDs`, thus:
   - Reduced memory consumption
   - Supported member info changes across pages
     (Role updates will be reflected in "Members" tab without needing to refresh the page)
   - Supported background loading of members list, reducing the time at initial loading screen  
     (It will load at background and automatically fill relevant data where necessary)
3. Replaced `vars.userInfo` with Context API `curUser`, also added optimization to prevent unnecessary re-renders when `users` change while ensuring `curUser` is updated when it is changed using `setUsers`
4. Replaced `vars.userPerm` with Context API `curUserPerm`, also added automatic `curUserPerm` re-calculation with the roles of `users[curUID]` when `users[curUID]` changes
5. Added permissions display next to roles in profile popover
6. Removed `vars.userDivisionIDs` and made it calculate when needed (only needed in delivery tab)
7. Removed `vars.isLoggedIn` to use `curUID ?= NULL` to determine whether user is logged in
8. Removed `vars.userStats` to get real-time `userDrivenDistance` in challenge tab on tab load
9. Replaced `vars.economy*` with Context API `economyCache`
10. Replaced `vars.userSettings` with Context API `AppContext.userSettings` and `ThemeContext.themeSettings`, thus:
    - Supported real-time reflection of settings updates
    - Improved handling of theme update
11. Replaced `vars.dlogDetails` with Context API `dlogDetailsCache`, also supported background loading
12. Replaced `vars.userBanner` with Context API `curUserBanner`
13. Replaced `vars.apiconfig` with Context API `apiConfig`
14. Replaced `vars.dhconfig` with Context API `webConfig`, also supported real-time reflection of web config update
15. Replaced `vars.allUsers` with Context API `allUsersCache` which is currently only used to purge inactive users
16. Replaced `vars.divisions` with Context API `divisions`
17. Replaced `vars.applicationTypes` with Context API `applicationTypes`
18. Replaced `vars.announcementTypes` with Context API `announcementTypes`
19. Updated detection mechanism of "page changed" to prevent wrong triggers due to Context API
20. Moved loading of `applicationTypes` and `divisions` to "before needed" rather than "on page load"
21. Replaced `vars.languages` with Context API `languages`, also supported background loading for supported languages
22. Replaced `vars.roles` with Context API `allRoles`, also removed `vars.orderedRoles` which is to be calculated in UserCard
23. Replaced `vars.perms` with Context API `allPerms`
24. Replaced `vars.ranks` with Context API `allRanks`
25. Replaced `vars.dhpath` with Context API `apiPath`
26. Replaced `vars.host` with `window.dhhost` (Context API was not used because this variable is mostly static and is defined locally on initial load)
27. Replaced `vars.apiversion` with Context API `apiVersion`
28. Replaced `vars.dhlogo` with Context API `vtcLogo`
29. Replaced `vars.dhbanner` with Context API `vtcBanner`
30. Replaced `vars.dhvtcbg` with Context API `vtcBackground`
31. Replaced `vars.dhcustombg` with Context API `customBackground`
32. Replaced `vars.specialRoles` and `vars.specialRolesMap` with Context API `specialRoles` and `specialUsers`
33. Replaced `vars.patrons` and `vars.userPatreonID` with Context API `patrons` and `curUserPatreonID`
34. Replaced `vars.userConfig` with Context API `userConfig`
35. Replaced `vars.vtc|userLevel` with Context API `vtc|userLevel`

## v3.3.x

1. Added compare truckersmp members (advanced staff function)

## v3.3.0

1. Added translations
2. Added `config.roles[].display_order_id` for client use
   - Does not interfere with `order_id`
   - Smaller is higher
   - Using `order_id` by default
   - -1 is reserved for hiding the role
3. Added Gallery
4. Added Live Map

## v3.2.0

1. Added batch role update (advanced staff function)
2. Added batch tracker update (advanced staff function)
3. Added batch dismiss member (advanced staff function)
4. Added prune users (advanced staff function)
5. Added tab to explain all badges
6. Added custom image background (vtc)
7. Added highest-role-color as name-color (special guest)
8. Added row-per-page settings
9. Added premium features (vtc theme / background)
10. Added patreon integration
11. Completed form-based config
12. Added config cache
13. Added local storage data encryption

## v3.1.0

1. Fixed permission issues on displaying user management buttons
2. Fixed api config editing issues by switching to TextField
3. Added api config editing line / column display
4. Fixed audit log sidebar button not showing for hrm/hr
5. Added crash error page
6. Added tab switching for configuration tab
7. Improved display for MUI Select (replaced with TextField-select)
8. Fixed incorrect user permissions being calculated
9. Fixed user session being revoked upon network error
10. Fixed UserCard re-render issues
11. Added table options for deliveries & leaderboard
12. Added partial form-based api config
13. Fixed datetime-local input issues
14. Added timezone sync to API
15. Fixed UserCard unique key warning (badge)
16. Added customizable display timezone (DateTimeField / getFormattedDate)
17. Added OTP Input when disabling MFA of other users (as required by API)
18. Added "Accepted as driver" option when accepting applications
19. Added table ordering buttons (Deliveries, Challenges, My Applications, All Applications, Member List, External Users, Banned Users)
20. Improved challenge tab
    - Added tooltip over status icon
    - Added ID after company/city/cargo name when updating job requirements
    - Prevented showing default values like -1 when attribute is not set in job requirements
21. Improved application form configuration
    - Added `min_length` attribute for `text`, `textarea`
    - Added `must_input` attribute for `text`, `textarea`, `date`, `datetime`, `number`, `dropdown`, `radio`, `checkbox`
    - Added `min_value` and `max_value` attribute for `number`
    - Added `x_must_be = {"key": "{label}", "value": "..."}` attribute to show field when a certain field has a certain value
22. Added data saver mode
23. Improved color picker
24. Added font size settings (experimental)
25. Added 404 page and redirect no-access tabs to /404
26. Added view member profile with URL (`/member/{userid}`)
27. Added preview profile appearance
28. Fixed table shows data of incorrect page when user changes the page too quickly

## v3.0.0

Initial release of Web Client made with React & MUI
