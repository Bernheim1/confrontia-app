import { Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/pages/login/login.component';
import { LayoutComponent } from '../components/layout/layout.component';
import { ChangePasswordComponent } from './modules/login/pages/change-password/change-password.component';

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
    //canActivate: [AuthGuard],
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
        path: 'change-password',
        component: ChangePasswordComponent
      }
    ]
  }
];