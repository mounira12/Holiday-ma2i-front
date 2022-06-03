import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Component, OnInit, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { HolidayTypeModel } from '../../models/holiday/holidayType.model';
import { HolidaySynthesisModel } from '../../models/holiday/holidaySynthesis.model';
import { LabelValueModel } from '../../models/common/label-value.model';
import { UserModel } from '../../models/user.model';
import { AuthenticationService } from '../../service/security/Authentication.service';
import { AppConsts } from '../../models/common/app-consts';
@Component({
  selector: 'app-synthesis-detail',
  templateUrl: './synthesis-detail.component.html',
  styleUrls: ['./synthesis-detail.component.css']
})
export class SynthesisDetailComponent  implements OnInit {
  @ViewChild('popinContent', {
    read: ViewContainerRef,
    static: true
  }) popinContainerRef: ViewContainerRef
 
  Type: HolidayTypeModel;
  rowGroupMetadata: any;
  tmpHolidaySynthesisList: HolidaySynthesisModel[]
  Year1: LabelValueModel;
  Year2: LabelValueModel;
  sidebar = false;
  title = '';
  readOnlyHoliday: boolean;
    holidaySynthesis: HolidaySynthesisModel;
    haspermission: boolean;
  _DefaultYear: LabelValueModel;
  @Input()
    set DefaultYear(value: LabelValueModel) {
      this._DefaultYear = value;
      this.updateRowGroupMetaData();
    }
    get DefaultYear(): LabelValueModel {
        return this._DefaultYear;
    }

  @Input()
    user: UserModel;
  _HolidaySynthesisList: HolidaySynthesisModel[];
  @Input()
  set HolidaySynthesisList(value: HolidaySynthesisModel[]) {
    this._HolidaySynthesisList = value;
    this.initYears();
    this.user = value[0].user;
    this.updateRowGroupMetaData();
  }
  get HolidaySynthesisList(): HolidaySynthesisModel[] {
    return this._HolidaySynthesisList;
  }

  @Output() onSave: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  HolidaySynthesis(year: string, typeId: number): HolidaySynthesisModel[] {
    var tmp: HolidaySynthesisModel[];
    tmp=this.HolidaySynthesisList.filter(item => item.yearDesignation == year && item.type.id == typeId);
    return tmp;
  }

    HolidaySynthesisYear1(typeId: number): HolidaySynthesisModel{
     return this.HolidaySynthesisList.filter(item => item.year == this.DefaultYear.value - 1 && item.type.id == typeId)[0];
  }
  HolidaySynthesisYear2(typeId: number): HolidaySynthesisModel {
      return this.HolidaySynthesisList.filter(item => item.year == this.DefaultYear.value && item.type.id == typeId)[0];
  }

  HolidaySynthesisN: HolidaySynthesisModel[];
  updateRowGroupMetaData() {
      this.rowGroupMetadata = {};
    if (this.DefaultYear)
    this.tmpHolidaySynthesisList = this.HolidaySynthesisList.filter(item => item.yearDesignation == this.DefaultYear.label);
    if (this.tmpHolidaySynthesisList) {
      for (let i = 0; i < this.tmpHolidaySynthesisList.length; i++) {
        let rowData = this.tmpHolidaySynthesisList[i];
        let brand = rowData.type.id;
        if (i == 0) {
          this.rowGroupMetadata[brand] = { index: 0, size: 1 };
        }
        else {
          if (this.rowGroupMetadata[brand] != null) {
            this.rowGroupMetadata[brand].size++;
          }
          else
            this.rowGroupMetadata[brand] = { index: i , size: 1 };
        }
      }
    }
  }
  initYears() {
    var tmpYearsChart = [];
    var tmpYears = [];
    _.each(this.HolidaySynthesisList, (item) => {
      let exist = _.findIndex(tmpYears, (f) => {
        return f.label == item.yearDesignation;
      });
      if (exist < 0) {
        tmpYears.push(new LabelValueModel(item.yearDesignation, item.period));
        tmpYearsChart.push(new LabelValueModel(item.yearDesignation, item.year));
      }
    });
    this.Year1 = tmpYears[0];
    this.Year2 = tmpYears[1];
  }

    constructor(private route: ActivatedRoute, private router: Router, private authenticateService: AuthenticationService,    private location: Location
  ) {
  }

 ngOnInit() {
        this.authenticateService.authenticationState.subscribe(() => {
            var jwtToken = JSON.parse(sessionStorage.getItem(AppConsts.TOKEN_KEY));
            this.haspermission = jwtToken == null ? '' : jwtToken.IsAdmin;
        });
  }

  edit(holidaySynthesis) {
    this.readOnlyHoliday = false;
    this.sidebar = true;
    this.holidaySynthesis = holidaySynthesis;
    this.title = "Modification d'un solde de congés";
  }

  save() {
    this.sidebar = false;
    this.onSave.emit();
    this.readOnlyHoliday = false;
  }

  cancel() {
    this.sidebar = false;
  }

  back() {
    this.location.back();
  }
  goToHolidays(holidaySynthesis: HolidaySynthesisModel) {
      this.router.navigate([`../list/${holidaySynthesis.user.id}/${holidaySynthesis.year}`], { relativeTo: this.route });
   
  }
}
