Of course. Here is a comprehensive handover document for the developer tasked with building the Docker Proof of Concept. This document outlines the project's goals, provides detailed descriptions of the user interfaces, and lays out a clear set of development tasks.  
---

### **Handover Document: Dockerized Multi-App Proof of Concept**

| Project Name: | Docker PoC: A Multi-Container Learning Environment |
| :---- | :---- |
| **Version:** | 1.0 |
| **Date:** | July 5, 2025 |
| **Author:** | Gemini AI |
| **Status:** | For Development |

### **1\. Project Overview & Goals**

#### **1.1. Project Vision**

The primary goal of this project is to create a comprehensive Proof of Concept (PoC) to serve as a learning and demonstration tool for building, deploying, and managing multi-container applications using Docker and Docker Compose. The system will simulate a real-world application with distinct frontend services, a backend service, a database, and a reverse proxy.

#### **1.2. Core Objectives**

* **Dockerization:** All components of the system (database, applications, proxy) must run in their own isolated Docker containers.  
* **Orchestration:** The entire system must be managed via a single docker-compose.yml file for easy startup, shutdown, and networking.  
* **Service Variety:** The project will include a diverse set of technologies (Nuxt.js, Python/Tornado, Angular, PostgreSQL) to demonstrate Docker's versatility.  
* **Data Persistence:** Database data must be persistent across container restarts using Docker volumes.  
* **Operational Readiness:** The final system should include clear procedures for development, deployment (with auto-start on boot), and performing application updates in an offline environment.

#### **1.3. Target Architecture**

The system is composed of five interconnected services, managed by a reverse proxy which acts as the single entry point.

* **proxy (Nginx):** Routes external traffic from localhost to the appropriate application container based on the URL path.  
* **database (PostgreSQL):** The central data store, enhanced with PostGIS for geospatial data and TimescaleDB.  
* **nuxt-app (Nuxt.js):** The primary user dashboard, handling user login and displaying/modifying data from the database.  
* **tornado-app (Python):** A utility web app and the backend API for the geospatial map service.  
* **angular-app (Angular):** A frontend application dedicated to displaying an interactive map.

### **2\. User Interface (UI) and Functional Description**

#### **2.1. NuxtUI Web App (http://localhost/)**

This is the main application for user interaction with business data.

* **Login Page (Default View):**  
  * **UI:** A clean, centered card with two input fields and a button.  
    * Input Field 1: "Email"  
    * Input Field 2: "Password" (type=password)  
    * Button: "Log In"  
  * **Functionality:**  
    * On form submission, it sends the credentials to a backend API.  
    * The authentication is a simple check against the users table in the database (no encryption needed for this PoC).  
    * On successful login, the user is redirected to the /dashboard. On failure, an error message should be shown.  
* **Dashboard Page (/dashboard, requires login):**  
  * **UI:** A card-based layout displaying several key statistics. Each statistic has a label, a value, and an increment button.  
    * Example Stat 1: "User Clicks: \[ 10 \]" \[ \+ \]  
    * Example Stat 2: "Items Processed: \[ 42 \]" \[ \+ \]  
    * Example Stat 3: "Profile Logins: \[ 1 \]" \[ \+ \]  
  * **Functionality:**  
    * On page load, it fetches the current values from the dashboard\_stats table in the database.  
    * When a user clicks a \[ \+ \] button, it triggers an API call to increment the corresponding value in the database.  
    * The UI must automatically update to reflect the new value without requiring a full page reload.

#### **2.2. Tornado Tools App (http://localhost/tools/)**

This is a simple, non-interactive diagnostic and utility page.

* **UI:** A single page with two sections.  
  * **Section 1: Python Environment:**  
    * A heading, e.g., "Installed Python Packages".  
    * A list displaying the names and versions of all Python packages installed in the container's environment (e.g., tornado: 6.2, numpy: 1.23.5).  
  * **Section 2: Data Visualization:**  
    * A heading, e.g., "NumPy Generated Plot".  
    * An embedded PNG image of a sine wave generated on the fly by the backend using numpy and matplotlib.

#### **2.3. Angular Map App (http://localhost/map/)**

A dedicated single-page application for geospatial interaction.

* **UI:**  
  * **Main View:** A full-page map, using OpenStreetMap tiles as the base layer.  
  * **Controls:** Two distinct buttons, clearly labeled:  
    * Button 1: "Create Point"  
    * Button 2: "Delete Last Point"  
