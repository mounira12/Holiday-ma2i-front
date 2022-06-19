import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';

import { FormGroup, Validators, NgForm } from '@angular/forms';
import * as _ from 'lodash';
import { HolidaySynthesisModel } from '../../models/holiday/holidaySynthesis.model';
import { HolidayService } from '../../service/holiday.service';
import { LoaderService } from '../common/loader';
import { DateTimeService } from '../../service/datetime.service';

@Component({
  selector: 'app-synthesis-edit-form',
  templateUrl: './synthesis-edit-form.component.html',
  styleUrls: ['./synthesis-edit-form.component.css']
})
export class SynthesisEditFormComponent  implements OnInit,OnDestroy {

  @Input() title: string;
  private _isPortage: boolean;

  private _holidaySynthesisSave;

  
  @Input() disabled: boolean;
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();
  private _holidaySynthesis: HolidaySynthesisModel;
  @Input()
  set holidaySynthesis(value: HolidaySynthesisModel) {
    this._holidaySynthesis = _.clone(value);
    this._holidaySynthesisSave = _.clone(value);
  }
  get holidaySynthesis(): HolidaySynthesisModel { return this._holidaySynthesis; }
  constructor(private messageService: MessageService,
              private confirmationService: ConfirmationService,
              private holidayService: HolidayService,
    private loaderService: LoaderService,
    public dateTimeService: DateTimeService) {
  } 

  ngOnDestroy(): void {
    this.holidaySynthesis = null;
  }

  ngOnInit() {
  }



  save(form: NgForm) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment enregistrer vos modifications ?`,
      accept: () => {
        this._save(form);        
      }
    });
  }

  cancel(form: NgForm){
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment annuler vos modifications ?`,
      accept: () => {
        this._cancel(form);
        this.holidaySynthesis = this._holidaySynthesisSave;
      }
    });
  }

  _save(form: NgForm) {

    let successMessage = { severity: 'success', summary: "Vos modifications ont été sauvegardées" };
    let errorMessage = { severity: 'error', summary: "Une erreur est surevenue lors de votre sauvegarde" };
    this.loaderService.showLoader("Sauvegarde en cours");
    this.holidayService.saveHolidaySynthesis(this.holidaySynthesis).subscribe((response: number) => {
      this.loaderService.hideLoader();
      if (response > 0) {
        this.messageService.add(successMessage);
        this.onSave.emit();
      }
      else {
        this.messageService.add(errorMessage);
      }
    });
  }

  

  _cancel(form: NgForm){
    this.onCancel.emit(null);
  }


  UpdateNumberOfDay(source: number) {
    
    if (source == 1)
      this._holidaySynthesis.numberOfDayRemaining = this._holidaySynthesis.numberOfDayAutorized - this._holidaySynthesis.numberOfDayTaken;
    else if (source == 2)
      this._holidaySynthesis.numberOfDayRemaining = this._holidaySynthesis.numberOfDayAutorized - this._holidaySynthesis.numberOfDayTaken;
    else if (source == 3)
      this._holidaySynthesis.numberOfDayTaken= this._holidaySynthesis.numberOfDayAutorized - this._holidaySynthesis.numberOfDayRemaining;
    }


    formatValue(value: any) {
       if (typeof value == 'string' || value instanceof String)
            value = value.replace(/\s/g, '');

        if (value != null && value != undefined && value != '') {
            let parsed = parseFloat(('' + value).replace(',', '.'));
            return parsed;
        }
        return 0;
    }

  }
