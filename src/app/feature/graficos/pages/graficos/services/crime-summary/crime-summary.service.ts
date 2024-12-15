import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PieChartData, BarLineChartData } from '../../../../../../data/models/chart';

@Injectable({
  providedIn: 'root'
})
export class CrimeSummaryService {
  private apiUrl = 'https://api-maps-safe.onrender.com/crime-summary';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los datos resumidos de crimenes para realizar gráficos específicos
   * @param year : Año para el filtro
   * @param chart_type : Tipo de gráfico (Bar, Line, Pie)
   * @param crime_type : (Opcional) Tipo de crimen
   * @return Observable con los datos de la API
   */
  getCrimeSummary(year: number, chart_type: 'pie'): Observable<PieChartData[]>;
  getCrimeSummary(year: number, chart_type: 'bar' | 'line'): Observable<BarLineChartData[]>;
  getCrimeSummary(year: number, chart_type: "bar" | "line" | "pie", crime_type?: string): Observable<PieChartData[] | BarLineChartData[]>{
    let params = new HttpParams();
    params = params.set("year",year).set("chart_type", chart_type);
    if(crime_type){
      params = params.set("crime_type", crime_type);
    }
    return this.http.get<PieChartData[] | BarLineChartData[]>(this.apiUrl, {params});
  }

}
