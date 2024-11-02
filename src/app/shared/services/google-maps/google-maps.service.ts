import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private apiLoaded: Promise<void> | null = null;

  loadApi(): Promise<void> {
    if (this.apiLoaded) {
      return this.apiLoaded;
    }

    this.apiLoaded = new Promise((resolve, reject) => {
      // Definir una función de callback global
      (window as any)['initMapCallback'] = () => {
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&callback=initMapCallback&v=weekly&libraries=marker&loading=async`;
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
}
