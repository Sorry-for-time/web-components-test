#!/bin/sh
echo "start compiling transform"
node -v
tsc -v
tsc -p ./tsconfig.json --watch
