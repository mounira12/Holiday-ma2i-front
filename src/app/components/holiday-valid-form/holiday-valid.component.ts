import { Component, OnInit, ViewChild, ComponentFactoryResolver, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgForm } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as _ from 'lodash';
import { HolidayModel } from '../../models/holiday/holiday.model';
import { HolidayRequestModel, HolidayStatusEnum } from '../../models/holiday/holidayRequest.model';
import { LoaderService } from '../common/loader';
import { HolidayService } from '../../service/holiday.service';
import { DateTimeService } from '../../service/datetime.service';
import { AppConsts } from '../../models/common/app-consts';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { HolidayFilterRequest } from 'src/app/models/holiday/holidayFilterRequest.model';
import * as moment from 'moment';

@Component({
  selector: 'app-holiday-valid',
  templateUrl: './holiday-valid.component.html',
  styleUrls: ['./holiday-valid.component.scss'] 
})

export class HolidayValidComponent implements OnInit {

  private _holiday: HolidayModel;
  private _submitted: boolean = false;
  holidayRouteId: string;  
  _holidayRequest: HolidayRequestModel;
  StartDate: Date;
  EndDate: Date; 
  ResponseDate:Date;
  SendDate:Date;
  holidayStatusRefused: any = HolidayStatusEnum.HOLIDAY_REFUSED;
  holidayStatusValidated: any = HolidayStatusEnum.HOLIDAY_VALIDATED;
  holidayStatusPending: any = HolidayStatusEnum.HOLIDAY_PENDING_VALIDATION;
  holidayStatusCanceled: any = HolidayStatusEnum.HOLIDAY_CANCELED;
  holidayStatusPendingCancelation: any = HolidayStatusEnum.HOLIDAY_PENDING_CANCELATION;
  oldStatus: any;
  @ViewChild('f', { static: true }) holidayForm: NgForm;
  
  set holiday(value: any) {
    this._holiday = value;     
  }
  get holiday(): any { return this._holiday; }
  
  @Input()
  set submitted(value: any) {
    this._submitted = value;
  }

  holidayReasonValidator: any;

  get submitted(): any { return this._submitted; }

  @Output() validate = new EventEmitter<boolean>();
    validatorEmail: string;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private loaderService: LoaderService,
    private holidayService: HolidayService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private location: Location,
      public dateTimeService: DateTimeService, private authenticateService: AuthenticationService) {
  }

  ngOnInit() {
      this.authenticateService.authenticationState.subscribe(() => {
          var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
          this.validatorEmail = jwtToken == null ? '' : jwtToken.Username;
      });
    this.holidayRouteId = this.route.snapshot.paramMap.get('id');
    

  this.init(); 
}


init() {
  this.loaderService.showLoader(); 
  if (this.holidayRouteId) {
    this.loadHoliday()
      .then(() => this.loaderService.hideLoader());
  } 
}

