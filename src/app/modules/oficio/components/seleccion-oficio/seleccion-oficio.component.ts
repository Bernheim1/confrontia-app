import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faCircleInfo, faRepeat } from '@fortawesome/free-solid-svg-icons';
import Papa from 'papaparse';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { CasoListDto } from '../../../../shared/models/caso-list-dto';
import { CasoService } from '../../../../services/caso/caso.service';
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

  // Case search
  casosEncontrados: CasoListDto[] = [];
  casosDisponibles: CasoListDto[] = [];
  casoSeleccionado: CasoListDto | null = null;
  buscandoCasos = false;
  mostrarSelectorCaso = false;
  casoAutoAplicado = false;

  // Juzgado autocomplete
  juzgadosIntervinientes: Array<{ juzgado: string; direccion?: string }> = [];
  juzgadosFiltrados: Array<{ juzgado: string; direccion?: string }> = [];
  filtroJuzgado = '';
  openDropdownJuzgado = false;
  highlightedIndexJuzgado = -1;
  pointerOverJuzgadoList = false;
  suppressOpenJuzgado = false;
  @ViewChild('juzgadoInput') juzgadoInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private oficioService: OficioService,
    private casoService: CasoService,
    private http: HttpClient
  ) {}

  async ngOnInit(): Promise<void> {
    this.sections = this.groupFieldsBySection(this.tipoOficio.fields);
    this.formulario = this.fb.group(this.buildControls());

    this.formulario.statusChanges.subscribe(status => {
      this.formularioCompletado.emit({
        index: this.index,
        valido: status === 'VALID'
      });
    });

    this.formulario.get('juzgado')?.valueChanges.subscribe((juzgado: string) => {
      const localidad = this.extraerLocalidadDeJuzgado(juzgado || '');
      if (localidad) {
        this.formulario.get('localidadFecha')?.setValue(localidad, { emitEvent: false });
      }
    });

    await this.cargarValoresIniciales();
    this.cargarJuzgados();
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

      if (!this.casoId) {
        const nombre = ((response.valores?.['nombreRazonSocial'] ?? '') as string).trim();
        if (nombre) {
          this.buscarCasosPorNombre(nombre);
        }
      }
    } catch (error) {
      console.error('Error procesando oficio', error);
      this.formulario.patchValue(valoresCaso);
    }
    this.filtroJuzgado = this.formulario.get('juzgado')?.value || '';
  }

  private getValoresDesdeCaso(): Record<string, OficioCampoValor> {
    if (!this.caso) {
      return {};
    }

    const domicilio = [this.caso.domicilio, this.caso.nro].filter(Boolean).join(' ');
    const monto = this.caso.montoTotalNumero ?? this.caso.montoCapitalNumero ?? null;
    const juzgado = this.caso.juzgadoInterviniente || this.caso.juzgadoTribunal || '';
    const localidadMatch = juzgado.match(/\bde\s+([A-ZÁÉÍÓÚÑ][^\n,]+)$/i);
    const localidadFecha = localidadMatch?.[1]?.trim() || '';

    return {
      caratula: this.caso.caratulaExpediente || '',
      numeroExpediente: this.caso.numeroExpediente || '',
      domicilio,
      titular: this.caso.textoRequerido || '',
      nombreRazonSocial: this.caso.textoRequerido || '',
      razonSocial: this.caso.textoRequerido || '',
      monto,
      localidad: this.caso.localidad || '',
      juzgado,
      localidadFecha,
      ubicacionJuzgado: this.caso.direccionJuzgado || ''
    };
  }

  // ──────────────── Case search ────────────────

  private buscarCasosPorNombre(nombre: string): void {
    this.buscandoCasos = true;
    this.casoAutoAplicado = false;
    this.casoService.getCasos({
      nroExpediente: '',
      caratula: nombre,
      fechaIngresoDesde: null!,
      fechaIngresoHasta: null!,
      offset: 0,
      limit: 10
    }).subscribe({
      next: result => {
        this.buscandoCasos = false;
        this.casosDisponibles = result.items || [];
        this.casosEncontrados = this.casosDisponibles;
        if (this.casosEncontrados.length === 1) {
          this.aplicarCasoEncontrado(this.casosEncontrados[0]);
          this.casoAutoAplicado = true;
        } else if (this.casosEncontrados.length > 1) {
          this.mostrarSelectorCaso = true;
        }
      },
      error: () => { this.buscandoCasos = false; }
    });
  }

  aplicarCasoEncontrado(casoList: CasoListDto): void {
    const juzgado = casoList.juzgadoInterviniente || '';
    const localidadMatch = juzgado.match(/\bde\s+([A-ZÁÉÍÓÚÑ][^\n,\-]+?)(?:\s*[-\u2013]|\s*$)/i);
    const localidad = localidadMatch?.[1]?.trim() || '';

    this.formulario.patchValue({
      caratula: casoList.caratulaExpediente || '',
      numeroExpediente: casoList.nroExpediente || ''
    });
    if (juzgado) {
      this.formulario.get('juzgado')?.setValue(juzgado);
      this.filtroJuzgado = juzgado;
      if (localidad) this.formulario.get('localidadFecha')?.setValue(localidad);
      this.intentarAutocompletarJuzgado();
    }
    this.mostrarSelectorCaso = false;
    this.casoAutoAplicado = true;
    this.casoSeleccionado = casoList;
    this.casosEncontrados = [];
  }

  cerrarSelectorCaso(): void {
    this.mostrarSelectorCaso = false;
    this.casosEncontrados = [];
  }

  cambiarCaso(): void {
    this.casoAutoAplicado = false;
    this.casoSeleccionado = null;
    this.casosEncontrados = [...this.casosDisponibles];
    this.mostrarSelectorCaso = this.casosEncontrados.length > 0;
  }

  // ──────────────── Juzgado autocomplete ────────────────

  private cargarJuzgados(): void {
    this.http.get('assets/database/direcciones-juzgados.csv', { responseType: 'text' }).subscribe({
      next: csv => {
        const parseResult = Papa.parse(csv, { header: true, skipEmptyLines: true, transformHeader: (h: string) => h.trim() });
        let rows = (parseResult.data as any[])
          .map((row: any) => ({
            juzgado: (row.juzgado || row.JUZGADO || row['Juzgado Interviniente'] || row['Juzgado'] || '').toString().trim(),
            direccion: (row.direccion || row.DIRECCION || row['Direccion'] || row['Dirección'] || '').toString().trim()
          }))
          .filter((r: any) => r.juzgado.length > 0);

        if (!rows.length) {
          const retry = Papa.parse(csv, { header: false, skipEmptyLines: true });
          rows = (retry.data as any[])
            .map((r: any) => ({
              juzgado: Array.isArray(r) ? (r[0] || '').toString().trim() : '',
              direccion: Array.isArray(r) ? (r[1] || '').toString().trim() : ''
            }))
            .filter((r: any) => r.juzgado.length > 0);
        }

        this.juzgadosIntervinientes = rows;
        this.juzgadosFiltrados = [...rows];
        this.intentarAutocompletarJuzgado();
      },
      error: () => {
        this.juzgadosIntervinientes = [];
        this.juzgadosFiltrados = [];
      }
    });
  }

  private extraerLocalidadDeJuzgado(juzgado: string): string {
    // Intenta "de Ciudad"
    const matchDe = juzgado.match(/\bde\s+([A-Z\u00C0-\u00FF][^\n,\-]+?)(?:\s*[-\u2013]|\s*$)/i);
    if (matchDe?.[1]?.trim()) return matchDe[1].trim();
    // Intenta "- Ciudad" o "– Ciudad" al final
    const matchGuion = juzgado.match(/[-\u2013]\s*([A-Z\u00C0-\u00FF][^\n,\-]+?)\s*$/i);
    if (matchGuion?.[1]?.trim()) return matchGuion[1].trim();
    return '';
  }

  private intentarAutocompletarJuzgado(): void {
    const current = (this.formulario.get('juzgado')?.value || '').trim();
    if (!current || !this.juzgadosIntervinientes.length) return;
    const q = current.toLowerCase();
    const match = this.juzgadosIntervinientes.find(r =>
      r.juzgado.toLowerCase().includes(q) || q.includes(r.juzgado.toLowerCase())
    );
    if (match) this.chooseJuzgado(match);
  }

  onFiltroJuzgado(valor: string): void {
    this.filtroJuzgado = valor ?? '';
    this.suppressOpenJuzgado = false;
    const q = this.filtroJuzgado.trim().toLowerCase();
    this.juzgadosFiltrados = q
      ? this.juzgadosIntervinientes.filter(item => item.juzgado.toLowerCase().includes(q))
      : [...this.juzgadosIntervinientes];
    this.openDropdownJuzgado = true;
    this.highlightedIndexJuzgado = -1;
    this.formulario.get('juzgado')?.setValue(valor);
  }

  chooseJuzgado(item: { juzgado: string; direccion?: string }): void {
    if (!item) return;
    const localidad = this.extraerLocalidadDeJuzgado(item.juzgado);

    this.filtroJuzgado = item.juzgado;
    this.formulario.get('juzgado')?.setValue(item.juzgado);
    this.formulario.get('ubicacionJuzgado')?.setValue(item.direccion || '');
    if (localidad) this.formulario.get('localidadFecha')?.setValue(localidad);

    this.openDropdownJuzgado = false;
    this.highlightedIndexJuzgado = -1;
    this.suppressOpenJuzgado = true;
    setTimeout(() => {
      try { this.juzgadoInput?.nativeElement.focus(); } catch {}
    }, 0);
  }

  onBlurJuzgado(): void {
    setTimeout(() => {
      if (this.pointerOverJuzgadoList) return;
      this.openDropdownJuzgado = false;
    }, 150);
  }

  onFocusJuzgado(): void {
    if (!this.suppressOpenJuzgado) {
      this.openDropdownJuzgado = true;
    } else {
      this.suppressOpenJuzgado = false;
    }
  }

  highlightJuzgado(i: number): void {
    this.highlightedIndexJuzgado = i;
  }

  onKeydownJuzgado(event: KeyboardEvent): void {
    if (!this.openDropdownJuzgado && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      this.openDropdownJuzgado = true;
    }
    if (this.openDropdownJuzgado) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.highlightedIndexJuzgado = Math.min(this.highlightedIndexJuzgado + 1, this.juzgadosFiltrados.length - 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.highlightedIndexJuzgado = Math.max(this.highlightedIndexJuzgado - 1, 0);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (this.highlightedIndexJuzgado >= 0 && this.highlightedIndexJuzgado < this.juzgadosFiltrados.length) {
          this.chooseJuzgado(this.juzgadosFiltrados[this.highlightedIndexJuzgado]);
        }
      } else if (event.key === 'Escape') {
        this.openDropdownJuzgado = false;
      }
    }
  }

  // ──────────────────────────────────────────────────────

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
