
export class Fecha {

  public _id : String;
  public dia: number;
  public mes: number;
  public anio: number;
  public dia_hoy: number;
  public horas: number;
  public minutos: number;

  constructor(
    _id : string = '',
    dia : number = 0,
	mes : number = 0,
	anio : number = 0,
	dia_hoy : number = 0,
	horas : number = 0,
	minutos : number = 0
  ) {

    this._id  = _id;
    this.dia  = dia;
    this.mes  = mes;
    this.anio = anio;
    this.dia_hoy = dia_hoy;
    this.horas = horas;
    this.minutos = minutos;

  }
}
