#!/bin/basho

set -e

echo "Building and deploying server"
bash/build.sh

echo "Deploying containers"
bash/puppeteer-worker/deploy.sh
bash/server/deploy.sh
