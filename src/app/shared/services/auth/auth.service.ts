import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://api-maps-safe.onrender.com'; // URL base del backend
  private tokenKey = 'access_token';
  private isLogin = signal(false);
  constructor(private http: HttpClient) {
    const token = this.getToken();
    if(token && this.isTokenValid(token)){
      this.isLogin.set(true);
    }
  }


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
          this.isLogin.set(true);
          return true;
        }),
        catchError((error) => {
          console.error('Error en login:', error);
          this.isLogin.set(false);
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
          throw new Error(error?.error?.message || 'Error desconocido al registrarse.');
        })
      );
  }


  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): WritableSignal<boolean> {
    this.checkTokenValidity();
    return this.isLogin;
  }

  /**
   * Obtiene el token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica si el token es válido (no expirado).
   */
  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < exp;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return false;
    }
  }

  /**
   * Valida el token y actualiza el estado de autenticación.
   */
  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      this.isLogin.set(true);
    } else {
      this.logout(); // Cierra sesión si el token es inválido
    }
  }

  /**
   * Cierra sesión eliminando el token
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLogin.set(false);
  }
}


