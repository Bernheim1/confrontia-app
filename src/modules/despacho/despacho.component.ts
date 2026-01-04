import { Component } from '@angular/core';
import { faGavel, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { TipoSalidaEnum } from '../../shared/enums/tipo-salida-enum';
import { TipoStepEnum } from '../../shared/enums/tipo-step-enum';
import { Salida } from '../../shared/models/salida';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IngresoDespachoComponent } from '../../components/ingreso-despacho/ingreso-despacho.component';
import { MostrarSalidaComponent } from '../../components/mostrar-salida/mostrar-salida.component';
import { SeleccionSalidaComponent } from '../../components/seleccion-salida/seleccion-salida.component';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, IngresoDespachoComponent, SeleccionSalidaComponent, MostrarSalidaComponent],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.scss'
})
export class DespachoComponent {
  faGavel = faGavel;
  faRepeat = faRepeat;
  step : TipoStepEnum = TipoStepEnum.Inicio;
  textoDespacho : string = '';
  tipoSalida = TipoSalidaEnum.SinAsignar;
  subtipoSalida : any;
  salida : Salida = new Salida();

  onTextoIngresado(event : string) 
  {
    if (event.length > 0)
    {
      this.textoDespacho = event;
    }
  }

  onTipoSalidaSeleccionado(event : TipoSalidaEnum)
  {
    if (this.textoDespacho.length > 0)
    {
      this.tipoSalida = event;
    }
  }

  onSubtipoSalidaSeleccionado(event : any)
  {
    if (this.textoDespacho.length > 0 && this.tipoSalida != TipoSalidaEnum.SinAsignar)
    {
      this.subtipoSalida = event;
      this.step = TipoStepEnum.SeleccionSalida;
    }
  }

  onSalidaSeleccionada(event : Salida) 
  {
    this.salida = event;
    this.step = TipoStepEnum.MostrarSalida;
  }

  onReingresar() 
  {
    this.step = TipoStepEnum.Inicio;
    this.textoDespacho = '';
    this.salida = new Salida();
  }
}
