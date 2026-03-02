import { RouterModule, Routes } from "@angular/router";
import { EstudioConfigPageComponent } from "./pages/estudio-config-page/estudio-config-page.component";
import { EstudioTablePageComponent } from "./pages/estudio-table-page/estudio-table-page.component";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { Perfiles } from "../../../services/user/contracts/perfiles-enum";
import { RolesGuard } from "../../../core/auth/guards/roles.guard";
import { AuthGuard } from "../../../core/auth/guards/auth.guards";

const routes: Routes = [
  {
    path: '',
    component: EstudioTablePageComponent,
    canActivate: [AuthGuard, RolesGuard],
    data: { allowedProfiles: [Perfiles.administrador] }
  },
  {
    path: 'create',
    component: EstudioConfigPageComponent,
    canActivate: [AuthGuard, RolesGuard],
    data: { allowedProfiles: [Perfiles.administrador] }
  },
  {
    path: 'update/:id',
    component: EstudioConfigPageComponent,
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
export class EstudiosModule { }
