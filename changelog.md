# Changelog

## v3.2.0

1. Added batch role update (advanced staff function)
2. Added batch tracker update (advanced staff function)
3. Added batch dismiss member (advanced staff function)
4. Added prune users (advanced staff function)

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
