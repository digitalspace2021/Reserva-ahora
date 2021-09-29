/// <reference types="@types/googlemaps
import { ElementRef, Component, OnInit, NgZone, ViewChild, TemplateRef, Injectable  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DataService } from '../../../data.service';
import { ActivatedRoute, Router, RouterStateSnapshot } from '@angular/router';
import { Pedido } from '../../../_models/pedido.model';
import { Fecha } from '../../../_models/fecha.model';
import { Configuracion } from '../../../_models/configuracion.model';
import { NgbModal, ModalDismissReasons, NgbTabset, NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from '../../../_services/authentication.service';
import {ImageCroppedEvent, ImageCropperComponent} from 'ngx-image-cropper';
import { MapsAPILoader } from '@agm/core';
declare let google: any;

import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'pedidoadmin-acceso',
  templateUrl: './pedidoadmin.component.html',
  providers: [{provide: NgbDateAdapter, useClass: NgbDateNativeAdapter}],
  styles: [`
    .star {
      font-size: 1.5rem;
      color: #b0c4de;
    }
    .filled {
      color: #d38c0a;
    }
  `]
})

export class PedidoAdminComponent implements OnInit {

  mainObj$ = new Pedido();
  configuracion$ = new Configuracion();
  currentUser$ : any;
  modalReference: any;
  modalReference2: any;
  mapPoints : any;
  pointSeleccionado : any;
  zoom: any;
  mapStyles: any;
  isAdmin: any;
  isAdminNeg: any;
  isMotofast: any;
  fecha_t$ = new Fecha();
  isClient: any;
  platilloSeleccionado$: any;
  index$: any;
  usuariosArray$: [];
  copiaPlatillos$ = [];
  copiaTotal$: any;
  ioConnection2 : any;
  mensajeAlerta$ = "";

  isPlace: any;
  isStation: any;
  isRestaurant : any;
  // geocoder : any;
  vista$ = 1;

  public imagePath;
  imgURL: any;
  public isActive: any;
  ioConnection: any;

  @ViewChild('listadoUsuarios') listadoUsuarios: TemplateRef<any>;
  @ViewChild('mDireccion') mDireccion: TemplateRef<any>;
  @ViewChild('mModificarInfo') mModificarInfo: TemplateRef<any>;
  @ViewChild('mConfirmarEliminarPlatillo') mConfirmarEliminarPlatillo: TemplateRef<any>;
  @ViewChild('mConfirmarGeneral') mConfirmarGeneral: TemplateRef<any>;


  constructor( private socket: Socket, private ngZone: NgZone, private mapsAPILoader: MapsAPILoader, private router: Router, private activatedRoute: ActivatedRoute, private dataService : DataService , private authenticationService: AuthenticationService, private modalService: NgbModal ){
  }

  regresar(){
    this.router.navigateByUrl('/pedidos/admin', { });
  }

  calificarPedidoCliente(){
    if( !this.mainObj$.calificacion_cliente ){
      this.dataService.generalAlert( { "message" : "Captura la calificación.", "status" : "error" } );
      return;
    }
    this.dataService.useService( "calificar_pedido_cliente" , { data : this.mainObj$ } )
    .subscribe
      (
          (data : any) =>   {
            this.mainObj$.calificado_cliente = true;
            this.dataService.generalAlert(data);
          },
          error =>  {
            this.dataService.generalAlert(error);
          }
    );
  }

  notify(ev){
    // console.log(ev);
    this.dataService.generalAlert({ "status" : "success" , "message" : "Copiado." });
  }

  irAChat(){
    this.router.navigateByUrl('/pedido/chat', { state: this.mainObj$ });
  }

  triggerEdicion(){
    this.vista$           = 2;
    this.copiaTotal$      = JSON.parse(JSON.stringify(this.mainObj$.total));
    this.copiaPlatillos$  = JSON.parse(JSON.stringify(this.mainObj$.platillos));
  }

  revertirCambios(){
    this.mainObj$.platillos   = this.copiaPlatillos$;
    this.mainObj$.total       = this.copiaTotal$;
    this.vista$               = 1;
  }

