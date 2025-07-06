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
        cur.execute("INSERT INTO map_points (geom) VALUES (ST_GeomFromGeoJSON(%s)) RETURNING id",   
                    (geojson.dumps(point),))  
        new_id = cur.fetchone()[0]  
        conn.commit()  
        cur.close()  
        conn.close()

        self.write({"status": "success", "id": new_id})  
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
    ], template_path=".")

if __name__ == "__main__":  
    print("Running Tornado application...")
    app = make_app()  
    app.listen(8888)  
    tornado.ioloop.IOLoop.current().start()
