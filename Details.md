Excellent. Thank you for the clarifications. Based on your input, we will proceed with a straightforward authentication, creative dashboard interactions, and a PostGIS-backed map application. The map server will be allowed internet access for tiles, simplifying that part of the setup.  
Here is the complete, step-by-step guide to building your proof-of-concept system on Docker.

### ---

**Part 1: Project Setup and Orchestration**

First, we'll define the project structure and the docker-compose.yml file that will manage all our services. This file is the heart of our application, defining how the containers are built, networked, and run.

#### **1.1. Project Directory Structure**

Create a root directory for your project (e.g., docker-poc) and populate it with the following subdirectories and files. You will create the content for these files in the upcoming steps.

docker-poc/  
├── docker-compose.yml  
├── nginx.conf  
|  
├── database/  
│   ├── Dockerfile  
│   └── init.sql  
|  
├── nuxt-app/  
│   └── (Nuxt.js project files will go here)  
│  
├── tornado-app/  
│   ├── main.py  
│   └── requirements.txt  
|  
└── angular-app/  
    └── (Angular project files will go here)

#### **1.2. The Reverse Proxy (Nginx)**

A reverse proxy is essential for routing traffic to the correct application from a single entry point (localhost).  
Create nginx.conf:

Nginx

events {}

http {  
    server {  
        listen 80;

        location / {  
            proxy\_pass http://nuxt-app:3000;  
        }

        location /tools/ {  
            proxy\_pass http://tornado-app:8888/;  
        }

        location /map/ {  
            proxy\_pass http://angular-app:80/;  
        }  
          
        \# Route API calls for map points to the Tornado backend  
        location /api/points/ {  
            proxy\_pass http://tornado-app:8888/api/points/;  
        }  
    }  
}

#### **1.3. The Docker Compose File**

This file orchestrates everything. It defines our five services: database, nuxt-app, tornado-app, angular-app, and proxy.  
Create docker-compose.yml:

YAML

version: '3.8'

services:  
  \# 1\. PostgreSQL Database with PostGIS & TimescaleDB  
  database:  
    build: ./database  
    container\_name: poc\_database  
    restart: always  
    environment:  
      \- POSTGRES\_USER=user  
      \- POSTGRES\_PASSWORD=password  
      \- POSTGRES\_DB=appdb  
    volumes:  
      \- postgres\_data:/var/lib/postgresql/data  
    ports:  
      \- "5432:5432"

  \# 2\. NuxtUI Web App  
  nuxt-app:  
    build:  
      context: ./nuxt-app  
    container\_name: poc\_nuxt\_app  
    restart: always  
    environment:  
      \- DATABASE\_URL=postgres://user:password@database:5432/appdb  
    depends\_on:  
      \- database

  \# 3\. Tornado Python App  
  tornado-app:  
    build:  
      context: ./tornado-app  
    container\_name: poc\_tornado\_app  
    restart: always  
    depends\_on:  
      \- database

  \# 4\. Angular Map App  
  angular-app:  
    build:  
      context: ./angular-app  
    container\_name: poc\_angular\_app  
    restart: always

  \# 5\. Nginx Reverse Proxy  
  proxy:  
    image: nginx:alpine  
    container\_name: poc\_proxy  
    restart: always  
    volumes:  
      \- ./nginx.conf:/etc/nginx/nginx.conf:ro  
    ports:  
      \- "80:80"  
    depends\_on:  
      \- nuxt-app  
      \- tornado-app  
      \- angular-app

volumes:  
  postgres\_data:

### ---

**Part 2: The Database Container**

This container will run PostgreSQL, enhanced with PostGIS for geographic data and TimescaleDB for time-series data.

#### **2.1. Dockerfile for the Database**

In the database/ directory, create a Dockerfile. We use the timescale/timescaledb-ha image which conveniently includes PostGIS.  
database/Dockerfile:

Dockerfile

\# Use the official TimescaleDB image, which includes PostGIS  
FROM timescale/timescaledb-ha:pg14-ts2.7-latest

