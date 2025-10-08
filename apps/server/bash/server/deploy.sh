#!/bin/bash

set -e

source "$(dirname "$0")/build.env"

docker tag $IMAGE_NAME:$TAG $IMAGE_URL
docker push $IMAGE_URL

gcloud run deploy $SERVICE \
    --image $IMAGE_URL \
    --allow-unauthenticated \
    --concurrency 20 \
    --description "REST server for Templetto" \
    --max-instances 1 \
    --min-instances 0 \
    --region europe-west3 \
    --timeout "3m" \
    --cpu 1 \
    --memory 1Gi \
    --port 3000 \
    --cpu-boost \
    --execution-environment gen2 \
    --ingress all \
    --env-vars-file "$(dirname "$0")/runtime.env"
