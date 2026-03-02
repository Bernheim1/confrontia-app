import { Component, OnInit } from '@angular/core';
import { EstudioDto } from '../../../../../services/estudio/contracts/estudio-dto';
import { EstudioService } from '../../../../../services/estudio/estudio.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-estudio-table-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudio-table-page.component.html',
  styleUrl: './estudio-table-page.component.scss'
})
export class EstudioTablePageComponent implements OnInit {
    estudios: EstudioDto[] = [];
    estudiosFiltrados: EstudioDto[] = [];
    
    // Configuración de paginado (lado cliente)
    paginaActual: number = 1;
    itemsPorPagina: number = 10;
    totalPaginas: number = 0;
    totalItems: number = 0;
  
    // Estado de carga
    loading: boolean = false;
    error: string | null = null;
  
    // Filtros
    filtroNombre: string = '';
  
    constructor(
      private estudioService: EstudioService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.cargarEstudios();
    }
  
    cargarEstudios(): void {
      this.loading = true;
      this.error = null;
      
      this.estudioService.getDropdown().subscribe({
        next: (result) => {
          if (result.length === 0) {
            this.estudios = [];
            this.aplicarFiltros();
            this.loading = false;
            return;
          }

          // Cargar los datos completos de cada estudio
          const observables = result.map(item => 
            this.estudioService.getById(item.id)
          );
          
          forkJoin(observables).subscribe({
            next: (estudios) => {
              this.estudios = estudios;
              this.aplicarFiltros();
              this.loading = false;
            },
            error: (err) => {
              console.error('Error al cargar los detalles de estudios:', err);
              this.error = 'Error al cargar los estudios';
              this.loading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error al cargar los estudios:', err);
          this.error = 'Error al cargar los estudios';
          this.loading = false;
        }
      });
    }

    aplicarFiltros(): void {
      this.estudiosFiltrados = this.estudios;

      if (this.filtroNombre) {
        this.estudiosFiltrados = this.estudiosFiltrados.filter(estudio =>
          estudio.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase())
        );
      }

      this.totalItems = this.estudiosFiltrados.length;
      this.totalPaginas = Math.ceil(this.totalItems / this.itemsPorPagina);
      this.paginaActual = 1;
    }

    get estudiosPaginados(): EstudioDto[] {
      const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
      const fin = inicio + this.itemsPorPagina;
      return this.estudiosFiltrados.slice(inicio, fin);
    }
  
    limpiarFiltros(): void {
      this.filtroNombre = '';
      this.paginaActual = 1;
      this.aplicarFiltros();
    }

    buscar(): void {
      this.aplicarFiltros();
    }
  
    irAPagina(pagina: number): void {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina;
      }
    }

    updateEstudio(id: string): void {
      this.router.navigateByUrl(`estudios/update/${id}`);
    }

    crearEstudio(): void {
      this.router.navigateByUrl('estudios/create');
    }
  
    paginaAnterior(): void {
      if (this.hasPreviousPage) {
        this.paginaActual--;
      }
    }
  
    paginaSiguiente(): void {
      if (this.hasNextPage) {
        this.paginaActual++;
      }
    }

    get hasPreviousPage(): boolean {
      return this.paginaActual > 1;
    }

    get hasNextPage(): boolean {
      return this.paginaActual < this.totalPaginas;
    }

    get rangoMostrado(): string {
      if (this.totalItems === 0) return '0 - 0 de 0';
      const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
      const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
      return `${inicio} - ${fin} de ${this.totalItems}`;
    }
  }
