import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { HttpClient } from '@angular/common/http';
import { Coordinate } from 'ol/coordinate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  map!: Map;
  vectorSource!: VectorSource;

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
    const point = new Point(coords);
    const feature = new Feature(point);
    this.vectorSource.addFeature(feature);

    this.http.post('/api/points/', { lon: coords[0], lat: coords[1] }).subscribe();
  }

  deleteLastPoint() {
    const features = this.vectorSource.getFeatures();
    if (features.length > 0) {
      const lastFeature = features[features.length - 1];
      this.vectorSource.removeFeature(lastFeature);

      const id = lastFeature.get('id');
      this.http.delete(`/api/points/?id=${id}`).subscribe();
    }
  }

  getPoints() {
    this.http.get<any[]>('/api/points/').subscribe(points => {
      const features = points.map(p => {
        const feature = new Feature(new Point(fromLonLat([p.geometry.coordinates[0], p.geometry.coordinates[1]])))
        feature.set('id', p.properties.id);
        return feature;
      });
      this.vectorSource.addFeatures(features);
    });
  }
}