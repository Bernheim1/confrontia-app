import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { categoriaFiscalCollection } from '../../../../../services/estudio/contracts/categorias-ficales-dto';
import { EstudioService } from '../../../../../services/estudio/estudio.service';

@Component({
  selector: 'app-firma-abogado-config',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule ],
  templateUrl: './firma-abogado-config.component.html',
  styleUrl: './firma-abogado-config.component.scss'
})
export class FirmaAbogadoConfigComponent implements OnInit {

  public constructor(private readonly _formBuilder: FormBuilder, private readonly _estudioService: EstudioService) 
  { this.firmaForm = this.initFirmaForm(); }

  @Output() public readonly componentFormInstance = new EventEmitter<FormGroup>();
  
  @Input() public estudioId: string | undefined;
  
  public firmaForm: FormGroup;
  public categoriaFiscalCollection = categoriaFiscalCollection;

  public ngOnInit(): void {
    if(this.estudioId) { this.getFirma(); }
   
    if (this.componentFormInstance.observed) {
      this.componentFormInstance.emit(this.firmaForm);
    }
  }

  private getFirma(): void {
    this._estudioService.getFirmaAbogado(this.estudioId!).subscribe({
      next: (response) => {
        if (response) {
          this.firmaForm.controls['firmaEnabled'].setValue(true);
          this.firmaForm.patchValue(response);
        }
      }});
  }
  
  private initFirmaForm (): FormGroup {
      const formGroup: FormGroup = this._formBuilder.nonNullable.group({
        firmaEnabled: [
          false, {
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
        ]
      });
  
      return formGroup;
    }
}