initData() {
  if (this.holiday && this.holiday != null) {
      if (this._holiday.startDate && this._holiday.startDate != null) {
          this.StartDate = this.dateTimeService.moment(this.holiday.startDate).toDate();
      }
     
    if (this._holiday.endDate && this._holiday.endDate != null) {
      this.EndDate = this.dateTimeService.moment(this.holiday.endDate).toDate();
    }
    if (this._holiday.responseDate && this._holiday.responseDate != null) {
      this.ResponseDate = this.dateTimeService.moment(this.holiday.responseDate).toDate();
    }

      if (this._holiday.auditDateCreation && this._holiday.auditDateCreation != null) {
          this.SendDate = this.dateTimeService.moment(this.holiday.auditDateCreation).toDate();
    } 
  }
  else {
    this.StartDate = null;
    this.EndDate = null;
    this.ResponseDate = null;
    this.SendDate = null;
  }

  this.loadSynthesis();
  }

  loadSynthesis()
  { 
    var request = new HolidayFilterRequest();
    request.FilterUserId = this.holiday.userId ;
    request.FilterYear = moment().locale('fr').year();
    return request;
   /* this.holidayService.getHolidaySynthesisByFilterRequest(request).subscribe(response => {
      this.listHolidaySynthesis = response;
      if (this.listHolidaySynthesis.length>0)
        this.user = this.listHolidaySynthesis[0].user;
      this.YearCols = this.getYearCols();
        this.loaderService.hideLoader();
      */
      }
  loadHoliday() {
    return this.holidayService.getHoliday(this.holidayRouteId)
    .toPromise()
    .then(holiday => {
      this.holiday = holiday;
      this.oldStatus = holiday.OldStatusId;
      this.initData();
    });
  }  

  validateHoliday(statusId) {
    let messagevalidation = "";
    let messsageSuccess = "";
    if (statusId == undefined || statusId == null) return false;

    if (statusId == HolidayStatusEnum.HOLIDAY_VALIDATED)
    {
      messagevalidation = `Voulez-vous vraiment valider la demande de congé ?`;
      messsageSuccess = `La demande de congé a été validée`;
    }
    else
    {
      messagevalidation = `Voulez-vous vraiment refuser la demande de congé ?`;
      messsageSuccess = `La demande de congé a été refusée`;
    }

    this.confirmationService.confirm({
      message: messagevalidation,
      accept: () => {
        this._holidayRequest = new HolidayRequestModel();
        this._holidayRequest.HolidayId = this.holidayRouteId;
        this._holidayRequest.ReasonValidator = this.holiday.ReasonValidator;
        this._holidayRequest.HolidayStatusId = statusId;
        this._holidayRequest.ValidatorEmail = this.validatorEmail;
         
        let successMessage = { severity: 'success', summary: messsageSuccess };
        let errorMessage = { severity: 'error', summary: "Une erreur est surevenue lors de votre sauvegarde" };
        this.holidayService.validateHoliday(this._holidayRequest).subscribe((response: any) => {
          this.loaderService.hideLoader();
        if (response) {
          setTimeout(() => { this.messageService.add(successMessage);  }, 400);
          this.location.back();
          // this.router.navigate(['../..'], { relativeTo: this.route });
              return true;
          }
          else {
              this.messageService.add(errorMessage);
              return false;
          }
        });

      }
    }); return false;
  }

  validateCancelationHoliday(statusId) {
    let messagevalidation = "";
    let messsageSuccess = "";
    if (statusId == undefined || statusId == null) return false;

    if (statusId == HolidayStatusEnum.HOLIDAY_CANCELED) {
      messagevalidation = `Voulez-vous vraiment valider la demande d'annulation de congé ?`;
      messsageSuccess = `La demande d'annulation de congé a été acceptée`;
    }
    else
    {
      messagevalidation = `Voulez-vous vraiment refuser la demande d'annulation de congé ?`;
      messsageSuccess = `La demande d'annulation de congé a été refusée`;
    }
    this.confirmationService.confirm({
      message: messagevalidation,
      accept: () => {
        this._holidayRequest = new HolidayRequestModel();
        this._holidayRequest.HolidayId = this.holidayRouteId;
        this._holidayRequest.ReasonValidator = this.holiday.ReasonValidator;
          this._holidayRequest.HolidayStatusId = statusId;
          this._holidayRequest.ValidatorEmail = this.validatorEmail
        let successMessage = { severity: 'success', summary: messsageSuccess };
        let errorMessage = { severity: 'error', summary: "Une erreur est surevenue lors de votre sauvegarde" };
        this.holidayService.validateHoliday(this._holidayRequest).subscribe((response: number) => {
          this.loaderService.hideLoader();
          if (response) {
            setTimeout(() => { this.messageService.add(successMessage); }, 400);
            this.location.back(); 
        }
          else {
            this.messageService.add(errorMessage);
          }
        });
      }
    }); return false;
  }
  back() {
    this.location.back();
  }
  synthesis() {
    this.router.navigate(['../../synthesis/' + this.holiday.userId], { relativeTo: this.route });
  }
  }
