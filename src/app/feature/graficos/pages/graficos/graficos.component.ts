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
  constructor( private crimeSummary: CrimeSummaryService){}
  ngOnInit(): void {
    this.loadPieChart();
    this.loadAreaChart();
  }

  isDropdownVisibleLine = false;
  isDropdownVisiblePie = false;

  toggleDropdownLine(): void {
    this.isDropdownVisibleLine = !this.isDropdownVisibleLine;
  }
  toggleDropdownPie(): void {
    this.isDropdownVisiblePie = !this.isDropdownVisiblePie;
  }

  private loadAreaChart(): void {
    const options = {
      chart: {
        height: '100%',
        maxWidth: '100%',
        type: 'area',
        fontFamily: 'Inter, sans-serif',
        dropShadow: { enabled: false },
        toolbar: { show: false },
      },
      tooltip: { enabled: true, x: { show: false } },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: '#1C64F2',
          gradientToColors: ['#1C64F2'],
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 6 },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: { left: 2, right: 2, top: 0 },
      },
      series: [
        {
          name: 'New users',
          data: [6500, 6418, 6456, 6526, 6356, 6456],
          color: '#1A56DB',
        },
      ],
      xaxis: {
        categories: [
          '01 February',
          '02 February',
          '03 February',
          '04 February',
          '05 February',
          '06 February',
          '07 February',
        ],
        labels: { show: false },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: { show: false },
    };

    const chart = new ApexCharts(document.getElementById('area-chart'), options);
    chart.render();
  }


  private loadPieChart(): void{
    this.crimeSummary.getCrimeSummary(2020, 'pie').subscribe({
      next: (data)=>{
        // Calcular el total de crímenes
      const total = data.reduce((sum, item) => sum + item.cantidad, 0);

      // Agrupar valores menores al 5% en "Others"
      const threshold = total * 0.10;
      const groupedData = data.reduce(
        (acc, item) => {
          if (item.cantidad >= threshold) {
            acc.labels.push(item.tipo_crimen);
            acc.series.push(item.cantidad);
          } else {
            acc.othersCount += (item.cantidad);
          }
          return acc;
        },
        { labels: [] as string[], series: [] as number[], othersCount: 0 }
      );

      // Agregar "Others" si es necesario
      if (groupedData.othersCount > 0) {
        groupedData.labels.push('OTHERS');
        groupedData.series.push(groupedData.othersCount);
      }
        const chartOptions = this.getChartOptions(groupedData.labels, (groupedData.series));
        const chart = new ApexCharts(document.getElementById("pie-chart"), chartOptions);
        chart.render();
      },
      error: (err)=>{
        console.log("Error al cargar los datos del gráfico", err);
      }
    })
  }

  private getChartOptions(labels: string[], series: number[]) {
    return {
      series: series,
      colors: [
        "#1C64F2", // Azul oscuro
        "#16BDCA", // Turquesa
        "#9061F9", // Lila
        "#F59E0B", // Amarillo oscuro
        "#10B981", // Verde esmeralda
        "#EF4444", // Rojo brillante
        "#3B82F6", // Azul claro
        "#6366F1", // Azul violeta
        "#F472B6", // Rosa vibrante
        "#8B5CF6"  // Púrpura
      ]
      ,
      chart: {
        height: 420,
        width: "100%",
        type: "pie",
      },
      stroke: {
        colors: ["white"],
        lineCap: "round",
      },
      plotOptions: {
        pie: {
          labels: {
            show: true,
          },
          size: "100%",
          dataLabels: {
            offset: -25
          }
        },
      },
      labels: labels,
      dataLabels: {
        enabled: true,
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
      legend: {
        position: "bottom",
        fontFamily: "Inter, sans-serif",
      },
      yaxis: {
        labels: {
          formatter: function (value: number) {
            return value;
          },
        },
      },
      xaxis: {
        labels: {
          formatter: function (value: number) {
            return value + "%";
          },
        },
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
      },
    };
  }

}
