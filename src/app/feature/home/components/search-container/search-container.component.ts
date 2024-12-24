import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouteComplete, RouteCoordinatesNames } from '../../../../data/models/route';

@Component({
  selector: 'app-search-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-container.component.html',
  styleUrl: './search-container.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SearchContainerComponent {
  @Input() searchHistory: RouteComplete[] = [];
  @Output() searchRoute = new EventEmitter<RouteCoordinatesNames>();

  onClicked(index: number){
    if(this.searchHistory.length>0){
      let coor: RouteCoordinatesNames = {oLatLng : this.searchHistory[index].oLatLng, dLatLng : this.searchHistory[index].dLatLng, origin: this.searchHistory[index].origin, destination: this.searchHistory[index].destination}
      this.searchRoute.emit(coor);
    }
  }
}

