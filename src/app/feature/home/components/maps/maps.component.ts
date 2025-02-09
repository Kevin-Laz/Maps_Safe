import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Output, OnChanges, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { RouteComplete } from '../../../../data/models/route';
import { NodesService } from '../../services/nodes.service';
import { debounceTime, Subject } from 'rxjs';
import { AuthService } from '../../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsComponent implements AfterViewInit, OnChanges {
  @Input() center: google.maps.LatLngLiteral = { lat: 34.03831, lng: -118.28353 };
  @Input() originCoordinates: google.maps.LatLngLiteral | null = null;
  @Input() destinationCoordinates: google.maps.LatLngLiteral | null = null;
  @Output() routeGenerated = new EventEmitter<RouteComplete>();
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private heatmap!: google.maps.visualization.HeatmapLayer;
  private originMarker!: any;
  private destinationMarker!: any;
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;
  private heatMapData: google.maps.visualization.WeightedLocation[] = [];
  private boundsChanged$ = new Subject<void>();
  private currentRenderMap = {min_lat: 0, max_lat: 0, min_lon: 0, max_lon: 0};

  constructor(private googleMapsService: GoogleMapsService, private http: HttpClient, private historyService: HistoryService, private nodeService: NodesService, private authService: AuthService){}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['originCoordinates'] || changes['destinationCoordinates']) {
      this.updateMarkers();
      this.updateRoute();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    try{
      await this.googleMapsService.loadApi();
      await this.initMap();
      await this.addHeatmapLayer();
    }
    catch (error){
      console.log('Error al cargar el API de Maps ', error);
    }
  }

  private async initMap(): Promise<void> {
    if (typeof google === 'undefined') {
      console.error('Google Maps API not loaded');
      return;
    }

    const { Map } = await google.maps.importLibrary('maps') as google.maps.MapsLibrary;
    const { AdvancedMarkerElement } = await google.maps.importLibrary('marker') as google.maps.MarkerLibrary;
    this.map = new Map(this.mapContainer.nativeElement, {
      center: this.center,
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

    const bounds = this.map.getBounds();
    if (bounds) {
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      this.currentRenderMap = {
        min_lat: sw.lat(),
        max_lat: ne.lat(),
        min_lon: sw.lng(),
        max_lon: ne.lng()
      };
    }

    this.map.addListener('bounds_changed', ()=>{
      this.boundsChanged$.next();
    })

    this.boundsChanged$.pipe(debounceTime(700)).subscribe(()=>{
      this.addHeatmapLayer();
    })

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      polylineOptions: {
        strokeColor: '#000000', // Negro
        strokeOpacity: 1.0, // Opacidad completa
        strokeWeight: 4, // Grosor de la línea
      },
    });
  }
  private updateMarkers(): void {
    if (!this.map) return;

    // Eliminar marcadores previos si existen
    if (this.originMarker) this.originMarker.map = null;
    if (this.destinationMarker) this.destinationMarker.map = null;

    // Crear nuevo marcador para el origen si hay coordenadas
    if (this.originCoordinates) {
      this.originMarker = new google.maps.marker.AdvancedMarkerElement({
        position: this.originCoordinates,
        map: this.map,
        title: 'Origen',
      });
      this.map.setCenter(this.originCoordinates);
    }

    if (this.destinationCoordinates) {
      this.destinationMarker = new google.maps.marker.AdvancedMarkerElement({
        position: this.destinationCoordinates,
        map: this.map,
        title: 'Destino',
      });
    }
  }

  private updateRoute(): void {
    if (!this.originCoordinates || !this.destinationCoordinates) return;

    const origin = new google.maps.LatLng(this.originCoordinates.lat, this.originCoordinates.lng);
    const destination = new google.maps.LatLng(this.destinationCoordinates.lat, this.destinationCoordinates.lng);
    const cacheKey = `S:${origin.lat(),origin.lng()},D:${destination.lat(),destination.lng()}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (this.originMarker) this.originMarker.map = null;
    if (this.destinationMarker) this.destinationMarker.map = null;

    if(cachedData){
      try {
        this.directionsRenderer.setDirections(JSON.parse(cachedData));
        console.log("direction cache");
      } catch (error) {
        console.warn('Error setting directions from cache:', error);
      }
    }
    else{
      this.directionsService.route(
        {
          origin,
          destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        async(response, status) => {
          if (status === google.maps.DirectionsStatus.OK && response?.routes?.[0]?.legs?.[0]) {
            this.directionsRenderer.setDirections(response);
            // Obtén la duración del primer tramo de la ruta
            const route = response.routes[0];
            const leg = route.legs[0];
            const duration = leg.duration?.text || 'N/A';
            const tempsafe = Number((Math.random() * (1 - 0.79) + 0.79).toFixed(5));
            // Registrar ruta en el historial
            await this.registerRouteHistory({
              origin: leg.start_address || 'Unknown Origin',
              destination: leg.end_address || 'Unknown Destination',
              securityLevel: tempsafe, // Nivel de seguridad simulado
              routeData: response,
            });
            if(new Blob([JSON.stringify(response)]).size < 200000){
              this.addToSessionStorage(cacheKey,response,5)
            }
            // Emite el evento con la información de la ruta
            this.routeGenerated.emit({
              origin: leg.start_address || 'Unknown Origin',
              destination: leg.end_address || 'Unknown Destination',
              duration: duration,
              safe: tempsafe,
              oLatLng: this.originCoordinates,
              dLatLng: this.destinationCoordinates
            });
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }
  }

  private async addHeatmapLayer(): Promise<void> {
    if (!this.map) return;
    const bounds = this.map.getBounds();
    if (!bounds) return;
     // Obtener límites visibles en el mapa
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const minLat = sw.lat();
    const maxLat = ne.lat();
    const minLon = sw.lng();
    const maxLon = ne.lng();

    const newRenderMap = {min_lat: minLat, max_lat: maxLat, min_lon: minLon, max_lon: maxLon};
    // Verifica si el nuevo mapa está completamente dentro del mapa renderizado
    const isInsideCurrentRender =
    newRenderMap.min_lat >= this.currentRenderMap.min_lat &&
    newRenderMap.max_lat <= this.currentRenderMap.max_lat &&
    newRenderMap.min_lon >= this.currentRenderMap.min_lon &&
    newRenderMap.max_lon <= this.currentRenderMap.max_lon;

    if (isInsideCurrentRender) {
    return; // No realiza la petición si ya está dentro del área renderizada
    }

    this.nodeService.getNodes(minLat,maxLat,minLon,maxLon).subscribe({
      next: (nodes)=>{
        const newHeatMapData: google.maps.visualization.WeightedLocation[] = nodes.map((node: any) => ({
          location: new google.maps.LatLng(node.latitude, node.longitude),
          weight: node.risk, // Usa el nivel de riesgo como peso
        }));
        this.heatMapData = [...newHeatMapData, ...this.heatMapData].filter((node, index, all)=>{
          return index === all.findIndex((n)=>{
            return node.location?.lat === n.location?.lat && node.location?.lng === n.location?.lng;
          })
        });
        if(this.heatmap){
          this.heatmap.setData(this.heatMapData);
        }
        else {
          this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: this.heatMapData,
            gradient: [
              'rgba(57, 106, 255, 0)',
              'rgba(57, 106, 255, 0.2)',
              'rgba(57, 106, 255, 0.4)',
              'rgba(10, 141, 196, 0.5)',
              'rgba(255, 255, 0, 0.5)',
              'rgba(255, 165, 0, 0.6)',
              'rgba(255, 0, 0, 0.7)'
            ],
            dissipating: true,
            radius: 35,
            map: this.map,
          });
        }
      },
      error: (error)=>{
        console.error("Error al cargar el mapa de calor: ", error);
      }
    })
  }

  private async registerRouteHistory(data: {
    origin: string;
    destination: string;
    securityLevel: number;
    routeData: google.maps.DirectionsResult;
  }): Promise<void> {
    try {
      const staticMapUrl = this.getStaticMapUrl(data.routeData);
      if (!staticMapUrl) {
        console.error('No se pudo generar la URL del mapa estático.');
        return;
      }

      // Obtener el token de sesión
      const token = this.authService.getToken();
      if (!token || !(await this.authService.isTokenValid(token))) {
        console.error('Token inválido o expirado. Iniciando sesión nuevamente');
        this.authService.logout();
        return;
      }

      const formData = new FormData();
      formData.append('origin_location', data.origin);
      formData.append('destination_location', data.destination);
      formData.append('security_level', data.securityLevel.toString());

      // Convertir la URL del mapa estático en un archivo
      const response = await fetch(staticMapUrl);
      if (!response.ok) {
        throw new Error(`Error al obtener la imagen del mapa estático: ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], 'map.png', { type: 'image/png' });

      formData.append('map_image', file);

      // Realizar la solicitud POST al backend
      await this.historyService.createRouteHistory(formData, token).toPromise();
      console.log('Ruta registrada exitosamente en el historial.');
    } catch (error) {
      console.error('Error al registrar la ruta en el historial:', error);
    }
  }


  private getStaticMapUrl(directions: google.maps.DirectionsResult): string {
    const apiKey = environment.googleMapsApiKey;
    const size = '600x400';
    const pathColor = '0x000000'; // Negro
    const pathWeight = 5;

    if (!directions || !directions.routes[0] || !directions.routes[0].overview_path) {
      console.error('No se encontró la ruta para generar el mapa estático.');
      return '';
    }

    // Extrae los puntos de la ruta (overview_path) generada por Directions API
    const pathPoints = directions.routes[0].overview_path.map(
      (point) => `${point.lat()},${point.lng()}`
    ).join('|');

    // Construye los marcadores (origen y destino)
    const origin = `${this.originCoordinates?.lat},${this.originCoordinates?.lng}`;
    const destination = `${this.destinationCoordinates?.lat},${this.destinationCoordinates?.lng}`;
    const markerOrigin = `color:red|label:A|${origin}`;
    const markerDestination = `color:blue|label:B|${destination}`;
    // Construye la URL del mapa estático
    return `https://maps.googleapis.com/maps/api/staticmap?size=${size}&path=color:${pathColor}|weight:${pathWeight}|${pathPoints}&markers=${markerOrigin}&markers=${markerDestination}&key=${apiKey}`;
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




  ngOnDestroy(): void {
    // Limpia el mapa y elimina eventos para evitar problemas en cambios de ruta
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = undefined!;
    }
  }
}


