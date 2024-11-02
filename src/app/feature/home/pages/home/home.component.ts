import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsComponent } from "../../components/maps/maps.component";
import { ModalRegisterComponent } from "../../../register/components/modal-register/modal-register.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapsComponent, GoogleMapsModule, ModalRegisterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomeComponent {

}
