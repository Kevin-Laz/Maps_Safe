import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Output, EventEmitter, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalLoginComponent } from '../../../feature/login/components/modal-login/modal-login.component';
import { ModalRegisterComponent } from "../../../feature/register/components/modal-register/modal-register.component";
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-side-bar, [app-side-bar]',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalLoginComponent, ModalRegisterComponent],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideBarComponent {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  sidebarStatus = input.required<boolean>();
  modalLoginStatus = false;
  registerActive = true;
  listSections = [
    {'icon': 'manage_search',
      'link': '/',
      'name': 'Home'
    },
    {'icon': 'history',
      'link': '/historial',
      'name': 'History'
    },
    {'icon': 'analytics',
      'link': '/graficos',
      'name': 'Charts'
    }
  ];

  constructor(private authService: AuthService) {
    if(authService.isAuthenticated()){
      this.registerActive = false;
    }
  }


  changeSidebar(){
    this.toggle.emit(!this.sidebarStatus());
  }
  changeModalLoginSatus(){
    if(this.modalLoginStatus){
      this.modalLoginStatus = false;
    }
    else{
      this.modalLoginStatus = true;
    }
  }
  redirectModalRegister(){
    this.registerActive = true;
  }
  redirectModalLogin(){
    this.registerActive = false;
  }
}
