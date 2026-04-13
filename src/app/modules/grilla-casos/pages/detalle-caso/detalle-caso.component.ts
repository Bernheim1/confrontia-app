import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CasoService } from '../../../../services/caso/caso.service';
import { ShowEscritosComponent } from '../../components/show-escritos/show-escritos.component';
import { MostrarSalidaComponent } from '../../../despacho/components/mostrar-salida/mostrar-salida.component';
import { CasoDto } from '../../../../shared/models/caso-dto';
import { Salida } from '../../../../shared/models/salida';
import { TipoSalidaEnum } from '../../../../shared/enums/tipo-salida-enum';
import { EstudioService } from '../../../../services/estudio/estudio.service';
import { FirmaAbogadoDto } from '../../../../services/estudio/contracts/firma-abogado-dto';
import { CasoNotificacionDto, CasoMevMetadataDto } from '../../../../shared/models/notificacion-caso-dto';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';

@Component({
  selector: 'app-detalle-caso',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MostrarSalidaComponent, ShowEscritosComponent],
  templateUrl: './detalle-caso.component.html',
  styleUrl: './detalle-caso.component.scss'
})
export class DetalleCasoComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  caso?: CasoDto;
  casoId!: string;
  loading: boolean = false;
  error: string | null = null;
  salida?: Salida;
  public firma: FirmaAbogadoDto | undefined;

  // MEV sync
  sincronizando: boolean = false;
  syncMessage: string | null = null;
  syncError: boolean = false;

  // Notificaciones
  filtroSoloNoLeidas: boolean = false;
  notificacionSeleccionada: CasoNotificacionDto | null = null;
  marcandoLeida: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService,
    private notificacionService: NotificacionService,
    private _estudioService: EstudioService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del caso desde la ruta
    this.route.params.subscribe(params => {
      this.casoId = params['id'];
      this.cargarCaso();
    });
  }

  private getFirma(estudioId: string): void {
    this._estudioService.getFirmaAbogado(estudioId).subscribe({
      next: (response) => {
        if (response) {
          this.firma = response;
        }
      }});
  }

  cargarCaso(): void {
    this.loading = true;
    this.error = null;

    this.casoService.getCasoById(this.casoId).subscribe({
      next: (caso) => {
        console.log('Caso recibido:', caso);
        console.log('TipoSalida:', caso.tipoSalida, 'Tipo:', typeof caso.tipoSalida);
        this.caso = caso;
        // Convertir CasoDto a Salida para el componente mostrar-salida
        this.salida = this.convertirCasoASalida(caso);

        if(caso.estudioId) {
          this.getFirma(caso.estudioId);
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el caso:', err);
        this.error = 'Error al cargar el caso';
        this.loading = false;
      }
    });
  }

  convertirCasoASalida(caso: CasoDto): Salida {
    return {
      tipoSalida: caso.tipoSalida,
      organo: caso.organo,
      juzgadoInterviniente: caso.juzgadoInterviniente,
      juzgadoTribunal: caso.juzgadoTribunal,
      direccionJuzgado: caso.direccionJuzgado,
      localidad: caso.localidad,
      domicilio: caso.domicilio,
      nro: caso.nro,
      piso: caso.piso,
      depto: caso.depto,
      unidad: caso.unidad,
      tipoDiligencia: caso.tipoDiligencia,
      caratulaExpediente: caso.caratulaExpediente,
      copiasTraslado: caso.copiasTraslado,
      urgente: caso.urgente,
      habilitacionDiaHora: caso.habilitacionDiaHora,
      bajoResponsabilidad: caso.bajoResponsabilidad,
      denunciado: caso.denunciado,
      constituido: caso.constituido,
      allanamiento: caso.allanamiento,
      allanamientoDomicilioSinOcupantes: caso.allanamientoDomicilioSinOcupantes,
      auxilioFuerzaPublica: caso.auxilioFuerzaPublica,
      conCerrajero: caso.conCerrajero,
      denunciaOtroDomicilio: caso.denunciaOtroDomicilio,
      denunciaBienes: caso.denunciaBienes,
      otrosFacultades: caso.otrosFacultades,
      textoRequerido: caso.textoRequerido,
      montoCapitalTexto: caso.montoCapitalTexto,
      montoCapitalNumerico: caso.montoCapitalNumero?.toString() || null,
      montoInteresesTexto: '', // No disponible en CasoDto
      montoInteresesNumerico: null, // No disponible en CasoDto
      textoNotificacion: '',
      textoDespacho: ''
    } as Salida;
  }

  volver(): void {
    this.router.navigate(['/casos']);
  }

  getNotificacionesNoLeidas(): number {
    return this.caso?.notificaciones?.filter(n => !n.leida).length ?? 0;
  }

  get notificacionesFiltradas(): CasoNotificacionDto[] {
    if (!this.caso?.notificaciones) return [];
    if (this.filtroSoloNoLeidas) return this.caso.notificaciones.filter(n => !n.leida);
    return this.caso.notificaciones;
  }

  abrirModalNotificacion(notif: CasoNotificacionDto): void {
    this.notificacionSeleccionada = notif;
  }

  cerrarModalNotificacion(): void {
    this.notificacionSeleccionada = null;
  }

  marcarComoLeida(notif: CasoNotificacionDto): void {
    this.marcandoLeida = true;
    this.notificacionService.marcarComoLeida(notif.idNotificacion).subscribe({
      next: () => {
        notif.leida = true;
        this.marcandoLeida = false;
        if (this.caso) {
          this.caso.tieneNotificacionesNoLeidas = this.caso.notificaciones?.some(n => !n.leida) ?? false;
        }
      },
      error: () => {
        this.marcandoLeida = false;
      }
    });
  }

  sincronizarMev(): void {
    this.sincronizando = true;
    this.syncMessage = null;
    this.syncError = false;

    this.casoService.sincronizarMevCaso(this.casoId).subscribe({
      next: (response) => {
        this.sincronizando = false;
        if (response.sincronizado) {
          const msg = response.notificacionesNuevas > 0
            ? `Se encontraron ${response.notificacionesNuevas} notificación(es) nueva(s)`
            : 'Sincronizado. No hay notificaciones nuevas';
          this.syncMessage = msg;
          this.syncError = false;
          // Recargar solo las notificaciones sin afectar scroll
          this.recargarNotificaciones();
        } else {
          this.syncMessage = response.encontradoEnMev
            ? 'No se pudo sincronizar completamente'
            : 'Caso no encontrado en MEV';
          this.syncError = !response.encontradoEnMev;
        }
        if (response.error) {
          this.syncMessage = response.error;
          this.syncError = true;
        }
      },
      error: (err) => {
        console.error('Error al sincronizar con MEV:', err);
        this.sincronizando = false;
        this.syncMessage = 'Error al sincronizar con MEV';
        this.syncError = true;
      }
    });
  }

  private recargarNotificaciones(): void {
    this.casoService.getCasoById(this.casoId).subscribe({
      next: (caso) => {
        if (this.caso) {
          this.caso.notificaciones = caso.notificaciones;
          this.caso.mevMetadata = caso.mevMetadata;
          this.caso.tieneNotificacionesNoLeidas = caso.tieneNotificacionesNoLeidas;
        }
      }
    });
  }

  getTipoSalidaTexto(tipo: TipoSalidaEnum): string {
    switch (tipo) {
      case TipoSalidaEnum.Cedula:
        return 'Cédula';
      case TipoSalidaEnum.Mandamiento:
        return 'Mandamiento';
      default:
        return 'Sin Asignar';
    }
  }
}
