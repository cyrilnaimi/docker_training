# Database Service Documentation

This document provides an exhaustive overview of the Database service, its purpose, and Dockerfile configuration.

## 1. Service Purpose

The `database` service provides a robust and persistent data store for all applications within this multi-container proof-of-concept. It is based on PostgreSQL with key extensions for advanced functionalities:

*   **PostGIS**: Enables geospatial data storage and querying, used by the Angular map application.
*   **TimescaleDB**: Provides time-series data capabilities, used by the Tornado application for sensor data management.

It serves as the central data repository for:

*   User authentication data (for the Nuxt.js app).
*   Dashboard statistics (for the Nuxt.js app).
*   Geospatial map points (for the Angular app).
*   Simulated sensor time-series data (for the Tornado app).

## 2. Database Schema and Initialization (`init.sql`)

The `init.sql` file is executed automatically when the PostgreSQL container is first initialized (i.e., when the mounted data volume is empty). It sets up the necessary database, extensions, and tables:

*   **`CREATE EXTENSION IF NOT EXISTS postgis;`**: Enables the PostGIS extension for geospatial functions.
*   **`CREATE TABLE users (...)`**: Defines the table for storing user information (email, hashed password, creation timestamp) for the Nuxt.js application.
*   **`CREATE TABLE dashboard_stats (...)`**: Defines the table for storing dashboard statistics (e.g., clicks, items processed, logins) for the Nuxt.js application.
*   **`CREATE TABLE map_points (...)`**: Defines the table for storing geographical points (with a `GEOMETRY` column for PostGIS) for the Angular map application.
*   **`CREATE TABLE sensor_data (...)`**: Defines the table for storing simulated sensor data (CPU, memory, network, bandwidth) with a `TIMESTAMPTZ` column for time-series data.
*   **`SELECT create_hypertable('sensor_data', 'time');`**: Converts the `sensor_data` table into a TimescaleDB hypertable, optimizing it for time-series data ingestion and querying.
*   **Initial Data Insertion**: Includes `INSERT` statements to pre-populate `dashboard_stats` with some initial values.

## 3. Dockerfile Explanation

The `database/Dockerfile` defines the steps to build the PostgreSQL container with TimescaleDB and PostGIS extensions.

```dockerfile
FROM timescale/timescaledb-ha:pg14-ts2.7-latest

COPY init.sql /docker-entrypoint-initdb.d/
```

**Explanation of Dockerfile:**

*   **`FROM timescale/timescaledb-ha:pg14-ts2.7-latest`**:
    *   Uses the official `timescale/timescaledb-ha` image as the base. This image comes pre-configured with PostgreSQL, TimescaleDB, and PostGIS, simplifying the setup process.
    *   The tag `pg14-ts2.7-latest` specifies PostgreSQL version 14 and TimescaleDB version 2.7.

*   **`COPY init.sql /docker-entrypoint-initdb.d/`**:
    *   Copies the `init.sql` script from the local `database/` directory into the `/docker-entrypoint-initdb.d/` directory inside the container.
    *   Any `.sql`, `.sh`, or `.sql.gz` files placed in this directory will be automatically executed by the PostgreSQL entrypoint script when the container is first started and the data directory is empty. This is how the database schema and initial data are set up.

## 4. Data Persistence

Data persistence for the `database` service is managed using a Docker named volume (`postgres_data`). This volume is mounted to `/home/postgres/pgdata/data` inside the container (which is the `PGDATA` directory for this specific TimescaleDB image).

*   **`docker-compose.yml` configuration**: The `volumes` section in `docker-compose.yml` defines `postgres_data: {}`, allowing Docker Compose to manage the volume's lifecycle. The `database` service then mounts this volume: `- postgres_data:/home/postgres/pgdata/data`.
*   **Host Permissions**: To ensure proper data persistence, the underlying host directory that backs this Docker volume must have correct write permissions for the `postgres` user (typically UID/GID 999) inside the container. This is often resolved by running `sudo chown -R 999:999 /path/to/docker/volume/_data` on the host machine.

This setup ensures that all data written to the database persists across container restarts, allowing for reliable application operation.
