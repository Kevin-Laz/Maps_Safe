import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsComponent implements AfterViewInit, OnChanges {
  @Input() center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 };
  test: google.maps.LatLngLiteral = {lat: -12.0466, lng: -77.0499}
  @Input() originCoordinates: google.maps.LatLngLiteral | null = null;
  @Input() destinationCoordinates: google.maps.LatLngLiteral | null = null;
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private originMarker!: any;
  private destinationMarker!: any;
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;

  constructor(private googleMapsService: GoogleMapsService){}
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
      mapId: 'DEMO_MAP_ID',
      disableDefaultUI: true,
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true
    });
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
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
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  }
}


