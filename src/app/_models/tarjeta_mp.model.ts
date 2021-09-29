


export class TarjetaMP {
	
  public cardExpirationMonth: String;
  public cardExpirationYear: String;
  public cardNumber: String;
  public securityCode: String;
  public cardholderName: String;
  public payment_method_id: String;
  public issuer_id: String;
  public docType: String;
  public docNumber: number;
  
  public token_id : String;
  
  constructor(
  
    cardExpirationMonth: string = '',
	cardExpirationYear: string = '',
	cardNumber: string = '',
	securityCode: string = '',
	cardholderName: string = '',
	payment_method_id: string = '',
	issuer_id: string = '',
	docType: string = '',
	docNumber: number = 0,
	
	token_id: string = '',
	
  ){
	  
    this.cardExpirationMonth = cardExpirationMonth;
	this.cardExpirationYear = cardExpirationYear;
	this.cardNumber = cardNumber;
	this.securityCode = securityCode;
	this.cardholderName = cardholderName;
	this.payment_method_id = payment_method_id;
	this.issuer_id = issuer_id;
	this.docType = docType;
	this.docNumber = docNumber;
	
	this.token_id = token_id;
	
  }

}
