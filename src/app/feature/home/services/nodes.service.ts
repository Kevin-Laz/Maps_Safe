import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodesService {
  private apiURL: string = 'https://api-maps-safe.onrender.com/nodes/';
  constructor(private http: HttpClient) { }

  getNodes(ltMin: number, ltMax: number, lnMin: number, lnMax: number): Observable<Node[]> {
    const params = new HttpParams()
      .set('min_lat', ltMin.toFixed(6))
      .set('max_lat', ltMax.toFixed(6))
      .set('min_lon', lnMin.toFixed(6))
      .set('max_lon', lnMax.toFixed(6));

    return this.http.get<Node[]>(this.apiURL, { params });
  }
}
