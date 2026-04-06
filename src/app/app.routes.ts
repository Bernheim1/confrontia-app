import { Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/pages/login/login.component';
import { ChangePasswordComponent } from './modules/login/pages/change-password/change-password.component';
import { AuthGuard } from './core/auth/guards/auth.guards';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'despacho',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginPageComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'despacho',
        loadChildren: () => import('./modules/despacho/despacho.module').then(m => m.DespachoModule)
      },
      {
        path: 'notificaciones',
        loadChildren: () => import('./modules/notificaciones/notificaciones.module').then(m => m.NotificacionesModule)
      },
      {
        path: 'casos',
        loadChildren: () => import('./modules/grilla-casos/grilla-casos.module').then(m => m.GrillaCasosModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./modules/configuracion/usuarios/usuarios.module').then(m => m.UsuariosModule)
      },
      {
        path: 'estudios',
        loadChildren: () => import('./modules/configuracion/estudios/estudios.module').then(m => m.EstudiosModule)
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      }
    ]
  }
];