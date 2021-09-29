/// <reference types="@types/googlemaps
import { ElementRef, Component, OnInit, NgZone, ViewChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../data.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { Banco } from '../../../_models/banco.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../_services/authentication.service';

@Component({
  selector: 'banco-acceso',
  templateUrl: './banco.component.html',
})

export class BancoComponent implements OnInit {

  mainObj$ = new Banco();
  mainObjParam$ = new Banco();
  mainArray$: [];
  currentUser$ : any;
  modalReference: any;

  public imagePath;
  imgURL: any;
  public isActive: any;

  @ViewChild('mBorrar') mBorrar: TemplateRef<any>;

  constructor( private ngZone: NgZone, private router: Router, private activatedRoute: ActivatedRoute, private dataService : DataService , private authenticationService: AuthenticationService, private modalService: NgbModal ){
  }

  borrar(){
    this.modalReference = this.modalService.open(this.mBorrar);
    this.modalReference.result.then((result) => {
      this.dataService.useService( "borrar_banco" , { data : this.mainObj$ } )
      .subscribe
        (
            (data : any) =>   {
              this.dataService.generalAlert(data);
              this.router.navigateByUrl('/administracion/bancos', { });
            },
            error =>  {
              this.dataService.generalAlert(error);
            }
      );
    }, (reason) => {
      // console.log("exit");
    });
  }

  guardar(){
    if( !this.mainObj$.nombre ){
      this.dataService.generalAlert( { "message" : "Completa el nombre.", "status" : "error" } );
      return;
    }
    this.dataService.useService( "actualizar_banco" , { data : this.mainObj$ } )
    .subscribe
      (
          (data : any) =>   {
            this.dataService.generalAlert(data);
            this.router.navigateByUrl('/administracion/bancos', { });
          },
          error =>  {
            this.dataService.generalAlert(error);
          }
    );
  }

  ngOnInit() {
    // console.log("Param on init banco");
    // console.log(history.state);
    if( history.state._id ){
      this.mainObj$ = history.state;
    }
    this.currentUser$ = this.authenticationService.currentUserValue;
  }

}
