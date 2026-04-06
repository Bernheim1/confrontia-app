import { Component, OnInit } from '@angular/core';
import { perfilesList } from '../../../../../services/user/contracts/perfiles-enum';
import { EstudioService } from '../../../../../services/estudio/estudio.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUsuarioCommand } from '../../../../../services/user/commands/create-usuario-command';
import { UserService } from '../../../../../services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { UpdateUsuarioCommand } from '../../../../../services/user/commands/update-usuario-command';
import { DropdownItem } from '../../../../../shared/models/dropdown-item';

@Component({
  selector: 'app-usuarios-config-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule ],
  templateUrl: './usuarios-config-page.component.html',
  styleUrl: './usuarios-config-page.component.scss'
})
export class UsuariosConfigPageComponent implements OnInit {

  private userId: string = '';

  constructor(private route: ActivatedRoute, private usuarioService: UserService,private estudioService: EstudioService,
    private readonly _formBuilder: FormBuilder, private toastr: ToastrService) { this.usuarioForm = this.initUsuarioForm(); }

  public ngOnInit(): void {
    this.getEstudios();
    this.route.params.subscribe(params => {
      if(params['id']) {
        this.createAction = false;
        this.userId = params['id'];
        this.getUser();
      }
    });
  }

  public usuarioForm: FormGroup;

  public perfilesCollection = perfilesList;
  public estudiosCollection: DropdownItem[] = [];
  public createAction: boolean = true;

  public create(): void {
    const formValue = this.usuarioForm.getRawValue();
    const command: CreateUsuarioCommand = {
      username: formValue.username,
      nombre: formValue.nombre,
      email: formValue.email,
      perfil: formValue.perfil,
      estudioId: formValue.estudioId !== '' ? formValue.estudioId : undefined
    }

    this.usuarioService.create(command).subscribe({
      next: (userId: string) => {
        // Si MEV está habilitado, configurarlo
        if (formValue.mevEnabled && userId) {
          this.configurarMevParaUsuario(userId, formValue.mevEnabled, formValue.mevUsername, formValue.mevPassword);
        } else {
          this.toastr.success('Usuario creado correctamente!', 'Exito');
        }
      },
      error: (err) => {
        this.toastr.error('Ocurrio un error.', 'Error')
      }
    })
  }

  public update(): void {
    const formValue = this.usuarioForm.getRawValue();
    const command: UpdateUsuarioCommand = {
      id: this.userId,
      username: formValue.username,
      nombre: formValue.nombre,
      email: formValue.email,
      perfil: formValue.perfil,
      estudioId: formValue.estudioId !== '' ? formValue.estudioId : undefined
    }

    this.usuarioService.update(this.userId, command).subscribe({
      next: () => {
        // Actualizar configuración MEV
        if (formValue.mevEnabled) {
          this.configurarMevParaUsuario(this.userId, formValue.mevEnabled, formValue.mevUsername, formValue.mevPassword);
        } else {
          // Si MEV está deshabilitado, eliminarlo
          this.usuarioService.eliminarMev(this.userId).subscribe({
            next: () => {
              this.toastr.success('Usuario modificado correctamente!', 'Exito');
            },
            error: () => {
              this.toastr.success('Usuario modificado correctamente!', 'Exito');
            }
          });
        }
      },
      error: () => {
        this.toastr.error('Ocurrio un error.', 'Error')
      }
    })
  }

  private getUser(): void {
    this.usuarioService.getById(this.userId)
    .subscribe({
      next: (res) => {
        this.usuarioForm.patchValue({
          username: res.username,
          nombre: res.nombre,
          email: res.email,
          perfil: res.perfil,
          estudioId: res.estudioId,
          mevEnabled: res.mev?.enabled || false,
          mevUsername: res.mev?.username,
          mevPassword: res.mev?.password
        });

        // Si el DTO no trajo la config MEV, consultarla por separado
        if (!res.mev) {
          this.cargarMevConfig();
        }
      }
    })
  }

  private cargarMevConfig(): void {
    this.usuarioService.getMev(this.userId).subscribe({
      next: (mevConfig) => {
        if (mevConfig) {
          this.usuarioForm.patchValue({
            mevEnabled: mevConfig.enabled,
            mevUsername: mevConfig.username,
            mevPassword: mevConfig.password
          });
        }
      }
    });
  }

  private configurarMevParaUsuario(userId: string, enabled: boolean, username?: string, password?: string): void {
    const mevCommand = {
      id: userId,
      enabled: enabled,
      username: username,
      password: password
    };

    this.usuarioService.configurarMev(userId, mevCommand).subscribe({
      next: () => {
        this.toastr.success('Usuario y configuración MEV guardados correctamente!', 'Exito');
      },
      error: () => {
        this.toastr.warning('Usuario creado pero hubo un error al configurar MEV.', 'Advertencia');
      }
    });
  }

  private initUsuarioForm(): FormGroup {
    const formGroup: FormGroup = this._formBuilder.nonNullable.group({
      username: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      nombre: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      email: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      perfil: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      estudioId: [
        undefined, {
          updateOn: 'change',
          validators: []
        }
      ],
      mevEnabled: [
        false, {
          updateOn: 'change',
          validators: []
        }
      ],
      mevUsername: [
        undefined, {
          updateOn: 'change',
          validators: []
        }
      ],
      mevPassword: [
        undefined, {
          updateOn: 'change',
          validators: []
        }
      ]
    });

    return formGroup;
  }

  private getEstudios(): void {
    this.estudioService.getDropdown()
    .subscribe({
      next: (res) => {
        this.estudiosCollection = res;
      }
    })
  }
}