  triggerCantidadPlatillo( tipo_t, platillo_t, index_t ){
    this.platilloSeleccionado$ = platillo_t;
    this.index$ = index_t;
    if( tipo_t === 1 ){ // Aumentar
      platillo_t.cantidad = platillo_t.cantidad + 1;
      platillo_t.total =
        parseFloat(platillo_t.costo) * parseInt(platillo_t.cantidad);
    }else{ // Disminuir
      platillo_t.cantidad = platillo_t.cantidad - 1;
      if( platillo_t.cantidad === 0 || platillo_t.cantidad < 0 ){
        platillo_t.cantidad = 0;
        this.modalReference = this.modalService.open(this.mConfirmarEliminarPlatillo);
        this.modalReference.result.then((result) => {
        }, (reason) => {
          platillo_t.cantidad = 1;
          if( this.mainObj$.costo_envio > 0 ){
            this.calcularTotalPedidoConEnvio();
          }else{
            this.calcularTotalPedido();
          }
        });
      }else{
        platillo_t.total =
          parseFloat(platillo_t.costo) * parseInt(platillo_t.cantidad);
      }
    }
    if( this.mainObj$.costo_envio > 0 ){
      this.calcularTotalPedidoConEnvio();
    }else{
      this.calcularTotalPedido();
    }
  }

  confimarEliminarPlatillo(){
    this.mainObj$.platillos.splice(this.index$,1);
    this.modalReference.close();
    if( this.mainObj$.costo_envio > 0 ){
      this.calcularTotalPedidoConEnvio();
    }else{
      this.calcularTotalPedido();
    }
  }

  calcularTotalPedidoConEnvio(){
    this.mainObj$.total = 0;
    for( var i = 0; i<this.mainObj$.platillos.length; i++ ){
      this.mainObj$.total = this.mainObj$.total +
        this.mainObj$.platillos[i].cantidad * this.mainObj$.platillos[i].costo;
    }
    this.mainObj$.total = this.mainObj$.total + this.mainObj$.costo_envio;
  }

  calcularTotalPedido(){
    this.mainObj$.total = 0;
    for( var i = 0; i<this.mainObj$.platillos.length; i++ ){
      this.mainObj$.total = this.mainObj$.total +
        this.mainObj$.platillos[i].cantidad * this.mainObj$.platillos[i].costo;
    }
  }

  initIoConnection(){
    // console.log("initIoConnection");
    this.ioConnection = this.dataService.onMessage()
    .subscribe((data: any) => {
      // console.log("evento de socket recibido");
      this.refrescarPedido();
    });
  }

  initIoConnection2(){
    // console.log("initIoConnection2");
    this.ioConnection = this.dataService.getPedidosUbicacion()
    .subscribe((data: any) => {
      // console.log(data);
      // console.log("evento de socket recibido");
      this.refrescarPedido();
    });
  }

  refrescarPedido(){
    // console.log("REFRESCAR PEDIDO ------------SOCKETTTTTTTTTTT--------------------------");
    this.dataService.useService( "get_pedido_by_id" , { data : this.mainObj$ } )
    .subscribe
      (
        (data : any) =>   {
          if( data.status === "success" ){
            this.mainObj$ = data.data[0];
            this.generateMapPoints();
          }
        },
        error =>  {
          this.dataService.generalAlert(error);
        }
    );
  }

  seleccionarMotofast(){
    // console.log("seleccionarMotofast");
    if( this.isAdmin ){
      this.dataService.useService( "get_usuarios_repartidor_administrador" , {  } )
      .subscribe
        (
            (data : any) =>   {
              this.usuariosArray$ = data.data;
              // console.log(this.usuariosArray$);
              this.modalReference = this.modalService.open(this.listadoUsuarios);
              this.modalReference.result.then((result) => {
                this.mainObj$.motofast = result;
                this.mainObj$.motofast_id = result._id;
                this.mensajeAlerta$ = "¿Seguro que desea agregar este repartidor?";
                this.modalReference2 = this.modalService.open(this.mConfirmarGeneral);
                this.modalReference2.result.then((result) => {
                  this.actualizarPedido(1);
                }, (reason) => {
                  // console.log("exit");
                });
              }, (reason) => {
                // console.log("exit");
              });
            },
            error =>  {
              alert("Error");
            }
      );
    }else{
      this.dataService.useService( "get_usuarios_repartidor_negocio" , { negocio : this.mainObj$.negocio } )
      .subscribe
        (
            (data : any) =>   {
              this.usuariosArray$ = data.data;
              // console.log(this.usuariosArray$);
              this.modalReference = this.modalService.open(this.listadoUsuarios);
              this.modalReference.result.then((result) => {
                this.mainObj$.motofast = result;
                this.mainObj$.motofast_id = result._id;
                this.mensajeAlerta$ = "¿Seguro que desea agregar este repartidor?";
                this.modalReference2 = this.modalService.open(this.mConfirmarGeneral);
                this.modalReference2.result.then((result) => {
                  this.actualizarPedido(1);
                }, (reason) => {
                  // console.log("exit");
                });
              }, (reason) => {
                // console.log("exit");
              });
            },
            error =>  {
              alert("Error");
            }
      );
    }
  }

