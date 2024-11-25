import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth/auth.service';
@Component({
  selector: 'app-modal-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon, FormsModule],
  templateUrl: './modal-login.component.html',
  styleUrl: './modal-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalLoginComponent implements OnInit{
  @Input() toggleModal: boolean = false;
  @Output() toggleUpdate = new EventEmitter<void>();
  @Output() changeModal = new EventEmitter<void>();
  textUser:string = '';
  textPassword:string = '';
  OnSubmitted:boolean = false;
  errorMessage: string = '';
  isAuthenticated: boolean = false; // Estado de autenticación

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.updateAuthStatus();
  }

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated(); // Verifica si el usuario está autenticado
  }

  changeToggleModel(){
    this.toggleUpdate.emit();
    this.OnSubmitted = false;
    this.textUser = '';
    this.textPassword = '';
  }
  onLogin(loginForm: NgForm){
    this.OnSubmitted = true;
    if(!loginForm.invalid){
      this.authService.login(this.textUser, this.textPassword).subscribe((success) => {
      if (success) {
        this.changeToggleModel();
        this.updateAuthStatus();
        console.log("Inicio de sesion exitoso")
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
          }
      });
    }
  }

  logout(): void {
    this.authService.logout(); // Cierra sesión
    this.updateAuthStatus(); // Actualiza el estado de autenticación
    this.changeToggleModel(); // Cierra el modal
    console.log('Sesión cerrada');
  }

  onRegisterRedirect(){
    this.changeModal.emit();
  }
}
