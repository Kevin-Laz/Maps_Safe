import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Output, EventEmitter, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalLoginComponent } from '../../../feature/login/components/modal-login/modal-login.component';

@Component({
  selector: 'app-side-bar, [app-side-bar]',
  standalone: true,
  imports: [CommonModule, RouterLink, ModalLoginComponent],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideBarComponent {
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  sidebarStatus = input.required<boolean>();
  modalLoginStatus = false;
  listSections = [
    {'icon': 'manage_search',
      'link': '/',
      'name': 'Inicio'
    },
    {'icon': 'history',
      'link': '/historial',
      'name': 'Historial'
    },
    {'icon': 'analytics',
      'link': '/graficos',
      'name': 'Graficos'
    }
  ];
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
}
