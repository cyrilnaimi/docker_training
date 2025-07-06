# Dockerized Multi-App Proof of Concept

This project is a comprehensive Proof of Concept (PoC) designed as a learning and demonstration tool for building, deploying, and managing multi-container applications using Docker and Docker Compose. It simulates a real-world application with distinct frontend services, a backend service, a database, and a reverse proxy.

## Core Technologies

- **Orchestration**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL with PostGIS and TimescaleDB extensions.
- **Frontend Applications**:
    - Nuxt.js (NuxtUI) for the main dashboard.
    - Angular for an interactive map.
- **Backend Service**:
    - Python with Tornado for a utility page and a geospatial API.

## How to Run the Project

1.  **Prerequisites**: Docker and Docker Compose must be installed.
2.  **Build and Start**: From the root directory, run the following command:
    ```bash
    docker-compose up --build -d
    ```

## Accessing Applications

-   **NuxtUI App**: `http://localhost/`
-   **Tornado Tools**: `http://localhost/tools/`
-   **Angular Map**: `http://localhost/map/`

## Development Workflow (Hot Reload)

To enable hot-reloading for frontend development, you can add volume mounts to your `docker-compose.yml` and modify the commands to run the dev servers.

Example for `nuxt-app`:

```yaml
# In docker-compose.yml
services:
  nuxt-app:
    # ...
    volumes:
      - ./nuxt-app:/app
    command: npm run dev
```

## Offline Update Process

This is the procedure for updating the application on a server with no internet access.

**1. On Your Development Machine (with Internet):**

*   Make your code changes in `nuxt-app`, `tornado-app`, or `angular-app`.
*   Build the new Docker images. For example, to rebuild just the Nuxt app:
    ```bash
    docker-compose build nuxt-app
    ```
*   Save the newly built image to a `.tar` file. The image name is typically `project-name_service-name`.
    ```bash
    docker save docker-poc_nuxt-app:latest > nuxt-app-new.tar
    ```

**2. Transfer the File:**

*   Move the `nuxt-app-new.tar` file to the offline server using a USB stick or other means.

**3. On the Offline Server:**

*   Load the image from the tarball into Docker:
    ```bash
    docker load < nuxt-app-new.tar
    ```
*   Go to the project directory where your `docker-compose.yml` is located.
*   Tell Docker Compose to restart the service. It will automatically use the newly loaded image:
    ```bash
    docker-compose up -d --no-build nuxt-app
    ```
    The `--no-build` flag is critical here, as it ensures Docker doesn't try (and fail) to build the image online. The container will be recreated using the new code. Your data is safe because it's stored in the `postgres_data` volume.