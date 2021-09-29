import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { DataService } from '../../data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Usuario } from '../../_models/usuario.model';
import {DomSanitizer} from '@angular/platform-browser';
import { AuthenticationService } from '../../_services/authentication.service';
import {ngxLoadingAnimationTypes, NgxLoadingComponent} from 'ngx-loading';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';

@Component({
  selector: 'administracion-empresas',
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent implements OnInit {

  heading = 'Usuarios';
  subheading = 'Administración de las empresas';
  icon = 'pe-7s-folder icon-gradient bg-tempting-azure';

  @ViewChild('ngxLoading') ngxLoadingComponent: NgxLoadingComponent;
  @ViewChild('customLoadingTemplate') customLoadingTemplate: TemplateRef<any>;

  @ViewChild('content') templateEditarRegistro: TemplateRef<any>;
  @ViewChild('mBorrar') templateBorrarRegistro: TemplateRef<any>;

  modalReference: any;
  mainObject$ = new Usuario();
  mainArray$: [];
  usuarioSeleccionado$: any;
  isActive = false;
  searchText = "";
  currentUser$ : any;

  constructor( private router: Router, private sanitizer: DomSanitizer, private dataService : DataService, private modalService: NgbModal, private authenticationService: AuthenticationService ){ }


  open(content) {
    this.modalReference = this.modalService.open(content);
    this.modalReference.result.then((result) => {
      // console.log("modal_closed");
    }, (reason) => {
      // console.log("exit");
    });
  }

  nuevoRegistro(){

    this.mainObject$ = new Usuario();
    this.router.navigateByUrl('/negocio/usuario', { state: this.mainObject$ });

  }

  editarRegistro( registroEditar ){

    this.router.navigateByUrl('/negocio/usuario', { state: registroEditar });

  }

  borrarRegistro( mBorrar, registroBorrar ){

    this.mainObject$ = registroBorrar;
    this.modalReference = this.modalService.open(mBorrar);
    this.modalReference.result.then((result) => {
      this.dataService.useService( "borrar_empresa" , { data : this.mainObject$ } )
      .subscribe
        (
            (data : any) =>   {
              mainObject$ : new Usuario();
              this.dataService.generalAlert(data);
              this.getRegistros();
            },
            error =>  {
              this.dataService.generalAlert(error);
            }
      );
    }, (reason) => {
      // console.log("exit");
    });

  }

  getRegistros(){
    this.dataService.useService( "get_usuarios_negocio" , { data : this.currentUser$.negocio } )
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
