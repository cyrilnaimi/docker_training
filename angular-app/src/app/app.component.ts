import { CommonModule } from '@angular/common';
import { versionInfo } from '../environments/version';
import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from 'ol/coordinate';


interface MapPoint {
  id: number;
  lon: number;
  lat: number;
  created_at: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule] // Add CommonModule here
})
export class AppComponent implements OnInit {
  map!: Map;
  vectorSource!: VectorSource;
  last10Points: MapPoint[] = [];
  commitHash: string = versionInfo.hash;
  appVersion: string = versionInfo.version;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.vectorSource = new VectorSource();

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        new VectorLayer({
          source: this.vectorSource
        })
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2
      })
    });

    this.map.on('click', (event) => {
      const coords = event.coordinate;
      this.createPoint(coords);
    });

    this.getPoints();
  }

  createPoint(coords: Coordinate) {
    const lonLat = toLonLat(coords);
    this.http.post<MapPoint>('/api/points/', { lon: lonLat[0], lat: lonLat[1] }).subscribe(newPoint => {
      const feature = new Feature(new Point(coords));
      feature.set('id', newPoint.id);
      feature.set('created_at', newPoint.created_at);
      this.vectorSource.addFeature(feature);
      this.updateLast10Points();
    });
  }

  deleteLastPoint() {
    const features = this.vectorSource.getFeatures();
    if (features.length > 0) {
      const lastFeature = features[features.length - 1];
      const id = lastFeature.get('id');
      this.http.delete(`/api/points/?id=${id}`).subscribe(() => {
        this.vectorSource.removeFeature(lastFeature);
        this.updateLast10Points();
      });
    }
  }

  getPoints() {
    this.http.get<any>('/api/points/').subscribe((response: any) => {
      this.vectorSource.clear(); // Clear existing features before adding new ones
      const features = response.features.map((p: any) => {
        const feature = new Feature(new Point(fromLonLat([p.geometry.coordinates[0], p.geometry.coordinates[1]])))
        feature.set('id', p.properties.id);
        feature.set('created_at', p.properties.created_at);
        return feature;
      });
      this.vectorSource.addFeatures(features);
      this.updateLast10Points();
    });
  }

  updateLast10Points() {
    const features = this.vectorSource.getFeatures();
    const allPoints: MapPoint[] = features.map(feature => {
      const coords = (feature.getGeometry() as Point).getCoordinates();
      const lonLat = toLonLat(coords);
      return {
        id: feature.get('id'),
        lon: lonLat[0],
        lat: lonLat[1],
        created_at: feature.get('created_at')
      };
    });
    // Sort by creation time (newest first) and take the last 10
    this.last10Points = allPoints.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  }
}