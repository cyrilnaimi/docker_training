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
    *   [x] Test all user flows as described in the acceptance criteria.
*   [x] **Task 3.2: Document Operational Procedures**
    *   [x] Update the main `README.md` with instructions for the offline update process and the development workflow with hot-reloading.
*   [ ] **Task 3.3: Versionning **

### Phase 4: Enhancement

*   [ ] **Task 4.1: Nuxt app**
    *   [ ] Refine the login page's CSS for a modern and user-friendly aesthetic, ensuring responsiveness and visual appeal.
    *   [ ] Redesign the dashboard with an improved layout, incorporating cards and a well-styled header with intuitive buttons for enhanced user experience and visual consistency.
    *   [ ] Implement a 'Create New User' button on the login page, enabling new user registration and seamless login after account creation.
    *   [ ] Integrate a user list display on the dashboard, showing registered users with relevant details (e.g., email, registration date).
*   [ ] **Task 4.2: Tornado app**
    *   [ ] Extend the Tornado app to leverage TimescaleDB for time-series data management. Develop a new dedicated page for generating and visualizing simulated datacenter sensor data (CPU, memory, network speed, bandwidth). Implement functionalities to generate one month of fake data, clear existing data, and display interactive charts using Apache ECharts with zoom capabilities for detailed analysis.

### Phase 5: HotUpdate
*   [ ] Develop comprehensive documentation and a step-by-step guide on utilizing Watchtower for automated, seamless deployment of new container images for the application, ensuring minimal downtime.
*   [ ] Demonstrate the Watchtower deployment process by applying the enhancements developed in Phase 4, validating the automated update mechanism.

### Phase 6: UnitTest
*   [ ] Create detailed documentation and a 'how-to' guide for setting up and writing unit tests across all application components (Nuxt.js, Tornado, Angular), adhering to best practices.
*   [ ] Develop a comprehensive suite of unit tests for all critical functionalities within the Nuxt.js, Tornado, and Angular applications to ensure code quality and reliability.
*   [ ] Generate and analyze a test coverage report for the entire application, identifying areas with insufficient test coverage and providing recommendations for improvement.
