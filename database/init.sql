-- Enable PostGIS extension  
CREATE EXTENSION IF NOT EXISTS postgis;

-- User table for the Nuxt app login  
CREATE TABLE users (  
    id SERIAL PRIMARY KEY,  
    email VARCHAR(255) UNIQUE NOT NULL,  
    password VARCHAR(255) NOT NULL,  
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

-- Dashboard data table  
CREATE TABLE dashboard_stats (  
    id SERIAL PRIMARY KEY,  
    stat_name VARCHAR(100) UNIQUE NOT NULL,  
    stat_value INT DEFAULT 0  
);

-- Geospatial table for map points from the Angular app  
CREATE TABLE map_points (  
    id SERIAL PRIMARY KEY,  
    geom GEOMETRY(Point, 4326) NOT NULL,   
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  
);

-- Insert some dummy data to start with  
INSERT INTO users (email, password) VALUES ('test@example.com', '1234');  
INSERT INTO dashboard_stats (stat_name, stat_value) VALUES ('clicks', 10), ('items_processed', 42), ('logins', 1);
