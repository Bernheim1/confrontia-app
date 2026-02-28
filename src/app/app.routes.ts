import { Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/pages/login/login.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { ChangePasswordComponent } from './modules/login/pages/change-password/change-password.component';
import { AuthGuard } from './core/auth/guards/auth.guards';
import { Perfiles } from './services/user/contracts/perfiles-enum';
import { RolesGuard } from './core/auth/guards/roles.guard';

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
        path: 'casos',
        loadChildren: () => import('./modules/grilla-casos/grilla-casos.module').then(m => m.GrillaCasosModule)
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./modules/configuracion/usuarios/usuarios.module').then(m => m.UsuariosModule)
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      }
    ]
  }
];