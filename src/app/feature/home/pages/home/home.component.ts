import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsComponent } from "../../components/maps/maps.component";
import { ModalRegisterComponent } from "../../../register/components/modal-register/modal-register.component";
import { FormsModule } from '@angular/forms';
import { GeocodingService } from '../../../../shared/services/geocoding/geocoding.service';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';
import { SearchContainerComponent } from "../../components/search-container/search-container.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsComponent, GoogleMapsModule, ModalRegisterComponent, FormsModule, SearchContainerComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.Default,
})
export default class HomeComponent implements AfterViewInit{
  origin:string = '';
  destination:string = '';
  originCoordinates: google.maps.LatLngLiteral | null = null;
  destinationCoordinates: google.maps.LatLngLiteral | null = null;
  searchHistory: { origin: string; destination: string; duration: string; safe: number }[] = []; // Historial
  @ViewChild('originInput') originInput!: ElementRef;
  @ViewChild('destinationInput') destinationInput!: ElementRef;

  private originAutocomplete!: google.maps.places.Autocomplete;
  private destinationAutocomplete!: google.maps.places.Autocomplete;

  constructor(private geocodingService: GeocodingService, private cdr: ChangeDetectorRef, private googleMapsService: GoogleMapsService){}

  async ngAfterViewInit(): Promise<void> {
    try {
      // Espera a que la API de Google Maps esté completamente cargada
      await this.googleMapsService.loadApi();

      // Inicializar Autocomplete en los campos de entrada
      this.originAutocomplete = new google.maps.places.Autocomplete(this.originInput.nativeElement, {

      });

      this.destinationAutocomplete = new google.maps.places.Autocomplete(this.destinationInput.nativeElement, {

      });

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

    } catch (error) {
      console.error('Error al cargar el API de Google Maps:', error);
    }
  }

  async searchRoute(){
    try {
      this.originCoordinates = await this.geocodingService.geocodeAddress(this.origin);
      this.destinationCoordinates = await this.geocodingService.geocodeAddress(this.destination);
      // Forzar la detección de cambios
      this.cdr.detectChanges();
    } catch (error) {
      console.error(error);
    }
  }

  onRouteGenerated(routeData: { origin: string; destination: string; duration: string; safe: number }): void {
    this.searchHistory.unshift(routeData);

    // Limitar el historial a las últimas 5 búsquedas
    if (this.searchHistory.length > 5) {
        this.searchHistory.pop();
    }

    console.log('Historial actualizado:', this.searchHistory);
  }
}
