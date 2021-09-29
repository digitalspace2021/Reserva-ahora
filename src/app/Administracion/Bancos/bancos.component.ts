import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../../data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Banco } from '../../_models/banco.model';
import {DomSanitizer} from '@angular/platform-browser';
import {ngxLoadingAnimationTypes, NgxLoadingComponent} from 'ngx-loading';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'administracion-empresas',
  templateUrl: './bancos.component.html',
})
export class BancosComponent implements OnInit {

  heading = 'Bancos';
  subheading = 'Administración de las empresas';
  icon = 'pe-7s-folder icon-gradient bg-tempting-azure';

  @ViewChild('ngxLoading') ngxLoadingComponent: NgxLoadingComponent;
  @ViewChild('customLoadingTemplate') customLoadingTemplate: TemplateRef<any>;

  @ViewChild('content') templateEditarRegistro: TemplateRef<any>;
  @ViewChild('mBorrar') templateBorrarRegistro: TemplateRef<any>;

  modalReference: any;
  mainObject$ = new Banco();
  mainArray$: [];
  bancoSeleccionado$: any;
  currentUser$: any;
  isActive = false;

  constructor( private authenticationService: AuthenticationService, private router: Router, private sanitizer: DomSanitizer, private dataService : DataService, private modalService: NgbModal ){ }


  nuevoRegistro(){

    this.mainObject$ = new Banco();
    this.router.navigateByUrl('/administracion/banco', { state: this.mainObject$ });

  }

  editarRegistro( registroEditar ){

    this.router.navigateByUrl('/administracion/banco', { state: registroEditar });

  }

  getRegistros(){
    this.dataService.useService( "get_bancos" , { data : this.currentUser$.negocio } )
    .subscribe
      (
          (data : any) =>   {
            this.mainArray$ = data.data;
          },
          error =>  {
            this.dataService.generalAlert(error);
          }
    );
  }

  ngOnInit() {

    this.currentUser$ = this.authenticationService.currentUserValue;
    this.getRegistros();
  }

}
