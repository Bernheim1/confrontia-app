import { Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/pages/login/login.component';
import { DespachoComponent } from '../modules/despacho/despacho.component';
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
        component: DespachoComponent
      },
      {
        path: 'change-password',
        component: ChangePasswordComponent
      }
    ]
  }
];