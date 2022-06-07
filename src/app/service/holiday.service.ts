import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { LoginModel } from "../models/login.model";
import { UserModel } from "../models/user.model";
import { HolidayFilterRequest } from "../models/holiday/holidayFilterRequest.model";
import { HolidayTypeModel } from "../models/holiday/holidayType.model";
import { HolidayModel, HolidayModelRequest } from "../models/holiday/holiday.model";
import { AppConsts } from "../models/common/app-consts";

import * as _ from 'lodash';
import { HolidayRequestModel } from "../models/holiday/holidayRequest.model";
import { HolidaySynthesisModel } from "../models/holiday/holidaySynthesis.model";
@Injectable()
export class HolidayService {  
  //baseUrl:string ='https://localhost:44358';
  constructor(private http: HttpClient) { }

  getHttpHeader(params = {}) {
    let httpHeaders = new HttpHeaders({
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials":"true",
      "X-Requested-With": "XMLHttpRequest"
    });
    let options =
    {
      headers: httpHeaders,
      params: params
    };
    return options;
  }

    getAllUsers(): Observable<any> {
        return this.http.get<any>(AppConsts.API_SERVICE_URL +'account/Get', this.getHttpHeader());
    }

  getAllHolidays(): Observable<any>{
      return this.http.get<any>(AppConsts.API_SERVICE_URL+ 'holiday/all', this.getHttpHeader());
  }

  login(model: LoginModel): Observable<any>{
      return this.http.post<any>(AppConsts.API_SERVICE_URL +'/account/Login' , model);
  }

  saveUser(model: UserModel): Observable<any>{
    if(model.id)
    return this.http.post<any>( AppConsts.API_SERVICE_URL+'account/EditUser',model);
    return this.http.post<any>( AppConsts.API_SERVICE_URL+'account/Register',model);
  }

  deleteUser(userId: string): Observable<any>{
    let params = new HttpParams().set('userId', userId);

    return this.http.get<any>( AppConsts.API_SERVICE_URL+'account/DeleteUser', { params: params });
  }

  getUserById(userId: string): Observable<UserModel>{
    let params = new HttpParams().set('userId', userId);

    return this.http.get<UserModel>( AppConsts.API_SERVICE_URL+'account/GetUserById', { params: params });
    }

    getHolidaysByFilterRequest(request: HolidayFilterRequest): Observable<any> {
        let httpOptions = this.getHttpHeader(request);
        var result = this.http.get(AppConsts.API_SERVICE_URL+ 'holiday/allByFilterRequest', httpOptions);
        return result;

    }
    getAllHolidayTypes(): Observable<HolidayTypeModel[]> {
        return this.http.get(AppConsts.API_SERVICE_URL+'holidayType/all', this.getHttpHeader()) as Observable<HolidayTypeModel[]>;
    }
    saveHoliday(request: HolidayModelRequest): Observable<string> {
        let options = {
            headers: new HttpHeaders({
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "X-Requested-With": "XMLHttpRequest"
            })
        };

        const formData = new FormData();
        formData.append("dto", JSON.stringify(request.HolidayModel));
        if (request.File)
            formData.append('file', request.File, request.FileName);
        if (request.HolidayModel.id != null)
            return this.http.post<string>(AppConsts.API_SERVICE_URL + "holiday/Edit", formData, options);
        else
            return this.http.post<string>(AppConsts.API_SERVICE_URL + "holiday/Add", formData, options);
    }
    getHoliday(holidayId: string): Observable<any> {
        let httpOptions = this.getHttpHeader();
        httpOptions.params = _.assign({ holidayId: holidayId }, httpOptions.params);
        return this.http.get<HolidayModel>(AppConsts.API_SERVICE_URL + "holiday/GetById", httpOptions);
    }
    validateHoliday(holidayRequest: HolidayRequestModel): Observable<any> {
        let httpOptions = this.getHttpHeader();
        return this.http.post<any>(AppConsts.API_SERVICE_URL + "holiday/validate", holidayRequest, httpOptions);
    }

    getHolidaySynthesisByFilterRequest(request: HolidayFilterRequest): Observable<any> {
        let httpOptions = this.getHttpHeader(request);
        return this.http.get(AppConsts.API_SERVICE_URL + "holidaySynthesis/allByFilterRequest", httpOptions);
    }

    saveHolidaySynthesis(holidaySynthesis: HolidaySynthesisModel): Observable<number> {
        let httpOptions = this.getHttpHeader();

        if (holidaySynthesis.id > 0)
            return this.http.post<number>(AppConsts.API_SERVICE_URL + "holidaySynthesis/Edit", holidaySynthesis, httpOptions);
        else
            return this.http.post<number>(AppConsts.API_SERVICE_URL + "holidaySynthesis/Add", holidaySynthesis, httpOptions);
    }
    cancelHoliday(holiday: HolidayModel): Observable<HolidayModel> {
        let httpOptions = this.getHttpHeader();
        return this.http.post<HolidayModel>(AppConsts.API_SERVICE_URL + "holiday/cancel", holiday, httpOptions);
    }

    checkValidity(request: HolidayFilterRequest): Observable<any> {
        let httpOptions = this.getHttpHeader(request);
        return this.http.get(AppConsts.API_SERVICE_URL + 'holiday/checkValidity', httpOptions);
    }

    getNumberOfDay(holiday: HolidayModel): Observable<number> {
        let httpOptions = this.getHttpHeader();
      
       return this.http.post<number>(AppConsts.API_SERVICE_URL + 'holiday/numberOfDay', holiday, httpOptions);
          
        }

} 
