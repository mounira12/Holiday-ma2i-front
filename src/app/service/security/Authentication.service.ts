import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";

import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import * as _ from "lodash";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseService } from "../common/base.service";
import { AppConsts } from "src/app/models/common/app-consts";
import { UserModel } from "src/app/models/user.model";
import { LoginUserRequestModel } from "src/app/models/LoginUserRequestModel";
import { LocalUserDataModel } from "src/app/models/localUserData.model";
import { ResetPasswordModel } from "src/app/models/ResetPasswordModel";

@Injectable()
export class AuthenticationService extends BaseService {
  authenticationState = new BehaviorSubject(false);
  isLoginPage = new BehaviorSubject(false);
  currentUser = new BehaviorSubject("");
  sessionExpired = new BehaviorSubject<boolean>(false);
  sTimeout: number = 20 * 60 * 1000; // 20 min
  sessionTimeout: NodeJS.Timeout;
  _this = this;
  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

   signIn(response: any, email: string, rememberMe: any) {
       let localUserData = new LocalUserDataModel();
       localUserData.FullName = response.fullName;
    localUserData.Username = email;
    localUserData.RememberMe = rememberMe;
    localUserData.UserRoles = response.Roles;
    if (rememberMe) {
      localStorage.setItem(AppConsts.REMEMBER_ME, rememberMe);
      localStorage.setItem(AppConsts.USER_MAIL, email);
    } else {
      localStorage.removeItem(AppConsts.REMEMBER_ME);
      localStorage.removeItem(AppConsts.USER_MAIL);
    }
       localUserData.IsAuthenticated = true;
       localUserData.IsAdmin = response.isAdmin;
       this.setXsrf(response.XsrfToken);
    this.setLocalUserData(localUserData);
    this.authenticationState.next(true);
    this.isLoginPage.next(false);
    this.currentUser.next(email);
    
  }

  endSession() {    
   /*  window.location.href =
    "/decisiel/inactive?returnUrl=" + window.location.href + "&&timeDisconnect="; */    
    let sessionExpire = window["expiredSession"] as BehaviorSubject<boolean>;    
    sessionExpire.next(true);    
  }


  /*inactiveUser() {
    const userData = window["getLocalUserData"]();
    const isAuthenticated =
      userData && userData != null && userData.IsAuthenticated;
    if (!isAuthenticated) return false;
    const lastActivity = parseInt(
      window.sessionStorage.getItem("lastActivity")
    );
    const currentTime = new Date().getTime();
    const timeLastActivity = lastActivity + parseInt(window["sTimeout"]);
    if (timeLastActivity <= currentTime) {
      window["endSession"]();
    } else {
      const diffTimeout = timeLastActivity - currentTime;
      this.sessionTimeout = setTimeout((res) => {
        window["InactiveUser"]();
      }, diffTimeout / 2);
    }
  }*/

  setXsrf(XsrfToken: string) {
    sessionStorage.setItem("XSRF-TOKEN", XsrfToken);
  }

  GetAntiforgery(): Observable<Object> {
    return this.http.get(
      environment.API_SERVICE_URL + "Security/antiforgery",
      this.getHttpHeader(false)
    );
  }

 

  login(credentials: LoginUserRequestModel): Observable<Object> {
      if (credentials.Password === null || credentials.UserName === null)
      throw "Please insert credentials";
    else {
      return this.http.post(
        environment.API_SERVICE_URL + "account/Login",
        credentials,
        this.getHttpHeader(false)
      );
    }
  }

 

  IsAuthenticated() {
    const userData = this.getLocalUserData();
    return userData && userData != null && userData.IsAuthenticated;
  }
/*
  register(credentials: StoreUser) {
    let httpOptions = this.getHttpHeader();

    if (
      credentials.Nom === null ||
      credentials.Prenom === null ||
      credentials.Password === null ||
      credentials.Email === null
    ) {
      throw "Merci de vérifier vos saisies.";
    } else {
      return this.http.post(
        environment.API_URL + "account/register",
        credentials,
        httpOptions
      );
    }
  }
*/
  updateMySettings(credentials: UserModel) {
    let httpOptions = this.getHttpHeader();

    return this.http.post(
      environment.API_URL + "account/updateSettings",
      credentials,
      httpOptions
    );
  }

  SendPasswordResetLink(data: string) {
    let httpOptions = this.getHttpHeader();

    return this.http.post(
      environment.API_URL + "account/SendPasswordResetLink",
      JSON.stringify(data),
      httpOptions
    );
  }

  
  getCurrentUser() {
    let httpOptions = this.getHttpHeader();

    return this.http.post(
      environment.API_URL + "account/getCurrentUser",
      null,
      httpOptions
    );
  }

 

  /*logoff(): Observable<any> {
    let httpOptions = this.getHttpHeader();

    const userData = this.getLocalUserData();
    return this.http.post(
      environment.API_URL + "account/LogOff",
      JSON.stringify(userData.UserEMail),
      httpOptions
    );
  }
*/
  
  

  
  getLocalUserData(): LocalUserDataModel {
    return JSON.parse(
      sessionStorage.getItem(AppConsts.TOKEN_KEY)
    ) as LocalUserDataModel;
  }

  setLocalUserData(userData: LocalUserDataModel) {
    sessionStorage.setItem(AppConsts.TOKEN_KEY, JSON.stringify(userData));
      sessionStorage.setItem(AppConsts.CurrentEmail, userData.Username);
  }
 

  hasPermission(roles: string[]) {
    const localUserData = this.getLocalUserData();

    return (
      this.IsAuthenticated() &&
      localUserData.UserRoles != null &&
      _.intersection(localUserData.UserRoles, roles).length > 0
    );
  }

  setNewPassword(resetPassword: ResetPasswordModel) {
    return this.http.post(
        environment.API_SERVICE_URL + "account/updatepassword",resetPassword,   this.getHttpHeader(false)
    );
}
}
