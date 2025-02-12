import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private apiLoaded: Promise<void> | null = null;
  private map!: google.maps.Map;
  private boundsChanged$ = new Subject<google.maps.LatLngBounds>();

  /**
   * Carga la API de Google Maps solo una vez.
   */
  loadApi(): Promise<void> {
    if (this.apiLoaded || document.getElementById('google-maps-script')) {
      return this.apiLoaded || Promise.resolve();
    }

    this.apiLoaded = new Promise((resolve, reject) => {
      (window as any)['initMapCallback'] = () => resolve();

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&callback=initMapCallback&v=weekly&libraries=places,visualization&loading=async`;
      script.async = true;
      script.defer = true;
      script.onerror = (error: any) => {
        this.apiLoaded = null; // Reiniciar en caso de error
        reject(error);
      };
      document.head.appendChild(script);
    });

    return this.apiLoaded;
  }

  /**
   * Inicializa el mapa en el contenedor especificado y activa el evento `bounds_changed`.
   */
  async initMap(container: HTMLElement, center: google.maps.LatLngLiteral): Promise<google.maps.Map> {
    await this.loadApi();

    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;

    this.map = new Map(container, {
      center,
      zoom: 16,
      minZoom: 15,
      maxZoom: 17,
      mapTypeId: 'roadmap',
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });

    //Escuchar el evento `bounds_changed`
    this.map.addListener('bounds_changed', () => {
      const bounds = this.map.getBounds();
      if (bounds) {
        this.boundsChanged$.next(bounds);
      }
    });

    return this.map;
  }

  /**
   * Obtiene la instancia del mapa si ya fue inicializada.
   */
  getMapInstance(): google.maps.Map | null {
    return this.map || null;
  }

  /**
   * Devuelve un Observable que emite cambios en los límites visibles (`bounds_changed`).
   */
  getBoundsChangedObservable(): Observable<google.maps.LatLngBounds> {
    return this.boundsChanged$.asObservable();
  }
}
