import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CasoService } from '../../../../services/caso/caso.service';
import { MevNotificacionBusquedaDto, SincronizarMevMasivoResponse } from '../../../../services/caso/contracts/sincronizar-mev-response';

@Component({
  selector: 'app-grilla-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grilla-notificaciones.component.html',
  styleUrls: ['./grilla-notificaciones.component.scss']
})
export class GrillaNotificacionesComponent implements OnInit {
  notificaciones: MevNotificacionBusquedaDto[] = [];

  // Filtros de fecha
  fechaDesde: string = '';
  fechaHasta: string = '';

  // Estado
  loading: boolean = false;
  error: string | null = null;
  buscado: boolean = false;

  // Resumen
  resumen: { total: number; asociadas: number; nuevas: number } | null = null;

  constructor(
    private casoService: CasoService,
    private router: Router
  ) {
    // Default: hoy
    const hoy = new Date().toISOString().split('T')[0];
    this.fechaDesde = hoy;
    this.fechaHasta = hoy;
  }

  ngOnInit(): void {
    this.buscarNotificaciones();
  }

  buscarNotificaciones(): void {
    this.loading = true;
    this.error = null;
    this.buscado = false;
    this.resumen = null;

    this.casoService.sincronizarMevMasivo(this.fechaDesde, this.fechaHasta).subscribe({
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
