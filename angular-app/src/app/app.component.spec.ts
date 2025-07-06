import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import Map from 'ol/Map';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, CommonModule] // Import AppComponent directly as it's standalone
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify(); // Ensure that no outstanding requests are pending
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the map', () => {
    expect(component.map).toBeInstanceOf(Map);
    expect(component.map.getTarget()).toBe('map');
  });

  it('should create a point and send it to the backend', () => {
    const mockCoords = fromLonLat([10, 20]);
    const mockNewPoint = { id: 1, lon: 10, lat: 20, created_at: new Date().toISOString() };

    component.createPoint(mockCoords);

    const req = httpTestingController.expectOne('/api/points/');
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ lon: 10, lat: 20 });
    req.flush(mockNewPoint);

    expect(component.vectorSource.getFeatures().length).toBe(1);
    expect(component.last10Points.length).toBe(1);
    expect(component.last10Points[0].lon).toBe(10);
  });

  it('should delete the last point and send delete request to backend', () => {
    // First, add a point to delete
    const mockCoords = fromLonLat([10, 20]);
    const mockNewPoint = { id: 1, lon: 10, lat: 20, created_at: new Date().toISOString() };
    component.createPoint(mockCoords);
    httpTestingController.expectOne('/api/points/').flush(mockNewPoint);

    component.deleteLastPoint();

    const req = httpTestingController.expectOne('/api/points/?id=1');
    expect(req.request.method).toEqual('DELETE');
    req.flush({});

    expect(component.vectorSource.getFeatures().length).toBe(0);
    expect(component.last10Points.length).toBe(0);
  });

  it('should fetch points from backend and update map and table', () => {
    const mockResponse = {
      features: [
        { geometry: { coordinates: [10, 20] }, properties: { id: 1, created_at: new Date().toISOString() } },
        { geometry: { coordinates: [30, 40] }, properties: { id: 2, created_at: new Date().toISOString() } },
      ]
    };

    component.getPoints();

    const req = httpTestingController.expectOne('/api/points/');
    expect(req.request.method).toEqual('GET');
    req.flush(mockResponse);

    expect(component.vectorSource.getFeatures().length).toBe(2);
    expect(component.last10Points.length).toBe(2);
    expect(component.last10Points[0].lon).toBe(30); // Assuming sorting by created_at, newest first
  });

  it('should update last10Points correctly after multiple additions', () => {
    // Simulate adding 15 points
    for (let i = 0; i < 15; i++) {
      const mockCoords = fromLonLat([i, i]);
      const mockNewPoint = { id: i, lon: i, lat: i, created_at: new Date(Date.now() + i * 1000).toISOString() };
      component.createPoint(mockCoords);
      httpTestingController.expectOne('/api/points/').flush(mockNewPoint);
    }

    expect(component.last10Points.length).toBe(10);
    // Verify that the last 10 points are indeed the newest ones
    expect(component.last10Points[0].id).toBe(14);
    expect(component.last10Points[9].id).toBe(5);
  });
});
