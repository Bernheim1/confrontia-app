import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CasoService } from '../../../../services/caso/caso.service';
import { CasoListDto } from '../../../../shared/models/caso-list-dto';
import { GridStateService } from '../../../../shared/services/grid-state.service';
import { GetGrillaCasosQuery, GetGrillaCasosQueryFilters } from '../../../../services/caso/queries/get-grilla-casos-query';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { PagedResult } from '../../../../shared/models/paged-result';
import { IPagedRequest } from '../../../../shared/models/paged-request';

@Component({
  selector: 'app-grilla-casos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './grilla-casos.component.html',
  styleUrls: ['./grilla-casos.component.scss']
})
export class GrillaCasosComponent implements OnInit, OnDestroy {
  private static readonly GRID_KEY = 'casos';

  casos: PagedResult<CasoListDto>;

  // Estado de carga
  loading: boolean = false;
  error: string | null = null;

  // Filtros (por ahora en cliente, luego se pueden mover al backend)
  private _pagedRequest: IPagedRequest = { offset: 0, limit: 10};
  public tableFilterForm: FormGroup;
  filtroNumeroExpediente: string = '';
  filtroCaratula: string = '';

  constructor(
    private readonly _formBuilder: FormBuilder,
    private casoService: CasoService,
    private router: Router,
    private gridState: GridStateService
  ) { this.tableFilterForm = this.initTableFilterForm(); }

  ngOnInit(): void {
    const cached = this.gridState.restore<any, PagedResult<CasoListDto>>(GrillaCasosComponent.GRID_KEY);
    if (cached) {
      this.filtroNumeroExpediente = cached.filters.filtroNumeroExpediente;
      this.filtroCaratula = cached.filters.filtroCaratula;
      this.casos = cached.data;
    } else {
      this.cargarCasos();
    }

    
  }

  ngOnDestroy(): void {
    if (this.casos.items.length > 0 && !this.error) {
      this.gridState.save(GrillaCasosComponent.GRID_KEY, {
        filters: {
          filtroNumeroExpediente: this.filtroNumeroExpediente,
          filtroCaratula: this.filtroCaratula,
        },
        data: this.casos,
        pagination: {
          page: this.casos.pageNumber,
          pageSize: this.casos.pageSize,
          totalItems: this.casos.totalCount,
          totalPages: this.casos.totalPages,
        },
        extras: {
          hasPreviousPage: this.casos.hasPreviousPage,
          hasNextPage: this.casos.hasNextPage,
        },
      });
    }
  }

  cargarCasos(): void {
    this.loading = true;
    this.error = null;

    const request: GetGrillaCasosQuery = {
      ...this.tableFilterForm.getRawValue(),
      ...this._pagedRequest
    };
    
    this.casoService.getCasos(request).subscribe({
      next: (result) => {
        this.casos = result;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar los casos:', err);
        this.error = 'Error al cargar los casos';
        this.loading = false;
      }
    });
  }

  aplicarFiltros(): void {
    this._pagedRequest.offset = 0;
    this.cargarCasos();
  }

  limpiarFiltros(): void {
    this.tableFilterForm.reset();
    this.aplicarFiltros();
  }

  verCaso(id: string): void {
    this.router.navigate(['/casos/detalle', id]);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.casos.totalPages) {
      this._pagedRequest.offset = (pagina - 1) * this._pagedRequest.limit;
      this.cargarCasos();
    }
  }

  paginaAnterior(): void {
    if (this.casos.hasPreviousPage) {
      this._pagedRequest.offset = this._pagedRequest.offset - this._pagedRequest.limit;
      this.cargarCasos();
    }
  }

  paginaSiguiente(): void {
    if (this.casos.hasNextPage) {
      this._pagedRequest.offset = this._pagedRequest.offset + this._pagedRequest.limit;
      this.cargarCasos();
    }
  }

  get rangoMostrado(): string {
    if (this.casos.totalCount === 0) return '0 - 0 de 0';
    const inicio = (this.casos.pageNumber - 1) * this.casos.pageSize + 1;
    const fin = Math.min(this.casos.pageNumber * this.casos.pageSize, this.casos.totalCount);
    return `${inicio} - ${fin} de ${this.casos.totalCount}`;
  }

  getTipoDiligenciaCorto(tipoDiligencia: string): string {
    if (!tipoDiligencia) return '-';
    const tipoLower = tipoDiligencia.toLowerCase();
    if (tipoLower.includes('mandamiento')) {
      return 'Mandamiento';
    } else if (tipoLower.includes('cédula') || tipoLower.includes('cedula')) {
      return 'Cédula';
    }
    return tipoDiligencia; // Si no coincide con ninguno, devuelve el original
  }

  getTipoDiligenciaClasses(tipoDiligencia: string): string {
    if (!tipoDiligencia) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    const tipoLower = tipoDiligencia.toLowerCase();
    if (tipoLower.includes('mandamiento')) {
      return 'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-100';
    } else if (tipoLower.includes('cédula') || tipoLower.includes('cedula')) {
      return 'bg-primary-200 text-primary-800 dark:bg-primary-700 dark:text-primary-50';
    }
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
  }

  private initTableFilterForm(): FormGroup {
    const formGroup: FormGroup = this._formBuilder.nonNullable.group({
      nroExpediente: [
        undefined, {
          validators: [],
          updateOn: 'blur'
        }
      ],
      caratula: [
        undefined, {
          validators: [],
          updateOn: 'blur'
        }
      ],
      fechaIngresoDesde: [
        undefined, {
          validators: [],
          updateOn: 'blur'
        }
      ],
      fechaIngresoHasta: [
        undefined, {
          validators: [],
          updateOn: 'blur'
        }
      ]
    });

    return formGroup;
  }
}
