import { Component, OnInit, AfterViewInit, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { Location } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import * as _ from 'lodash';
import { HolidayService } from 'src/app/service/holiday.service';
import { LoaderService } from 'src/app/components/common/loader';
import { ConfirmationService, LazyLoadEvent, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from 'src/app/models/user.model';
import { LabelValueModel } from 'src/app/models/common/label-value.model';
import { AppConsts, USER_ROLES } from 'src/app/models/common/app-consts';
import { DateTimeService } from 'src/app/service/datetime.service';
import { AuthenticationService } from 'src/app/service/security/Authentication.service';
import { UserService } from 'src/app/service/user.service';
import { Table } from 'primeng/table';
import { HolidayStatusEnum } from '../../models/holiday/holidayRequest.model';
import { HolidayModel } from '../../models/holiday/holiday.model';
import { HolidayTypeModel } from '../../models/holiday/holidayType.model';
import { HolidayFilterRequest } from '../../models/holiday/holidayFilterRequest.model';
@Component({
  selector: 'app-holidays-home',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class HolidaysHomeComponent  implements OnInit, AfterViewInit,AfterViewChecked {
    years = [];
    IsAdmin: boolean;
  filterYear: number;
  listHolidays: HolidayModel[] = [];
  allListHolidays: HolidayModel[] =[];
  minFilterSize = 2;
  pageSize = 15;
  totalRecords: number = 0;
  selectedItem: HolidayModel;
  holiday: HolidayModel;
  sidebar = false;
  title = '';
  filterStartDate: Date;
  filterEndDate: Date;
  filterCollaborator: UserModel | string;
  filterCollaboratorCollection: UserModel[];
  filterStatus: HolidayStatusEnum;
  allCollaborators: UserModel[];
  holidayStatusPending: HolidayStatusEnum = HolidayStatusEnum.HOLIDAY_PENDING_VALIDATION;
  holidayStatusRefused: HolidayStatusEnum = HolidayStatusEnum.HOLIDAY_REFUSED;
  holidayStatusPendingCancelation: HolidayStatusEnum = HolidayStatusEnum.HOLIDAY_PENDING_CANCELATION;
  holidayStatusCanceled: HolidayStatusEnum = HolidayStatusEnum.HOLIDAY_CANCELED;
  holidayStatusValidated: HolidayStatusEnum = HolidayStatusEnum.HOLIDAY_VALIDATED;
  adminHolidays: any[] = [USER_ROLES.RESPONSABLE_CONGE];
  validHolidays: any[];
  haspermission = this.authenticateService.hasPermission(this.adminHolidays);
  haspermissioncrm: boolean; 
  readOnlyHoliday: boolean;
  userId:string;
  year:number;
  status: LabelValueModel[];
  prefixeredirection: string = '';
  filterType: HolidayTypeModel;
    types: HolidayTypeModel[];
    emailConnectedUser: string;

  constructor(private holidayService: HolidayService, private loaderService: LoaderService, 
              private messageService: MessageService, private confirmationService: ConfirmationService,
    private location: Location, private router: Router, private authenticateService: AuthenticationService,
      public dateTimeService: DateTimeService, private UserModel: UserService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef) {
    
  }

    ngOnInit() {

        this.authenticateService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            this.emailConnectedUser = jwtToken == null ? '' : jwtToken.Username;
            this.IsAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;

        });
    this.haspermissioncrm = true;
    this.validHolidays = [USER_ROLES.RESPONSABLE_CONGE];
    
    this.userId =  this.route.snapshot.paramMap.get('userid');
    this.year =  this.route.snapshot.params['year']; 
    this.selectedItem = new HolidayModel();
    this.loadYear();
    this.status = this.getStatus();
    this.getHolidayTypes();
    if (this.userId != null && this.userId.length > 0)
    {
      this.prefixeredirection = '../../';
      }


      this.loadHolidays(0);
  }

  ngAfterViewInit() { 
    //this.loadColloborators();
 }
 ngAfterViewChecked()
  {  
    this.cdRef.detectChanges();
  }

  

  initHolidays(firstPage) {
    this.loadHolidays(firstPage);
    this.holiday = new HolidayModel();
    this.selectedItem = null;
  }

  valid() {
    if (this.selectedItem != null) {
     
        this.router.navigate([this.prefixeredirection + '../valid/' + this.selectedItem.id], { relativeTo: this.route });
      }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Veuillez sélectionner une demande de congé' });
    }
  }
  synthesis() {
    if (this.selectedItem != null)
    {
     
        this.router.navigate([this.prefixeredirection + '../synthesis/' + this.selectedItem.userId], { relativeTo: this.route });
    }
    else
    {
        this.router.navigate([this.prefixeredirection + '../synthesis'], { relativeTo: this.route });
    }
  }

  edit() {
    if (this.selectedItem != null) {
      this.sidebar = true;
      this.holiday = this.selectedItem;
      if (this.holiday.statusId == this.holidayStatusPending)
        this.readOnlyHoliday = false;
      else
        this.readOnlyHoliday = true;
      this.title = "Modification d'une demande de congé";
    }
    else {
      this.messageService.add({ severity: 'warn', summary: 'Veuillez sélectionner une demande de congé' });
    }
  }

  cancelHoliday() {
    if (this.selectedItem != null) {
      this.holiday = this.selectedItem;
        if (this.holiday.statusId == this.holidayStatusCanceled) {
        this.messageService.add({ severity: 'warn', summary: `Impossible d'annuler une demande de congé annulée` });
      }
        else if (this.holiday.statusId == this.holidayStatusRefused) {
        this.messageService.add({ severity: 'warn', summary: `Impossible d'annuler une demande de congé refusée` });
      }
        else if (this.holiday.statusId == this.holidayStatusPendingCancelation) {
        this.messageService.add({ severity: 'warn', summary: `La demande de congé est en cours d'annulation` });
      }
      else {
        this.confirmationService.confirm({
          message: `Voulez-vous vraiment annuler la demande de congé ?`,
          accept: () => {
            let errorMessage = { severity: 'error', summary: "Une erreur est surevenu lors de votre demande" };
            let successMessage = { severity: 'success', summary: "La demande d'annulation de congé a été envoyée" };
            var holidayRequest = new HolidayModel();
              holidayRequest.id = this.holiday.id;
              holidayRequest.UserEmail = this.emailConnectedUser;
              if (this.holiday.statusId == this.holidayStatusPending) {
                  holidayRequest.statusId = this.holidayStatusCanceled;
              successMessage = { severity: 'success', summary: "La demande de congé a été annulée" };
            }
            else
            {
                  holidayRequest.statusId = this.holidayStatusPendingCancelation;
            }
              this.holidayService.cancelHoliday(holidayRequest).subscribe((response: HolidayModel) => {
                  this.loaderService.hideLoader();
                  alert(response);
                  if (response) {
                      this.messageService.add(successMessage);
                      this.initHolidays(0);
                  }
                  else {
                      this.messageService.add(errorMessage);
                  }
              });
          }
        });
      }
    }
    else
    {
      this.messageService.add({ severity: 'warn', summary: 'Veuillez sélectionner une demande de congé' });
    }
  }

  add(){
    this.sidebar = true;
    this.title = "Création d'une demande de congé";

    this.holiday = new HolidayModel();
    this.readOnlyHoliday = false;
  }

  save() {
      this.initHolidays(0);
      this.sidebar = false;
    
    this.readOnlyHoliday = false;
  } 

  cancel() {
    this.sidebar = false;
  }

  back(){
    this.location.back(); 
  }

  searchCollaborator(event: any) {
    // Get all dirigeants if they dont exist.
    let lowerQuery = _.toLower(event.query);
    this.filterCollaboratorCollection = _.filter(this.allCollaborators, (collaborator: UserModel) => {
    return _.toLower(collaborator.designation).indexOf(lowerQuery) >= 0;
    });
  }
  loadColloborators() {
    return this.UserModel.all()
      .toPromise()
      .then((users: UserModel[]) => {
        this.allCollaborators = users;
        if (this.userId != null && this.userId.length > 0) 
        {
          this.filterCollaboratorCollection = _.filter(this.allCollaborators, (collaborator: UserModel) => {
            return _.toLower(collaborator.id).indexOf(this.userId) >= 0;
          });
          this.filterCollaborator=this.filterCollaboratorCollection[0];          
          this.initHolidays(0);
        }
      })
  } 
 
  loadHolidays(firstPage: number) {
    this.loaderService.showLoader();
    var request = this.createHolidayRequest(firstPage, this.pageSize);
    this.holidayService.getHolidaysByFilterRequest(request).subscribe(response => {
      this.totalRecords = response.totalCount;
        this.listHolidays = response.items;
        console.log(response.items)
      this.allListHolidays = response.items;
      this.loaderService.hideLoader();
    },
      (error) => {
        this.loaderService.hideLoader();
      });
  }
  
  createHolidayRequest(firstPage: number, pageSize: number): HolidayFilterRequest {
      var request = new HolidayFilterRequest();
      request.emailConnectedUser = this.emailConnectedUser;
    if (this.filterYear != null) {
      request.FilterYear = (this.filterYear as number);
    }
    if (this.filterStatus != null) {
      request.FilterStatus = (this.filterStatus);
    }
    if (this.filterType != null) {
      request.FilterTypeApplicationId = (this.filterType.applicationId);
    }
    if (this.filterStartDate != null)
      request.FilterStartDate = this.dateTimeService.utcFormatDate(this.filterStartDate);
    if (this.filterEndDate != null)
      request.FilterEndDate = this.dateTimeService.utcFormatDate(this.filterEndDate);
    if (this.filterCollaborator != null) {
        if (this.filterCollaborator['Id'] != null)
          request.FilterUserId = (this.filterCollaborator as UserModel).id;
        else
          request.FilterUserName = (this.filterCollaborator as string).toLowerCase();
      }
   
   /* request.SortColumn = this.sortField != undefined ? this.sortField : null;
    if (this.sortField != undefined)
      request.SortOrder = this.getSortDirection(this.sortOrder)*/
    request.PageNumber = firstPage;
    request.PageSize = pageSize;
    return request;
  }

  loadHolidaysLazy(event: LazyLoadEvent) {
      if (event && event != null) {
      //this.sortField = event.sortField;
   //   this.sortOrder = event.sortOrder;
      
      this.initHolidays(event.first);
    } 
  }

  onCollaboratorSelected(event) {
    const idCollaborator = event.Id;
    if (idCollaborator && idCollaborator !=null) {
     this.initHolidays(0);
    }
  }
  

  initFilters() {
    this.filterEndDate = null;
    this.filterStartDate = null;
    this.filterCollaborator = null;
    this.filterYear = null;
    this.filterStatus = null;
    this.filterType=null;
    this.initHolidays(0);
    return false;
  }

  info(){
    if(this.selectedItem != null){
      this.sidebar = true;
      this.holiday = this.selectedItem;
      this.readOnlyHoliday = true;
      this.title =  "Détails d'une demande de congé" ;
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Veuillez sélectionner une demande de congé' });
    }
  }

  /*export() {
    var request = this.createHolidayRequest(null, null);
    if (this.authenticateService.hasPermission(this.adminHolidays))
      this.holidayService.exportHolidayToExcel(request).then(response => {
        saveAs(response.document, response.fileName);});
    else
      this.holidayService.exportHolidayByUserIdToExcel(request).then(response => {
        saveAs(response.document, response.fileName);});
  }
*/
  loadYear() {
    this.years = this.dateTimeService.loadNextYearsFilterItems();
    if (this.year && this.year > 0) 
      this.filterYear =  Number(this.year);
  }

  getStatus() {
    return [
      new LabelValueModel("Envoyée", this.holidayStatusPending),
      new LabelValueModel("Acceptée", this.holidayStatusValidated),
      new LabelValueModel("Refusée", this.holidayStatusRefused),
      new LabelValueModel("En cours d'annulation", this.holidayStatusPendingCancelation),
      new LabelValueModel("Annulée", this.holidayStatusCanceled),
    ];
  }

   getHolidayTypes() {
     this.loaderService.showLoader();
     this.holidayService.getAllHolidayTypes().subscribe((response: any) => {
       this.types = response;
        this.loaderService.hideLoader(); 
      }, (error) => {
        this.loaderService.hideLoader();
      });    
  } 
}
