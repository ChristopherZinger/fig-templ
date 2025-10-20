#!/bin/bash

set -eoux pipefail

export NODE_ENV=production
source "$(dirname "$0")/build.env"

pushd ../..
# Build the Docker image
echo "Building Docker image $IMAGE_NAME:$TAG..."
docker build --platform linux/amd64 -f apps/starter-app/Dockerfile -t $IMAGE_NAME:$TAG .

# Tag the image for Google Artifact Registry
echo "Tagging image..."
docker tag $IMAGE_NAME:$TAG $IMAGE_URL

# Push the image to Google Artifact Registry
echo "Pushing image to Artifact Registry..."
docker push $IMAGE_URL

# Deploy to Cloud Run
popd;
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
