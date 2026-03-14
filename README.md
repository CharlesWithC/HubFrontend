# Drivers Hub: Frontend

```text
    ____       _                         __  __      __  
   / __ \_____(_)   _____  __________   / / / /_  __/ /_   
  / / / / ___/ / | / / _ \/ ___/ ___/  / /_/ / / / / __ \  
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /  
/_____/_/  /_/ |___/\___/_/  /____/  /_/ /_/\__,_/_.___/  

```

An advanced Drivers Hub solution for Euro Truck Simulator 2 / American Truck Simulator VTCs.

## About

This is a working demonstration of a web client for the Drivers Hub.

As it is built by a backend developer obliged to work on frontend, the codebase is relatively messy and fragile.

Due to multi-hub support and past monetization attempts, the codebase also involves various features limited to privileged users. These features are being removed or transformed to better suit an open-source project.

Nevertheless, everything works just fine and directly out of the box with the backend server.

## Features

Most of the features provided by backend are supported. See [drivershub.charlws.com](https://drivershub.charlws.com/features) for more information.

Additional features - these are implemented with non-standard approaches or without direct backend support:

- [announcement/downloads/poll] Add `[Image src="{link}" loc="left|right"]` (\*case-sensitive) to the beginning of content/description to show an image banner for an announcement / downloadablt item.  
- [event] Add `[Image src="{link}"]` (\*case-sensitive) to the beginning of description to show an image heading for an event.
- [display] VTC Background image  
- [display] VTC Theme & Name Color
- [gallery] Gallery

More additional features - these are implemented by using api endpoints in creative ways:

- Auto import mulitple trucky jobs
- Sync member profiles
- Compare TruckersMP Members
- Batch update tracker
- Batch update roles
- Batch dismiss members
- Prune users
- Advanced form builder

Electron client features:

- Not affected by downtime of frontend server
- Local static files / No need to request it every time on load
- Switch Drivers Hub
- OAuth login with default browser
- Custom build (icon / locked domain)
- Discord Rich Presence
  - VTC Logo will be used as large image / CHub Logo will be used as small image
  - For default RPC
    - `Powered by CHub` will be used as second button
  - For custom RPC
    - Set `discordClientID` in `electron-config.json` and `build-electron/config.json`
    - There will not be a second button
- Desktop Notifications

## Getting Started

### Prerequisite

- Node v25.8.0

**Note**: Any modern version should work.

### Update Environment Variables

```properties
# .env

# whether to use multihub
VITE_USE_MULTIHUB=false|true

# if using multihub, the discovery endpoint must accept 'domain' param, and return client config
VITE_MULTIHUB_DISCOVERY=

# if not using multihub, provide the url to fetch client config
# https://github.com/CharlesWithC/HubBackend/blob/main/src/external_plugins/client-config.py
VITE_CONFIG_URL=https://<domain>/<prefix>/client/config/global
```

### Development Mode

```bash
# install dependencies
npm ci

# launch the server
npm run dev
```

### Production Mode

```bash
# build the code
npm run build

# distribute the code
rsync ...
```

## Resources

- [HubBackend](https://github.com/CharlesWithC/HubBackend) provides information on backend design and api documentation
- [wiki.charlws.com](https://wiki.charlws.com/shelves/drivers-hub) provides some (possibly outdated) information on using the drivers hub

## License

This repository is licensed under the GNU Affero General Public License v3.0.  

Copyright &copy; 2022-2026 [CharlesWithC](https://charlws.com)
