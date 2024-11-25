import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = 'https://api-maps-safe.onrender.com/route-history/';

  constructor(private http: HttpClient) {}

  /**
   * Registrar una nueva ruta en el historial
   * @param formData - Los datos de la ruta, incluidos el archivo de la imagen
   * @param token - Token de sesión del usuario
   */
  createRouteHistory(formData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // Incluir token en el encabezado
    });
    // Hacer la solicitud HTTP
    return this.http.post(this.apiUrl, formData, { headers }).pipe(
      // Interceptar errores para depuración
      catchError((error) => {
        console.error('Error en la solicitud POST al backend:', error);
        return throwError(() => new Error('Error al enviar los datos al backend.'));
      })
    );
    }

    getRouteHistory(token: string): Observable<any> {
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      return this.http.get(this.apiUrl, { headers });
    }

}
