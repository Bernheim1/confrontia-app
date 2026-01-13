import { Component, ViewChildren, QueryList } from '@angular/core';
import { TipoSalidaEnum } from '../../shared/enums/tipo-salida-enum';
import { faGavel, faRepeat } from '@fortawesome/free-solid-svg-icons';
import { TipoStepEnum } from '../../shared/enums/tipo-step-enum';
import { Salida } from '../../shared/models/salida';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IngresoDespachoComponent } from '../../components/ingreso-despacho/ingreso-despacho.component';
import { MostrarSalidaComponent } from '../../components/mostrar-salida/mostrar-salida.component';
import { SeleccionSalidaComponent } from '../../components/seleccion-salida/seleccion-salida.component';
import { DespachoService } from '../../shared/services/despacho/despacho.service';

@Component({
  selector: 'app-despacho',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, IngresoDespachoComponent, SeleccionSalidaComponent, MostrarSalidaComponent, FormsModule],
  templateUrl: './despacho.component.html',
  styleUrl: './despacho.component.scss'
})
export class DespachoComponent {
  faGavel = faGavel;
  faRepeat = faRepeat;
  step : TipoStepEnum = TipoStepEnum.Inicio;
  despachos : any[] = [];
  tipoSalida = TipoSalidaEnum.SinAsignar;
  subtipoSalida : any;
  salida : Salida[] = [];
  salidasRecolectadas: Map<number, Salida> = new Map();
  formulariosValidos: Set<number> = new Set();
  
  @ViewChildren(SeleccionSalidaComponent) seleccionComponents!: QueryList<SeleccionSalidaComponent>;

  constructor(private despachoService: DespachoService) {}

  onTextoIngresado(event : any[]) 
  {
    if (event.length > 0)
    {
      this.despachos = event;
    }
  }

  onTipoSalidaSeleccionado(event : TipoSalidaEnum)
  {
    if (this.despachos.length > 0)
    {
      this.tipoSalida = event;
    }
  }

  onSubtipoSalidaSeleccionado(event : any)
  {
    if (this.despachos.length > 0 && this.tipoSalida != TipoSalidaEnum.SinAsignar)
    {
      this.subtipoSalida = event;
      this.step = TipoStepEnum.SeleccionSalida;
    }
  }

  onSalidaSeleccionada(event: { salida: Salida, index: number }) 
  {
    this.salidasRecolectadas.set(event.index, event.salida);
    
    // Solo avanzar cuando tengamos todas las salidas
    if (this.salidasRecolectadas.size === this.despachos.length) {
      // Ordenar las salidas según el índice
      this.salida = Array.from({ length: this.despachos.length }, (_, i) => 
        this.salidasRecolectadas.get(i)!
      );
      this.step = TipoStepEnum.MostrarSalida;
    }
  }

  generarTodos() {
    // Limpiar salidas previas
    this.salidasRecolectadas.clear();
    this.salida = [];
    
    // Iterar sobre todos los componentes y ejecutar su submit
    this.seleccionComponents.forEach((component, index) => {
      component.submitFromParent(index);
    });
  }

  onFormularioCompletado(event: { index: number, valido: boolean }) {
    if (event.valido) {
      this.formulariosValidos.add(event.index);
    } else {
      this.formulariosValidos.delete(event.index);
    }
  }

  onReingresar() 
  {
    this.step = TipoStepEnum.Inicio;
    this.despachos = [];
    this.salida = [];
    this.salidasRecolectadas.clear();
    this.formulariosValidos.clear();
  }
}
