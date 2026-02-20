import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Salida } from '../../../../../shared/models/salida';
import { CasoService } from '../../../../../services/caso/caso.service';
import { TipoSalidaEnum } from '../../../../../shared/enums/tipo-salida-enum';

@Component({
  selector: 'app-detalle-caso',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './detalle-caso.component.html',
  styleUrls: ['./detalle-caso.component.scss']
})
export class DetalleCasoComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  caso?: Salida;
  casoId!: number;
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casoService: CasoService
  ) {}

  ngOnInit(): void {
    // Obtener el ID del caso desde la ruta
    this.route.params.subscribe(params => {
      this.casoId = +params['id'];
      this.cargarCaso();
    });
  }

  cargarCaso(): void {
    this.loading = true;
    this.error = null;

    // Por ahora, datos de ejemplo. Cuando tengas el backend, descomentar esto:
    // this.casoService.getCasoById(this.casoId).subscribe({
    //   next: (caso) => {
    //     this.caso = caso;
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Error al cargar el caso';
    //     this.loading = false;
    //   }
    // });

    // Datos de ejemplo temporal
    setTimeout(() => {
      this.caso = this.generarCasoEjemplo(this.casoId);
      this.loading = false;
    }, 500);
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

  // Método temporal para generar caso de ejemplo
  private generarCasoEjemplo(id: number): Salida {
    const tiposExpediente = ['Embargo', 'Desalojo', 'Notificación', 'Ejecución', 'Medida Cautelar'];
    const juzgados = ['Juzgado Civil N° 1', 'Juzgado Civil N° 2', 'Juzgado Comercial N° 5', 'Juzgado Laboral N° 4'];
    const localidades = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'];
    const nombres = ['García', 'Rodríguez', 'Fernández', 'Martínez', 'López'];
    const apellidos = ['Pérez', 'González', 'Sánchez', 'Romero', 'Torres'];
    
    const anio = 2024 + (id % 3);
    
    return new Salida({
      id: id,
      numeroExpediente: `EXP-${anio}-${String(id).padStart(5, '0')}`,
      tipoSalida: id % 2 === 0 ? TipoSalidaEnum.Cedula : TipoSalidaEnum.Mandamiento,
      organo: `Organo Judicial ${id}`,
      juzgadoInterviniente: juzgados[id % juzgados.length],
      juzgadoTribunal: 'Poder Judicial de la Nación',
      direccionJuzgado: 'Av. Libertador 1234, CABA',
      tipoDiligencia: tiposExpediente[id % tiposExpediente.length],
      caratulaExpediente: `${nombres[id % 5]} c/ ${apellidos[id % 5]} s/ ${tiposExpediente[id % tiposExpediente.length]}`,
      domicilio: `${['Av. Rivadavia', 'Calle Corrientes', 'Av. Belgrano', 'Calle Florida', 'Av. 9 de Julio'][id % 5]} ${1000 + id * 10}`,
      localidad: localidades[id % localidades.length],
      nro: 1000 + id * 10,
      piso: id % 10,
      depto: String.fromCharCode(65 + (id % 8)),
      copiasTraslado: id % 2 === 0,
      urgente: id % 4 === 0,
      habilitacionDiaHora: id % 3 === 0,
      bajoResponsabilidad: id % 5 === 0,
      denunciado: id % 2 === 0,
      constituido: id % 3 === 0,
      allanamiento: id % 6 === 0,
      auxilioFuerzaPublica: id % 7 === 0,
      conCerrajero: id % 8 === 0,
      textoRequerido: `Se solicita la ${tiposExpediente[id % tiposExpediente.length]} en el domicilio indicado. El presente caso requiere de especial atención dado que involucra aspectos críticos del proceso judicial.`,
      montoCapitalTexto: id % 2 === 0 ? 'Cincuenta mil pesos' : '',
      montoCapitalNumerico: id % 2 === 0 ? '50000' : null,
      textoNotificacion: 'Se notifica al demandado para que en el plazo de 5 días se presente a estar a derecho.',
      textoDespacho: 'Por presentado, por parte y domicilio constituido. Téngase presente la documentación acompañada.'
    });
  }
}
