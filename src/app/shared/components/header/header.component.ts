import { ChangeDetectionStrategy, Component, Output, EventEmitter, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ModalLoginComponent } from '../../../feature/login/components/modal-login/modal-login.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatButtonModule, ModalLoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  NAME_SCHOOL = 'Maps Safe';
  SOURCE_LOGO = 'images/Insignia.png';
  modalLoginStatus = false;
  @Output() toggleSidebar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() sidebarStatus: boolean = true;
  changeSidebarStatus(){
    this.toggleSidebar.emit(!this.sidebarStatus);
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
