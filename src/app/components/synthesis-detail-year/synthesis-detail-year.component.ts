import { MessageService, ConfirmationService, LazyLoadEvent } from 'primeng/api';
import { Component, OnInit, Input, ViewChild, ViewContainerRef, ComponentFactoryResolver, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { HolidayTypeModel } from '../../models/holiday/holidayType.model';
import { HolidaySynthesisModel } from '../../models/holiday/holidaySynthesis.model';
@Component({
  selector: 'app-synthesis-detail-year',
  templateUrl: './synthesis-detail-year.component.html',
  styleUrls: ['./synthesis-detail-year.component.css']
})
export class SynthesisDetailYearComponent  implements OnInit {
  @ViewChild('popinContent', {
    read: ViewContainerRef,
    static: true
  }) popinContainerRef: ViewContainerRef
  Type: HolidayTypeModel;
  validHolidays: any[];
  rowGroupMetadata: any;
  tmpHolidaySynthesisList: HolidaySynthesisModel[]
  sidebar = false;
  title = '';
  hasSynthesis: boolean = true;
  isPaidHoliday: boolean = false;
  hs: HolidaySynthesisModel;
  _HolidaySynthesis: HolidaySynthesisModel;

  @Input()
  set HolidaySynthesis(value: HolidaySynthesisModel) {
      this._HolidaySynthesis = value;
    this.hs = value;
  }
  get HolidaySynthesis(): HolidaySynthesisModel {
    return this._HolidaySynthesis;
  }

  constructor(private route: ActivatedRoute
   
  ) {
  }

  ngOnInit() {
    
      if (this.hs != null) {
      this.hasSynthesis = (this.hs.type.applicationId == 1 || this.hs.type.applicationId == 4) ? true : false;
    this.isPaidHoliday = (this.hs.type.applicationId == 1 && this.hs.yearDesignation =='N') ? true : false;
      }
  }
}
