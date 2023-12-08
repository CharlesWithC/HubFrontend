#!/bin/bash

sed -i "s|/static|./static|g" ./build/index.html

css=$(ls ./build/static/css | head -n 1)
sed -i "s|/static|../../static|g" ./build/static/css/$css