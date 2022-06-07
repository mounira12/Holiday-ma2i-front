import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { FormGroup, Validators, NgForm } from '@angular/forms';
import * as _ from 'lodash';
import { HolidayModel, HolidayModelRequest } from '../../models/holiday/holiday.model';
import { HolidayTypeModel } from '../../models/holiday/holidayType.model';
import { AppConsts, USER_ROLES } from '../../models/common/app-consts';
import { UserModel } from '../../models/user.model';
import { DateTimeService } from '../../service/datetime.service';
import { HolidayService } from '../../service/holiday.service';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { LoaderService } from '../common/loader';
import { UserService } from '../../service/user.service';
import { HolidayFilterRequest } from '../../models/holiday/holidayFilterRequest.model';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['./edit-form.component.css']
})
export class EditFormComponent implements OnInit, OnDestroy {
    IsAdmin: boolean;
    userEmail: string;
  @Input() title: string;
  @Input() disabled: boolean;
  private _isPortage: boolean;

  @Input()
  set isPortage(value: boolean) {
    this._isPortage = value;
  }
  get isPortage(): boolean { return this._isPortage; }
 
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
    private _holidayId: string;
    holiday: HolidayModel;
  _holidayTypeModel: HolidayTypeModel;
  _NumberOfDay: Number;
  startDate: Date;
  endDate: Date;
  MinDate: Date;
  MaxDate: Date;
  file: File;
  startDateIsFullDay: boolean=true;
  endDateIsFullDay: boolean=true;
  types: HolidayTypeModel[];
  adminHolidays: any[] = [USER_ROLES.RESPONSABLE_CONGE];
    haspermission = true;//this.authenticateService.hasPermission(this.adminHolidays);
  disabledCollaborator:boolean;  
    allCollaborators: UserModel[];
    filterCollaboratorCollection: UserModel[];

    @Input()
    set holidayId(value: string) {
        this._holidayId = _.clone(value);
        this.initData();
    }
    get holidayId(): string { return this._holidayId; }

  
  set HolidayTypeModel(value : HolidayTypeModel){
    this._holidayTypeModel = value;
  }
  get HolidayTypeModel():HolidayTypeModel{
    return this._holidayTypeModel;
  }

  constructor(private messageService: MessageService,private confirmationService: ConfirmationService,private holidayService: HolidayService,
    private loaderService: LoaderService,public dateTimeService: DateTimeService,private authenticateService: AuthenticationService,private collaboratorService: UserService) {

      this.authenticateService.authenticationState.subscribe(() => {
          var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
          this.IsAdmin = jwtToken == null ? '' : jwtToken.IsAdmin;
          this.userEmail = jwtToken == null ? '' : jwtToken.Username;         
      });
      
  } 

  ngOnDestroy(): void {
    this.holiday = null;
  }

