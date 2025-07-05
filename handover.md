# Project Handover: Dockerized Multi-App Proof of Concept

## Project Description

This project is a comprehensive Proof of Concept (PoC) designed as a learning and demonstration tool for building, deploying, and managing multi-container applications using Docker and Docker Compose. It simulates a real-world application with distinct frontend services, a backend service, a database, and a reverse proxy.

**Core Objectives:**
*   **Dockerization:** All components run in isolated Docker containers.
*   **Orchestration:** Managed via a single `docker-compose.yml` file.
*   **Service Variety:** Includes Nuxt.js, Python/Tornado, Angular, and PostgreSQL.
*   **Data Persistence:** Database data persists across container restarts using Docker volumes.
*   **Operational Readiness:** Includes procedures for development, deployment, and offline updates.

**Target Architecture:**
*   `proxy` (Nginx): Routes external traffic.
*   `database` (PostgreSQL with PostGIS and TimescaleDB): Central data store.
*   `nuxt-app` (Nuxt.js): Primary user dashboard (login, stats).
*   `tornado-app` (Python/Tornado): Utility web app and geospatial API.
*   `angular-app` (Angular): Interactive map application.

## Project Status

The project is largely implemented, with all core services and their Docker configurations set up. The frontend applications (Nuxt.js and Angular) have been scaffolded and their initial components and API integrations are in place. The database and Tornado backend are also configured.

**Current Progress (as per `todo.md`):**

### Phase 1: Foundation & Backend Services
*   **Task 1.1: Project Scaffolding:** Completed.
*   **Task 1.2: Docker & Nginx Configuration:** Completed.
*   **Task 1.3: Database Container:** Completed.
*   **Task 1.4: Tornado/Python App & Geo-API:** Completed.

### Phase 2: Frontend Applications
*   **Task 2.1: NuxtUI Web App:** Completed.
*   **Task 2.2: Angular Map App:** Completed.

### Phase 3: Integration, Testing & Documentation
*   **Task 3.1: Full System Integration:** Initial `docker-compose up --build -d` completed successfully. Nuxt login page and functionality verified.
*   **Task 3.2: Document Operational Procedures:** Pending.

## Implementation Details

### Project Structure
```
.
├── docker-compose.yml
├── nginx.conf
├── database/
│   ├── Dockerfile
│   └── init.sql
├── nuxt-app/
│   ├── Dockerfile
│   ├── package.json
│   ├── app.vue
│   ├── nuxt.config.ts
│   ├── pages/login.vue
│   ├── pages/dashboard.vue
│   ├── pages/index.vue
│   └── server/api/
│       ├── login.post.ts
│       ├── stats.get.ts
│       └── stats.put.ts
├── tornado-app/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   └── index.html
└── angular-app/
    ├── Dockerfile
    ├── package.json
    ├── src/app/app.component.ts
    ├── src/app/app.component.html
    └── src/app/app.config.ts
```

### Key Implementation Notes:

*   **Docker Compose:** The `docker-compose.yml` orchestrates all five services, defining their build contexts, dependencies, environment variables, and exposed ports.
*   **Nginx:** Configured as a reverse proxy to route traffic to `nuxt-app` (root), `tornado-app` (`/tools/`, `/api/points/`), and `angular-app` (`/map/`).
*   **Database:** Uses `timescale/timescaledb-ha` image. `init.sql` sets up `users`, `dashboard_stats`, and `map_points` tables with initial data.
*   **Nuxt.js App:**
    *   Uses `node:20-alpine` for Docker builds.
    *   `pages/index.vue` redirects to `/login`.
    *   Login and dashboard pages are implemented with NuxtUI components.
    *   Backend API endpoints (`/api/login`, `/api/stats`) handle database interactions using `pg` (PostgreSQL client).
*   **Tornado App:**
    *   Uses `python:3.9-slim` for Docker builds.
    *   `main.py` provides a utility page (`/tools/`) displaying Python package versions and a Matplotlib-generated sine wave plot.
    *   Implements a geospatial API (`/api/points/`) for GET, POST, and DELETE operations on the `map_points` table using `psycopg2` and `geojson`.
*   **Angular App:**
    *   Uses `node:20-alpine` for Docker builds (multi-stage build with Nginx for serving).
    *   Integrates OpenLayers for interactive map functionality.
    *   Allows creating points by clicking on the map and deleting the last point. These actions interact with the Tornado geospatial API.
    *   `HttpClientModule` is correctly imported and used for API calls.

## Next Steps

*   Complete testing of all user flows for the Tornado and Angular applications.
*   Document operational procedures (offline updates, development workflow) in the `README.md`.
