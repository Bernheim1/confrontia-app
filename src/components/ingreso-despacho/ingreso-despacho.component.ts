import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Output, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { TipoCedulaEnum, TipoCedulaTexto, TipoMandamientoEnum, TipoMandamientoTexto, TipoSalidaEnum, TipoSalidaTexto } from '../../shared/enums/tipo-salida-enum';
import { ToastrModule, ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-ingreso-despacho',
  standalone: true,
  imports: [CommonModule, FormsModule ,FontAwesomeModule, ToastrModule],
  templateUrl: './ingreso-despacho.component.html',
  styleUrl: './ingreso-despacho.component.scss'
})
export class IngresoDespachoComponent {
  primerDespacho : string = '';
  faArrowRight = faArrowRight;
  @Output() textoIngresado = new EventEmitter<any[]>();
  @Output() tipoSalidaOutput = new EventEmitter<TipoSalidaEnum>();
  @Output() subtipoSalidaOutput = new EventEmitter<any>();
  tipoSalida = TipoSalidaEnum.Mandamiento;
  subtipoSalida : any;
  tipoCedula = TipoCedulaEnum;
  tipoMandamiento = TipoMandamientoEnum;
  textoSalida = 'Seleccione tipo de salida'
  items : any[] = [{primerDespacho: ''}];
  masivo : boolean = false;

  constructor(private toastr: ToastrService) 
  {

  }
  
  onSubmit() {
    this.textoIngresado.emit(this.items);
    this.tipoSalidaOutput.emit(this.tipoSalida);
    this.subtipoSalidaOutput.emit(this.subtipoSalida);
  }

  seleccionTipoSalida(tipo: number, subtipo: number) {
    if (tipo === 0) { // Cédula
      this.tipoSalida = TipoSalidaEnum.Cedula;
      this.subtipoSalida = subtipo;
      this.textoSalida = TipoSalidaTexto[this.tipoSalida] + ' - ' + TipoCedulaTexto[subtipo as TipoCedulaEnum];
    } else {
      this.tipoSalida = TipoSalidaEnum.Mandamiento;
      this.subtipoSalida = subtipo;
      this.textoSalida = TipoSalidaTexto[this.tipoSalida] + ' - ' + TipoMandamientoTexto[subtipo as TipoMandamientoEnum];
    }
  }

  dropdownOpen = false;
  submenuOpen: string | null = null;

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

  addDespacho() {

    if(this.items.length < 10)
    {
      if (this.items.length == 1)
      {
        this.tipoSalida = TipoSalidaEnum.Mandamiento;
      }
      this.masivo = true;
      this.items.push({ primerDespacho: '' });
    }else{
      this.toastr.error('No puede agregar más de 10 despachos a la vez.', 'Límite alcanzado');
    }

  }

  deteleDespacho(index: number) {
    this.items.splice(index, 1);
    if (this.items.length === 1) {  
      this.masivo = false;
    }
  }

    getTextoSalidaCorto(): string {
    if (this.tipoSalida === TipoSalidaEnum.SinAsignar) {
      return 'Seleccionar';
    }
    // Extrae solo el subtipo después del guión
    const partes = this.textoSalida.split(' - ');
    return partes.length > 1 ? partes[1] : this.textoSalida;
  }
}