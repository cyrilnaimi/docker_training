# Nuxt.js Application Documentation

This document provides an exhaustive overview of the Nuxt.js application, its purpose, architecture, and Dockerfile configuration.

## 1. Application Purpose

The `nuxt-app` serves as the primary user-facing frontend for the multi-container proof-of-concept. Its main functionalities include:

*   **User Authentication**: Provides a login interface and handles user registration.
*   **Dashboard Display**: Presents key statistics and allows for their incrementation.
*   **User Management**: Displays a list of registered users.

It interacts with the PostgreSQL database (via the `database` service) for user authentication and dashboard statistics.

## 2. Application Architecture and Key Files

The application is built using the Nuxt.js framework (version 3), leveraging Vue.js for the frontend and Nitro for the server-side API routes.

*   **`app.vue`**: The main entry point for the Nuxt.js application.
*   **`nuxt.config.ts`**: Nuxt.js configuration file, defining modules, build options, and other settings. It includes `@nuxt/ui` for UI components.
*   **`pages/` directory**: Contains the Vue components that define the application's routes:
    *   `pages/index.vue`: Redirects to the login page.
    *   `pages/login.vue`: Implements the user login and registration forms. It uses `@nuxt/ui` components for a modern aesthetic.
    *   `pages/dashboard.vue`: Displays dashboard statistics and a list of registered users. It includes buttons for refreshing stats and logging out.
*   **`server/api/` directory**: Contains the server-side API endpoints built with Nuxt's Nitro server:
    *   `server/api/login.post.ts`: Handles user login requests. It queries the `users` table in the PostgreSQL database and uses `bcrypt` to compare the provided password with the stored hashed password.
    *   `server/api/register.post.ts`: Handles new user registration requests. It hashes the user's password using `bcrypt` before inserting the new user into the `users` table. It also checks for existing users to prevent duplicate registrations.
    *   `server/api/stats.get.ts`: Fetches dashboard statistics from the `dashboard_stats` table in the PostgreSQL database.
    *   `server/api/stats.put.ts`: Handles requests to increment specific dashboard statistics in the `dashboard_stats` table.
    *   `server/api/users.get.ts`: Fetches a list of all registered users from the `users` table in the PostgreSQL database.

## 3. Dependencies

The `package.json` file lists the following key dependencies:

*   `nuxt`: The core Nuxt.js framework.
*   `@nuxt/ui`: A UI library providing pre-built components for a consistent and modern look.
*   `pg`: A PostgreSQL client for Node.js, used to interact with the `database` service.
*   `bcrypt`: A library for hashing and comparing passwords securely.

## 4. Dockerfile Explanation

The `nuxt-app/Dockerfile` defines the steps to build and run the Nuxt.js application within a Docker container. It uses a multi-stage build process for optimized image size.

```dockerfile
# Stage 1: Build the Nuxt.js application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
# This step is cached if dependencies haven't changed
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Nuxt.js application for production
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy only the necessary build output from the build stage
COPY --from=build /app/.output .

# Expose the port the Nuxt.js application listens on
EXPOSE 3000

# Command to run the Nuxt.js application
CMD ["node", "server/index.mjs"]
```

**Explanation of Dockerfile Stages:**

*   **`FROM node:20-alpine AS build`**:
    *   Uses `node:20-alpine` as the base image for the build stage. Alpine images are lightweight, resulting in smaller final image sizes.
    *   `AS build` names this stage "build" so it can be referenced later.

*   **`WORKDIR /app`**:
    *   Sets the working directory inside the container to `/app`. All subsequent commands will be executed relative to this directory.

*   **`COPY package*.json ./` and `RUN npm install`**:
    *   Copies `package.json` and `package-lock.json` (or `yarn.lock`) to the working directory.
    *   Installs all project dependencies. This step is placed early to leverage Docker's build cache. If these files don't change, this layer won't be rebuilt on subsequent builds, speeding up the process.

*   **`COPY . .`**:
    *   Copies the rest of the application source code into the container.

*   **`RUN npm run build`**:
    *   Executes the Nuxt.js build command, which compiles the application for production, generating optimized client-side assets and server-side bundles.

*   **`FROM node:20-alpine`**:
    *   Starts a new, clean stage using the same lightweight Node.js Alpine image. This is the final image that will be deployed.

*   **`WORKDIR /app`**:
    *   Sets the working directory for the final image.

*   **`COPY --from=build /app/.output .`**:
    *   This is the core of the multi-stage build. It copies *only* the production-ready output from the `/app/.output` directory of the "build" stage to the current stage's `/app` directory. This significantly reduces the final image size by not including development dependencies or build tools.

*   **`EXPOSE 3000`**:
    *   Informs Docker that the container listens on port 3000 at runtime.

*   **`CMD ["node", "server/index.mjs"]`**:
    *   Defines the command that will be executed when the container starts. It runs the compiled Nuxt.js server-side application.

This multi-stage Dockerfile ensures that the final `nuxt-app` image is as small and efficient as possible, containing only the necessary runtime code.
