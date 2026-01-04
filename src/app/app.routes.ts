import { Routes } from '@angular/router';
import { LoginPageComponent } from './modules/login/pages/login/login.component';
import { DespachoComponent } from '../modules/despacho/despacho.component';
import { AuthGuard } from './core/auth/guards/auth.guards';

export const routes: Routes = [
    { path: '', redirectTo: '/despacho', pathMatch: 'full' },
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'despacho',
        //canActivate: [AuthGuard],
        component: DespachoComponent
    }
];
