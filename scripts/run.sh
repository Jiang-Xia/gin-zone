#!/bin/sh

set -e

cd server
go run main.go;
cd -

cd admin
yarn start
cd -

echo "✅ running"
