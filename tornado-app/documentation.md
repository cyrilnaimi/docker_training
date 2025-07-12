# Tornado Application Documentation

This document provides an exhaustive overview of the Tornado (Python) application, its purpose, architecture, and Dockerfile configuration.

## 1. Application Purpose

The `tornado-app` serves as a backend service providing two main sets of functionalities:

*   **Utility Page**: Displays information about installed Python packages and a generated sine wave plot.
*   **Geospatial API**: Provides endpoints for managing map points (GET, POST, DELETE) used by the Angular application.
*   **TimescaleDB Integration**: Manages and visualizes simulated sensor time-series data, including generation, clearing, and fetching functionalities.

It interacts with the PostgreSQL database (via the `database` service) for storing and retrieving map points and sensor data.

## 2. Application Architecture and Key Files

The application is built using the Tornado web framework in Python.

*   **`main.py`**: The core Python script containing the Tornado application setup, request handlers, and database interaction logic.
    *   **`get_db_connection()`**: Function to establish a connection to the PostgreSQL database.
    *   **`MainHandler`**: Handles requests to the root path (`/`) of the Tornado app. It gathers Python package versions and generates a sine wave plot, rendering them into `index.html` with the application version and Git commit hash.
    *   **`PointsApiHandler`**: Manages CRUD operations (GET, POST, DELETE) for `map_points` in the database. It uses `psycopg2` for database interaction and `geojson` for handling geospatial data.
    *   **`SensorDataHandler`**: Renders the `sensor_data.html` page, which is the frontend for the TimescaleDB sensor data visualization.
    *   **`GenerateSensorDataHandler`**: Handles POST requests to generate a month's worth of simulated CPU, memory, network speed, and bandwidth data, inserting it into the `sensor_data` hypertable.
    *   **`ClearSensorDataHandler`**: Handles POST requests to clear all data from the `sensor_data` table.
    *   **`FetchSensorDataHandler`**: Handles GET requests to retrieve all sensor data from the `sensor_data` table, returning it as JSON.
    *   **`make_app()`**: Configures the Tornado `Application` with various URL routes mapping to their respective handlers.
*   **`requirements.txt`**: Lists all Python dependencies required by the application, such as `tornado`, `numpy`, `matplotlib`, `psycopg2-binary`, and `geojson`.
*   **`index.html`**: The main HTML template for the Tornado utility page, displaying installed packages and providing a link to the Timescale Dashboard.
*   **`sensor_data.html`**: The HTML template for the Timescale Dashboard, which uses Apache ECharts to visualize sensor data and provides controls for data management.

## 3. Dockerfile Explanation

The `tornado-app/Dockerfile` defines the steps to build and run the Tornado application within a Docker container.

```dockerfile
FROM python:3.9-slim

ARG COMMIT_HASH
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV COMMIT_HASH=${COMMIT_HASH}

EXPOSE 8888

CMD ["python", "main.py"]
```

**Explanation of Dockerfile:**

*   **`FROM python:3.9-slim`**:
    *   Uses `python:3.9-slim` as the base image. The `slim` tag indicates a smaller image size, which is beneficial for production deployments.

*   **`ARG COMMIT_HASH`**:
    *   Declares a build argument `COMMIT_HASH` which will be passed during the Docker build process (e.g., `--build-arg COMMIT_HASH=<hash>`).

*   **`WORKDIR /app`**:
    *   Sets the working directory inside the container to `/app`. All subsequent commands will be executed relative to this directory.

*   **`COPY requirements.txt .`**:
    *   Copies the `requirements.txt` file into the working directory. This is done before copying the rest of the code to leverage Docker's build cache. If dependencies don't change, this layer won't be rebuilt.

*   **`RUN pip install --no-cache-dir -r requirements.txt`**:
    *   Installs all Python packages listed in `requirements.txt`. The `--no-cache-dir` flag prevents pip from storing downloaded packages in a cache, further reducing the image size.

*   **`COPY . .`**:
    *   Copies the entire contents of the current directory (your `tornado-app` folder) into the `/app` directory inside the container.

*   **`ENV COMMIT_HASH=${COMMIT_HASH}`**:
    *   Sets an environment variable `COMMIT_HASH` in the final image, using the value passed during the build process. This variable is then accessible within the Tornado application.

*   **`EXPOSE 8888`**:
    *   Informs Docker that the container listens on port 8888 at runtime. This is the default port for the Tornado application.

*   **`CMD ["python", "main.py"]`**:
    *   Defines the command that will be executed when the container starts. It runs the `main.py` script, which starts the Tornado web server.

This Dockerfile creates a self-contained environment for the Tornado application, ensuring all dependencies are met and the application can run reliably.

## 4. Unit Testing

Unit tests for the Tornado application are written using [Pytest](https://docs.pytest.org/en/stable/).

### Test File Location

Test files are typically located in a `tests/` directory within the `tornado-app/` folder and follow the `test_*.py` or `*_test.py` naming convention (e.g., `tests/test_main.py`).

### Running Tests

To run all unit tests for the Tornado application, execute the following command from within the `tornado-app/` directory:

```bash
pytest
```

### Generating Coverage Reports

To generate a code coverage report, first ensure `pytest-cov` is installed (add it to `requirements.txt` if not already present).

Then, run the following command:

```bash
pytest --cov=.
```

This will generate a coverage report in the console. For a more detailed HTML report, use:

```bash
pytest --cov=. --cov-report=html
```

This will create an `htmlcov/` directory with the detailed report.

