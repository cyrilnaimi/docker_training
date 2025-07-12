#!/bin/bash

# Get the current Git commit hash
COMMIT_HASH=$(git rev-parse HEAD)

echo "Building Docker images with commit hash: $COMMIT_HASH"

# Build Nuxt.js app
echo "Building nuxt-app..."
docker build --build-arg COMMIT_HASH=$COMMIT_HASH -t nuxt-app:latest ./nuxt-app

# Build Tornado app
echo "Building tornado-app..."
docker build --build-arg COMMIT_HASH=$COMMIT_HASH -t tornado-app:latest ./tornado-app

# Build Angular app
echo "Building angular-app..."
docker build --build-arg COMMIT_HASH=$COMMIT_HASH -t angular-app:latest ./angular-app

echo "Docker images built successfully."

# You can add docker-compose up -d here if you want to deploy immediately after building
# docker-compose up -d
