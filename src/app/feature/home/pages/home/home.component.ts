import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsComponent } from "../../components/maps/maps.component";
import { ModalRegisterComponent } from "../../../register/components/modal-register/modal-register.component";
import { FormsModule } from '@angular/forms';
import { GeocodingService } from '../../../../shared/services/geocoding/geocoding.service';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';
import { SearchContainerComponent } from "../../components/search-container/search-container.component";
import { RouteComplete, RouteCoordinatesNames } from '../../../../data/models/route';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsComponent, GoogleMapsModule, FormsModule, SearchContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export default class HomeComponent implements AfterViewInit{
  origin:string = '';
  destination:string = '';
  originCoordinates: google.maps.LatLngLiteral | null = null;
  destinationCoordinates: google.maps.LatLngLiteral | null = null;
  searchHistory: RouteComplete[] = []; // Historial
  @ViewChild('originInput') originInput!: ElementRef;
  @ViewChild('destinationInput') destinationInput!: ElementRef;
  @ViewChild('originInputMovil') originInputM!: ElementRef;
  @ViewChild('destinationInputMovil') destinationInputM!: ElementRef;

  private originAutocomplete!: google.maps.places.Autocomplete;
  private destinationAutocomplete!: google.maps.places.Autocomplete;
  private originAutocompleteM!: google.maps.places.Autocomplete;
  private destinationAutocompleteM!: google.maps.places.Autocomplete;

  constructor(private geocodingService: GeocodingService, private cdr: ChangeDetectorRef, private googleMapsService: GoogleMapsService){}

  async ngAfterViewInit(): Promise<void> {
    try {
      // Espera a que la API de Google Maps esté completamente cargada
      await this.googleMapsService.loadApi();

      // Inicializar Autocomplete en los campos de entrada detectados
      this.originAutocomplete = new google.maps.places.Autocomplete(this.originInput.nativeElement, {});
      this.destinationAutocomplete = new google.maps.places.Autocomplete(this.destinationInput.nativeElement, {});
      this.originAutocompleteM = new google.maps.places.Autocomplete(this.originInputM.nativeElement, {});
      this.destinationAutocompleteM = new google.maps.places.Autocomplete(this.destinationInputM.nativeElement, {});

      // Escuchar cambios en Autocomplete para obtener el lugar seleccionado
      this.originAutocomplete.addListener('place_changed', () => {
        const place = this.originAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          this.origin = place.formatted_address || '';
          this.originCoordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          this.cdr.detectChanges();
        }
      });

      this.destinationAutocomplete.addListener('place_changed', () => {
        const place = this.destinationAutocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          this.destination = place.formatted_address || '';
          this.destinationCoordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          this.cdr.detectChanges();
        }
      });

      // Escuchar cambios en Autocomplete para obtener el lugar seleccionado
      this.originAutocompleteM.addListener('place_changed', () => {
        const place = this.originAutocompleteM.getPlace();
        if (place.geometry && place.geometry.location) {
          this.origin = place.formatted_address || '';
          this.originCoordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          this.cdr.detectChanges();
        }
      });

      this.destinationAutocompleteM.addListener('place_changed', () => {
        const place = this.destinationAutocompleteM.getPlace();
        if (place.geometry && place.geometry.location) {
          this.destination = place.formatted_address || '';
          this.destinationCoordinates = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          this.cdr.detectChanges();
        }
      });

    } catch (error) {
      console.error('Error al cargar el API de Google Maps:', error);
    }
  }

  async searchRoute(coor?: RouteCoordinatesNames){
    if(coor){
      this.originCoordinates = coor.oLatLng;
      this.destinationCoordinates = coor.dLatLng;
      this.origin = coor.origin;
      this.destination = coor.destination;
      this.cdr.detectChanges();
    }
    else{
      try {
        this.originCoordinates = await this.geocodingService.geocodeAddress(this.origin);
        this.destinationCoordinates = await this.geocodingService.geocodeAddress(this.destination);
        // Forzar la detección de cambios
        this.cdr.detectChanges();
      } catch (error) {
        console.error(error);
      }
    }
  }

  onRouteGenerated(routeData: RouteComplete): void {
    this.searchHistory.unshift(routeData);
    // Limitar el historial a las últimas 5 búsquedas
    if (this.searchHistory.length > 5) {
        this.searchHistory.pop();
    }
  }
}
