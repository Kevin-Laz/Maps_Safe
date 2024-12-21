import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HistoryService } from '../../../../shared/services/history/history.service';
import { CommonModule } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

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
  isLoading: boolean = true; // Indica si los datos están cargando
  errorMessage: string = ''; // Mensaje de error en caso de fallo
  baseUrl:string = 'https://pub-9d126dbf99084610b5fe23eccc20fb8b.r2.dev';

  constructor(private historyService: HistoryService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  private loadHistory(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      this.errorMessage = 'You need to log in to access your history.';
      this.isLoading = false;
      return;
    }

    this.historyService.getRouteHistory(token).subscribe(
      (response: any) => {
        // Procesar la respuesta para incluir la URL pública correcta
        this.routeHistory = (response.routes || []).map((route: any) => {
          return {
            ...route,
            map_image_url: route.map_image_url.replace(
              'https://67407e986fcf55f6a317ad1f58aae7bb.r2.cloudflarestorage.com',
              this.baseUrl
            )
          };
        });
        this.isLoading = false;
        console.log("Historial cargado", this.routeHistory);
      },
      (error) => {
        console.error('Error al cargar el historial:', error);
        this.errorMessage = 'Error loading the history. Please try again.';
        this.isLoading = false;
      }
    );
  }
}
