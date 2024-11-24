import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { CrimesService, Crime } from './services/crimes.service';

Chart.register(...registerables);

interface ProcessedCrime extends Crime {
  date: Date;
}

@Component({
  selector: 'app-graficos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './graficos.component.html',
  styleUrls: ['./graficos.component.scss']
})

export class GraficosComponent implements OnInit, AfterViewInit {
  @ViewChild('crimeTypeChart') crimeTypeChart!: ElementRef;
  @ViewChild('crimeTimelineChart') crimeTimelineChart!: ElementRef;

  crimes: ProcessedCrime[] = [];
  filteredCrimes: ProcessedCrime[] = [];
  loading = true;
  error: string | null = null;

  // Filtros
  selectedCrimeType: string = '';
  selectedMonth: string = '';
  selectedYear: string = '';
  
  crimeTypes: string[] = [];
  years: number[] = [];
  months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'Augst' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];

  // Agregar estas nuevas propiedades para la paginación
  currentPage = 1;
  itemsPerPage = 10;

  // Agregar este getter para calcular el total de páginas
  get totalPages() {
    return Math.ceil(this.filteredCrimes.length / this.itemsPerPage);
  }

  // Agregar estos métodos para la navegación
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Agregar este getter para obtener los crímenes de la página actual
  get paginatedCrimes() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCrimes.slice(start, start + this.itemsPerPage);
  }

  private typeChart: Chart | null = null;
  private timelineChart: Chart | null = null;

  constructor(private crimesService: CrimesService) {}

  ngOnInit() {
    this.loadCrimes();
  }

  ngAfterViewInit() {
    // Los gráficos se inicializarán cuando los datos estén cargados
  }

  loadCrimes() {
    this.loading = true;
    this.error = null;
    
    this.crimesService.getCrimes().subscribe({
      next: (data) => {
        // Procesar las fechas y ordenar por fecha
        this.crimes = data.map(crime => ({
          ...crime,
          date: new Date(crime.date_reported)
        })).sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Inicializar filtros
        this.initializeFilters();
        
        // Aplicar filtros iniciales
        this.applyFilters();
        
        // Inicializar gráficos
        this.initializeCharts();
        
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los datos: ' + error.message;
        this.loading = false;
      }
    });
  }

  private initializeFilters() {
    // Obtener tipos únicos de crímenes
    this.crimeTypes = [...new Set(this.crimes.map(crime => crime.crime_description))].sort();
    
    // Obtener años únicos
    this.years = [...new Set(this.crimes.map(crime => crime.date.getFullYear()))].sort((a, b) => b - a);
  }

  applyFilters() {
    this.filteredCrimes = this.crimes.filter(crime => {
      const matchesType = !this.selectedCrimeType || crime.crime_description === this.selectedCrimeType;
      const matchesMonth = !this.selectedMonth || crime.date.getMonth() === parseInt(this.selectedMonth);
      const matchesYear = !this.selectedYear || crime.date.getFullYear() === parseInt(this.selectedYear);
      
      return matchesType && matchesMonth && matchesYear;
    });

    // Actualizar los gráficos después de filtrar
    this.updateCharts();
  }

  private processTimelineData() {
    // Crear un mapa para almacenar los conteos por fecha
    const timelineCounts = new Map<string, number>();
    
    // Ordenar crímenes por fecha
    const sortedCrimes = [...this.filteredCrimes].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Procesar cada crimen
    sortedCrimes.forEach(crime => {
      const date = crime.date;
      const monthYear = `${this.months[date.getMonth()].label} ${date.getFullYear()}`;
      timelineCounts.set(monthYear, (timelineCounts.get(monthYear) || 0) + 1);
    });

    // Convertir el mapa a arrays ordenados
    const sortedEntries = Array.from(timelineCounts.entries())
      .sort((a, b) => {
        const [monthYearA] = a[0].split(' ');
        const [monthYearB] = b[0].split(' ');
        const monthIndexA = this.months.findIndex(m => m.label === monthYearA);
        const monthIndexB = this.months.findIndex(m => m.label === monthYearB);
        const yearA = parseInt(a[0].split(' ')[1]);
        const yearB = parseInt(b[0].split(' ')[1]);
        
        if (yearA !== yearB) return yearA - yearB;
        return monthIndexA - monthIndexB;
      });

    return {
      labels: sortedEntries.map(([label]) => label),
      values: sortedEntries.map(([, value]) => value)
    };
  }

  private initializeCharts() {
    if (this.crimeTypeChart && this.crimeTimelineChart) {
      this.initializeCrimeTypeChart();
      this.initializeTimelineChart();
    }
  }

  private initializeCrimeTypeChart() {
    if (this.typeChart) {
      this.typeChart.destroy();
    }

    const ctx = this.crimeTypeChart.nativeElement.getContext('2d');
    const data = this.processCrimeTypeData();

    this.typeChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Número de Crímenes',
          data: data.values,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  private initializeTimelineChart() {
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }

    const ctx = this.crimeTimelineChart.nativeElement.getContext('2d');
    const data = this.processTimelineData();

    this.timelineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Crímenes por Mes',
          data: data.values,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }

  private processCrimeTypeData() {
    const crimeCounts = new Map<string, number>();
    
    this.filteredCrimes.forEach(crime => {
      const count = crimeCounts.get(crime.crime_description) || 0;
      crimeCounts.set(crime.crime_description, count + 1);
    });

    // Convertir a arrays y ordenar por cantidad
    const sortedEntries = Array.from(crimeCounts.entries())
      .sort((a, b) => b[1] - a[1]);

    return {
      labels: sortedEntries.map(([label]) => label),
      values: sortedEntries.map(([, value]) => value)
    };
  }

  private updateCharts() {
    if (this.typeChart && this.timelineChart) {
      const typeData = this.processCrimeTypeData();
      const timelineData = this.processTimelineData();

      this.typeChart.data.labels = typeData.labels;
      this.typeChart.data.datasets[0].data = typeData.values;
      this.typeChart.update();

      this.timelineChart.data.labels = timelineData.labels;
      this.timelineChart.data.datasets[0].data = timelineData.values;
      this.timelineChart.update();
    }
  }
  
}