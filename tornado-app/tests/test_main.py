import pytest
from unittest.mock import MagicMock, patch
from main import MainHandler, PointsApiHandler, SensorDataHandler, GenerateSensorDataHandler, ClearSensorDataHandler, FetchSensorDataHandler
import json
from tornado.testing import AsyncHTTPTestCase
from tornado.web import Application
import geojson
from datetime import datetime, timedelta

# Mock the database connection for all tests
@pytest.fixture(autouse=True)
def mock_db_connection():
    with patch('main.get_db_connection') as mock_get_db_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_db_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        yield mock_cursor

class TestTornadoApp(AsyncHTTPTestCase):
    def get_app(self):
        return Application([
            (r"/", MainHandler),
            (r"/api/points/", PointsApiHandler),
            (r"/tools/sensor_data", SensorDataHandler),
            (r"/api/sensor_data/generate", GenerateSensorDataHandler),
            (r"/api/sensor_data/clear", ClearSensorDataHandler),
            (r"/api/sensor_data/fetch", FetchSensorDataHandler),
        ])

    @pytest.mark.gen_test
    async def test_main_handler(self, mock_db_connection):
        response = await self.http_client.fetch("/")
        self.assertEqual(response.code, 200)
        self.assertIn(b"Installed Python Packages", response.body)
        self.assertIn(b"Sinus Plot", response.body)

    @pytest.mark.gen_test
    async def test_points_api_get(self, mock_db_connection):
        mock_db_connection.fetchall.return_value = [
            (1, json.dumps({"type": "Point", "coordinates": [10, 20]})),
        ]
        response = await self.http_client.fetch("/api/points/")
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(data['type'], 'FeatureCollection')
        self.assertEqual(len(data['features']), 1)
        self.assertEqual(data['features'][0]['properties']['id'], 1)

    @pytest.mark.gen_test
    async def test_points_api_post(self, mock_db_connection):
        mock_db_connection.fetchone.return_value = (1, datetime.now())
        response = await self.http_client.fetch(
            "/api/points/",
            method="POST",
            body=json.dumps({"lon": 10, "lat": 20}),
            headers={'Content-Type': 'application/json'}
        )
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['id'], 1)
        mock_db_connection.execute.assert_called_once()

    @pytest.mark.gen_test
    async def test_points_api_delete(self, mock_db_connection):
        response = await self.http_client.fetch("/api/points/?id=1", method="DELETE")
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(data['status'], 'deleted')
        self.assertEqual(data['id'], 1)
        mock_db_connection.execute.assert_called_once_with("DELETE FROM map_points WHERE id = %s", (1,))

    @pytest.mark.gen_test
    async def test_sensor_data_handler(self):
        response = await self.http_client.fetch("/tools/sensor_data")
        self.assertEqual(response.code, 200)
        self.assertIn(b"Sensor Data Dashboard", response.body)

    @pytest.mark.gen_test
    async def test_generate_sensor_data_handler(self, mock_db_connection):
        response = await self.http_client.fetch(
            "/api/sensor_data/generate",
            method="POST",
            headers={'Content-Type': 'application/json'}
        )
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(data['status'], 'success')
        self.assertIn('Sensor data generated.', data['message'])
        mock_db_connection.execute.assert_called()
        mock_db_connection.connection.commit.assert_called_once()

    @pytest.mark.gen_test
    async def test_clear_sensor_data_handler(self, mock_db_connection):
        response = await self.http_client.fetch(
            "/api/sensor_data/clear",
            method="POST",
            headers={'Content-Type': 'application/json'}
        )
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(data['status'], 'success')
        self.assertEqual(data['message'], 'Sensor data cleared.')
        mock_db_connection.execute.assert_called_once_with("TRUNCATE TABLE sensor_data;")
        mock_db_connection.connection.commit.assert_called_once()

    @pytest.mark.gen_test
    async def test_fetch_sensor_data_handler(self, mock_db_connection):
        mock_db_connection.fetchall.return_value = [
            {'time': datetime.now(), 'cpu_usage': 50.0, 'memory_usage': 60.0, 'network_speed': 100.0, 'bandwidth_usage': 200.0}
        ]
        response = await self.http_client.fetch("/api/sensor_data/fetch")
        self.assertEqual(response.code, 200)
        data = json.loads(response.body)
        self.assertEqual(len(data), 1)
        self.assertIn('cpu_usage', data[0])
        self.assertIn('memory_usage', data[0])
