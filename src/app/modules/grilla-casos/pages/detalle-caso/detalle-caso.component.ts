import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CasoService } from '../../../../services/caso/caso.service';
import { CasoDto } from '../../../../../shared/models/caso-dto';
import { TipoSalidaEnum } from '../../../../../shared/enums/tipo-salida-enum';
import { Salida } from '../../../../../shared/models/salida';
import { MostrarSalidaComponent } from '../../../../../components/mostrar-salida/mostrar-salida.component';

@Component({
  selector: 'app-detalle-caso',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, MostrarSalidaComponent],
  templateUrl: './detalle-caso.component.html',
  styleUrls: ['./detalle-caso.component.scss']
})
export class DetalleCasoComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  caso?: CasoDto;
  casoId!: string;
  loading: boolean = false;
  error: string | null = null;
  salida?: Salida;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del caso desde la ruta
    this.route.params.subscribe(params => {
      this.casoId = params['id'];
      this.cargarCaso();
    });
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
