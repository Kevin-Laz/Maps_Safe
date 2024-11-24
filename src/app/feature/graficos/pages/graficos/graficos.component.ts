import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http'; // Cambiado
import { CrimesService, Crime } from './services/crimes.service';

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [
    CommonModule
    // Removemos HttpClientModule de aquí
  ],
  template: `
    <div class="graficos-container">
      <h2>Dashboard de Crímenes</h2>
      
      <!-- Mostrar loading mientras carga -->
      <div *ngIf="loading">Cargando datos...</div>
      
      <!-- Mostrar error si existe -->
      <div *ngIf="error" class="error">
        {{ error }}
      </div>
      
      <!-- Mostrar datos cuando estén disponibles -->
      <div *ngIf="crimes.length > 0" class="data-container">
        <div class="total-crimes">
          <h3>Total de Crímenes</h3>
          <p>{{ crimes.length }}</p>
        </div>
        
        <!-- Lista básica de crímenes -->
        <div class="crimes-list">
          <h3>Últimos Crímenes Registrados</h3>
          <ul>
            <li *ngFor="let crime of crimes.slice(0, 5)">
              {{ crime.tipo }} - {{ crime.fecha }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .graficos-container {
      padding: 20px;
    }
    
    .error {
      color: red;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid red;
      border-radius: 4px;
    }
    
    .data-container {
      margin-top: 20px;
    }
    
    .total-crimes {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    
    .crimes-list {
      background: white;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    ul {
      list-style-type: none;
      padding: 0;
    }
    
    li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }
  `]
})
export class GraficosComponent implements OnInit {
  crimes: Crime[] = [];
  loading = true;
  error: string | null = null;

  constructor(private crimesService: CrimesService) {}

  ngOnInit() {
    this.loadCrimes();
  }

  loadCrimes() {
    this.loading = true;
    this.error = null;
    
    this.crimesService.getCrimes().subscribe({
      next: (data) => {
        this.crimes = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los datos: ' + error.message;
        this.loading = false;
      }
    });
  }
}