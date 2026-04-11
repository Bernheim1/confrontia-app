import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { DialogRef } from '../../../../shared/services/modal/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/services/modal/dialog-token';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { categoriaFiscalCollection } from '../../../../services/estudio/contracts/categorias-ficales-dto';
import { DataEscritosDto } from '../../../../services/estudio/contracts/firma-abogado-dto';

@Component({
  selector: 'app-data-escritos-config-dialog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './data-escritos-config-dialog.component.html',
  styleUrl: './data-escritos-config-dialog.component.scss'
})
export class DataEscritosConfigDialogComponent {

  @Output() generarEvent = new EventEmitter<any>();
  
  constructor(
    private readonly _formBuilder: FormBuilder,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DataEscritosDto, 
    private toastr: ToastrService
  ) { this.firmaForm = this.initFirmaForm(); }

  public firmaForm: FormGroup;
  public categoriaFiscalCollection = categoriaFiscalCollection;

  close() {
    this.dialogRef.close();
  }

  generar() {
    this.generarEvent.emit(this.firmaForm.getRawValue());
  }

  private initFirmaForm (): FormGroup {
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
          cuil: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          domicilio: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          domicilioElectronico: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          categoriaFiscal: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          nroLegajo: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          nroCajaPrevisoria: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          parteRepresentada: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ],
          nombreExpediente: [
            undefined, {
              updateOn: 'change',
              validators: [Validators.required]
            }
          ]
        });

        if(this.data)
          formGroup.patchValue(this.data);
    
        return formGroup;
  }

}