  llamarTelefono(tel_t, tipo_t){
    if( tipo_t === 1 ){
      window.open('tel:'+tel_t, '_system');
    }else{
      window.open( "https://api.whatsapp.com/send?phone="+tel_t , "_system");
    }
  }

  generateMapPoints() {
    this.mapPoints = [];
    this.mapPoints.push({
      "direccion"  : this.mainObj$.origen_direccion,
      "latitude"  : this.mainObj$.origen_latitude,
      "longitude" : this.mainObj$.origen_longitude,
      "icon" : {
        "url" : "https://codigeek.com/projects/vieneviene/storepin.png",
        scaledSize: {
          width: 50,
          height: 50
        }
      }
    });
    this.mapPoints.push({
      "direccion"  : this.mainObj$.destino_direccion,
      "latitude"  : this.mainObj$.destino_latitude,
      "longitude" : this.mainObj$.destino_longitude
    });
    if( this.mainObj$.tipo_servicio === 1 ){
      this.mapPoints[1].icon = {
        "url" : "https://www.codigeek.com/projects/bookapp/car.png",
        scaledSize: {
          width: 40,
          height: 32
        }
      }
    }else{
      this.mapPoints[1].icon = {
        "url" : "https://codigeek.com/projects/vieneviene/housepin.jpg",
        scaledSize: {
          width: 40,
          height: 40
        }
      }
      if( this.mainObj$.repartidor_latitude ){
        this.mapPoints.push({
          "direccion"  : this.mainObj$.repartidor_direccion,
          "latitude"  : this.mainObj$.repartidor_latitude,
          "longitude" : this.mainObj$.repartidor_longitude,
          "icon" : {
            "url" : "https://www.codigeek.com/projects/bookapp/delivery.png",
            scaledSize: {
              width: 35,
              height: 40
            }
          }
        });
      }
    }
  }

  modificarPedido(){
    this.modalReference = this.modalService.open(this.mModificarInfo);
  }

  guardarModificacionPlatillosPedido(){
    if( this.isAdmin || this.isAdminNeg ){
      this.mainObj$.confirmacion_cliente = true;
    }else{
      this.mainObj$.confirmacion_cliente = false;
    }
    if( this.isClient ){
      this.mainObj$.confirmacion_admins = true;
    }else{
      this.mainObj$.confirmacion_admins = false;
    }
    this.dataService.useService( "actualizar_pedido_platillos_informacion" , { data : this.mainObj$, info : { fecha : new Date() } } )
    .subscribe
      (
          (data : any) =>   {
            this.dataService.generalAlert(data);
            this.mainObj$.status = 10;
            this.refrescarPedido();
            this.vista$ = 1;
            if(this.modalReference){
              this.modalReference.close();
            }
          },
          error =>  {

          }
    );
  }

