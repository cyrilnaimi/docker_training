#!/bin/bash

# Get the current Git commit hash (short version)
GIT_COMMIT_HASH=$(git rev-parse --short HEAD)

# Get the app version from package.json
APP_VERSION=$(node -p "require('./package.json').version")

# Define the path to nuxt.config.ts
NUXT_CONFIG_PATH="./nuxt.config.ts"

# Replace placeholders in nuxt.config.ts
# Using | as a delimiter for sed to avoid issues with slashes in paths
sed -i '' "s|__COMMIT_HASH__|$GIT_COMMIT_HASH|g" "$NUXT_CONFIG_PATH"
sed -i '' "s|__APP_VERSION__|$APP_VERSION|g" "$NUXT_CONFIG_PATH"

echo "Updated $NUXT_CONFIG_PATH with version $APP_VERSION and commit hash $GIT_COMMIT_HASH"