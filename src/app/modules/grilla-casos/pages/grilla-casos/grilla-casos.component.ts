import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CasoService } from '../../../../../services/caso/caso.service';
import { CasoListDto } from '../../../../../shared/models/caso-list-dto';

@Component({
  selector: 'app-grilla-casos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grilla-casos.component.html',
  styleUrls: ['./grilla-casos.component.scss']
})
export class GrillaCasosComponent implements OnInit {
  casos: CasoListDto[] = [];
  
  // Configuración de paginado (ahora del servidor)
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;
  totalItems: number = 0;
  hasPreviousPage: boolean = false;
  hasNextPage: boolean = false;

  // Estado de carga
  loading: boolean = false;
  error: string | null = null;

  // Filtros (por ahora en cliente, luego se pueden mover al backend)
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
    
    // Calcular offset basado en la página actual
    const offset = (this.paginaActual - 1) * this.itemsPorPagina;
    
    this.casoService.getCasos(offset, this.itemsPorPagina).subscribe({
      next: (result) => {
        this.casos = result.items;
        this.totalItems = result.totalCount;
        this.totalPaginas = result.totalPages;
        this.hasPreviousPage = result.hasPreviousPage;
        this.hasNextPage = result.hasNextPage;
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
    // Por ahora, los filtros se aplican en el cliente
    // TODO: Implementar filtros en el backend cuando sea necesario
    this.paginaActual = 1;
    this.cargarCasos();
  }

  limpiarFiltros(): void {
    this.filtroNumeroExpediente = '';
    this.filtroCaratula = '';
    this.aplicarFiltros();
  }

  verCaso(id: string): void {
    this.router.navigate(['/casos/detalle', id]);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarCasos();
    }
  }

  paginaAnterior(): void {
    if (this.hasPreviousPage) {
      this.paginaActual--;
      this.cargarCasos();
    }
  }

  paginaSiguiente(): void {
    if (this.hasNextPage) {
      this.paginaActual++;
      this.cargarCasos();
    }
  }

  get rangoMostrado(): string {
    if (this.totalItems === 0) return '0 - 0 de 0';
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
    return `${inicio} - ${fin} de ${this.totalItems}`;
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
}
