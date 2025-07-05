### Phase 1: Foundation & Backend Services

*   [x] **Task 1.1: Project Scaffolding**
    *   [x] Create the following directories: `database`, `nuxt-app`, `tornado-app`, `angular-app`.
*   [x] **Task 1.2: Docker & Nginx Configuration**
    *   [x] Create `docker-compose.yml` defining the five services (`proxy`, `database`, `nuxt-app`, `tornado-app`, `angular-app`).
    *   [x] Create `nginx.conf` with reverse proxy rules for all applications.
*   [x] **Task 1.3: Database Container**
    *   [x] Create `database/Dockerfile` using the `timescale/timescaledb-ha` image.
    *   [x] Create `database/init.sql` to set up the `postgis` extension, create `users`, `dashboard_stats`, and `map_points` tables, and insert seed data.
*   [x] **Task 1.4: Tornado/Python App & Geo-API**
    *   [x] Create `tornado-app/Dockerfile`.
    *   [x] Create `tornado-app/requirements.txt` with `tornado`, `numpy`, `matplotlib`, `psycopg2-binary`, and `geojson`.
    *   [x] Create `tornado-app/main.py` with handlers for `/tools/` and the `/api/points/` endpoint (GET, POST, DELETE).
    *   [x] Create a basic `tornado-app/index.html` template for the tools page.

### Phase 2: Frontend Applications

*   [x] **Task 2.1: NuxtUI Web App**
    *   [x] Initialize a Nuxt 3 project in `nuxt-app/`.
    *   [x] Create `nuxt-app/Dockerfile` for building and running the app.
    *   [x] Implement the login page (`pages/login.vue`).
    *   [x] Implement the dashboard page (`pages/dashboard.vue`).
    *   [x] Create the backend API endpoints (`server/api/login.post.ts`, `server/api/stats.get.ts`, `server/api/stats.put.ts`).
*   [x] **Task 2.2: Angular Map App**
    *   [x] Initialize an Angular project in `angular-app/`.
    *   [x] Create `angular-app/Dockerfile` (multi-stage build).
    *   [x] Implement the map component using OpenLayers.
    *   [x] Implement the "Create Point" and "Delete Last Point" functionality.
    *   [x] Create a service to communicate with the `/api/points/` backend.

### Phase 3: Integration, Testing & Documentation

*   [x] **Task 3.1: Full System Integration**
    *   [x] Run `docker-compose up --build -d` to launch the full system.
    *   [ ] Test all user flows as described in the acceptance criteria.
*   [ ] **Task 3.2: Document Operational Procedures**
    *   [ ] Update the main `README.md` with instructions for the offline update process and the development workflow with hot-reloading.
