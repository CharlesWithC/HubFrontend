#!/bin/bash

sed -i "s|/static|https://cdn.chub.page/static|g" ./build/index.html
sed -i "s|/static|https://cdn.chub.page/static|g" ./build/asset-manifest.json

rm -f ./build/electron.js
rm -f ./build/preload.js
rm -f ./build/logo.png