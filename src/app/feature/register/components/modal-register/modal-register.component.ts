import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth/auth.service';
@Component({
  selector: 'app-modal-register',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon, FormsModule],
  templateUrl: './modal-register.component.html',
  styleUrl: './modal-register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalRegisterComponent {
  @Input() toggleRegister: boolean = false;
  @Output() toggleUpdate = new EventEmitter<void>();
  @Output() changeModal = new EventEmitter<void>();

  textFullname:string = '';
  textEmail:string = '';
  textPassword:string = '';
  textConfirmPassword:string = '';
  OnSubmitted:boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false; // Estado de autenticación

  constructor(private authService: AuthService) {}

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated(); // Verifica si el usuario está autenticado
  }

  onRegister(from: FormsModule){

  }
  onLoginRedirect(){
    this.changeModal.emit();
  }

  changeToggleRegister(){

  }
}
