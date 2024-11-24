import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-container.component.html',
  styleUrl: './search-container.component.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SearchContainerComponent {
  @Input() searchHistory: { origin: string; destination: string; duration: string }[] = [];
}
