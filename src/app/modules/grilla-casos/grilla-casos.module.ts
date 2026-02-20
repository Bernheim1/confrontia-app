import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GrillaCasosComponent } from './pages/grilla-casos/grilla-casos.component';
import { DetalleCasoComponent } from './pages/detalle-caso/detalle-caso.component';

const routes: Routes = [
  {
    path: '',
    component: GrillaCasosComponent
  },
  {
    path: 'detalle/:id',
    component: DetalleCasoComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class GrillaCasosModule { }
