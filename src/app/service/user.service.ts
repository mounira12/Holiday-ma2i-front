import { Injectable } from "@angular/core"; 
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import * as _ from 'lodash';
import { BaseService } from "./common/base.service";
import { AppConsts } from "../models/common/app-consts";
import { UserModel } from "../models/user.model";

export enum saveCollaboratorResponse {
  AccountAlreadyExist = 'AccountAlreadyExist',
  AccountExistInRefClient = 'AccountExistInRefClient',
  UnknownClient = 'UnknownClient',
  IssueSendingMail = 'IssueSendingMail',
  CreateUserAndSendMailWithSuccess = 'CreateUserAndSendMailWithSuccess',
  ErrorCreatCpt = 'ErrorCreatCpt'
}

@Injectable()
export class UserService extends BaseService {
  
  constructor(private http : HttpClient) {
      super();
    }

    getbyemail(email:string){
      let httpOptions = this.getHttpHeader(); 
      return this.http.post(AppConsts.API_SERVICE_URL + "account/getbyemail",JSON.stringify(email), httpOptions);
    } 

  allAttached():Observable<UserModel[]>{
    let httpOptions = this.getHttpHeader(); 
    return this.http.get<UserModel[]>(AppConsts.API_SERVICE_URL + "collaborator/allAttached", httpOptions);
  }

  all():Observable<UserModel[]>{
    let httpOptions = this.getHttpHeader();
    
    return this.http.get<UserModel[]>(AppConsts.API_SERVICE_URL + "account/get", httpOptions);
  }

  getColloborator(collaboratorId: string):Observable<UserModel>{
    let httpOptions = this.getHttpHeader();

    httpOptions.params = _.assign({collaboratorId: collaboratorId}, httpOptions.params);
    
    return this.http.get<UserModel>(AppConsts.API_SERVICE_URL + "collaborator/GetCollboratorById", httpOptions);
  }

  GetSignerCollaboratorById(collaboratorId: string): Observable<any> {
    let httpOptions = this.getHttpHeader();
    httpOptions.params = _.assign({ id: collaboratorId }, httpOptions.params);
    return this.http.get<UserModel>(AppConsts.API_SERVICE_URL + "collaborator/GetSignerCollaboratorById", httpOptions);
  }
  registerColloborator(collborator: UserModel):Promise<saveCollaboratorResponse>{
    let httpOptions = this.getHttpHeader();
    
    collborator.UserName = collborator.Email;
    return this.http.post<saveCollaboratorResponse>(AppConsts.API_SERVICE_URL + "Account/register", collborator, httpOptions)
        .toPromise();
  }

  saveColloborator(collborator: UserModel):Promise<boolean>{
    let httpOptions = this.getHttpHeader();
    
    return this.http.post<boolean>(AppConsts.API_SERVICE_URL + "collaborator/update", collborator, httpOptions)
        .toPromise();
  }

  deleteColloborators(colloboratorsIds: string[]):Promise<boolean>{
    let httpOptions = this.getHttpHeader();
    
    return this.http.post<boolean>(AppConsts.API_SERVICE_URL + "collaborator/delete", colloboratorsIds, httpOptions)
        .toPromise();
  }

 

  GetListCollaboratorsAsKeyValueObjectByFilter(filter:string):Observable<any> {
    let httpOptions = this.getHttpHeader();
    return this.http.post(AppConsts.API_SERVICE_URL + "collaborator/GetListCollaboratorsAsKeyValueObjectByFilter",JSON.stringify(filter), httpOptions);
  }
  

  
}
