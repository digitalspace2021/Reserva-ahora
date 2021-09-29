import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BancosRoutingModule } from './bancos-routing.module';
import { BancosComponent } from './bancos.component';
import { SharedModule } from '../../shared.module';

@NgModule({
  declarations: [ BancosComponent ],
  imports: [
    CommonModule,
    BancosRoutingModule,
    SharedModule
  ]
})
export class BancosModule { }
