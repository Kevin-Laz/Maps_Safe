import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsComponent implements AfterViewInit {
  @Input() center: google.maps.LatLngLiteral = { lat: -12.0464, lng: -77.0428 };
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;

  constructor(private googleMapsService: GoogleMapsService){}

  async ngAfterViewInit(): Promise<void> {
    try{
      await this.googleMapsService.loadApi();
      console.log('Espera carga del api');
      await this.initMap();
      console.log('Se inicio el mapa');
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

    const customMarkerImg = document.createElement('img');
    customMarkerImg.src = 'marcador.png';
    customMarkerImg.style.width = '50px';
    customMarkerImg.style.height = '50px';
    new AdvancedMarkerElement({
      position: this.center,
      map: this.map,
      title: 'Ubicación',
      content: customMarkerImg,
    });
  }
}

