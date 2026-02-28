import { Component, OnInit } from '@angular/core';
import { perfilesList } from '../../../../../services/user/contracts/perfiles-enum';
import { DropdownItem } from "../../../../../../shared/models/dropdown-item";
import { EstudioService } from '../../../../../services/estudio/estudio.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateUsuarioCommand } from '../../../../../services/user/commands/create-usuario-command';
import { UserService } from '../../../../../services/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import { UpdateUsuarioCommand } from '../../../../../services/user/commands/update-usuario-command';

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
    const command: CreateUsuarioCommand = {
      ...this.usuarioForm.getRawValue(),
      estudioId: this.usuarioForm.controls['estudioId'].value !== '' ? this.usuarioForm.controls['estudioId'].value: undefined
    }

    this.usuarioService.create(command).subscribe({
      next: () => {
        this.toastr.success('Usuario creado correctamente!', 'Exito')
      },
      error: (err) => {
        var a = err;
        debugger
        this.toastr.error('Ocurrio un error.', 'Error')
      }
    })
  }

  public update(): void {
    const command: UpdateUsuarioCommand = {
      ...this.usuarioForm.getRawValue(),
      estudioId: this.usuarioForm.controls['estudioId'].value !== '' ? this.usuarioForm.controls['estudioId'].value: undefined,
      id: this.userId
    }

    this.usuarioService.update(this.userId, command).subscribe({
      next: () => {
        this.toastr.success('Usuario modificado correctamente!', 'Exito')
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
        this.usuarioForm.patchValue(res);
      }
    })
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
