# Changelog

**v2.6.2**  
Bug fixes on compatability  

**v2.6.1**  
Updated to be mostly compatible with API v2.1.0  

**v2.6.0 (pre-release)**  
Updated to be mostly compatible with API v2.0.0  

**v2.5.7**  
1.Replaced UniSans with OpenSans  
2.Fixed name/role display  
3.Added support to multiple application tokens  
4.Added OAuth function  

**v2.5.6**  
1.Added shortcut button to update division status  
2.Fixed `sigfig` showing `undefined` suffix for number larger than 1e15  
3.Added show / hide password button for login  

**v2.5.5**  
1.Removed lazy load  
2.Downgraded `SimpleBar`  
3.Changed mini leaderboard in overview tab to monthly leaderboard  
4.Changed default order of challenge to by end time  
5.Added filter by role to members tab  
6.Added shortcut button to update application status  
7.Added hidden function to unban user (Ctrl+Alt+U)  

**v2.5.4**  
1.Added TSR Card (Removable)  
-> If you want it back after removing it, Clear Cache in Settings  
2.Removed 2022 Wrapped  

**v2.5.3**  
1.Added pending application count badge  

**v2.5.2**  
1.Updated Turkish Translation  
2.Added application `min-length` attribute  

**v2.5.1**  
1.Added 2022 Wrapped  
2.Added tab title  
3.Changed default chart scale to 360d  

**v2.4.8**  
1.Fixed chart stretching endlessly when resizing window  
2.Fixed user profile tab some title / button not showing text  
3.Added custom time range for statistics chart  
4.Added .ics file export to events  

**v2.4.7**  
0.Changed CDN domain to `cdn.chub.page`  
1.Updated to be compatible with API v1.21.7  
2.Fixed HR cannot ban user  
3.Fixed `RANKING = undefiend` lead to functions stuck  
4.Fixed markdown image overflow  
5.Fixed Web Config Editor (HubFrontend:Extension)  
6.Added refresh username button  

**v2.4.6**  
0.Added nighty release  
1.Fixed the bug that dropup banner does not display on regular / premium plan  
2.Fixed the bug that `'` in string breaks html element  
3.Fixed event description cannot be loaded when editing  
4.Fixed the bug of falling into endless loop of getting `logo.png`  
5.Fixed the issue that 2FA login resets when OTP is invalid occasionally  
6.Reduced the number of `logo.png` requests by saving it into `logob64` (after base64 encode) in memory  
7.Added `/member/@me` as alternative to user's own profile  
8.Added `Clear Cache` button  
9.Added activity parse  
10.Added browser icon in sessions  
11.Added page separator for pending division validation request  
12.Added `Download Default` (if exists) and `Download Current` button to web config editor - Custom Application & Style  
13.Added option to enable Discord & Application notification before submitting application  
14.Added better support to distance-based challenge  
15.Improved challenge status badge  
16.Improved language string table  

**v2.4.5**  
1.Fixed the issue that `<td>` are not in `<tr>`  
2.Fixed profile dropup stuck visible when disabled  
3.*[Downloads]* Fixed downloadable item image overflow  
4.*[Challenge]* Fixed original challenge description not loaded when editing challenge  
5.*[Challenge]* Fixed challenge editing display overwrites city / company  
6.Changed `View / Show Details` to icon  
7.Added separator for `tbody > tr`  
8.Added highlight for user in delivery log and leaderboard list  
9.Added automatic modal destroy on tab switch  
10.Added human-readable language name  
11.Added support to changing frontend language (using cookies in addition to `Accept-Language` header)  
12.*[Member]* Changed "Driver of the X" to consider only `distance` point  
13.*[Dlog]* Added delete delivery function  

**v2.4.4**  
1.*[Announcement]* Fixed announcement editing showing original content  
2.*[Application]* Fixed default application leading to `Answer element not found error`  
3.*[Member]* Fixed non-driver member failing to see pages tabs that get their leaderboard data (partially)  
4.Fixed 500 error with `/api`  
5.*[Member]* Improved caching for `driver-ranks`  
6.*[Member]* Added rank color  
7.*[Downloads]* Integrated downloads editor to each downloadable item  
8.*[Challenge]* Improved UI design for challenge details and added support to recurring challenge  
9.Added API Language Selector  
10.Added `SafeParse` to prevent `JSON.Parse` throwing errors when data is `undefined`  

**v2.4.3**  
1.Fixed Navio Live 0 driver trucking issue  
2.Added Spanish Translation  

**v2.4.2**  
1.Updated to be compatible with API v1.20.2  
2.Added notification settings  
3.Added Russian Translation

**v2.4.1**  
1.Added full translation table  
2.Added `Update Discord ID` option under `Members Tab`  
3.Added `<a>` tag for account info under `Profile Tab`  

**v2.3.2**  
1.Integrated `naviolive.js` to `bundle.js`  
2.Updated config format  
3.Added web config editor  
4.Added `logo_key` and `banner_key` in config to support instant updates (no need to wait to CDN to update)  

**v2.3.1**  
1.Updated to be compatible with API v1.19.4  
2.Added role color  
3.Added **Recent Visitors** table in overview  
4.Added MarkDown Editor  

**v2.2.2**  
1.Added support to hide non-enabled plugins  

**v2.2.1**  
1.Updated to be compatible with API v1.19.2  

**v2.1.1**  
1.Added emoji remover for username  
2.Updated to be compatible with API v1.17.1  

**v1.5.6**  
Added partial MFA support  

**v1.5.5**  
1.Removed Dark Mode transition  
2.Added SimpleBar for menu  
3.Improved svg icons - Genuine FontAwesome  
4.Improved footer  
5.Optimized Loading Bar  
6.Improved member searcher for Assign Roles, Update Member Points, Dismiss  

