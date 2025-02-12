import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RouteSafe, SafeRouteRequest } from '../../../../data/models/route';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SafeRouteService {
  private apiURL = "https://api-maps-safe.onrender.com/safe-route";

  constructor(private http: HttpClient) { }

  getRouteSafe(origin: [number, number], destination: [number, number]): Observable<RouteSafe>{
    const originRounded: [number, number] = [
      parseFloat(origin[0].toFixed(5)),
      parseFloat(origin[1].toFixed(5))
    ];

    const destinationRounded: [number, number] = [
      parseFloat(destination[0].toFixed(5)),
      parseFloat(destination[1].toFixed(5))
    ];
    const requestData : SafeRouteRequest = {origin: originRounded, destination: destinationRounded}


    return this.http.post<RouteSafe>(this.apiURL, requestData).pipe(map((response)=>{
      const security_level  = 1 - response.total_risk;
      const responseTransforme: RouteSafe = { ...response, security_level};
      console.log("Ruta segura recibida:", responseTransforme);
      return responseTransforme;
    }), catchError((error: HttpErrorResponse)=>{
      console.error("Error al obtener la ruta segura:", error);
      return throwError(()=>new Error(`Error en la API ${error.message}`));
    }))
  }
}
