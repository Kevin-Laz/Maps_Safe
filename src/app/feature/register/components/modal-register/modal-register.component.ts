import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-modal-register',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon, FormsModule, MatProgressSpinner],
  templateUrl: './modal-register.component.html',
  styleUrl: './modal-register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalRegisterComponent {
  @Input() toggleRegister: boolean = false;
  @Output() toggleUpdate = new EventEmitter<void>();
  @Output() changeModal = new EventEmitter<void>();
  isLoading: WritableSignal<boolean> = signal(false);
  textFullname:string = '';
  textEmail:string = '';
  textPassword:string = '';
  textConfirmPassword:string = '';
  OnSubmitted:boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  constructor(private authService: AuthService) {}

  onRegister(form: NgForm): void {
    if (form.valid) {
      if (this.textPassword === this.textConfirmPassword) {
        this.isLoading.set(true);
        this.authService.register(this.textEmail, this.textPassword).subscribe({
          next:(success) => {
            if (success) {
              this.successMessage = 'Registration successful!';
              this.errorMessage = '';
              form.reset(); // Reset the form on success
            } else {
              this.errorMessage = 'Registration failed. Please try again.';
              this.successMessage = '';
            }
          },
          error: (error) => {
            this.isLoading.set(false);
            console.error('Error during registration:', error);
            this.errorMessage = 'An error occurred. Please try again.';
            this.successMessage = '';
            },
          complete: ()=> {
            this.isLoading.set(false);
          }
          })
        }
      else {
        this.errorMessage = 'Passwords do not match.';
        this.successMessage = '';
      }
    }
    else {
      this.errorMessage = 'Please fill in all required fields.';
      this.successMessage = '';
    }

  }
  onLoginRedirect(){
    this.changeModal.emit();
  }

  changeToggleRegister(){
    this.toggleUpdate.emit();
  }
}
