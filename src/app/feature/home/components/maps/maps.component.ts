import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, Output, OnChanges, SimpleChanges, ViewChild, EventEmitter } from '@angular/core';
import { GoogleMapsService } from '../../../../shared/services/google-maps/google-maps.service';
import { RouteComplete } from '../../../../data/models/route';
import { NodesService } from '../../services/nodes.service';
import { debounceTime } from 'rxjs';
import { RouteService } from '../../services/route/route.service';

@Component({
  selector: 'app-maps',
  standalone: true,
  imports: [],
  templateUrl: './maps.component.html',
  styleUrl: './maps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsComponent implements AfterViewInit, OnChanges {
  @Input() center: google.maps.LatLngLiteral = { lat: 34.03831, lng: -118.28353 };
  @Input() originCoordinates: google.maps.LatLngLiteral | null = null;
  @Input() destinationCoordinates: google.maps.LatLngLiteral | null = null;
  @Output() routeGenerated = new EventEmitter<RouteComplete>();
  @ViewChild('map', { static: false }) mapContainer!: ElementRef;
  private map!: google.maps.Map;
  private heatmap!: google.maps.visualization.HeatmapLayer;
  private heatMapData: google.maps.visualization.WeightedLocation[] = [];
  private currentRenderMap = {min_lat: 0, max_lat: 0, min_lon: 0, max_lon: 0};

  constructor(private googleMapsService: GoogleMapsService, private routeService: RouteService, private nodeService: NodesService){}
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['originCoordinates'] || changes['destinationCoordinates']) {
      //Asignar los marcadores de origen y destino en el mapa
      await this.routeService.setMarkers(this.originCoordinates || undefined, this.destinationCoordinates || undefined);
      this.updateRoute();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    try{
      await this.googleMapsService.loadApi();
      this.map = await this.googleMapsService.initMap(this.mapContainer.nativeElement, this.center);

      //Inicializa el servicio de rutas
      this.routeService.initDirections(this.map);

      // **Suscribirte** al observable de la ruta
      this.routeService
        .getRouteGeneratedObservable()
        .subscribe((lastRoute: RouteComplete | null) => {
          if (lastRoute) {
            this.routeGenerated.emit(lastRoute);
          }
        });

      this.googleMapsService.getBoundsChangedObservable().pipe(debounceTime(700)).subscribe((bounds) => {
        this.addHeatmapLayer(bounds);
    });

    }
    catch (error){
      console.log('Error al cargar el API de Maps ', error);
    }
  }

  /**
   *Actualiza la ruta cuando cambian las coordenadas de origen o destino.
   */
  private async updateRoute(): Promise<void> {
    if (!this.originCoordinates || !this.destinationCoordinates) return;

    if (this.originCoordinates && this.destinationCoordinates) {
      await this.routeService.getDirections(this.originCoordinates, this.destinationCoordinates);
    }
  }

  /**
   *Carga y actualiza la capa de heatmap.
   */
  private async addHeatmapLayer(bounds: google.maps.LatLngBounds): Promise<void> {
    if (!this.map) return;

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const minLat = sw.lat();
    const maxLat = ne.lat();
    const minLon = sw.lng();
    const maxLon = ne.lng();

    const newRenderMap = { min_lat: minLat, max_lat: maxLat, min_lon: minLon, max_lon: maxLon };

    //Evitar llamadas innecesarias si el área ya fue renderizada
    const isInsideCurrentRender =
      newRenderMap.min_lat >= this.currentRenderMap.min_lat &&
      newRenderMap.max_lat <= this.currentRenderMap.max_lat &&
      newRenderMap.min_lon >= this.currentRenderMap.min_lon &&
      newRenderMap.max_lon <= this.currentRenderMap.max_lon;

    if (isInsideCurrentRender) return;

    this.nodeService.getNodes(minLat, maxLat, minLon, maxLon).subscribe({
      next: (nodes) => {
        const newHeatMapData: google.maps.visualization.WeightedLocation[] = nodes.map((node: any) => ({
          location: new google.maps.LatLng(node.latitude, node.longitude),
          weight: node.risk
        }));

        //Evitar nodos duplicados en el heatmap
        this.heatMapData = [...newHeatMapData, ...this.heatMapData].filter((node, index, all) => {
          return index === all.findIndex((n) => node.location?.lat === n.location?.lat && node.location?.lng === n.location?.lng);
        });

        // Actualizar heatmap si ya existe, o crearlo si no
        if (this.heatmap) {
          this.heatmap.setData(this.heatMapData);
        } else {
          this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: this.heatMapData,
            gradient: [
              'rgba(57, 106, 255, 0)',
              'rgba(57, 106, 255, 0.2)',
              'rgba(57, 106, 255, 0.4)',
              'rgba(10, 141, 196, 0.5)',
              'rgba(255, 255, 0, 0.5)',
              'rgba(255, 165, 0, 0.6)',
              'rgba(255, 0, 0, 0.7)'
            ],
            dissipating: true,
            radius: 35,
            map: this.map
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar el mapa de calor:', error);
      }
    });
  }

  /**
   *Elimina los eventos del mapa al destruir el componente.
   */
  ngOnDestroy(): void {
    if (this.map) {
      google.maps.event.clearInstanceListeners(this.map);
      this.map = undefined!;
    }
  }
}


