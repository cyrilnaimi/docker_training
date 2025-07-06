import tornado.ioloop  
import tornado.web  
import io  
import base64  
import numpy as np  
import matplotlib.pyplot as plt  
import pkg_resources  
import json  
import psycopg2  
from psycopg2.extras import RealDictCursor  
import geojson
from datetime import datetime, timedelta
import random

print("Starting main.py")

# --- Database Connection ---
def get_db_connection():  
    return psycopg2.connect("dbname='appdb' user='user' password='password' host='database'")

# --- Tornado Handlers ---
class MainHandler(tornado.web.RequestHandler):  
    def get(self):  
        # 1. Get Python package versions  
        installed_packages = {pkg.key: pkg.version for pkg in pkg_resources.working_set}  
          
        # 2. Generate sinus plot  
        t = np.arange(0.0, 2.0, 0.01)  
        s = 1 + np.sin(2 * np.pi * t)  
        fig, ax = plt.subplots()  
        ax.plot(t, s)  
        ax.set(xlabel='time (s)', ylabel='voltage (mV)', title='Sinus Plot')  
          
        # Save plot to memory  
        buf = io.BytesIO()  
        fig.savefig(buf, format='png')  
        plt.close(fig)  
        data = base64.b64encode(buf.getbuffer()).decode("ascii")  
          
        # 3. Render HTML  
        self.render("index.html", packages=installed_packages, plot_image=data)

class SensorDataHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("sensor_data.html")

class GenerateSensorDataHandler(tornado.web.RequestHandler):
    def post(self):
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            # Clear existing data
            cur.execute("TRUNCATE TABLE sensor_data;")

            # Generate one month of fake data
            end_time = datetime.now()
            start_time = end_time - timedelta(days=30)
            current_time = start_time

            while current_time <= end_time:
                cpu = round(random.uniform(20, 80), 2)
                memory = round(random.uniform(30, 90), 2)
                network = round(random.uniform(100, 1000), 2)
                bandwidth = round(random.uniform(50, 500), 2)
                cur.execute(
                    "INSERT INTO sensor_data (time, cpu_usage, memory_usage, network_speed, bandwidth_usage) VALUES (%s, %s, %s, %s, %s)",
                    (current_time, cpu, memory, network, bandwidth)
                )
                current_time += timedelta(minutes=5) # Data every 5 minutes
            conn.commit()
            self.write({"status": "success", "message": "Sensor data generated."})
        except Exception as e:
            conn.rollback()
            self.write({"status": "error", "message": str(e)})
        finally:
            cur.close()
            conn.close()
        self.set_header("Content-Type", "application/json")

class ClearSensorDataHandler(tornado.web.RequestHandler):
    def post(self):
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("TRUNCATE TABLE sensor_data;")
            conn.commit()
            self.write({"status": "success", "message": "Sensor data cleared."})
        except Exception as e:
            conn.rollback()
            self.write({"status": "error", "message": str(e)})
        finally:
            cur.close()
            conn.close()
        self.set_header("Content-Type", "application/json")

class FetchSensorDataHandler(tornado.web.RequestHandler):
    def get(self):
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            cur.execute("SELECT time, cpu_usage, memory_usage, network_speed, bandwidth_usage FROM sensor_data ORDER BY time ASC;")
            data = cur.fetchall()
            # Convert datetime objects to string for JSON serialization
            for row in data:
                row['time'] = row['time'].isoformat()
            self.write(json.dumps(data))
        except Exception as e:
            self.write({"status": "error", "message": str(e)})
        finally:
            cur.close()
            conn.close()
        self.set_header("Content-Type", "application/json")

class PointsApiHandler(tornado.web.RequestHandler):  
    def get(self):  
        conn = get_db_connection()  
        cur = conn.cursor()  
        cur.execute("SELECT id, ST_AsGeoJSON(geom) as geojson FROM map_points")  
        points = cur.fetchall()  
        cur.close()  
        conn.close()  
          
        features = [geojson.Feature(geometry=json.loads(p[1]), properties={"id": p[0]}) for p in points]  
        self.write(geojson.FeatureCollection(features))  
        self.set_header("Content-Type", "application/json")

    def post(self):  
        data = json.loads(self.request.body)  
        point = geojson.Point((data['lon'], data['lat']))  
          
        conn = get_db_connection()  
        cur = conn.cursor()  
        cur.execute("INSERT INTO map_points (geom) VALUES (ST_GeomFromGeoJSON(%s)) RETURNING id, created_at",   
                    (geojson.dumps(point),))  
        new_id, created_at = cur.fetchone()  
        conn.commit()  
        cur.close()  
        conn.close()

        self.write({"status": "success", "id": new_id, "created_at": created_at.isoformat()})  
        self.set_header("Content-Type", "application/json")  
          
    def delete(self):  
        point_id = int(self.get_argument("id"))  
        conn = get_db_connection()  
        cur = conn.cursor()  
        cur.execute("DELETE FROM map_points WHERE id = %s", (point_id,))  
        conn.commit()  
        cur.close()  
        conn.close()  
        self.write({"status": "deleted", "id": point_id})

def make_app():  
    print("Making Tornado application...")
    return tornado.web.Application([  
        (r"/", MainHandler),  
        (r"/api/points/", PointsApiHandler),  
        (r"/tools/sensor_data", SensorDataHandler),
        (r"/api/sensor_data/generate", GenerateSensorDataHandler),
        (r"/api/sensor_data/clear", ClearSensorDataHandler),
        (r"/api/sensor_data/fetch", FetchSensorDataHandler),
    ], template_path=".")

if __name__ == "__main__":  
    print("Running Tornado application...")
    app = make_app()  
    app.listen(8888)  
    tornado.ioloop.IOLoop.current().start()
