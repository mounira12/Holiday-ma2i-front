import { UserModel } from 'src/app/models/user.model';
import { HolidayTypeModel } from './holidayType.model';
 
export class HolidayModel  {

  constructor() {
  }
  id: string;
  statusId: number;
  OldStatusId: number;
  startDate: string;
  endDate: string;
  responseDate: Date | null;
  startDateIsFullDay: boolean;
  endDateIsFullDay: boolean;
  numberOfDay: number | null;
  TypeId: number;
    userFullName: string;
    userId: string;
    user: UserModel;
    Validator: UserModel;
    ValidatorDesignation: string;
    type: HolidayTypeModel;
    ReasonUser:string;
    ReasonValidator: string;
    UserEmail: string;
    auditDateCreation: Date | null;
}

export class HolidayModelRequest {
  HolidayModel: HolidayModel;
  File: File;
  FileName: string;
}
