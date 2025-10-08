#!/bin/bash

set -e

echo "Building server"
npm run build;

echo "Building docker images"
docker compose build;