  guardarModificacionPedido(){
    if( !this.mainObj$.fecha_pedido ){
      this.dataService.generalAlert({ "status" : "info" , "message" : "Completa la fecha del pedido" });
      return;
    }
    if( this.mainObj$.tipo_servicio === 2 ){
      if( !this.mainObj$.hora_pedido ){
        this.dataService.generalAlert({ "status" : "info" , "message" : "Completa la hora del pedido" });
        return;
      }
    }
    if( !this.mainObj$.total ){
      this.dataService.generalAlert({ "status" : "info" , "message" : "Completa el total del pedido" });
      return;
    }
    if( !this.mainObj$.comentarios ){
      this.dataService.generalAlert({ "status" : "info" , "message" : "Completa los comentarios" });
      return;
    }
    if( this.isAdmin || this.isAdminNeg ){
      this.mainObj$.confirmacion_cliente = true;
    }else{
      this.mainObj$.confirmacion_cliente = false;
    }
    if( this.isClient ){
      this.mainObj$.confirmacion_admins = true;
    }else{
      this.mainObj$.confirmacion_admins = false;
    }
    this.dataService.useService( "actualizar_pedido_informacion" , { data : this.mainObj$, info : { fecha : new Date() } } )
    .subscribe
      (
          (data : any) =>   {
            this.dataService.generalAlert(data);
            this.mainObj$.status = 10;
            this.refrescarPedido();
            this.modalReference.close();
          },
          error =>  {

          }
    );
  }

  actualizarPedido( tipo_t ){

    let servicio_t = "";

    if( tipo_t === 1 ){
      if( this.mainObj$.tipo_servicio === 2 ){
        if( !this.mainObj$.motofast ){
          this.dataService.generalAlert({ "status" : "info" , "message" : "Completa el repartidor" });
          return;
        }
      }
    }

    if( tipo_t === 10 ){
      if( this.mainObj$.tipo_servicio === 2 && !this.mainObj$.pideloquequieras ){
        if( !this.mainObj$.hora_pedido ){
          this.dataService.generalAlert({ "status" : "info" , "message" : "Completa la hora de entrega" });
          return;
        }
      }
    }

    // if( tipo_t === 10 ){
    //   if( !this.mainObj$.tiempo_texto ){
    //     this.dataService.generalAlert({ "status" : "info" , "message" : "Completa el tiempo aproximado de entrega" });
    //     return;
    //   }
    // }

    switch(tipo_t){
      case 1:
        servicio_t = "actualizar_asignar_motofast";
        this.mainObj$.fecha_asignar_motofast = new Date();
      break;
      case 2:
        servicio_t = "actualizar_pedido_listo";
        this.mainObj$.fecha_pedido_listo = new Date();
      break;
      case 3:
        servicio_t = "actualizar_pedido_entregue_productos";
        this.mainObj$.fecha_entregue_productos = new Date();
      break;
      case 10:
        servicio_t = "actualizar_pedido_platillos_listos";
        this.mainObj$.fecha_platillos_listos = new Date();
      break;
	  case 14:
        servicio_t = "actualizar_pedido_no_asistencia";
        this.mainObj$.fecha_cancelacion = new Date();
      break;
      case 15:
        servicio_t = "actualizar_pedido_cancelar";
        this.mainObj$.fecha_cancelacion = new Date();
      break;
      case 16:
        servicio_t = "actualizar_cancelacion_vendedor";
        this.mainObj$.fecha_cancelacion_vendedor = new Date();
      break;
    }
	
	var dia_hoy_y = new Date();
	this.fecha_t$.dia     = dia_hoy_y.getDay();
    this.fecha_t$.mes     = dia_hoy_y.getMonth();
    this.fecha_t$.anio    = dia_hoy_y.getFullYear();
    this.fecha_t$.dia_hoy = dia_hoy_y.getDate();
    this.fecha_t$.horas   = dia_hoy_y.getHours();
    this.fecha_t$.minutos = dia_hoy_y.getMinutes();

    this.dataService.useService( servicio_t , { data : this.mainObj$, fecha_t : this.fecha_t$ } )
    .subscribe
      (
        (data : any) =>   {
          this.dataService.generalAlert(data);
          if( data.status === "success" ){
            switch(tipo_t){
              case 1:
                this.dataService.ejecutarModal({ "titulo" : "¡Listo!" , "mensaje" : "Has asignado el pedido al repartidor" , "mostrar_icono" : true });
                this.mainObj$.status = 2;
              break;
              case 2:
                this.mainObj$.status = 2;
              break;
              case 3:
                this.mainObj$.status = 3;
              break;
              case 10:
                this.mainObj$.status = 1;
              break;
              case 15:
                this.mainObj$.status = 15;
              break;
            }
          }
          this.refrescarPedido();
        },
        error =>  {
          this.dataService.generalAlert(error);
        }
    );

  }

