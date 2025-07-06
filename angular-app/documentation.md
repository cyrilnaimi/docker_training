# Angular Application Documentation

This document provides an exhaustive overview of the Angular application, its purpose, architecture, and Dockerfile configuration.

## 1. Application Purpose

The `angular-app` serves as a specialized frontend for displaying an interactive map. Its primary functionalities include:

*   **Interactive Map Display**: Renders a map using OpenLayers.
*   **Point Creation**: Allows users to click on the map to create new geographical points.
*   **Point Deletion**: Provides functionality to delete the last created point.
*   **Point Visualization**: Displays the last 10 created points in a table alongside the map, showing their coordinates and creation time.

It interacts with the Tornado backend service (`tornado-app`) via the `/api/points/` endpoint for managing map point data.

## 2. Application Architecture and Key Files

The application is built using the Angular framework.

*   **`src/main.ts`**: The main entry point for the Angular application, responsible for bootstrapping the `AppComponent`.
*   **`src/app/app.component.ts`**: The main Angular component that orchestrates the map functionality and point management.
    *   Initializes the OpenLayers map.
    *   Handles map click events to create new points.
    *   Manages the `vectorSource` for displaying points on the map.
    *   Includes `createPoint()`, `deleteLastPoint()`, `getPoints()`, and `updateLast10Points()` methods for interacting with the backend API and managing the displayed points.
    *   Uses `HttpClient` for making API calls to the Tornado backend.
    *   Imports `CommonModule` to enable Angular directives like `*ngFor` and `*ngIf`, and pipes like `number` and `date`.
*   **`src/app/app.component.html`**: The template for the `AppComponent`, defining the layout of the map and the sidebar.
    *   Divides the page into a 2/3 map container and a 1/3 sidebar.
    *   Includes a button for deleting the last point.
    *   Displays a table showing the last 10 points with their latitude, longitude, and creation timestamp.
*   **`src/app/app.css`**: Contains the custom CSS for styling the Angular application, including the layout for the map and sidebar, and styling for cards, buttons, and the points table. This CSS is designed to align with the aesthetic of the Nuxt.js application.
*   **`angular.json`**: The Angular CLI configuration file. It defines project settings, build options, and includes `src/app/app.css` in the build process to ensure the custom styles are applied.
*   **`nginx.conf` (in `angular-app/` directory)**: A specific Nginx configuration file used within the Angular Docker container to serve the static Angular assets. It ensures that the Angular application is correctly served from the `/usr/share/nginx/html` directory within the container.

## 3. Dependencies

The `package.json` file lists the following key dependencies:

*   `@angular/core`, `@angular/common`, etc.: Core Angular framework packages.
*   `ol`: OpenLayers library for interactive map functionalities.
*   `rxjs`: Reactive Extensions for JavaScript, used for asynchronous operations.

## 4. Dockerfile Explanation

The `angular-app/Dockerfile` defines the steps to build and serve the Angular application using a multi-stage build process.

```dockerfile
# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration production

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built Angular application from the build stage
COPY --from=build /app/dist/angular-app/browser /usr/share/nginx/html

# Copy the custom Nginx configuration for Angular
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Command to start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Explanation of Dockerfile Stages:**

*   **`FROM node:20-alpine AS build`**:
    *   Uses `node:20-alpine` as the base image for the build stage, providing the Node.js environment needed to build the Angular application.
    *   `AS build` names this stage "build".

*   **`WORKDIR /app`**:
    *   Sets the working directory inside the container to `/app`.

*   **`COPY package.json package-lock.json ./` and `RUN npm install`**:
    *   Copies dependency files and installs them. This is cached for faster rebuilds.

*   **`COPY . .`**:
    *   Copies the rest of the Angular application source code.

*   **`RUN npm run build -- --configuration production`**:
    *   Executes the Angular CLI build command to compile the application for production. The `--configuration production` flag ensures an optimized, production-ready build.

*   **`FROM nginx:alpine`**:
    *   Starts a new, clean stage using the lightweight `nginx:alpine` image. This will be the final image.

*   **`COPY --from=build /app/dist/angular-app/browser /usr/share/nginx/html`**:
    *   Copies the compiled Angular application (the static assets) from the `build` stage's output directory (`/app/dist/angular-app/browser`) to the Nginx web root directory (`/usr/share/nginx/html`) in the final image.

*   **`COPY nginx.conf /etc/nginx/conf.d/default.conf`**:
    *   Copies the custom Nginx configuration file from the `angular-app` directory into the Nginx configuration directory inside the container. This ensures Nginx serves the Angular app correctly.

*   **`EXPOSE 80`**:
    *   Informs Docker that the container listens on port 80 (the default HTTP port for Nginx).

*   **`CMD ["nginx", "-g", "daemon off;"]`**:
    *   Defines the command to start the Nginx server in the foreground, which is necessary for Docker containers.

This multi-stage Dockerfile results in a small and efficient Angular application image, served by Nginx.
