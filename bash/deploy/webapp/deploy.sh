#!/bin/bash

set -eoux pipefail

BUILD_ENV_FILE="$(dirname "$0")/build-combined.env"
echo -e "# local build.env" > "$BUILD_ENV_FILE"
cat "$(dirname "$0")/build.env" >> "$BUILD_ENV_FILE"
echo -e "\n\n# shared build.env" >> "$BUILD_ENV_FILE"
cat "$(dirname "$0")/../build.env" >> "$BUILD_ENV_FILE"
source "$BUILD_ENV_FILE"

export NODE_ENV=production

echo "Deploying webapp to Cloud Run..."
gcloud run deploy $SERVICE \
    --image $IMAGE_URL \
    --allow-unauthenticated \
    --concurrency 80 \
    --description "Web app" \
    --max-instances 1 \
    --min-instances 0 \
    --region europe-west3 \
    --timeout "60s" \
    --cpu 1 \
    --memory 512Mi \
    --port 3000 \
    --cpu-boost \
    --execution-environment gen2 \
    --ingress all \
    --env-vars-file "$(dirname "$0")/runtime.env"

echo "Deployment complete!"
