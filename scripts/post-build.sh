#!/bin/bash

replacement="https://cdn.chub.page/beta/static"

# Replace "/beta/static" with the specified URL in index.html
sed -i "s|/beta/static|$replacement|g" ./build/index.html

# Replace "/beta/static" with the specified URL in asset-manifest.json
sed -i "s|/beta/static|$replacement|g" ./build/asset-manifest.json

find ./build -type f -name '*.map' -exec rm {} \;