import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, Subject } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { environment } from '../../../../../environments/environment';
import { Coordinate, RouteComplete } from '../../../../data/models/route';
import { SafeRouteService } from '../safe_route/safe-route.service';


@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;
  private map!: google.maps.Map;
  private originMarker!: google.maps.marker.AdvancedMarkerElement;
  private destinationMarker!: google.maps.marker.AdvancedMarkerElement;
  private polyline: google.maps.Polyline | null = null;



  //Evento para emitir información de la ruta generada
  private routeGenerated$ = new BehaviorSubject<RouteComplete | null>(null);

  constructor(private historyService: HistoryService, private authService: AuthService, private safeRouteService: SafeRouteService) { }

  /**
   *Inicializa `DirectionsService`, `DirectionsRenderer` y asocia el mapa.
   */
  initDirections(map: google.maps.Map): void {
    this.map = map;
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map,
      polylineOptions: {
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      },
    });
  }

  /**
   *Agrega o actualiza los marcadores en el mapa.
   */
  async setMarkers(origin?: google.maps.LatLngLiteral, destination?: google.maps.LatLngLiteral): Promise<void> {
    if (!this.map) return;

    //Importar `AdvancedMarkerElement` de Google Maps antes de usarlo
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;

    //Eliminar marcadores previos si existen
    if (this.originMarker) this.originMarker.map = null;
    if (this.destinationMarker) this.destinationMarker.map = null;

    if (origin) {
      this.originMarker = new AdvancedMarkerElement({
        position: origin,
        map: this.map,
        title: 'Origen',
      });
      this.map.setCenter(origin);
    }

    if (destination) {
      this.destinationMarker = new AdvancedMarkerElement({
        position: destination,
        map: this.map,
        title: 'Destino',
      });

      if (!origin) {
        this.map.setCenter(destination);
      }
    }
  }

  private roundCoord(coord: number, decimals: number): number {
    return parseFloat(coord.toFixed(decimals));
  }

  private generateCacheKey(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral): string {
    const lat1 = this.roundCoord(origin.lat, 3);
    const lng1 = this.roundCoord(origin.lng, 3);
    const lat2 = this.roundCoord(destination.lat, 3);
    const lng2 = this.roundCoord(destination.lng, 3);

    return `S:${lat1},${lng1},D:${lat2},${lng2}`;
  }


  /**
   *Obtiene una ruta entre dos puntos y la dibuja en el mapa.
   */
  async getDirections(
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ): Promise<void> {
    if (!this.directionsService) {
      console.error('DirectionsService no ha sido inicializado.');
      return;
    }

    if (this.originMarker) this.originMarker.map = null;
    if (this.destinationMarker) this.destinationMarker.map = null;

    // **Generar clave de caché con coordenadas redondeadas**
    const cacheKey = this.generateCacheKey(origin, destination);
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        this.directionsRenderer.setDirections(JSON.parse(cachedData));
        console.log("direction cache");
      } catch (error) {
        console.warn('Error setting directions from cache:', error);
      }
    }
    else{

      //Obtener ruta desde Google Maps API
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,

        },
        async (response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response?.routes?.[0]?.legs?.[0]) {
            console.log(response.routes[0]);
            this.directionsRenderer.setDirections(response);

            //Registrar en el historial
            await this.registerRouteHistory(response.routes[0]);

            //Guardar en caché
            if (new Blob([JSON.stringify(response)]).size < 200000) {
              this.addToSessionStorage(cacheKey,response,5)
            }

            //Emitir evento con la información de la ruta
            this.emitRouteGenerated(response.routes[0]);

          } else {
            console.error('Error en la solicitud de direcciones:', status);
          }
        }
      );
    }
  }

  /**
   *Genera el camino visual en el mapa
   */
  private async drawSafeRoute(origin: google.maps.LatLngLiteral, destination: google.maps.LatLngLiteral): Promise<void> {
    try {
      // Obtener la ruta segura desde la API
      const previewRouteSafe = await firstValueFrom(
        this.safeRouteService.getRouteSafe([origin.lat, origin.lng], [destination.lat, destination.lng])
      );

      // Convertir los waypoints en objetos google.maps.LatLng
      const routePath: google.maps.LatLng[] = previewRouteSafe.waypoints.map(
        (coord) => new google.maps.LatLng(coord[0], coord[1]) // Convertir array en LatLng
      );

      // Si ya existe una ruta previa en el mapa, eliminarla antes de agregar la nueva
      if (this.polyline) {
        this.polyline.setMap(null);
      }

      // Crear y dibujar la Polyline en el mapa
      this.polyline = new google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: '#0000FF', // Azul
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });

      // Agregar la Polyline al mapa
      this.polyline.setMap(this.map);

      // Agregar marcadores de inicio y fin
      this.setMarkers(origin, destination);

      console.log("Ruta segura dibujada en el mapa sin Google Directions API");

    } catch (error) {
      console.error("Error al obtener la ruta segura:", error);
    }
  }


  /**
   *Emite la información de la ruta generada a los componentes suscritos.
   */
  private emitRouteGenerated(route: google.maps.DirectionsRoute, security_level?: number): void {
    const leg = route.legs[0];
    const duration = leg.duration?.text || 'N/A';

    const start_location = leg.start_location as Coordinate | google.maps.LatLng;
    const end_location = leg.end_location as Coordinate | google.maps.LatLng;

    //Convertir `start_location` y `end_location` a instancias de `google.maps.LatLng`
    const startLocation = start_location instanceof google.maps.LatLng
    ? start_location
    : new google.maps.LatLng(start_location.lat, start_location.lng);

  const endLocation = end_location instanceof google.maps.LatLng
    ? end_location
    : new google.maps.LatLng(end_location.lat, end_location.lng);

    this.routeGenerated$.next({
      origin: leg.start_address || 'Unknown Origin',
      destination: leg.end_address || 'Unknown Destination',
      duration,
      safe: security_level || -1,
      oLatLng: startLocation.toJSON(),
      dLatLng: endLocation.toJSON()
    });
  }

  /**
   *Método para suscribirse a `routeGenerated$`
   */
 // Devuelve el observable para poder suscribirse desde el componente
  getRouteGeneratedObservable(): Observable<RouteComplete | null> {
    return this.routeGenerated$.asObservable();
  }

  /**
   * Registra la ruta en el historial con imagen estática.
   */
  private async registerRouteHistory(route: google.maps.DirectionsRoute): Promise<void> {
    try {
      const staticMapUrl = this.getStaticMapUrl(route);
      if (!staticMapUrl) {
        console.error('No se pudo generar la URL del mapa estático.');
        return;
      }

      const token = this.authService.getToken();
      if (!token || !(await this.authService.isTokenValid(token))) {
        console.error('Token inválido o expirado. Cierre de sesión automático.');
        this.authService.logout();
        return;
      }

      const leg = route.legs[0];

      const formData = new FormData();
      formData.append('origin_location', leg.start_address || 'Unknown');
      formData.append('destination_location', leg.end_address || 'Unknown');
      formData.append('security_level', Math.random().toFixed(2));

      const response = await fetch(staticMapUrl);
      if (!response.ok) {
        throw new Error(`Error al obtener la imagen del mapa estático: ${response.statusText}`);
      }

      const blob = await response.blob();
      formData.append('map_image', new File([blob], 'map.png', { type: 'image/png' }));

      await this.historyService.createRouteHistory(formData, token).toPromise();
      console.log('Ruta registrada exitosamente en el historial.');

    } catch (error) {
      console.error('Error al registrar la ruta en el historial:', error);
    }
  }

  // Función para agregar un elemento a sessionStorage
  private addToSessionStorage(cacheKey: string, data: any, MAX_ITEMS: number) {

    // Obtén la lista de claves almacenadas en sessionStorage
    let keys = JSON.parse(sessionStorage.getItem('cacheKeys') || '[]');

    // Si ya hay 5 elementos, elimina el más antiguo
    if (keys.length >= MAX_ITEMS) {
        const oldestKey = keys.shift(); // Quita el primer elemento
        sessionStorage.removeItem(oldestKey); // Elimina la clave más antigua
    }

    // Agrega el nuevo elemento
    sessionStorage.setItem(cacheKey, JSON.stringify(data));

    // Agrega la nueva clave a la lista y actualiza en sessionStorage
    keys.push(cacheKey);
    sessionStorage.setItem('cacheKeys', JSON.stringify(keys));

  }



  /**
   *Genera la URL del mapa estático de Google.
   */
  private getStaticMapUrl(route: google.maps.DirectionsRoute): string {
    const apiKey = environment.googleMapsApiKey;
    const size = '600x400';
    const pathColor = '0x000000';
    const pathWeight = 5;

    if (!route.overview_path) {
      return '';
    }

    const pathPoints = route.overview_path.map(
      (point) => `${point.lat()},${point.lng()}`
    ).join('|');

    const leg = route.legs[0];

    // Construye los marcadores (origen y destino)
    const origin = `${leg.start_location.lat()},${leg.start_location.lng()}`;
    const destination = `${leg.end_location.lat()},${leg.end_location.lng()}`;
    const markerOrigin = `color:red|label:A|${origin}`;
    const markerDestination = `color:blue|label:B|${destination}`;

    return `https://maps.googleapis.com/maps/api/staticmap?size=${size}&path=color:${pathColor}|weight:${pathWeight}|${pathPoints}&markers=${markerOrigin}&markers=${markerDestination}&key=${apiKey}`;
  }
}
