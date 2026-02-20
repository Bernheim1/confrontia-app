import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Salida } from '../../../../../shared/models/salida';
import { CasoService } from '../../../../../services/caso/caso.service';
import { TipoSalidaEnum } from '../../../../../shared/enums/tipo-salida-enum';

@Component({
  selector: 'app-grilla-casos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grilla-casos.component.html',
  styleUrls: ['./grilla-casos.component.scss']
})
export class GrillaCasosComponent implements OnInit {
  casos: Salida[] = [];
  casosFiltrados: Salida[] = [];
  casosPaginados: Salida[] = [];
  
  // Configuración de paginado
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;
  totalItems: number = 0;

  // Estado de carga
  loading: boolean = false;
  error: string | null = null;

  // Filtros
  filtroNumeroExpediente: string = '';
  filtroCaratula: string = '';

  constructor(
    private casoService: CasoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCasos();
  }

  cargarCasos(): void {
    this.loading = true;
    this.error = null;
    
    // Por ahora, datos de ejemplo hasta que tengamos el backend
    // Cuando tengas el endpoint del backend, descomentar esto:
    // this.casoService.getCasos().subscribe({
    //   next: (casos) => {
    //     this.casos = casos;
    //     this.casosFiltrados = [...this.casos];
    //     this.totalItems = this.casosFiltrados.length;
    //     this.calcularPaginacion();
    //     this.actualizarPaginaActual();
    //     this.loading = false;
    //   },
    //   error: (err) => {
    //     this.error = 'Error al cargar los casos';
    //     this.loading = false;
    //   }
    // });
    
    setTimeout(() => {
      // Datos de ejemplo
      this.casos = this.generarCasosEjemplo();
      this.casosFiltrados = [...this.casos];
      this.totalItems = this.casosFiltrados.length;
      this.calcularPaginacion();
      this.actualizarPaginaActual();
      this.loading = false;
    }, 500);
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.totalItems / this.itemsPorPagina);
  }

  actualizarPaginaActual(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.casosPaginados = this.casosFiltrados.slice(inicio, fin);
  }

  aplicarFiltros(): void {
    this.casosFiltrados = this.casos.filter(caso => {
      const cumpleNumeroExpediente = !this.filtroNumeroExpediente || 
        caso.numeroExpediente?.toLowerCase().includes(this.filtroNumeroExpediente.toLowerCase());
      
      const cumpleCaratula = !this.filtroCaratula || 
        caso.caratulaExpediente?.toLowerCase().includes(this.filtroCaratula.toLowerCase());
      
      return cumpleNumeroExpediente && cumpleCaratula;
    });
    
    this.totalItems = this.casosFiltrados.length;
    this.paginaActual = 1; // Resetear a la primera página
    this.calcularPaginacion();
    this.actualizarPaginaActual();
  }

  limpiarFiltros(): void {
    this.filtroNumeroExpediente = '';
    this.filtroCaratula = '';
    this.aplicarFiltros();
  }

  verCaso(id: number): void {
    this.router.navigate(['/casos/detalle', id]);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginaActual();
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
      this.actualizarPaginaActual();
    }
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
      this.actualizarPaginaActual();
    }
  }

  get rangoMostrado(): string {
    if (this.totalItems === 0) return '0 - 0 de 0';
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
    return `${inicio} - ${fin} de ${this.totalItems}`;
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

  // Método temporal para generar casos de ejemplo
  private generarCasosEjemplo(): Salida[] {
    const ejemplos: Salida[] = [];
    const tiposExpediente = ['Embargo', 'Desalojo', 'Notificación', 'Ejecución', 'Medida Cautelar'];
    const juzgados = ['Juzgado Civil N° 1', 'Juzgado Civil N° 2', 'Juzgado Comercial N° 5', 'Juzgado Laboral N° 4'];
    const localidades = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'];
    
    for (let i = 1; i <= 50; i++) {
      const anio = 2024 + (i % 3);
      const salida = new Salida({
        id: i,
        numeroExpediente: `EXP-${anio}-${String(i).padStart(5, '0')}`,
        tipoSalida: i % 2 === 0 ? TipoSalidaEnum.Cedula : TipoSalidaEnum.Mandamiento,
        organo: `Organo ${i}`,
        juzgadoInterviniente: juzgados[i % juzgados.length],
        juzgadoTribunal: 'Tribunal',
        tipoDiligencia: tiposExpediente[i % tiposExpediente.length],
        caratulaExpediente: `${['García', 'Rodríguez', 'Fernández', 'Martínez', 'López'][i % 5]} c/ ${['Pérez', 'González', 'Sánchez', 'Romero', 'Torres'][i % 5]} s/ ${tiposExpediente[i % tiposExpediente.length]}`,
        domicilio: `${['Av. Rivadavia', 'Calle Corrientes', 'Av. Belgrano', 'Calle Florida', 'Av. 9 de Julio'][i % 5]} ${1000 + i * 10}`,
        localidad: localidades[i % localidades.length],
        urgente: i % 4 === 0,
        textoRequerido: `Contenido del caso ${i}`
      });
      ejemplos.push(salida);
    }
    
    return ejemplos;
  }
}
