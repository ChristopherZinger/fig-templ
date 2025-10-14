#!/bin/bash

set -e

source "$(dirname "$0")/build.env"

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$TAG -f Dockerfile .

# Tag the image for Google Artifact Registry
echo "Tagging image..."
docker tag $IMAGE_NAME:$TAG $IMAGE_URL

# Push the image to Google Artifact Registry
echo "Pushing image to Artifact Registry..."
docker push $IMAGE_URL

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE \
    --image $IMAGE_URL \
    --allow-unauthenticated \
    --concurrency 80 \
    --description "Templetto Starter App - SvelteKit web application" \
    --max-instances 3 \
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
