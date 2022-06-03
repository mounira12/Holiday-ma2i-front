import { MessageService, ConfirmationService, LazyLoadEvent  } from 'primeng/api';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import {Location} from '@angular/common';
import * as _ from 'lodash';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { LabelValueModel } from '../../models/common/label-value.model';
import { UserModel } from '../../models/user.model';
import { HolidaySynthesisModel } from '../../models/holiday/holidaySynthesis.model';
import { HolidayStatusEnum } from '../../models/holiday/holidayRequest.model';
import { DateTimeService } from '../../service/datetime.service';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { UserService } from '../../service/user.service';
import { AppConsts } from '../../models/common/app-consts';
import { HolidayFilterRequest } from '../../models/holiday/holidayFilterRequest.model';
import { HolidayService } from '../../service/holiday.service';
import { LoaderService } from '../common/loader';

@Component({
  selector: 'app-holidays-synthesis',
  templateUrl: './synthesis.component.html',
  styleUrls: ['./synthesis.component.css']
})
export class HolidaysSynthesisComponent  implements OnInit{
  YearCols: LabelValueModel[];
  currentEmail: string;
  user: UserModel;
  year: number;
  years: LabelValueModel[] = [];
  filterYear: LabelValueModel;
  listHolidaySynthesis: HolidaySynthesisModel[] = [];
  minFilterSize = 2;
  rowGroupMetadata: any;
  filterCollaborator: UserModel | string;
    filterCollaboratorCollection: UserModel[];
    allCollaborators: UserModel[];
  holidayStatusPending: any = HolidayStatusEnum.HOLIDAY_PENDING_VALIDATION;
  haspermission: boolean = false;
  validHolidays: any[];
  readOnlyHoliday: boolean;
  outputData: HolidaySynthesisModel;
  selectedTabIndexSubject: Subject<number>;
  userId: string;
  prefixeredirection: string = '';
  reload: boolean;
  constructor(private route: ActivatedRoute,private datetimeService: DateTimeService, private holidayService: HolidayService, private loaderService: LoaderService, 
              private location: Location, private router: Router, private authenticateService: AuthenticationService,
      public dateTimeService: DateTimeService, private collaboratorService: UserService) {
   
  }
  
  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('userid');
    if (this.userId != null && this.userId.length > 0) {
      this.prefixeredirection = '../';
    } this.loadColloborators();    
    this.loadYear();
      this.selectedTabIndexSubject = new Subject<number>();

      this.authenticateService.authenticationState.subscribe(() => {
          var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
          this.haspermission = jwtToken == null ? '' : jwtToken.IsAdmin;
      });
    
    }
  initSelectedUser() {
    if (this.userId != null)
    {
        this.filterCollaborator = _.filter(this.allCollaborators, (collaborator: UserModel) => {
        return collaborator.id == this.userId;})[0];
    }
    else
    {
      this.authenticateService.authenticationState.subscribe(() => {
        var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
        this.currentEmail = jwtToken == null ? '' : jwtToken.UserEMail;
      });
        this.filterCollaborator = _.filter(this.allCollaborators, (collaborator: UserModel) => {
        return collaborator.Email == this.currentEmail;})[0];
    }      
  }

  loadYear() {
    this.years = this.datetimeService.loadYearsFilterHolidaysItems();
    this.filterYear = this.years[0];
  }
   
  initHolidays() {
     this.loadHolidays();
  }

  searchCollaborator(event: any) {
      let lowerQuery = _.toLower(event.query);
      this.filterCollaboratorCollection = _.filter(this.allCollaborators, (collaborator: UserModel) => {
      return _.toLower(collaborator.designation).indexOf(lowerQuery) >= 0;
    });
  }
  loadColloborators() {
    return this.collaboratorService.all()
      .toPromise()
        .then((users: UserModel[]) => {
        this.allCollaborators = users;
        this.initSelectedUser();
        this.initHolidays();
      });
  }
  loadHolidays() {
    this.loaderService.showLoader();
    var request = this.createHolidayRequest();
    this.holidayService.getHolidaySynthesisByFilterRequest(request).subscribe(response => {
      this.listHolidaySynthesis = response;
      if (this.listHolidaySynthesis.length>0)
        this.user = this.listHolidaySynthesis[0].user;
      this.YearCols = this.getYearCols();
        this.loaderService.hideLoader();
    },
      (error) => {
        this.loaderService.hideLoader();
      });
  }
 
  createHolidayRequest(): HolidayFilterRequest {
    var request = new HolidayFilterRequest();
    if (this.filterCollaborator != null) {
        if (this.filterCollaborator['id'] != null)
            request.FilterUserId = (this.filterCollaborator as UserModel).id;
        else
          request.FilterUserName = (this.filterCollaborator as string).toLowerCase();
    }
  
    request.FilterYear = this.filterYear ? this.filterYear.value : 0;
    return request;
  }

  onCollaboratorSelected(event) {
    const idCollaborator = event.Id;
    if (idCollaborator && idCollaborator !=null) {
     this.initHolidays();
    }
  }

  initFilters() {
    this.filterCollaborator = null;
    this.loadYear();
    this.user = null;
    return false;
  }

  getsythesebyTypes(selecteddata: HolidaySynthesisModel) {
    if (selecteddata != null && selecteddata != undefined) {
      this.outputData = selecteddata;
      this.selectedTabIndexSubject.next(1);
    }
  }

  getYearCols() {
      var tmpYears = [];
      _.each(this.listHolidaySynthesis, (item) => {
      let exist = _.findIndex(tmpYears, (f) => {
        return f.label == item.yearDesignation;
      });
      if (exist < 0 && item.numberOfDayTaken != 0) tmpYears.push(new LabelValueModel(item.yearDesignation, item.year));
    });
    return tmpYears;
  }
  back() {
    this.location.back();
  }
  goToHolidays() {
    
      this.router.navigate([this.prefixeredirection + `../list/${this.user.id}/${this.filterYear.value}`], { relativeTo: this.route });
  }
  save() {
    this.initHolidays();
    this.reload = true;
    }
  
}
