import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { SideBarComponent } from './shared/components/side-bar/side-bar.component';
import { CommonModule } from '@angular/common';
import { GoogleMapsService } from './shared/services/google-maps/google-maps.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule, SideBarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  constructor(private googleMapsService: GoogleMapsService) {}
  ngOnInit(): void {
    this.googleMapsService.loadApi().catch((error) =>
      console.error('Error al cargar la API de Google Maps', error)
    );
  }
  title = 'maps_safe';
  sidebarState = signal<boolean>(true);
  onToggleSidebar(newState: boolean) {
    this.sidebarState.set(newState);
  }
}
