import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GrillaNotificacionesComponent } from './pages/grilla-notificaciones/grilla-notificaciones.component';
import { NotificacionDespachoComponent } from './pages/notificacion-despacho/notificacion-despacho.component';

const routes: Routes = [
  {
    path: '',
    component: GrillaNotificacionesComponent
  },
  {
    path: 'despacho',
    component: NotificacionDespachoComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GrillaNotificacionesComponent,
    NotificacionDespachoComponent,
    RouterModule.forChild(routes)
  ]
})
export class NotificacionesModule { }
