import { Routes } from '@angular/router';
import { GrillaCasosComponent } from './pages/grilla-casos/grilla-casos.component';
import { DetalleCasoComponent } from './pages/detalle-caso/detalle-caso.component';

export const GRILLA_CASOS_ROUTES: Routes = [
  {
    path: '',
    component: GrillaCasosComponent
  },
  {
    path: 'detalle/:id',
    component: DetalleCasoComponent
  }
];
