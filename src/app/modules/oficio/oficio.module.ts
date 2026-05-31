import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IngresoOficioComponent } from './components/ingreso-oficio/ingreso-oficio.component';
import { MostrarOficioComponent } from './components/mostrar-oficio/mostrar-oficio.component';
import { SeleccionOficioComponent } from './components/seleccion-oficio/seleccion-oficio.component';
import { OficioComponent } from './pages/oficio/oficio.component';

const routes: Routes = [
  {
    path: '',
    component: OficioComponent
  }
];

@NgModule({
  declarations: [OficioComponent],
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    IngresoOficioComponent,
    SeleccionOficioComponent,
    MostrarOficioComponent,
    RouterModule.forChild(routes)
  ]
})
export class OficioModule { }