  actualizarTotalConfirmacionCliente(){
    if( !this.mainObj$.total || this.mainObj$.total === 0 ){
      this.dataService.generalAlert({ "status" : "info" , "message" : "Completa el total" });
      return;
    }
    this.dataService.useService( "actualizar_pedido_total_confirmacion_adminneg" , { data : this.mainObj$, info : { fecha : new Date() } } )
    .subscribe
      (
          (data : any) =>   {
            this.dataService.generalAlert(data);
            this.refrescarPedido();
          },
          error =>  {

          }
    );
  }

  abrirUbicacion(){
    switch( this.mainObj$.tipo_servicio ){
      case 1:
        this.pointSeleccionado = {
          "direccion" : this.mainObj$.negocio.direccion,
          "latitude" : this.mainObj$.negocio.latitude,
          "longitude" : this.mainObj$.negocio.longitude
        };
      break;
      case 2:
        this.pointSeleccionado = {
          "direccion" : this.mainObj$.destino_direccion,
          "latitude" : this.mainObj$.destino_latitude,
          "longitude" : this.mainObj$.destino_longitude
        };
      break;
    }
    this.modalReference = this.modalService.open(this.mDireccion);
  }

  abrirNavegacion(){
    if((navigator.platform.indexOf("iPhone") != -1) ||
     (navigator.platform.indexOf("iPad") != -1) ||
     (navigator.platform.indexOf("iPod") != -1)){
       window.open("maps://maps.google.com/maps?daddr="+ this.pointSeleccionado.latitude +","+ this.pointSeleccionado.longitude +"&amp;ll=");
    }else{
       window.open("https://maps.google.com/maps?daddr="+ this.pointSeleccionado.latitude +","+ this.pointSeleccionado.longitude +"&amp;ll=");
    }
  }

  getConfiguracion(){
    this.dataService.useService( "get_configuracion" , {} )
    .subscribe
      (
          (data : any) =>   {
            this.configuracion$ = data.data[0];
          },
          error =>  {
            this.dataService.generalAlert(error);
          }
    );
  }

  ngOnInit() {

    this.isAdmin = false;
    this.isAdminNeg = false;
    this.isMotofast = false;
    this.isClient = false;

    this.isPlace = false;
    this.isStation = false;
    this.isRestaurant = false;

    // console.log("Param on init pedido");
    // console.log(history.state);

    if( history.state._id ){
      this.mainObj$ = history.state;
    }else{
      this.router.navigateByUrl('/pedidos/admin', { });
    }

    this.currentUser$ = this.authenticationService.currentUserValue;
    switch( this.currentUser$.tipo_usuario_id ){
      //Admin App
      case "5c4050f358209844a83c8622":
        this.isAdmin = true;
      break;
      //Admin Neg
      case "5c4050fa58209844a83c8623":
        this.isAdminNeg = true;
      break;
      //Repartidor
      case "5c40513658209844a83c862a":
        this.isMotofast = true;
      break;
      //Cliente
      case "5c40513258209844a83c8629":
        this.isClient = true;
      break;
      //Restaurante
      case "5e30cadaec6ea3c622235f99":
        this.isRestaurant = true;
      break;
      //Station
      case "5e30cae5ec6ea3c622235f9b":
        this.isStation = true;
      break;
      //Place
      case "5e30cadfec6ea3c622235f9a":
        this.isPlace = true;
      break;
    }

    this.getConfiguracion();

    this.zoom = 13;
    this.mapsAPILoader.load().then(() => {
      // this.geocoder = new google.maps.Geocoder;
      this.generateMapPoints();
      this.initIoConnection();
      this.initIoConnection2();
    });

    this.authenticationService.setPedido(new Pedido());

    this.mapStyles = [
        {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "color": "#e0efef"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "hue": "#1900ff"
                },
                {
                    "color": "#c0e8e8"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
                {
                    "lightness": 100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "transit.line",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "on"
                },
                {
                    "lightness": 700
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "all",
            "stylers": [
                {
                    "color": "#7dcdcd"
                }
            ]
        }
    ];

  }

}
