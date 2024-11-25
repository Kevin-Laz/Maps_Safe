import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Crime {
  id: number;
  date_reported: string;
  crime_description: string;
  latitude: number;
  longitude: number;

  // Agrega otros campos según tu API
}

@Injectable({
  providedIn: 'root'
})
export class CrimesService {
  private apiUrl = 'https://api-maps-safe.onrender.com/crimes/?limit=2000';

  constructor(private http: HttpClient) { }

  getCrimes(): Observable<Crime[]> {
    return this.http.get<Crime[]>(this.apiUrl);
  }
}