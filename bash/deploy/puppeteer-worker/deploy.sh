#!/bin/bash

set -e

source "$(dirname "$0")/build.env"

docker tag $IMAGE_NAME:$TAG $IMAGE_URL
docker push $IMAGE_URL

gcloud run deploy $SERVICE \
    --image $IMAGE_URL \
    --no-allow-unauthenticated \
    --invoker-iam-check \
    --concurrency 20 \
    --description "Puppeteer worker for Templetto" \
    --max-instances 1 \
    --min-instances 0 \
    --region europe-west3 \
    --timeout "3m" \
    --cpu 1 \
    --memory 4Gi \
    --port 3001 \
    --cpu-boost \
    --execution-environment gen1 \
    --env-vars-file "$(dirname "$0")/runtime.env"
    # --ingress internal
