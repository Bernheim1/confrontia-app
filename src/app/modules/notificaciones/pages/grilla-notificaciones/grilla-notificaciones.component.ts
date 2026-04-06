import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CasoService } from '../../../../services/caso/caso.service';
import { MevNotificacionBusquedaDto, SincronizarMevMasivoResponse } from '../../../../services/caso/contracts/sincronizar-mev-response';
import { MevService } from '../../../../services/mev/mev.service';
import { MevFiltrosResponse, MevFiltroOption } from '../../../../services/mev/contracts/mev-filtros-response';
import { MevBusquedaCommand } from '../../../../services/mev/commands/mev-busqueda-command';
import { MultiSelectComponent } from '../../../../shared/components/multi-select/multi-select.component';
import { DatepickerComponent } from '../../../../shared/components/datepicker/datepicker.component';
import { GridStateService } from '../../../../shared/services/grid-state.service';

@Component({
  selector: 'app-grilla-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectComponent, DatepickerComponent],
  templateUrl: './grilla-notificaciones.component.html',
  styleUrls: ['./grilla-notificaciones.component.scss']
})
export class GrillaNotificacionesComponent implements OnInit, OnDestroy {
  notificaciones: MevNotificacionBusquedaDto[] = [];

  // Filtros de fecha
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Filtro rápido
  soloCasosPendientesHoy: boolean = false;

  // Filtros avanzados
  tramiteIds: number[] = [];
  departamento: number = -1;
  organismo: string = '';
  textoEnCaratula: string = '';
  textoEnDocumento: string = '';
  codigoDeBarras: string = '';
  estadoProceso: number = -1;
  ordenVisualizacion: string = 'FECHANOTIFICACION';

  // Opciones de filtros (desde backend)
  filtros: MevFiltrosResponse | null = null;

  // UI
  filtrosExpandidos: boolean = false;

  // Estado
  loading: boolean = false;
  error: string | null = null;
  buscado: boolean = false;

  // Resumen
  resumen: { total: number; asociadas: number; nuevas: number } | null = null;

  private busquedaSub: Subscription | null = null;
  private filtrosSub: Subscription | null = null;

  private static readonly GRID_KEY = 'notificaciones';

  constructor(
    private casoService: CasoService,
    private mevService: MevService,
    private router: Router,
    private gridState: GridStateService
  ) {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarFiltros();

    const cached = this.gridState.restore<any, MevNotificacionBusquedaDto[]>(GrillaNotificacionesComponent.GRID_KEY);
    if (cached) {
      this.fechaDesde = cached.filters.fechaDesde;
      this.fechaHasta = cached.filters.fechaHasta;
      this.soloCasosPendientesHoy = cached.filters.soloCasosPendientesHoy ?? false;
      this.tramiteIds = cached.filters.tramiteIds;
      this.departamento = cached.filters.departamento;
      this.organismo = cached.filters.organismo;
      this.textoEnCaratula = cached.filters.textoEnCaratula;
      this.textoEnDocumento = cached.filters.textoEnDocumento;
      this.codigoDeBarras = cached.filters.codigoDeBarras;
      this.estadoProceso = cached.filters.estadoProceso;
      this.ordenVisualizacion = cached.filters.ordenVisualizacion;
      this.filtrosExpandidos = cached.filters.filtrosExpandidos;
      this.notificaciones = cached.data;
      this.resumen = cached.extras?.['resumen'] ?? null;
      this.buscado = true;
    } else {
      this.buscarNotificaciones();
    }
  }

  ngOnDestroy(): void {
    this.busquedaSub?.unsubscribe();
    this.filtrosSub?.unsubscribe();

    if (this.buscado && !this.error) {
      this.gridState.save(GrillaNotificacionesComponent.GRID_KEY, {
        filters: {
          fechaDesde: this.fechaDesde,
          fechaHasta: this.fechaHasta,
          soloCasosPendientesHoy: this.soloCasosPendientesHoy,
          tramiteIds: this.tramiteIds,
          departamento: this.departamento,
          organismo: this.organismo,
          textoEnCaratula: this.textoEnCaratula,
          textoEnDocumento: this.textoEnDocumento,
          codigoDeBarras: this.codigoDeBarras,
          estadoProceso: this.estadoProceso,
          ordenVisualizacion: this.ordenVisualizacion,
          filtrosExpandidos: this.filtrosExpandidos,
        },
        data: this.notificaciones,
        extras: { resumen: this.resumen },
      });
    }
  }

