#!/bin/sh

set -e

cd server
go mod tidy
cd -

cd admin
yarn
cd -

cd client
npm install
cd -

echo "✅ installed completed"