**v1.5.4**  
1.Fixed staff controls not showing up  
2.Fixed staff positions not showing up  
3.Fixed event details not showing up  
4.Fixed event attendee cannot add new attendee  

**v1.5.3**  
Templatized all tables  

**v1.5.2**  
1.Fixed `LoadCache()` is not called which made entire website not loading  
2.Fixed User Profile does not load  
3.Fixed no notification pops up on update application status  
4.Fixed application type showing `[object]`  
5.Fixed event attendee being `undefined`  
6.Added markdown parser for event description  
7.Added clickable event votes and attendees  
8.Added "X of the month" back  
9.Added Steam Login button  
10.Templatized partial tables  
11.Removed copyrighted.com badge for better visual experience  

**v1.5.1**  
1.Fixed the bug that event details are not loading  
2.Updated endpoint paths / methods to catch up with API v1.13.1  
3.Removed "Steam / TruckersMP Not Bound" notification  
4.Add support to custom application types  
5.Improved code base  

**v1.4.5**  
Updates to catch up with API v1.12.7

**v1.4.4**  
1.Fixed staff application "Agree to terms" not working  
2.Added button to save downloads content  

**v1.4.3**  
1.Added redirect for `/banner/{userid}`  
2.Improved `<a>` text color in dark mode  
3.Added load timeout for `ShowTab` in case errors make loading stop  
4.Added hyper-link for Driver of the Day / Week  
5.Improved imperial unit to support fuel and weight  
6.Added `Request Discord Role` button for `User Statistics`  
7.Fixed `Request Discord Role` stuck at `Working` when role already exists  

**v1.4.2**  
Updates to catch up with API v1.12.2  

**v1.4.1**  
Updates to catch up with API v1.12.1  

**v1.3.6**  
Updates to catch up with API v1.11.3  

**v1.3.5**  
1.Fixed the bug that announcement is sending `test` as message content  
2.Fixed the bug that application content shows corrupted questions when user translate the page  
3.Fixed the bug that default application shows `<?php echo ... ?>`  
4.Improved auto redirect to `/login` when token is invalid  
5.Added option to set custom message content for announcement  
6.Added French Translation  
7.Added `password_login` and `password_login_note` to string table  

**v1.3.4**  
1.Updated note under "Update Member Points"  
2.Updated ETS2 ProMods settings to support latest map  
3.Added redirect from `/apply` to `/submitapp`  
4.Added sessions section in user profile page  
5.Added auto redirect to `/login` if token is invalid  
6.Fixed the bug that url `/member/{id}` is not working  
7.Added support to `/delivery/{id}`  
8.Hided time ranged query for `/dlog/stats` (require clicking "All" to show it)  

**v1.3.3**  
Updated API config wizard to support API v1.11.1

**v1.3.2**  
Added custom style (css)

**v1.3.1**  
Added custom application  

**v1.2.3**  
**Delivery Tab**  
1.Resumed Driver of the Day (Counting from 0:00 UTC instead of using relative -24h calculation)  
2.Added Driver of the Week  
3.Prevented `Export Delivery Table` from showing when user is not logged in as member  
**Home Tab**  
4.Allowed users who haven't logged in to see `Application` section, but redirect them to `/login` when clicked  
5.Added link to `/login` for `ProfileTabBtn` when user is not logged in  
6.Changed `New Drivers` to `New Members`  
7.**Trace The History** - Added option to set `starttime` and `endtime` for `/dlog/stats` query under `Overview` tab

**v1.2.2**  
Updates to catch up to API v1.10.6  

**v1.2.1**  
1.Added support to editing web config  
2.Added better redirect for /images (to drivershub-cdn.charlws.com)  
3.Added frosted-glass effect to login page  

**v1.1.8**  
Finished Administrator - Edit Server Config  

**v1.1.7**  
Updated footer  

**v1.1.6**  
Various bug fixes, including:  

- Application submission error showing "UNHANDLED" even if there's error descriptor in API response  
- Updates to catch up with API v1.10  
- Redirect /images to drivershub-cdn.charlws.com  

**v1.1.5**  
Added telemetry data decoder for v5 (API v1.9.9)  

**v1.1.4**  
Updates to catch up to API v1.9.4  

**v1.1.beta3**  
1.Added `Unbind Account Connection` function  
2.Added `Delete User` function  
3.Added `Export Delivery Log` function  
4.Updated `Failed to receive API response` error to detailed error message  
5.Minor bug fixes  

**v1.1.beta2**  
1.Fixed \<select\> doesn't work with translations  
2.Removed guest login and redirect to /login when user is not logged in (automatic guest login)  

**v1.0.5-beta.1**  
1.Removed "Manager" / "Lead" role name detection for higher role  
2.Updated Profile Page  
3.Added function for admin to change Discord account for users  

**v1.0.4-beta.3**  
1.Updated font  
2.Updated login page title & subtitle  
3.Removed `Detail` button for delivery table and made `ID` clickable to show details  

**v1.0.4-beta.2**  
1.Fixed overview incorrect data display  
2.Added more administrator config fields  

**v1.0.4-beta.1**  
1.Load `.js` plugins based on `enabled_plugins` by `.php`  
2.Fixed leaderboard not showing today's statistics bug  

**v1.0.3**  
1.Added TruckersMP Update Function  
2.Bug fixes

**v1.0.2**  
Bug fixes  

**v1.0.1**  
Bug fixes

**v1.0.0.beta**  
1.Bug fixes  
2.Added admin functions  

**v1.0.0.pre2**  
Restructured code  

**v1.0.0.pre1**  
Basic templatization  
