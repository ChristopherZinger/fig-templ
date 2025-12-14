#!/bin/basho

set -e

echo "Building and deploying server"
"$(dirname "$0")/build.sh"

echo "Deploying puppeteer worker"
bash "$(dirname "$0")/puppeteer-worker/deploy.sh"

echo "Deploying REST server"
bash "$(dirname "$0")/rest-server/deploy.sh"

echo "Deploying starter app"
bash "$(dirname "$0")/webapp/deploy.sh"

exit 0