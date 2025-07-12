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

The project is fully implemented, with all core services and their Docker configurations set up. All frontend applications (Nuxt.js and Angular) are now functional and integrated with the backend services.

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
*   **Task 3.1: Full System Integration:** Completed. All user flows have been tested and verified.
*   **Task 3.2: Document Operational Procedures:** Completed.
*   **Task 3.3: Versioning:** Completed.

### Phase 6: Unit Testing
*   **Unit Test Documentation:** Completed. Detailed guides for setting up and writing unit tests for Nuxt.js, Tornado, and Angular applications have been created.
*   **Unit Test Development:** In Progress. Comprehensive unit tests are being developed for critical functionalities across all applications.

### Phase 4: Enhancement
*   **Task 4.1: Nuxt app:** Completed.
*   **Task 4.2: Tornado app:** Completed.
*   **Task 4.3: Angular app:** Completed.

## Implementation Details

### Project Structure
```
.
├── docker-compose.yml
├── nginx.conf
├── database/
│   ├── Dockerfile
│   ├── init.sql
│   └── documentation.md
├── nuxt-app/
│   ├── Dockerfile
│   ├── package.json
│   ├── app.vue
│   ├── nuxt.config.ts
│   ├── pages/login.vue
│   ├── pages/dashboard.vue
│   ├── pages/index.vue
│   ├── server/api/
│   │   ├── login.post.ts
│   │   ├── register.post.ts
│   │   ├── stats.get.ts
│   │   ├── stats.put.ts
│   │   └── users.get.ts
│   └── documentation.md
├── tornado-app/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── index.html
│   ├── sensor_data.html
│   └── documentation.md
└── angular-app/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── src/app/app.component.ts
    ├── src/app/app.component.html
    ├── src/app/app.config.ts
    ├── src/app/app.css
    ├── src/styles.css
    └── documentation.md
```

### Key Implementation Notes:

*   **Docker Compose:** The `docker-compose.yml` orchestrates all five services, defining their build contexts, dependencies, environment variables, and exposed ports.
    *   **Database Persistence Fix**: Configured `postgres_data` as a managed volume and ensured the correct mount point (`/home/postgres/pgdata/data`) and user (`postgres`) for data persistence with the `timescale/timescaledb-ha` image.
*   **Nginx:** Configured as a reverse proxy to route traffic to `nuxt-app` (root), `tornado-app` (`/tools/`, `/api/points/`, `/api/sensor_data/`), and `angular-app` (`/map/`).
    *   **Routing Fixes**: Implemented specific `location` blocks in `nginx.conf` to correctly route requests for `/tools/`, `/tools/sensor_data`, and `/api/sensor_data/` to the Tornado app, resolving previous 404 errors.
*   **Database:** Uses `timescale/timescaledb-ha` image. `init.sql` sets up `users`, `dashboard_stats`, `map_points`, and `sensor_data` tables (with TimescaleDB hypertable).
    *   **User Management**: Removed pre-seeded user from `init.sql` to enforce registration through the Nuxt.js app.
*   **Nuxt.js App:**
    *   Uses `node:20-alpine` for Docker builds.
    *   `pages/index.vue` redirects to `/login`.
    *   **Enhanced Login/Registration**: `pages/login.vue` now includes a toggle for user registration, with `server/api/register.post.ts` handling new user creation (including `bcrypt` hashing).
    *   **Improved Dashboard**: `pages/dashboard.vue` features a redesigned layout with cards, a user list display (`server/api/users.get.ts`), and refreshed styling.
    *   **Secure Login**: `server/api/login.post.ts` uses `bcrypt.compare` for secure password validation.
*   **Tornado App:**
    *   Uses `python:3.9-slim` for Docker builds.
    *   **TimescaleDB Integration**: `main.py` now includes handlers for generating, clearing, and fetching simulated sensor data, stored in the `sensor_data` table (TimescaleDB hypertable).
    *   **Sensor Data Dashboard**: `sensor_data.html` provides an interactive dashboard with Apache ECharts for visualizing sensor data.
    *   **Updated Tools Page**: `index.html` has been restyled and includes a direct link to the Timescale Dashboard.
    *   **API Response Enhancement**: `main.py`'s `PointsApiHandler` now returns `created_at` for new points.
*   **Angular App:**
    *   Uses `node:20-alpine` for Docker builds (multi-stage build with Nginx for serving).
    *   Integrates OpenLayers for interactive map functionality.
    *   Allows creating points by clicking on the map and deleting the last point. These actions interact with the Tornado geospatial API.
    *   `HttpClientModule` is correctly imported and used for API calls.
    *   **Enhanced UI**: `src/app/app.component.html` and `src/app/app.css` have been updated to provide a 2/3 map and 1/3 sidebar layout, a table displaying the last 10 points with coordinates and creation time, and styling consistent with the Nuxt.js app.
    *   **Angular Module Fix**: `src/app/app.component.ts` now imports `CommonModule` to correctly support `*ngFor`, `*ngIf`, and Angular pipes.
    *   **Key Fixes for Angular App (retained from previous handover):**
        *   **Nginx Configuration:** `angular-app/nginx.conf` correctly serves Angular assets from `/usr/share/nginx/html` within the container.
        *   **Base Href:** Configured `"baseHref": "/map/"` in `angular-app/angular.json` for the production build to ensure correct asset loading when served from a subpath.
        *   **OpenLayers CSS:** Included `ol/ol.css` directly in the `styles` array of `angular-app/angular.json` for proper map rendering.
        *   **Angular Bootstrapping:** Corrected `angular-app/src/main.ts` to bootstrap `AppComponent` directly, and removed unnecessary `app.ts` and `app.routes.ts`.
        *   **API Response Handling:** Modified `getPoints()` in `angular-app/src/app/app.component.ts` to correctly parse the GeoJSON `FeatureCollection` response from the Tornado API by accessing the `response.features` property.
        *   **Map Buttons:** Restored the "Delete Last Point" button in `angular-app/src/app/app.component.html`.
*   **Documentation**: `documentation.md` files have been created in `nuxt-app/`, `tornado-app/`, `angular-app/`, and `database/` directories, providing exhaustive explanations of each application and its Dockerfile.

## Next Steps

The project is now fully functional and all acceptance criteria for Phase 1, 2, 3, and 4 have been met. Future work can focus on the enhancements outlined in `todo.md` (Phase 5 and 6).
