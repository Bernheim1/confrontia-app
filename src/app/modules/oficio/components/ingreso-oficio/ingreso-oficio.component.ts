import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { OFICIO_CATEGORIES, getOficioTypeByCode, getOficioTypesByCategory, OficioTypeConfig } from '../../models/oficio-catalog';

@Component({
  selector: 'app-ingreso-oficio',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ToastrModule],
  templateUrl: './ingreso-oficio.component.html',
  styleUrl: '../../../despacho/components/ingreso-despacho/ingreso-despacho.component.scss'
})
export class IngresoOficioComponent {
  @Output() oficioConfigurado = new EventEmitter<{ proveidos: Array<{ proveido: string }>; tipoOficio: OficioTypeConfig }>();

  categorias = OFICIO_CATEGORIES;
  tiposDisponibles: OficioTypeConfig[] = [];
  categoriaSeleccionada = '';
  tipoOficioCodigo = '';
  items: Array<{ proveido: string }> = [{ proveido: '' }];
  masivo = false;
  errorIndex: number | null = null;
  dropdownOpen = false;
  submenuOpen: string | null = null;

  constructor(private toastr: ToastrService) {}

  onSubmit() {
    const emptyIndex = this.items.findIndex(item => !item.proveido || item.proveido.trim().length === 0);

    if (emptyIndex !== -1) {
      this.errorIndex = emptyIndex;
      this.toastr.error('Debe ingresar el proveído antes de continuar', 'Error');

      setTimeout(() => {
        const element = document.getElementById(`oficio-${emptyIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      setTimeout(() => {
        this.errorIndex = null;
      }, 3000);

      return;
    }

    this.errorIndex = null;
    const tipoOficio = getOficioTypeByCode(this.tipoOficioCodigo);
    if (!tipoOficio) {
      this.toastr.error('Seleccione una categoría y un tipo de oficio.', 'Error');
      return;
    }

    this.oficioConfigurado.emit({ proveidos: this.items, tipoOficio });
  }

  onCategoriaSeleccionada() {
    this.tiposDisponibles = getOficioTypesByCategory(this.categoriaSeleccionada);
    if (!this.tiposDisponibles.some(item => item.code === this.tipoOficioCodigo)) {
      this.tipoOficioCodigo = '';
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
    this.submenuOpen = null;
  }

  openSubmenu(name: string) {
    this.submenuOpen = name;
  }

  closeSubmenu() {
    this.submenuOpen = null;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const dropdown = document.querySelector('.dropdown');

    if (dropdown && !dropdown.contains(target)) {
      this.dropdownOpen = false;
      this.submenuOpen = null;
    }
  }

  addOficio() {
    if (this.items.length < 10) {
      this.masivo = true;
      this.items.push({ proveido: '' });
    } else {
      this.toastr.error('No puede agregar más de 10 oficios a la vez.', 'Límite alcanzado');
    }
  }

  deleteOficio(index: number) {
    this.items.splice(index, 1);
    if (this.items.length === 1) {
      this.masivo = false;
    }
  }
}