\# This script will be executed on first run to initialize our database  
COPY init.sql /docker-entrypoint-initdb.d/

#### **2.2. Database Initialization Script**

This SQL script creates our tables. The PostGIS extension is enabled, and tables for users, dashboard stats, and map points are defined.  
database/init.sql:

SQL

\-- Enable PostGIS extension  
CREATE EXTENSION IF NOT EXISTS postgis;

\-- User table for the Nuxt app login  
CREATE TABLE users (  
    id SERIAL PRIMARY KEY,  
    email VARCHAR(255) UNIQUE NOT NULL,  
    password VARCHAR(255) NOT NULL,  
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

\-- Dashboard data table  
CREATE TABLE dashboard\_stats (  
    id SERIAL PRIMARY KEY,  
    stat\_name VARCHAR(100) UNIQUE NOT NULL,  
    stat\_value INT DEFAULT 0  
);

\-- Geospatial table for map points from the Angular app  
CREATE TABLE map\_points (  
    id SERIAL PRIMARY KEY,  
    \-- Storing point data in WGS 84 spatial reference system (SRID 4326\)  
    geom GEOMETRY(Point, 4326\) NOT NULL,   
    created\_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

\-- Insert some dummy data to start with  
INSERT INTO users (email, password) VALUES ('test@example.com', '1234');  
INSERT INTO dashboard\_stats (stat\_name, stat\_value) VALUES ('clicks', 10), ('items\_processed', 42), ('logins', 1);

### ---

**Part 3: The NuxtUI Web App**

Now, let's create the Nuxt app.

#### **3.1. Create the Nuxt Project**

1. Navigate into the nuxt-app directory.  
2. Run the command to create a new Nuxt 3 project:  
   Bash  
   npx nuxi@latest init .

3. When prompted, install the dependencies.  
4. Install pg for database access: npm install pg  
5. Install NuxtUI: npm install @nuxt/ui  
6. Add @nuxt/ui to the modules section of your nuxt.config.ts file.

#### **3.2. Dockerfile for Nuxt**

In the nuxt-app/ directory, create a Dockerfile.  
nuxt-app/Dockerfile:

Dockerfile

\# Stage 1: Build the application  
FROM node:18-alpine AS build  
WORKDIR /app  
COPY package\*.json ./  
RUN npm install  
COPY . .  
RUN npm run build

\# Stage 2: Run the application  
FROM node:18-alpine  
WORKDIR /app  
COPY \--from=build /app/.output .  
ENV HOST=0.0.0.0  
EXPOSE 3000  
CMD \["node", "./server/index.mjs"\]

#### **3.3. Application Code**

You'll need to create pages and server endpoints. Here are the key files to create inside nuxt-app:  
**Login Page (pages/login.vue):**

HTML

\<template\>  
  \<UCard @submit.prevent="handleLogin"\>  
    \<UForm :state="state"\>  
      \<UFormGroup label="Email" name="email"\>\<UInput v-model="state.email" /\>\</UFormGroup\>  
      \<UFormGroup label="Password" name="password"\>\<UInput v-model="state.password" type="password" /\>\</UFormGroup\>  
      \<UButton type="submit"\>Log In\</UButton\>  
    \</UForm\>  
  \</UCard\>  
\</template\>  
\<script setup\>  
const state \= reactive({ email: '', password: '' })  
const handleLogin \= async () \=\> {  
  await $fetch('/api/login', { method: 'POST', body: state });  
  navigateTo('/dashboard');  
}  
\</script\>

**Dashboard Page (pages/dashboard.vue):**

HTML

\<template\>  
  \<UCard\>  
    \<template \#header\>Dashboard\</template\>  
    \<div v-for="stat in stats.data.value" :key="stat.id"\>  
      {{ stat.stat\_name }}: {{ stat.stat\_value }}  
      \<UButton @click="increment(stat.stat\_name)"\>+\</UButton\>  
    \</div\>  
  \</UCard\>  
\</template\>  
\<script setup\>  
const stats \= await useFetch('/api/stats');  
const increment \= async (name) \=\> {  
  await $fetch('/api/stats', { method: 'PUT', body: { name } });  
  await stats.refresh();  
}  
\</script\>

API Endpoints (server/api/):  
Create the files login.post.ts, stats.get.ts, and stats.put.ts in the server/api/ directory with the appropriate logic to query your database.

### ---

**Part 4: The Tornado/Python Tools App**

This service will showcase Python capabilities.

#### **4.1. Project Files**

In the tornado-app/ directory, create these two files.  
requirements.txt:

tornado  
numpy  
matplotlib  
psycopg2-binary  
geojson

main.py:

Python

import tornado.ioloop  
import tornado.web  
import io  
import base64  
import numpy as np  
import matplotlib.pyplot as plt  
import pkg\_resources  
import json  
import psycopg2  
from psycopg2.extras import RealDictCursor  
import geojson

\# \--- Database Connection \---  
def get\_db\_connection():  
    return psycopg2.connect("dbname='appdb' user='user' password='password' host='database'")

\# \--- Tornado Handlers \---  
class MainHandler(tornado.web.RequestHandler):  
    def get(self):  
        \# 1\. Get Python package versions  
        installed\_packages \= {pkg.key: pkg.version for pkg in pkg\_resources.working\_set}  
          
        \# 2\. Generate sinus plot  
        t \= np.arange(0.0, 2.0, 0.01)  
        s \= 1 \+ np.sin(2 \* np.pi \* t)  
        fig, ax \= plt.subplots()  
        ax.plot(t, s)  
        ax.set(xlabel='time (s)', ylabel='voltage (mV)', title='Sinus Plot')  
          
        \# Save plot to memory  
        buf \= io.BytesIO()  
        fig.savefig(buf, format='png')  
        plt.close(fig)  
        data \= base64.b64encode(buf.getbuffer()).decode("ascii")  
          
        \# 3\. Render HTML  
        self.render("index.html", packages=installed\_packages, plot\_image=data)

class PointsApiHandler(tornado.web.RequestHandler):  
    def get(self):  
        conn \= get\_db\_connection()  
        cur \= conn.cursor()  
        cur.execute("SELECT id, ST\_AsGeoJSON(geom) as geojson FROM map\_points")  
        points \= cur.fetchall()  
        cur.close()  
        conn.close()  
          
        features \= \[geojson.Feature(geometry=json.loads(p\[1\]), properties={"id": p\[0\]}) for p in points\]  
        self.write(geojson.FeatureCollection(features))  
        self.set\_header("Content-Type", "application/json")

    def post(self):  
        data \= json.loads(self.request.body)  
        point \= geojson.Point((data\['lon'\], data\['lat'\]))  
          
        conn \= get\_db\_connection()  
        cur \= conn.cursor()  
        \# Use ST\_GeomFromGeoJSON for easy insertion  
        cur.execute("INSERT INTO map\_points (geom) VALUES (ST\_GeomFromGeoJSON(%s)) RETURNING id",   
                    (geojson.dumps(point),))  
        new\_id \= cur.fetchone()\[0\]  
        conn.commit()  
        cur.close()  
        conn.close()

        self.write({"status": "success", "id": new\_id})  
        self.set\_header("Content-Type", "application/json")  
          
    def delete(self):  
        point\_id \= int(self.get\_argument("id"))  
        conn \= get\_db\_connection()  
        cur \= conn.cursor()  
        cur.execute("DELETE FROM map\_points WHERE id \= %s", (point\_id,))  
        conn.commit()  
        cur.close()  
        conn.close()  
        self.write({"status": "deleted", "id": point\_id})

def make\_app():  
    return tornado.web.Application(\[  
        (r"/", MainHandler),  
        (r"/api/points/", PointsApiHandler),  
    \], template\_path=".")

if \_\_name\_\_ \== "\_\_main\_\_":  
    app \= make\_app()  
    app.listen(8888)  
    tornado.ioloop.IOLoop.current().start()

Create a simple index.html template in the same directory for the MainHandler to render.

#### **4.2. Dockerfile for Tornado**

In the tornado-app/ directory, create a Dockerfile.  
tornado-app/Dockerfile:

Dockerfile

FROM python:3.9-slim  
WORKDIR /app  
COPY requirements.txt .  
RUN pip install \--no-cache-dir \-r requirements.txt  
COPY . .  
CMD \["python", "main.py"\]

### ---

**Part 5: The Angular Map App**

This app will provide the interactive map.

#### **5.1. Create the Angular Project**

1. Make sure you have the Angular CLI: npm install \-g @angular/cli.  
2. Navigate into the angular-app directory.  
3. Run ng new . to create a new project in the current directory.  
4. Install OpenLayers: npm install ol.

#### **5.2. Dockerfile for Angular**

In the angular-app/ directory, create a Dockerfile. This uses a multi-stage build to create a small, efficient Nginx server for the final image.  
angular-app/Dockerfile:

Dockerfile

\# Stage 1: Build the Angular app  
FROM node:18-alpine as build  
WORKDIR /app  
COPY package.json package-lock.json ./  
RUN npm install  
COPY . .  
RUN npm run build \-- \--configuration production

\# Stage 2: Serve the app with Nginx  
FROM nginx:alpine  
COPY \--from=build /app/dist/angular-app/ /usr/share/nginx/html  
EXPOSE 80

#### **5.3. Application Code**

Replace the contents of src/app/app.component.ts and src/app/app.component.html to implement the map using OpenLayers. You will create a service to handle HTTP requests to your Tornado API (/api/points/) for creating and deleting points.

### ---

**Part 6: Usage Guide**

#### **Installation and Running**

1. **Install Prerequisites**: Make sure you have **Docker** and **Docker Compose** installed on your Linux machine.  
2. **Clone Project**: Get the project code onto your machine.  
3. **Start Services**: Open a terminal in the root docker-poc directory and run:  
   Bash  
   docker-compose up \--build \-d  
   This command will build all your custom images and start the containers in detached (-d) mode.

**Accessing Your Applications:**

* **NuxtUI App**: http://localhost  
* **Tornado Tools**: http://localhost/tools/  
* **Angular Map**: http://localhost/map/

#### **Development Workflow (Hot Reload)**

To enable hot-reloading for frontend development, you can add volume mounts to your docker-compose.yml and modify the commands to run the dev servers.  
Example for nuxt-app:

YAML

\# In docker-compose.yml  
services:  
  nuxt-app:  
    \# ...  
    volumes:  
      \- ./nuxt-app:/app  
    command: npm run dev

#### **Offline Update Process**

This is the procedure for updating the application on a server with no internet access.  
**1\. On Your Development Machine (with Internet):**

* Make your code changes in nuxt-app, tornado-app, or angular-app.  
* Build the new Docker images. For example, to rebuild just the Nuxt app:  
  Bash  
  docker-compose build nuxt-app

* Save the newly built image to a .tar file. The image name is typically project-name\_service-name.  
  Bash  
  docker save docker-poc\_nuxt-app:latest \> nuxt-app-new.tar

**2\. Transfer the File:**

* Move the nuxt-app-new.tar file to the offline server using a USB stick or other means.

**3\. On the Offline Server:**

* Load the image from the tarball into Docker:  
  Bash  
  docker load \< nuxt-app-new.tar

* Go to the project directory where your docker-compose.yml is located.  
* Tell Docker Compose to restart the service. It will automatically use the newly loaded image:  
  Bash  
  docker-compose up \-d \--no-build nuxt-app  
  The \--no-build flag is critical here, as it ensures Docker doesn't try (and fail) to build the image online. The container will be recreated using the new code. Your data is safe because it's stored in the postgres\_data volume.