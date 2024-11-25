import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api-maps-safe.onrender.com'; // URL base del backend
  private tokenKey = 'access_token';
  constructor(private http: HttpClient) { }


  login(username: string, password: string): Observable<boolean> {
    const body = new URLSearchParams();
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http
      .post<{ access_token: string }>(`${this.apiUrl}/token`, body.toString(), { headers })
      .pipe(
        map((response) => {
          localStorage.setItem(this.tokenKey, response.access_token); // Almacena el token
          return true;
        }),
        catchError((error) => {
          console.error('Error en login:', error);
          return of(false);
        })
      );
  }


  register(username: string, password: string): Observable<boolean> {
    const body = { username, password };

    return this.http
      .post(`${this.apiUrl}/register`, body)
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error('Error en registro:', error);
          return of(false);
        })
      );
  }


  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Cierra sesión eliminando el token
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
}
