import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DespachoComponent } from './pages/despacho/despacho.component';

const routes: Routes = [
  {
    path: '',
    component: DespachoComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DespachoModule { }
