#!/bin/bash

# convert ./build/ to electron app friendly format

sed -i "s|https://cdn.chub.page/static|/static|g" ./build/index.html
sed -i "s|https://cdn.chub.page/static|/static|g" ./build/manifest.json

cp "./public/electron.js" "./build/electron.js"
cp "./public/preload.js" "./build/preload.js"
cp "./public/logo.png" "./build/logo.png"