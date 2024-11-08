import { Injectable } from '@angular/core';
import { GoogleMapsService } from '../google-maps/google-maps.service';
@Injectable({
  providedIn: 'root'
})
export class GeocodingService {

  private geocoder: any;

  constructor(private googleMapsService: GoogleMapsService) {
  }

  async geocodeAddress(address: string): Promise<google.maps.LatLngLiteral> {
    await this.googleMapsService.loadApi();

    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
          });
        } else {
          reject('Geocoding failed: ' + status);
        }
      });
    });
  }
}
