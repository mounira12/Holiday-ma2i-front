import { UserModel } from 'src/app/models/user.model';
import { HolidayTypeModel } from './holidayType.model';
 
export class HolidaySynthesisModel  {

  constructor() {
  }
  id: number;
  year: number;
  yearDesignation: string;
  period: string;
  numberOfDayAutorized: number;
  numberOfDayTaken: number;
  numberOfDayRemaining: number;
  user: UserModel;
  type: HolidayTypeModel;
}
