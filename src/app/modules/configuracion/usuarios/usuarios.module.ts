import { RouterModule, Routes } from "@angular/router";
import { UsuariosConfigPageComponent } from "./pages/usuarios-config-page/usuarios-config-page.component";
import { UsuariosTablePageComponent } from "./pages/usuarios-table-page/usuarios-table-page.component";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Perfiles } from "../../../services/user/contracts/perfiles-enum";
import { RolesGuard } from "../../../core/auth/guards/roles.guard";
import { AuthGuard } from "../../../core/auth/guards/auth.guards";

const routes: Routes = [
  {
    path: '',
    component: UsuariosTablePageComponent,
    canActivate: [AuthGuard, RolesGuard],
    data: { allowedProfiles: [Perfiles.administrador] }
  },
  {
    path: 'create',
    component: UsuariosConfigPageComponent,
    canActivate: [AuthGuard, RolesGuard],
    data: { allowedProfiles: [Perfiles.administrador] }
  },
  {
    path: 'update/:id',
    component: UsuariosConfigPageComponent,
    canActivate: [AuthGuard, RolesGuard],
    data: { allowedProfiles: [Perfiles.administrador] }
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class UsuariosModule { }