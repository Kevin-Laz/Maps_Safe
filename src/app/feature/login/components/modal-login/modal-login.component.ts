import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter, OnInit, WritableSignal, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-modal-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon, FormsModule, MatProgressSpinner],
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
  isAuthenticated: WritableSignal<boolean> = signal(false); // Estado de autenticación
  isLoading: boolean = false;

  constructor(private authService: AuthService) {
    effect(()=>{
      this.updateAuthStatus();
    })
  }

  ngOnInit(): void {

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
      this.isLoading = true;
      this.authService.login(this.textUser, this.textPassword).subscribe((success) => {
      if (success) {
        this.changeToggleModel();
        this.updateAuthStatus();
        this.isLoading = false;
        } else {
          this.errorMessage = 'Usuario o contraseña incorrectos';
          this.isLoading = false;
          }
      });
    }
  }

  logout(): void {
    this.authService.logout(); // Cierra sesión
    this.updateAuthStatus(); // Actualiza el estado de autenticación
    this.changeToggleModel(); // Cierra el modal
  }

  onRegisterRedirect(){
    this.changeModal.emit();
  }
}
