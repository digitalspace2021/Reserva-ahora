import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BancosComponent } from './bancos.component';

// const routes: Routes = [];

const routes: Routes = [
  {
    path: '',
    component: BancosComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BancosRoutingModule { }
