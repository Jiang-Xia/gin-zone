#!/bin/sh
set -e

cd server go tidy mod
cd admin yarn
cd client npm install