* **Functionality:**  
  * **Point Creation:**  
    1. User clicks the "Create Point" button. The application enters "creation mode."  
    2. The user clicks anywhere on the map.  
    3. A marker (e.g., a pin icon) appears at the clicked location.  
    4. The coordinates (latitude, longitude) of the point are sent to the Tornado backend API (/api/points/) and stored in the map\_points table in the PostGIS database.  
  * **Point Deletion:**  
    1. User clicks the "Delete Last Point" button.  
    2. The most recently added marker is removed from the map.  
    3. An API call is made to the Tornado backend to delete the corresponding record from the database.  
  * **Data Persistence:** When the page is reloaded, all existing points from the database should be fetched and rendered on the map.

---

### **3\. Development Tasks & Implementation Plan**

#### **Phase 1: Foundation & Backend Services**

1. **Task 1.1: Project Scaffolding**  
   * Create the root directory structure as outlined in the initial plan.  
2. **Task 1.2: Docker & Nginx Configuration**  
   * Write the docker-compose.yml file, defining all five services (database, nuxt-app, tornado-app, angular-app, proxy), networks, and the postgres\_data volume.  
   * Write the nginx.conf file to correctly proxy requests to the appropriate upstream services based on the URL paths.  
3. **Task 1.3: Database Container**  
   * Create the Dockerfile in the database/ directory using the timescale/timescaledb-ha base image.  
   * Create the init.sql script to:  
     * Enable the postgis extension.  
     * Create the users, dashboard\_stats, and map\_points tables with the correct schemas.  
     * Insert initial seed data for users and stats.  
4. **Task 1.4: Tornado/Python App & Geo-API**  
   * Create the Dockerfile for the Tornado service.  
   * Write the requirements.txt file (tornado, numpy, matplotlib, psycopg2-binary, geojson).  
   * Implement the main.py application with two handlers:  
     * MainHandler (/tools/): Generates the page with the package versions and the Matplotlib sine wave plot.  
     * PointsApiHandler (/api/points/): Implements GET, POST, and DELETE methods to interact with the map\_points PostGIS table.

#### **Phase 2: Frontend Applications**

5. **Task 2.1: NuxtUI Web App**  
   * Initialize a Nuxt 3 project inside the nuxt-app/ directory.  
   * Install necessary dependencies (pg, @nuxt/ui).  
   * Create the Vue components for the login page and the dashboard page.  
   * Implement the Nuxt server API endpoints (/api/login, /api/stats) to handle authentication and data fetching/updating from the database container.  
   * Write the Dockerfile for building and running the Nuxt application.  
6. **Task 2.2: Angular Map App**  
   * Initialize an Angular project inside the angular-app/ directory.  
   * Install the OpenLayers library (ol).  
   * Create an Angular component to render the OpenLayers map.  
   * Create an Angular service to handle all HTTP communication with the Tornado API (/api/points/).  
   * Implement the "Create Point" and "Delete Last Point" logic.  
   * Write the multi-stage Dockerfile to build the Angular app and serve it with Nginx.

#### **Phase 3: Integration, Testing & Documentation**

7. **Task 3.1: Full System Integration**  
   * Run docker-compose up \--build and test all user flows from end-to-end to ensure seamless communication between the proxy, frontends, backends, and database.  
8. **Task 3.2: Document Operational Procedures**  
   * Write a clear, step-by-step guide in a README.md for the **Offline Update Process**. This must detail the docker save, file transfer, docker load, and docker-compose up \--no-build workflow.  
   * Document the **Development Workflow**, explaining how to use bind mounts in a separate docker-compose.override.yml for hot-reloading.

### **4\. Acceptance Criteria**

The project will be considered complete when all of the following criteria are met:

* \[ \] All five containers start successfully with docker-compose up \-d.  
* \[ \] Navigating to http://localhost/ shows the Nuxt login page.  
* \[ \] A user can log in with the seed data credentials (test@example.com / 1234).  
* \[ \] The dashboard at http://localhost/dashboard correctly displays and updates stats from the database.  
* \[ \] Navigating to http://localhost/tools/ displays the Python package list and a sine wave image.  
* \[ \] Navigating to http://localhost/map/ displays an OpenStreetMap.  
* \[ \] Users can add and delete points on the map, and these changes are correctly saved to and removed from the PostGIS database.  
* \[ \] All data in the database persists after running docker-compose down and docker-compose up.  
* \[ \] The offline update procedure is tested and documented.