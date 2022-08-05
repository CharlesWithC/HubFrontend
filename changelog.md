# Changelog

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
