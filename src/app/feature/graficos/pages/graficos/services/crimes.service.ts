import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Crime {
  id: number;
  tipo: string;
  fecha: string;
  // Agrega otros campos según tu API
}

@Injectable({
  providedIn: 'root'
})
export class CrimesService {
  private apiUrl = 'https://api-maps-safe.onrender.com/crimes/';

  constructor(private http: HttpClient) { }

  getCrimes(): Observable<Crime[]> {
    return this.http.get<Crime[]>(this.apiUrl);
  }
}