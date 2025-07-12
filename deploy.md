# Automated Deployment and Updates with a Local Registry and Watchtower

This guide provides a step-by-step walkthrough on how to set up a local Docker registry, version and push an application image, and use Watchtower to automate updates. We will use the `nuxt-app` as our example.

## 1. Setting Up a Local Docker Registry

First, we need a local registry to store our Docker images. This simulates a private registry in a real-world environment.

**Start the local registry:**
```bash
docker run -d -p 5050:5000 --restart=always --name registry registry:2
```
This command starts a Docker registry container named `registry` that listens on port 5050.

## 2. Initial Application Deployment (Version 1.0.0)

### Step 2.1: Version the Application

Set the version number in the `nuxt-app`'s `package.json` file.

**File:** `nuxt-app/package.json`
```json
{
  "name": "nuxt-app",
  "version": "1.0.0",
  ...
}
```

### Step 2.2: Build and Push the Image

Now, build the Docker image for the `nuxt-app` and tag it with the version number and the local registry address.

```bash
# Build the Nuxt.js image (replace <VERSION> with the actual version, e.g., 1.0.0)
docker build -t localhost:5050/nuxt-app:<VERSION> ./nuxt-app

# Push the Nuxt.js image to the local registry
docker push localhost:5050/nuxt-app:<VERSION>
```

### Step 2.2.1: Build and Push the Angular App Image

Now, build the Docker image for the `angular-app` and tag it with the version number and the local registry address.

```bash
# Build the Angular.js image (replace <VERSION> with the actual version, e.g., 1.0.0)
docker build -t localhost:5050/angular-app:<VERSION> ./angular-app

# Push the Angular.js image to the local registry
docker push localhost:5050/angular-app:<VERSION>
```

### Step 2.3: Configure Docker Compose

Modify the `docker-compose.yml` file to use the image from your local registry. Also, add a `latest` tag to the image so Watchtower can monitor it.

**Tag and push the `latest` version:**
```bash
docker tag localhost:5050/nuxt-app:1.0.0 localhost:5050/nuxt-app:latest
docker push localhost:5050/nuxt-app:latest
```

**Update `docker-compose.yml`:**

Change the `nuxt-app` service definition to use the image from the local registry.

```yaml
services:
  # ... other services
  nuxt-app:
    image: localhost:5050/nuxt-app:latest # Use the image from the local registry
    container_name: poc_nuxt_app
    restart: always
    # ... rest of the configuration
```
*Note: We removed the `build` context from the `nuxt-app` service because we are now pulling a pre-built image from our registry.*

### Step 2.4: Deploy the Application

With the configuration updated, start all services.

```bash
docker-compose up -d
```
At this point, your `nuxt-app` (v1.0.0) is running, along with Watchtower, which is now monitoring your services.

## 3. The Automated Update Process (Version 1.0.1)

### Step 3.1: Modify the Application

Let's make a small, visible change to the `nuxt-app`. For example, let's change the text on a button in `pages/dashboard.vue`.

**File:** `nuxt-app/pages/dashboard.vue`
```html
<!-- Change this: -->
<UButton icon="i-heroicons-arrow-path" @click="stats.refresh()">Refresh Stats</UButton>

<!-- To this: -->
<UButton icon="i-heroicons-arrow-path" @click="stats.refresh()">Refresh Data</UButton>
```

### Step 3.2: Increment the Version

Update the version number in `nuxt-app/package.json`.

```json
{
  "name": "nuxt-app",
  "version": "1.0.1",
  ...
}
```

### Step 3.3: Build and Push the New Images

Build the new versions of the applications and push them to the local registry.

```bash
# Build the new Nuxt.js version
docker build -t localhost:5050/nuxt-app:1.0.1 ./nuxt-app

# Push the new Nuxt.js version
docker push localhost:5050/nuxt-app:1.0.1

# Update the 'latest' tag for Nuxt.js
docker tag localhost:5050/nuxt-app:1.0.1 localhost:5050/nuxt-app:latest
docker push localhost:5050/nuxt-app:latest
```

```bash
# Build the new Angular.js version
docker build -t localhost:5050/angular-app:1.0.1 ./angular-app

# Push the new Angular.js version
docker push localhost:5050/angular-app:1.0.1

# Update the 'latest' tag for Angular.js
docker tag localhost:5050/angular-app:1.0.1 localhost:5050/angular-app:latest
docker push localhost:5050/angular-app:latest
```

### Step 3.4: Watchtower in Action

You don't need to do anything else! Watchtower is configured to check for new images every 5 minutes (or as configured by `WATCHTOWER_POLL_INTERVAL`).

Within that interval, Watchtower will:
1.  Detect that the `localhost:5050/nuxt-app:latest` image has a new hash in the registry.
2.  Automatically pull the new `localhost:5050/nuxt-app:1.0.1` image.
3.  Gracefully shut down the old `poc_nuxt_app` container.
4.  Start a new `poc_nuxt_app` container using the new image.

### Step 3.5: Verify the Update

You can check the logs of the Watchtower container to see the update process.

```bash
docker logs -f watchtower
```

You will see logs indicating that it has found a new image and is updating the container. Once updated, you can visit the application in your browser, and you should see the button text changed to "Refresh Data", confirming the update was successful.

## 4. Advanced Docker Management

### 4.1 Verifying Docker Volumes

To inspect the volumes created by Docker Compose, you can use the following commands:

*   **List all volumes:**
    ```bash
    docker volume ls
    ```
*   **Inspect a specific volume (e.g., `docker_training_postgres_data`):**
    ```bash
    docker volume inspect docker_training_postgres_data
    ```
    This will show details like the mountpoint on the host system, which is useful for direct access or backups.

### 4.2 Using Named Volumes for the Registry

For better management and clarity, it's recommended to use a named volume for your local Docker registry. This ensures data persistence even if the registry container is removed.

1.  **Create a named volume:**
    ```bash
    docker volume create my_registry_data
    ```
2.  **Start the registry using the named volume:**
    ```bash
    docker run -d -p 5050:5000 --restart=always --name registry -v my_registry_data:/var/lib/registry registry:2
    ```
    Here, `my_registry_data` is the named volume, and `/var/lib/registry` is the default data directory inside the registry container.

### 4.3 Exporting and Importing Docker Images

If you need to move a built image to a new server without direct registry access, you can export and import it.

*   **Export a built image to a tar archive:**
    ```bash
    docker save -o my_image.tar localhost:5050/my-app:latest
    ```
    This saves the image `localhost:5050/my-app:latest` to a file named `my_image.tar`.

*   **Import an image from a tar archive on a new server:**
    ```bash
    docker load -i my_image.tar
    ```
    This loads the image from the `my_image.tar` file into the Docker daemon on the new server.

### 4.4 Pushing an Imported Image to an Existing Registry

After importing an image to a new server, you might want to push it to an existing registry (e.g., your `localhost:5050` registry or a remote one).

1.  **Tag the imported image for the target registry:**
    ```bash
    docker tag my-app:latest localhost:5050/my-app:latest
    ```
    Replace `my-app:latest` with the image name and tag after loading it.

2.  **Push the tagged image to the registry:**
    ```bash
    docker push localhost:5050/my-app:latest
    ```
    Ensure your Docker daemon on the new server is configured to access the target registry (e.g., by logging in if it's a private registry).