  cargarFiltros(): void {
    this.filtrosSub = this.mevService.getFiltros().subscribe({
      next: (filtros: MevFiltrosResponse) => {
        this.filtros = filtros;
      },
      error: (err) => {
        console.error('Error al cargar filtros MEV:', err);
      }
    });
  }

  buildCommand(): MevBusquedaCommand {
    const cmd: MevBusquedaCommand = {};

    if (this.soloCasosPendientesHoy) {
      cmd.soloCasosPendientesHoy = true;
      return cmd;
    }

    if (this.fechaDesde) cmd.fechaDesde = this.fechaDesde + 'T00:00:00';
    if (this.fechaHasta) cmd.fechaHasta = this.fechaHasta + 'T00:00:00';
    if (this.tramiteIds.length > 0) cmd.tramiteIds = this.tramiteIds;
    if (this.departamento !== -1) {
      const dep = this.filtros?.departamentos.find(d => d.value === this.departamento);
      if (dep) cmd.departamento = dep.text;
    }
    if (this.organismo.trim().length >= 5) cmd.organismo = this.organismo.trim();
    if (this.textoEnCaratula.trim()) cmd.textoEnCaratula = this.textoEnCaratula.trim();
    if (this.textoEnDocumento.trim()) cmd.textoEnDocumento = this.textoEnDocumento.trim();
    if (this.codigoDeBarras.trim()) cmd.codigoDeBarras = this.codigoDeBarras.trim();
    if (this.estadoProceso !== -1) {
      const est = this.filtros?.estadosProceso.find(e => e.value === this.estadoProceso);
      if (est) cmd.estadoProceso = est.text.replace(/ /g, '');
    }
    if (this.ordenVisualizacion) cmd.ordenVisualizacion = this.ordenVisualizacion;

    return cmd;
  }

  buscarNotificaciones(): void {
    // Cancelar la petición anterior si sigue en curso
    this.busquedaSub?.unsubscribe();

    this.loading = true;
    this.error = null;
    this.buscado = false;
    this.resumen = null;

    const command = this.buildCommand();

    this.busquedaSub = this.casoService.sincronizarMevMasivo(command).subscribe({
      next: (result: SincronizarMevMasivoResponse) => {
        this.loading = false;
        this.buscado = true;

        if (!result.exitoso) {
          this.error = result.error || 'Error al buscar notificaciones en MEV';
          this.notificaciones = [];
          return;
        }

        this.notificaciones = result.notificaciones;
        this.resumen = {
          total: result.totalNotificaciones,
          asociadas: result.notificacionesAsociadas,
          nuevas: result.notificacionesNuevas
        };
      },
      error: (err) => {
        console.error('Error al buscar notificaciones MEV:', err);
        this.error = 'Error al comunicarse con el servidor';
        this.loading = false;
        this.buscado = true;
      }
    });
  }

  toggleFiltros(): void {
    this.filtrosExpandidos = !this.filtrosExpandidos;
  }

  limpiarFiltros(): void {
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = primerDiaMes.toISOString().split('T')[0];
    this.soloCasosPendientesHoy = false;
    this.tramiteIds = [];
    this.departamento = -1;
    this.organismo = '';
    this.textoEnCaratula = '';
    this.textoEnDocumento = '';
    this.codigoDeBarras = '';
    this.estadoProceso = -1;
    this.ordenVisualizacion = 'FECHANOTIFICACION';
  }

  get filtrosActivosCount(): number {
    let count = 0;
    if (this.tramiteIds.length > 0) count++;
    if (this.departamento !== -1) count++;
    if (this.organismo.trim().length >= 5) count++;
    if (this.textoEnCaratula.trim()) count++;
    if (this.textoEnDocumento.trim()) count++;
    if (this.codigoDeBarras.trim()) count++;
    if (this.estadoProceso !== -1) count++;
    if (this.ordenVisualizacion !== 'FECHANOTIFICACION') count++;
    return count;
  }

  verCaso(casoId: string): void {
    this.router.navigate(['/casos/detalle', casoId]);
  }

  crearCaso(): void {
    this.router.navigate(['/despacho']);
  }

  getEstadoClasses(notif: MevNotificacionBusquedaDto): string {
    if (notif.casoId && !notif.yaExistente) {
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    }
    if (notif.casoId && notif.yaExistente) {
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
  }

  getEstadoTexto(notif: MevNotificacionBusquedaDto): string {
    if (notif.casoId && !notif.yaExistente) return 'Nueva';
    if (notif.casoId && notif.yaExistente) return 'Existente';
    return 'Sin caso';
  }
}
