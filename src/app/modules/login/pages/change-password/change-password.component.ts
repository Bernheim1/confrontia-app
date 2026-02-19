import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faEye, faEyeSlash, faGavel } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../../core/auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChangePasswordCommand } from '../../../../services/user/commands/change-password-command';
import { UserService } from '../../../../services/user/user.service';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  public constructor(
      private formBuilder: FormBuilder,
      private userService: UserService,
      private toastr: ToastrService,
      private auth: AuthService
  ) {
      this.changePasswordForm = this.formBuilder.group({
          oldPasswd: ['', [Validators.required]],
          newPasswd: ['', [Validators.required]],
          newRepeatedPasswd: ['', [Validators.required]]
      });
  }
  
  public faGavel = faGavel;
  public faEyeSlash = faEyeSlash;
  public faEye = faEye;
  public basicPwdShow = false;
  public changePasswordForm: FormGroup;

  public onSubmit(): void {
      if (!this.changePasswordForm.valid ||
        this.changePasswordForm.get('newRepeatedPasswd')?.value != this.changePasswordForm.get('newPasswd')?.value) {
          this.toastr.error('Las claves ingresadas no coinciden.', 'Error');

          return;
      }
      const oldPasswd = this.changePasswordForm.get('oldPasswd')?.value;
      const newPasswd = this.changePasswordForm.get('newPasswd')?.value;
      
      this.auth.currentUser$.pipe(take(1)).subscribe({
        next: (res) => {
          const command: ChangePasswordCommand = {
            newPassword: newPasswd,
            oldPassword: oldPasswd,
            id: res?.id ?? ''
          }
          
          this.changePassword(command);
        },
        error: (err) => {
          this.toastr.error('Los datos ingresados son erróneos. Por favor, revíselos y vuelva a intentar.', 'Error');
        },
      });
  }

  private changePassword(command: ChangePasswordCommand): void {
    this.userService.changePassword(command?.id ?? '', command)
      .subscribe({
        next: () => {
          this.toastr.success('Contraseña modificada correctamente.', 'Éxito');
        },
        error: () => {
          this.toastr.error('Los datos ingresados son erróneos. Por favor, revíselos y vuelva a intentar.', 'Error');
        }
      });
  }
}
