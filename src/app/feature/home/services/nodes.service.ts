import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NodesService {
  private apiURL: string = 'http://api-maps-safe.onrender.com/nodes/';
  constructor(private http: HttpClient) { }

  getNodes(ltMin: number, ltMax: number, lnMin: number, lnMax: number): Observable<Node[]> {
    const params = new HttpParams()
      .set('min_lat', ltMin.toString())
      .set('max_lat', ltMax.toString())
      .set('min_lon', lnMin.toString())
      .set('max_lon', lnMax.toString());

    return this.http.get<Node[]>(this.apiURL, { params });
  }
}
