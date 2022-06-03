
export class HolidayRequestModel {
    HolidayId: string;
    ValidatorEmail: string;
    HolidayStatusId: number;
    ReasonValidator: string; 
}

export  enum HolidayStatusEnum {
  HOLIDAY_PENDING_VALIDATION = 1,
  HOLIDAY_VALIDATED = 3,
  HOLIDAY_REFUSED = 2,
  HOLIDAY_PENDING_CANCELATION = 4,
  HOLIDAY_CANCELED = 5      
}
