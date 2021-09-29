import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { User } from './_models/user.model';
import { Configuracion } from './_models/configuracion.model';
import { Module } from './module.model';
import { DataService } from './data.service';
import { AuthenticationService } from './_services/authentication.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
declare let PushNotification: any;
declare global {
  interface Window {
    plugins: any;
  }
}

import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})

export class AppComponent implements OnInit {

  users$: User[];
  modules$: Module[];
  currentUser$: any;
  title = 'Delivery';
  registrationId = '';
  configuracion$ = new Configuracion();

  classNotificacion$ = "notification-new-order";
  tipoNotificacion$ = 1;
  cantidadNotificacion$ = 1;
  mensajeNotificacion$ = "";
  modalOpened$ = false;
  mostrarIcono$ = false;
  mostrarImagen$ = false;
  urlImagen$ = false
  modalReference: any;
  modalReference2: any;
  showOverlay$ = true;
  promocion$: any;

  tituloModal$: any;
  mensajeModal$: any;
  tipoModal$: any;

  @ViewChild('mMensajeGeneral') mMensajeGeneral: TemplateRef<any>;
  @ViewChild('mPromocion') mPromocion: TemplateRef<any>;

  constructor(
    private socket: Socket,
    private authenticationService: AuthenticationService,
    private router: Router,
    private dataService: DataService,
    private modalService: NgbModal,
  ) {
    this.dataService.getModalData().subscribe(data => { this.triggerMensajeGeneral(data); });
  }

  triggerMensajeGeneral(data) {

    // console.log("triggerMensajeGeneral");

    this.tituloModal$ = data.titulo;
    this.mensajeModal$ = data.mensaje;
    this.tipoModal$ = data.tipo;
    this.mostrarIcono$ = data.mostrar_icono;
    this.mostrarImagen$ = data.mostrar_imagen;
    this.urlImagen$ = data.url_imagen;

    this.modalReference = this.modalService.open(
      this.mMensajeGeneral,
      { windowClass: 'cgk-modal-full', backdrop: false }
    );
    this.modalReference.result.then((result) => {
    }, (reason) => {
      // console.log("exit");
    });
  }

  closeModal() {
    this.modalReference.close();
  }

  getConfiguracion() {
    this.dataService.useService("get_configuracion", {})
      .subscribe
      (
        (data: any) => {
          this.configuracion$ = data.data[0];
          // this.dataService.setAppFavicon(this.configuracion$.logo_bookapp_business.toString());
          this.dataService.setAppFavicon(this.configuracion$.logo_bookapp_business.toString());
          if (this.currentUser$) {
            this.promocion$ = data.data[0];
            if (this.promocion$.activar_promo_inicio) {
              this.modalReference2 = this.modalService.open(this.mPromocion);
            }
          }         
          this.loadOneSignal(); 
        },
        error => {
          this.dataService.generalAlert(error);
        }
      );    
  }

  ngOnInit() {
    this.currentUser$ = this.authenticationService.currentUserValue;
    this.authenticationService.setRegistrationID(this.registrationId);
    this.authenticationService.setUser(this.currentUser$);
    if (this.currentUser$) {
      this.authenticationService.watchUserPosition(this.currentUser$);
    }
    setTimeout(() => {
      this.showOverlay$ = false;
    }, 3000);
    this.getConfiguracion();
  }

  loadOneSignal() {
    //START ONESIGNAL CODE
    //Remove this method to stop OneSignal Debugging 
    //window.plugins.OneSignal.setLogLevel({logLevel: 6, visualLevel: 0});
    var notificationOpenedCallback = function (jsonData) {
      console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData));
    };
    // Set your iOS Settings
    var iosSettings = {};
    iosSettings["kOSSettingsKeyAutoPrompt"] = false;
    iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;
    if (window.plugins) {
      if (window.plugins.OneSignal) {
        window.plugins.OneSignal
          .startInit(this.configuracion$.onesignal_app_id_cliente)
          .handleNotificationOpened(notificationOpenedCallback)
          .iOSSettings(iosSettings)
          .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
          .endInit();
        window.plugins.OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
          console.log("User accepted notifications: " + accepted);
        });
        window.plugins.OneSignal.getPermissionSubscriptionState((status) => {
          console.log("getPermissionSubcription");
          console.log(status.subscriptionStatus.userId);
          console.log(status.subscriptionStatus.pushToken);
          if (this.currentUser$) {
            if (this.currentUser$._id) {
              this.dataService.useService("actualizar_registration_one_signal", { data: this.currentUser$, onesignal: { userId: status.subscriptionStatus.userId, pushToken: status.subscriptionStatus.pushToken } })
                .subscribe(function (data) {
                }, function (error) {
                });
            }
          }
        });
        //END ONESIGNAL CODE
      }
    }
    
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['pages/login']);
  }

}
