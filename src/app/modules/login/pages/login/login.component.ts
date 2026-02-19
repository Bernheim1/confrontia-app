import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/service/auth.service';
import { faEye, faEyeSlash, faGavel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CoreConfigService } from '../../../../core/services/config.service';
import { take } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,ReactiveFormsModule, FontAwesomeModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginPageComponent {
  public constructor(
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private _coreConfigService: CoreConfigService,
        private toastr: ToastrService,
        private readonly _router: Router
    ) {
        this.switchLayout(false);
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            passwd: ['', [Validators.required]]
        });
    }

    public faGavel = faGavel;
    public faEyeSlash = faEyeSlash;
    public faEye = faEye;
    public basicPwdShow = false;
    public loginForm: FormGroup;

    public onSubmit(): void {
        if (!this.loginForm.valid) {
            this.toastr.error('Los datos ingresados son erróneos. Por favor, revíselos y vuelva a intentar.', 'Error');

            return;
        }
        const username = this.loginForm.get('username')?.value;
        const passwd = this.loginForm.get('passwd')?.value;
        this.signIn(username, passwd);
    }

    public signIn(username: string, passwd: string): void {
        this.authService.login(username, passwd)
            .subscribe((result: any) => {
                if (!result.success) {
                    this.toastr.error('Los datos ingresados son erróneos. Por favor, revíselos y vuelva a intentar.', 'Error');

                    return;
                }

                this.switchLayout(true);
                this._router.navigate(['']);
            });
    }

    private switchLayout(show: boolean): void {
        this._coreConfigService.getConfig().pipe(take(1)).subscribe((res: any) => {
            res.layout.menu.hidden = !show;
            res.layout.navbar.hidden = !show;
            this._coreConfigService.setConfig(res);
        });
    }
}
