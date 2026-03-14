#!/bin/bash

# update ./build/ for electron-based release

# ensure assets are directly under /static (i.e. not a cdn domain)
sed -i "s|$ASSETS_BASE/static|/static|g" ./build/index.html
sed -i "s|$ASSETS_BASE/static|/static|g" ./build/manifest.json

cp "./public/electron.js" "./build/electron.js"
cp "./public/preload.js" "./build/preload.js"
cp "./public/logo.png" "./build/logo.png"