import { ChangeDetectionStrategy, Component, effect, OnInit, signal, WritableSignal } from '@angular/core';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { CommonModule } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { AuthService } from '../../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class HistorialComponent implements OnInit{
  routeHistory: any[] = []; // Aquí se almacenará el historial de rutas
  isLoading = signal(true);
  errorMessage = signal('');
  baseUrl:string = 'https://pub-9d126dbf99084610b5fe23eccc20fb8b.r2.dev';

  constructor(private historyService: HistoryService, private authService: AuthService ) {
    effect(() => {
        if (this.authService.isAuthenticated()()) {
          this.loadHistory();
        } else {
          this.isLoading.set(false);
          this.errorMessage.set('You need to log in to access your history.');
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {

  }

  private loadHistory(): void {
    this.errorMessage.set('');
    const token = this.authService.getToken();
    if (!token) {
      this.isLoading.set(false);
      this.errorMessage.set('Session token is missing. Please log in again.');
      return;
    }

    this.historyService.getRouteHistory(token).subscribe({
      next: (response) => {
        this.routeHistory = this.processHistory(response.routes || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar el historial:', error);
        this.errorMessage.set('Error loading the history. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  private processHistory(routes: any[]): Array<{ map_image_url: string; [key: string]: any }> {
    return routes.map((route) => ({
      ...route,
      map_image_url: route.map_image_url.replace(
        'https://67407e986fcf55f6a317ad1f58aae7bb.r2.cloudflarestorage.com',
        this.baseUrl
      ),
    }));
  }
}
