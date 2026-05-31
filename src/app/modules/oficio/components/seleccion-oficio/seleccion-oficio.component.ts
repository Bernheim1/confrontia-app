import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleInfo, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { OficioService } from '../../../../services/oficio/oficio.service';
import { buildOficioText, OficioFieldConfig, OficioTypeConfig } from '../../models/oficio-catalog';
import { OficioCampoValor, OficioDocumento } from '../../models/oficio-documento';

@Component({
  selector: 'app-seleccion-oficio',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './seleccion-oficio.component.html',
  styleUrl: '../../../despacho/components/seleccion-salida/seleccion-salida.component.scss'
})
export class SeleccionOficioComponent implements OnInit {
  faCircleInfo = faCircleInfo;
  faRepeat = faRepeat;
  faCheck = faCheck;

  @Output() oficioSeleccionado = new EventEmitter<{ documento: OficioDocumento; index: number }>();
  @Output() formularioCompletado = new EventEmitter<{ index: number; valido: boolean }>();
  @Output() reingresar = new EventEmitter<void>();
  @Input() proveido = '';
  @Input() tipoOficio!: OficioTypeConfig;
  @Input() index = 0;
  @Input() masivo = false;
  @Input() totalOficios = 1;
  @Input() oficiosCompletados = 0;
  @Input() caso?: CasoDto;
  @Input() casoId?: string;

  formulario!: FormGroup;
  hasError = false;
  generado = false;
  sections: Array<{ name: string; fields: OficioFieldConfig[] }> = [];
  observaciones: string | null = null;

  constructor(private fb: FormBuilder, private oficioService: OficioService) {}

  async ngOnInit(): Promise<void> {
    this.sections = this.groupFieldsBySection(this.tipoOficio.fields);
    this.formulario = this.fb.group(this.buildControls());

    this.formulario.statusChanges.subscribe(status => {
      this.formularioCompletado.emit({
        index: this.index,
        valido: status === 'VALID'
      });
    });

    await this.cargarValoresIniciales();
  }

  private buildControls(): Record<string, FormControl> {
    return this.tipoOficio.fields.reduce<Record<string, FormControl>>((controls, field) => {
      controls[field.key] = new FormControl('', field.required ? Validators.required : []);
      return controls;
    }, {});
  }

  private groupFieldsBySection(fields: OficioFieldConfig[]): Array<{ name: string; fields: OficioFieldConfig[] }> {
    const grouped = new Map<string, OficioFieldConfig[]>();

    fields.forEach(field => {
      const section = field.section || 'Datos variables';
      const current = grouped.get(section) || [];
      current.push(field);
      grouped.set(section, current);
    });

    return Array.from(grouped.entries()).map(([name, sectionFields]) => ({ name, fields: sectionFields }));
  }

  private async cargarValoresIniciales(): Promise<void> {
    const valoresCaso = this.getValoresDesdeCaso();

    try {
      const response = await this.oficioService.procesarOficioAsync({
        proveido: this.proveido,
        tipoOficioCodigo: this.tipoOficio.code,
        casoId: this.casoId
      });

      this.observaciones = response.observaciones || null;
      this.formulario.patchValue({ ...valoresCaso, ...(response.valores || {}) });
    } catch (error) {
      console.error('Error procesando oficio', error);
      this.formulario.patchValue(valoresCaso);
    }
  }

  private getValoresDesdeCaso(): Record<string, OficioCampoValor> {
    if (!this.caso) {
      return {};
    }

    const domicilio = [this.caso.domicilio, this.caso.nro].filter(Boolean).join(' ');
    const monto = this.caso.montoTotalNumero ?? this.caso.montoCapitalNumero ?? null;

    return {
      caratula: this.caso.caratulaExpediente || '',
      numeroExpediente: this.caso.numeroExpediente || '',
      domicilio,
      titular: this.caso.textoRequerido || '',
      nombreRazonSocial: this.caso.textoRequerido || '',
      razonSocial: this.caso.textoRequerido || '',
      monto,
      localidad: this.caso.localidad || ''
    };
  }

  onSubmit() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.hasError = true;

      setTimeout(() => {
        const element = document.getElementById(`salida-${this.index}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      setTimeout(() => {
        this.hasError = false;
      }, 3000);

      return;
    }

    this.hasError = false;
    this.generado = true;
    const valores = this.formulario.getRawValue() as Record<string, OficioCampoValor>;
    const documento: OficioDocumento = {
      casoId: this.casoId,
      categoriaCodigo: this.tipoOficio.categoryCode,
      categoriaNombre: this.tipoOficio.categoryName,
      tipoOficioCodigo: this.tipoOficio.code,
      tipoOficioNombre: this.tipoOficio.label,
      organismoDestino: this.tipoOficio.organismoDestino,
      proveido: this.proveido,
      textoGenerado: buildOficioText(this.tipoOficio.template, valores),
      valores
    };

    this.oficioSeleccionado.emit({ documento, index: this.index });

    setTimeout(() => {
      this.generado = false;
    }, 2000);
  }

  submitFromParent(index: number) {
    this.index = index;
    this.onSubmit();
  }

  campoInvalido(path: string): boolean {
    const control = this.formulario.get(path);
    return !!(control && control.invalid && control.touched);
  }

  esCampoAmplio(field: OficioFieldConfig): boolean {
    return field.type === 'textarea';
  }

  getInputType(type: OficioFieldConfig['type']): string {
    if (type === 'date') return 'date';
    if (type === 'email') return 'email';
    if (type === 'number' || type === 'money' || type === 'percent') return 'number';
    return 'text';
  }

  getPasoNumero(): number {
    return this.index + 1;
  }

  onReingresar() {
    this.reingresar.emit();
  }
}
