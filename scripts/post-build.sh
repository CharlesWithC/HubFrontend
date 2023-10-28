#!/bin/bash

replacement="https://cdn.chub.page/static"

# Replace "/static" with the specified URL in index.html
sed -i "s|/static|$replacement|g" ./build/index.html

# Replace "/static" with the specified URL in asset-manifest.json
sed -i "s|/static|$replacement|g" ./build/asset-manifest.json

find ./build -type f -name '*.map' -exec rm {} \;