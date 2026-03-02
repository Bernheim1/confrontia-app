import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstudioService } from '../../../../../services/estudio/estudio.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateEstudioCommand } from '../../../../../services/estudio/commands/create-estudio-command';
import { UpdateEstudioCommand } from '../../../../../services/estudio/commands/update-estudio-command';

@Component({
  selector: 'app-estudio-config-page',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './estudio-config-page.component.html',
  styleUrl: './estudio-config-page.component.scss'
})
export class EstudioConfigPageComponent implements OnInit {

  private estudioId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private estudioService: EstudioService,
    private readonly _formBuilder: FormBuilder,
    private toastr: ToastrService
  ) {
    this.estudioForm = this.initEstudioForm();
  }

  public ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.createAction = false;
        this.estudioId = params['id'];
        this.getEstudio();
      }
    });
  }

  public estudioForm: FormGroup;
  public createAction: boolean = true;

  public create(): void {
    const formValue = this.estudioForm.getRawValue();
    const command: CreateEstudioCommand = {
      nombre: formValue.nombre,
      cuit: formValue.cuit,
      direccion: formValue.direccion,
      telefono: formValue.telefono,
      email: formValue.email
    }

    this.estudioService.create(command).subscribe({
      next: (estudioId: string) => {
        // Si MEV está habilitado, configurarlo
        if (formValue.mevEnabled && estudioId) {
          this.configurarMevParaEstudio(estudioId, formValue.mevEnabled, formValue.mevUsername, formValue.mevPassword);
        } else {
          this.toastr.success('Estudio creado correctamente!', 'Exito');
          this.router.navigate(['/estudios']);
        }
      },
      error: () => {
        this.toastr.error('Ocurrio un error.', 'Error')
      }
    })
  }

  public update(): void {
    const formValue = this.estudioForm.getRawValue();
    const command: UpdateEstudioCommand = {
      id: this.estudioId,
      nombre: formValue.nombre,
      cuit: formValue.cuit,
      direccion: formValue.direccion,
      telefono: formValue.telefono,
      email: formValue.email
    }

    this.estudioService.update(this.estudioId, command).subscribe({
      next: () => {
        // Actualizar configuración MEV
        if (formValue.mevEnabled) {
          this.configurarMevParaEstudio(this.estudioId, formValue.mevEnabled, formValue.mevUsername, formValue.mevPassword);
        } else {
          // Si MEV está deshabilitado, eliminarlo
          this.estudioService.eliminarMev(this.estudioId).subscribe({
            next: () => {
              this.toastr.success('Estudio modificado correctamente!', 'Exito');
              this.router.navigate(['/estudios']);
            },
            error: () => {
              this.toastr.success('Estudio modificado correctamente!', 'Exito');
              this.router.navigate(['/estudios']);
            }
          });
        }
      },
      error: () => {
        this.toastr.error('Ocurrio un error.', 'Error')
      }
    })
  }

  private getEstudio(): void {
    this.estudioService.getById(this.estudioId)
      .subscribe({
        next: (res) => {
          this.estudioForm.patchValue({
            nombre: res.nombre,
            cuit: res.cuit,
            direccion: res.direccion,
            telefono: res.telefono,
            email: res.email,
            mevEnabled: res.mev?.enabled || false,
            mevUsername: res.mev?.username,
            mevPassword: res.mev?.password
          });
        }
      })
  }

  private configurarMevParaEstudio(estudioId: string, enabled: boolean, username?: string, password?: string): void {
    const mevCommand = {
      id: estudioId,
      enabled: enabled,
      username: username || '',
      password: password || ''
    };

    this.estudioService.configurarMev(estudioId, mevCommand).subscribe({
      next: () => {
        this.toastr.success('Estudio y configuración MEV guardados correctamente!', 'Exito');
        this.router.navigate(['/estudios']);
      },
      error: () => {
        this.toastr.warning('Estudio creado pero hubo un error al configurar MEV.', 'Advertencia');
        this.router.navigate(['/estudios']);
      }
    });
  }

  private initEstudioForm(): FormGroup {
    const formGroup: FormGroup = this._formBuilder.nonNullable.group({
      nombre: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      cuit: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      direccion: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      telefono: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required]
        }
      ],
      email: [
        undefined, {
          updateOn: 'change',
          validators: [Validators.required, Validators.email]
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

  public volver(): void {
    this.router.navigate(['/estudios']);
  }
}
