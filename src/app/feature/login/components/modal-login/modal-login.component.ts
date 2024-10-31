import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-modal-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIcon, FormsModule],
  templateUrl: './modal-login.component.html',
  styleUrl: './modal-login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalLoginComponent {
  @Input() toggleModal: boolean = false;
  @Output() toggleUpdate = new EventEmitter<void>();
  textUser:string = '';
  textPassword:string = '';
  OnSubmitted:boolean = false;
  changeToggleModel(){
    this.toggleUpdate.emit();
    this.OnSubmitted = false;
    this.textUser = '';
    this.textPassword = '';
  }
  onLogin(loginForm: NgForm){
    this.OnSubmitted = true;
    if(!loginForm.invalid){
      console.log("Se inicio sesion");
      console.log(this.textUser);
    }
  }
}
