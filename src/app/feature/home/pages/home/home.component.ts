import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsComponent } from "../../components/maps/maps.component";
import { ModalRegisterComponent } from "../../../register/components/modal-register/modal-register.component";
import { FormsModule } from '@angular/forms';
import { GeocodingService } from '../../../../shared/services/geocoding/geocoding.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsComponent, GoogleMapsModule, ModalRegisterComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {
  origin:string = '';
  destination:string = '';
  originCoordinates: google.maps.LatLngLiteral | null = null;
  destinationCoordinates: google.maps.LatLngLiteral | null = null;
  constructor(private geocodingService: GeocodingService){}
  async searchRoute(){
    try {
      this.originCoordinates = await this.geocodingService.geocodeAddress(this.origin);
      this.destinationCoordinates = await this.geocodingService.geocodeAddress(this.destination);

      console.log('Origen:', this.originCoordinates);
      console.log('Destino:', this.destinationCoordinates);


    } catch (error) {
      console.error(error);
    }
  }
}
