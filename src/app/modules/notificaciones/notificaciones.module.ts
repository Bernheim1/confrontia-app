import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GrillaNotificacionesComponent } from './pages/grilla-notificaciones/grilla-notificaciones.component';

const routes: Routes = [
  {
    path: '',
    component: GrillaNotificacionesComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GrillaNotificacionesComponent,
    RouterModule.forChild(routes)
  ]
})
export class NotificacionesModule { }
