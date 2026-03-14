#!/bin/bash

# update ./build/ for browser-based release

# ensure assets are directly under /static
# this may do nothing but acts as a safety guard
sed -i "s|$ASSETS_BASE/static|/static|g" ./build/index.html
sed -i "s|$ASSETS_BASE/static|/static|g" ./build/manifest.json
# this ensures ASSETS_BASE is used for assets
sed -i "s|/static|$ASSETS_BASE/static|g" ./build/index.html
sed -i "s|/static|$ASSETS_BASE/static|g" ./build/manifest.json

rm -f ./build/electron.js
rm -f ./build/preload.js
rm -f ./build/electron-config.json