import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsComponent } from "../../components/maps/maps.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsComponent, GoogleMapsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {

}