  ngOnInit() {    
    this.getHolidayTypes();
    this.loadColloborators();
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

  save(form: NgForm){
    let controleDateMessage = { severity: 'error', summary: "Veuillez saisir une date fin supérieure à la date début" };
    let controleChevauchement = { severity: 'error', summary: "Veuillez vérifier les dates de la demande de congé. Un chevauchement a été detecté avec d'autres demandes de congé." };
    let controleColaborateur = { severity: 'error', summary: "Veuillez choisir un collaborateur de la liste" };
    let controleNbreJour = { severity: 'error', summary: "Impossible d'ajouter une demande de congé avec nombre de jours de congés 0" };
    let is_validCollaborateur = true;
    
    if (this.authenticateService.hasPermission(this.adminHolidays))
    {
      if (this.holiday.User == null  || !this.holiday.User.id )
        is_validCollaborateur = false; 
    }
    if (this.holiday.numberOfDay == 0) {
      this.messageService.add(controleNbreJour);
    }
    else if (!is_validCollaborateur)
    {
      this.messageService.add(controleColaborateur);
    }
    else if (this.startDate > this.endDate) {
      this.messageService.add(controleDateMessage);
    }
    else {
      var request = new HolidayFilterRequest();
      request.FilterStartDate = this.dateTimeService.utcFormatDate(this.holiday.startDate);
      request.FilterEndDate = this.dateTimeService.utcFormatDate(this.holiday.endDate);
      if (this.authenticateService.hasPermission(this.adminHolidays)) {
        request.FilterUserId = this.holiday.User.id;
      }
      if (this.holiday.id != null )
      request.FilterHolidayId = this.holiday.id;
      this.holidayService.checkValidity(request).subscribe(response => {
        if (response == true) {
          this.confirmationService.confirm({
            message: `Voulez-vous vraiment enregistrer ?`,
            accept: () => {
              this._save(form);
            }
          });
        }
        else { this.messageService.add(controleChevauchement) }
      });
    }
  }

  cancel(form: NgForm){
    this.onCancel.emit(null);
  }

  _save(form: NgForm){
    let message = (this.holiday.id) ? "Vos modifications ont été sauvegardées" : "Votre demande de congé a été sauvegardée"
    let successMessage = {severity:'success', summary: message};
    let errorMessage = {severity:'error', summary:"Une erreur est surevenue lors de votre sauvegarde"};
    this.loaderService.showLoader("Sauvegarde en cours");
      this.holiday.type = this.HolidayTypeModel;
      this.holiday.UserEmail = this.userEmail;
    let request = new HolidayModelRequest();
    if(this.file){ 
      request.File = this.file;
      request.FileName = this.file.name;
    }
    request.HolidayModel = this.holiday;
    this.holidayService.saveHoliday(request).subscribe((response: string) => {
        this.loaderService.hideLoader();
       if (response) {
        this.messageService.add(successMessage);
        this.onSave.emit();
      }
      else {
        this.messageService.add(errorMessage);
      }
    });
  }

  onUpload(event) {
    this.file = event.files[0];
  }

    initData() {
        if (this._holidayId)
            this.holidayService.getHoliday(this._holidayId).subscribe((response: HolidayModel) => {
                this.loaderService.hideLoader();
                if (response) {
                    this.holiday = response;
                    if (this.holiday.startDate && this.holiday.startDate != null) {
                        this.startDate = this.dateTimeService.moment(this.holiday.startDate).toDate();
                    }
                    if (this.holiday.endDate && this.holiday.endDate != null) {
                        this.endDate = this.dateTimeService.moment(this.holiday.endDate).toDate();
                    }
                    if (this.holiday.type && this.holiday.type != null) {
                        const filterHoliday = _.filter(this.types, (type: any) => {
                            return type.id == this.holiday.type.id;
                        });
                        this.HolidayTypeModel = filterHoliday != null && filterHoliday.length > 0 ?
                            filterHoliday[0] : null;
                    }

                    this.holiday.numberOfDay = this.holiday.numberOfDay;
                    if (this.holiday.startDateIsFullDay != null)
                        this.startDateIsFullDay = this.holiday.startDateIsFullDay;
                    if (this.holiday.endDateIsFullDay != null)
                        this.endDateIsFullDay = this.holiday.endDateIsFullDay;
                    if (this.holiday.id != null)
                        this.disabledCollaborator = true;
                    else
                        this.disabledCollaborator = false;


                }
            });
        else {

            this.holiday = new HolidayModel();
            this.startDate = null;
            this.endDate = null;
            this.startDateIsFullDay = true;
            this.endDateIsFullDay = true;
            this.disabledCollaborator = false;
            this.HolidayTypeModel = null;
        }
  }
  getNumberOfDay() {
    if (this.startDate != null && this.endDate != null) {
      this.holiday.startDate = this.dateTimeService.utcFormatDate(this.startDate);
      this.holiday.endDate = this.dateTimeService.utcFormatDate(this.endDate);
      this.holiday.startDateIsFullDay = this.startDateIsFullDay;
      this.holiday.endDateIsFullDay = this.endDateIsFullDay;
      this.holiday.type = this.HolidayTypeModel;
      this.holidayService.getNumberOfDay(this.holiday).subscribe((response: number) => {
        this.loaderService.hideLoader();
        if (response >= 0) {
          this.holiday.numberOfDay = response;
        }
      });
    }
  }
  
    loadColloborators() {
    return this.collaboratorService.all()
        .toPromise()
        .then((users: UserModel[]) => {
            this.allCollaborators = users;
      })
  } 
  searchCollaborator(event: any) {
      let lowerQuery = _.toLower(event.query);
      
      this.filterCollaboratorCollection = _.filter(this.allCollaborators, (collaborator: UserModel) => {
          var aa = this.allCollaborators;
          return _.toLower(collaborator.designation).indexOf(lowerQuery) >= 0;
    });
  }

  numbersOnly(event: any) {
    let charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  onChange(){
    if (this.startDate && this.endDate)  this.getNumberOfDay();
  }
}
