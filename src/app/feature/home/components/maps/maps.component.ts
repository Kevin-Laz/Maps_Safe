import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Output, OnChanges, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { HistoryService } from '../../../../shared/services/history/history.service';

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
  @Output() routeGenerated = new EventEmitter<{ origin: string; destination: string; duration: string; safe: number }>();
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private heatmap!: google.maps.visualization.HeatmapLayer;
  private originMarker!: any;
  private destinationMarker!: any;
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;

  constructor(private googleMapsService: GoogleMapsService, private http: HttpClient, private historyService: HistoryService){}
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
    //const mapContainer = document.getElementById('map') as HTMLElement;
    this.map = new Map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: 15,
      mapTypeId: 'roadmap',
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });
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
      /*const customMarkerImg = document.createElement('img');
      customMarkerImg.src = 'marcador.png';
      customMarkerImg.style.width = '50px';
      customMarkerImg.style.height = '50px';*/

      this.originMarker = new google.maps.marker.AdvancedMarkerElement({
        position: this.originCoordinates,
        map: this.map,
        title: 'Origen',
        //content: customMarkerImg,
      });
      this.map.setCenter(this.originCoordinates); // Centrar el mapa en el origen
    }

    // Crear nuevo marcador para el destino si hay coordenadas
    if (this.destinationCoordinates) {
      /*const customMarkerImg = document.createElement('img');
      customMarkerImg.src = 'marcador.png';
      customMarkerImg.style.width = '50px';
      customMarkerImg.style.height = '50px';*/

      this.destinationMarker = new google.maps.marker.AdvancedMarkerElement({
        position: this.destinationCoordinates,
        map: this.map,
        title: 'Destino',
        //content: customMarkerImg,
      });
    }
  }

  private updateRoute(): void {
    if (!this.originCoordinates || !this.destinationCoordinates) return;

    const origin = new google.maps.LatLng(this.originCoordinates.lat, this.originCoordinates.lng);
    const destination = new google.maps.LatLng(this.destinationCoordinates.lat, this.destinationCoordinates.lng);

    if (this.originMarker) this.originMarker.map = null;
    if (this.destinationMarker) this.destinationMarker.map = null;

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

          // Emite el evento con la información de la ruta
          this.routeGenerated.emit({
            origin: leg.start_address || 'Unknown Origin',
            destination: leg.end_address || 'Unknown Destination',
            duration: duration,
            safe: tempsafe
          });
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }

  private async addHeatmapLayer(): Promise<void> {
    try {
      const response = await fetch('https://api-maps-safe.onrender.com/nodes/');
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
      const nodes: [Node] = await response.json();
      // Transforma los datos en puntos para el mapa de calor
      const heatmapData = nodes.map((node: any) => ({
        location: new google.maps.LatLng(node.latitude, node.longitude),
        weight: node.risk, // Usa el nivel de riesgo como peso
      }));

      const gradient = [
        'rgba(57, 106, 255, 0)',  // Totalmente transparente (sin datos)
        'rgba(57, 106, 255, 0.2)',  // Azul muy seguro (opacidad baja)
        'rgba(57, 106, 255, 0.4)',  // Azul seguro
        'rgba(10, 141, 196, 0.5)',  // Celeste seguro
        'rgba(255, 255, 0, 0.5)',   // Amarillo neutral
        'rgba(255, 165, 0, 0.6)',   // Naranja riesgoso
        'rgba(255, 0, 0, 0.7)',     // Rojo muy riesgoso
      ];

      // Crea y añade la capa de Heatmap
      this.heatmap = new google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        gradient: gradient,
        dissipating: true, // Ajusta el tamaño del área afectada por cada punto
        radius: 35,
        map: this.map,
      });
    } catch (error) {
      console.error('Error al cargar los nodos para el mapa de calor: ', error);
    }
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
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No se encontró el token de sesión.');
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







  ngOnDestroy(): void {
    // Limpia el mapa y elimina eventos para evitar problemas en cambios de ruta
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = undefined!;
    }
  }
}


