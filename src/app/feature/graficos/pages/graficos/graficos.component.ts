import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrimeSummaryService } from './services/crime-summary/crime-summary.service';
declare const ApexCharts: any;




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

export default class GraficosComponent implements OnInit {
  // Control de visibilidad de dropdowns
  chartInstanceLine: any | null = null;
  chartInstancePie: any | null = null;
  chartInstanceBar: any | null = null;

  isDropdownVisibleLine = false;
  isDropdownVisiblePie = false;
  isDropdownVisibleBar = false;
  menuYear: number[] = [2020,2021,2022,2023,2024];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  yearLineSelected = this.menuYear[0];
  yearPaiSelected = this.menuYear[0];
  yearBarSelected = this.menuYear[0];

  constructor(private crimeSummary: CrimeSummaryService) {}

  ngOnInit(): void {
    this.loadPieChart(2020);
    this.loadAreaChart(2020);
    this.loadBarChart(2020);
  }

  // Métodos para alternar dropdowns
  toggleDropdown(type: 'line' | 'pie' | 'bar'): void {
    if (type === 'line') {
      this.isDropdownVisibleLine = !this.isDropdownVisibleLine;
    }
    else if (type === 'pie') {
      this.isDropdownVisiblePie = !this.isDropdownVisiblePie;
    }
    else{
      this.isDropdownVisibleBar = !this.isDropdownVisibleBar;
    }
  }

  updateChart(year: number, type: 'line' | 'pie' | 'bar'){
    if(type == 'line'){
      this.yearLineSelected = year;
      this.loadAreaChart(this.yearLineSelected);
      this.toggleDropdown('line');
    }
    if(type == 'pie'){
      this.yearPaiSelected = year;
      this.loadPieChart(this.yearPaiSelected);
      this.toggleDropdown('pie');
    }

    if(type == 'bar'){
      this.yearBarSelected = year;
      this.loadBarChart(this.yearBarSelected);
      this.toggleDropdown('bar');
    }

  }

  // Cargar el gráfico de área
  private loadAreaChart(year: number): void {
    // Destruir el gráfico anterior si existe
  if (this.chartInstanceLine) {
    this.chartInstanceLine.destroy();
  }
    this.crimeSummary.getCrimeSummary(year, 'line').subscribe({
      next: (data) => {
        const chartOptions = this.getLineChartOptions(
          data.map((item) => this.monthNames[item.mes-1]),
          data.map((item) => item.cantidad)
        );
        this.chartInstanceLine = new ApexCharts(document.getElementById('area-chart'), chartOptions);
        this.chartInstanceLine.render();
      },
      error: (err) => {
        console.error('Error al cargar el gráfico de área:', err);
      }
    });
  }

  // Cargar el gráfico de pastel
  private loadPieChart(year: number): void {
    if(this.chartInstancePie){
      this.chartInstancePie.destroy();
    }
    this.crimeSummary.getCrimeSummary(year, 'pie').subscribe({
      next: (data) => {
        const groupedData = this.groupPieChartData(data, 0.1); // Agrupar datos con un umbral del 10%
        const chartOptions = this.getPieChartOptions(groupedData.labels, groupedData.series);
        this.chartInstancePie = new ApexCharts(document.getElementById('pie-chart'), chartOptions);
        this.chartInstancePie.render();
      },
      error: (err) => {
        console.error('Error al cargar el gráfico de pastel:', err);
      }
    });
  }

  private loadBarChart(year: number): void {
      // Destruir el gráfico anterior si existe
  if (this.chartInstanceBar) {
    this.chartInstanceBar.destroy();
  }
    this.crimeSummary.getCrimeSummary(year, 'bar').subscribe({
      next: (data) => {
        const chartOptions = this.getBarOptions(
          data.map((item) => this.monthNames[item.mes-1]),
          data.map((item) => item.cantidad)
        );
        this.chartInstanceBar = new ApexCharts(document.getElementById('bar-chart'), chartOptions);
        this.chartInstanceBar.render();
      },
      error: (err) => {
        console.error('Error al cargar el gráfico de barras:', err);
      }
    });
  }


  // Opciones para el gráfico de línea
  private getLineChartOptions(categories: string[], seriesData: number[]): any {
    return {
      chart: {
        height: '226px',
        maxWidth: '100%',
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        dropShadow: { enabled: false },
        toolbar: { show: false }
      },
      tooltip: { enabled: true, x: { show: false } },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: '#1C64F2',
          gradientToColors: ['#1C64F2']
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: 6 },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: 0 }
      },
      series: [
        {
          name: 'Crimes count',
          data: seriesData,
          color: '#1A56DB'
        }
      ],
      xaxis: {
        categories: categories,
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false }
    };
  }

  // Opciones para el gráfico de pastel
  private getPieChartOptions(labels: string[], series: number[]): any {
    return {
      series: series,
      colors: [
        "#1C64F2", "#16BDCA", "#9061F9", "#F59E0B", "#10B981",
        "#EF4444", "#3B82F6", "#6366F1", "#F472B6", "#8B5CF6"
      ],
      chart: { height: 420, width: '100%', type: 'pie' },
      stroke: { colors: ['white'], lineCap: 'round' },
      plotOptions: { pie: { size: '100%' } },
      labels: labels,
      dataLabels: { enabled: true, style: { fontFamily: 'Inter, sans-serif' } },
      legend: { position: 'bottom', fontFamily: 'Inter, sans-serif' }
    };
  }

  private getBarOptions(labels: string[], series: number[]): any{
    return {
      series: [
        {
          name: 'Crimes',
          data: series
        }
      ],
      chart: {
        type: 'bar',
        height: 452,
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      colors: ['#020617'],
      plotOptions: {
        bar: {
          columnWidth: '40%',
          borderRadius: 2
        }
      },
      xaxis: {
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        },
        labels: {
          style: {
            colors: '#616161',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: 400
          }
        },
        categories: labels
      },
      yaxis: {
        labels: {
          style: {
            colors: '#616161',
            fontSize: '12px',
            fontFamily: 'inherit',
            fontWeight: 400
          }
        }
      },
      grid: {
        show: true,
        borderColor: '#dddddd',
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 5,
          right: 20
        }
      },
      fill: {
        opacity: 0.8
      },
      tooltip: {
        theme: 'dark'
      }
    }
  }

  // Método para agrupar datos menores a un umbral
  private groupPieChartData(data: any[], thresholdPercentage: number): { labels: string[], series: number[] } {
    const total = data.reduce((sum, item) => sum + item.cantidad, 0);
    const threshold = total * thresholdPercentage;

    const groupedData = data.reduce(
      (acc, item) => {
        if (item.cantidad >= threshold) {
          acc.labels.push(item.tipo_crimen);
          acc.series.push(item.cantidad);
        } else {
          acc.othersCount += item.cantidad;
        }
        return acc;
      },
      { labels: [] as string[], series: [] as number[], othersCount: 0 }
    );

    if (groupedData.othersCount > 0) {
      groupedData.labels.push('OTHERS');
      groupedData.series.push(groupedData.othersCount);
    }

    return { labels: groupedData.labels, series: groupedData.series };
  }

}
