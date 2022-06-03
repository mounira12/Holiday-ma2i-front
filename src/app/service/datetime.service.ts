import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as _ from 'lodash';
import { BaseService } from "./base.service";
import { LabelValueModel } from "../models/common/label-value.model";
import * as moment from "moment";

@Injectable()
export class DateTimeService extends BaseService {

  constructor(private http: HttpClient) {
    super();
  }

  fr = {
    firstDayOfWeek: 1,
    dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    dayNamesMin: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Jul', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    clear: 'effacer'
  };

  _months = {
    'janvier': 0,
    'février': 1,
    'mars': 2,
    'avril': 3,
    'mai': 4,
    'juin': 5,
    'juillet': 6,
    'août': 7,
    'septembre': 8,
    'octobre': 9,
    'novembre': 10,
    'décembre': 11
  }

  loadYearsFilterHolidaysItems(): any[] {
    let year = moment().year();
    let annees = [];
      for (let i = 0; i < 2; i++) {
          annees.push(new LabelValueModel(year.toString(), year));
      year = year - 1;
    }
    return annees;
  }
  loadYearsFilterItems():any[]{
    let year = moment().year();
    let annees = [];
    for(let i = 0; i < 4; i++){
      annees.push({label:year, value:year});
      year = year - 1;
    }
    return annees;
  }
  loadNextYearsFilterItems(): LabelValueModel[] {
    let year = moment().year()- 2;
    let annees = [];
    for (let i = 0; i < 4; i++) {
      annees.push({ label: year, value: year });
      year = year + 1;
    }
    return annees;
  }
  loadYears(from:number, to:number): LabelValueModel[] {
    let annees = [];
    let year = moment().year();
    if (year > to) to = year;
    for (let i = from; i <= to; i++) {
      annees.push({ label: i, value: i });
    }
    return annees;
  }

  loadMonthsFilterItems():LabelValueModel[]{
    moment.locale('fr');
    let months = moment.months();
    var monthsFilters = [];

    months.forEach(month => {
      monthsFilters.push({label:month, value:month})
    });
    return monthsFilters;
  }

  months(){
    moment.locale('fr');
    return moment.months();
  }

  monthsWithCapitalLetter():LabelValueModel[]{
    return _.map(this.fr.monthNames, (month, index) => {
      return {label:month, value:index};
    });
  }

  getMonthIndex(monthName:string){
    let month = _.toLower(monthName);

    return this._months[month];
  }

  getTime(date:string){
    return !_.isEmpty(date) ? moment(date).format('HH:mm') : null;
  }

  getDate(date:Date|string):string{
    return (date != null && date != undefined) ? moment(date).format('DD/MM/YYYY') : null;
  }

  toDate(date:Date|string,format:string=null):Date{
    if (format != null)
      return (date != null && date != undefined) ? moment(date,format).toDate() : null;
    else
      return (date != null && date != undefined) ? moment(date).toDate() : null;
  }

  midnight(){
    return moment({hour: 0, minute: 0}).toDate();
  }

  utcFormatDate(date:Date|string, endOfDay?: boolean){
    if(date == null || date == undefined)
      return null;

    if(endOfDay)
      return moment(date).endOf('day').utc(true).format("YYYY-MM-DD[T]HH:mm:ss")

    return moment(date).utc(true).format("YYYY-MM-DD[T]HH:mm:ss")
  }

  utcFormatTime(date:Date|string){
    return moment(date).utc(true).format("HH:mm")
  }

  utcNow(){
    return moment().utc(true).format("YYYY-MM-DD[T]HH:mm:ss")
  }

  moment(date:string|Date){
    return moment(date).locale('fr');
  }

  momentFromUtc(date:string|Date, format: string = ''){
    var offset = moment().utcOffset();
    var localText = moment.utc(date).locale('fr').utcOffset(offset).format(format);
    return localText;
  }

  now(){
    return moment().locale('fr');
  }

  getYears(startYear:number): any[]{
    let currentYear: number = this.now().year();
    let years: number[]= _.range(startYear, currentYear + 1);
    let annees: any[] = [];

    years.forEach((value) => {
      let stringValue = '' + value;
      annees.push( new LabelValueModel(stringValue, stringValue))
    });
    return annees;
  }

  getCurrentYear() {
    return this.now().year();
  }

  getPreviousYear() {
    return this.now().year() - 1;
  }

  getPreviousPreviousYear() {
    return this.now().year() - 2;
  }

  getYear(minus: number) {
    if (minus > 0)
      return this.now().year() - minus;
    else
      return this.getCurrentYear();
  }

  formatDate(date:Date|string, format:string){
    if(date == null || date == undefined)
      return null;
    return moment(date).format(format)
  }

  isValidDate(date:Date|string,format:string){
    return moment(date, format).isValid()
  }
}
