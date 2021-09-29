import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BancoRoutingModule } from './banco-routing.module';
import { BancoComponent } from './banco.component';
import { SharedModule } from '../../../shared.module';

@NgModule({
  declarations: [ BancoComponent ],
  imports: [
    CommonModule,
    BancoRoutingModule,
    SharedModule
  ]
})
export class BancoModule { }
