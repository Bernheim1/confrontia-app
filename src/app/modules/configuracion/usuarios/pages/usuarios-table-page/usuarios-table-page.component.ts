import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../../../../services/user/contracts/user-dto';
import { UserService } from '../../../../../services/user/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { perfilesList } from '../../../../../services/user/contracts/perfiles-enum';
import { GetFromCollectionPipe } from '../../../../../../shared/pipes/get-from-collection.pipe';

@Component({
  selector: 'app-usuarios-table-page',
  standalone: true,
  imports: [CommonModule, FormsModule, GetFromCollectionPipe],
  templateUrl: './usuarios-table-page.component.html',
  styleUrl: './usuarios-table-page.component.scss'
})
export class UsuariosTablePageComponent implements OnInit {
    usuarios: UserDto[] = [];
    
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
    filtroUsername: string = '';

    perfilesCollection = perfilesList;
  
    constructor(
      private userService: UserService,
      private router: Router
    ) {}
  
    ngOnInit(): void {
      this.cargarUsuarios();
    }
  
    cargarUsuarios(): void {
      this.loading = true;
      this.error = null;
      
      // Calcular offset basado en la página actual
      const offset = (this.paginaActual - 1) * this.itemsPorPagina;
      
      this.userService.getUsuarios(offset, this.itemsPorPagina, this.filtroUsername).subscribe({
        next: (result) => {
          this.usuarios = result.items;
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
  
    limpiarFiltros(): void {
      this.filtroUsername = '';
      this.paginaActual = 1;
      this.cargarUsuarios();
    }
  
    verCaso(id: string): void {
      this.router.navigate(['/casos/detalle', id]);
    }
  
    irAPagina(pagina: number): void {
      if (pagina >= 1 && pagina <= this.totalPaginas) {
        this.paginaActual = pagina;
        this.cargarUsuarios();
      }
    }

    updateUsuario(id: string): void {
      this.router.navigateByUrl(`usuarios/update/${id}`);
    }

    crearUsuario(): void {
      this.router.navigateByUrl('usuarios/create');
    }
  
    paginaAnterior(): void {
      if (this.hasPreviousPage) {
        this.paginaActual--;
        this.cargarUsuarios();
      }
    }
  
    paginaSiguiente(): void {
      if (this.hasNextPage) {
        this.paginaActual++;
        this.cargarUsuarios();
      }
    }

    get rangoMostrado(): string {
      if (this.totalItems === 0) return '0 - 0 de 0';
      const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
      const fin = Math.min(this.paginaActual * this.itemsPorPagina, this.totalItems);
      return `${inicio} - ${fin} de ${this.totalItems}`;
    }
  }
