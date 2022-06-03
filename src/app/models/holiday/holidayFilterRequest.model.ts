import { PaginationModel } from 'src/app/models/common/pagination-model';
import { HolidayStatusEnum } from './holidayRequest.model';

export class HolidayFilterRequest extends PaginationModel {
    FilterStartDate: string;
    FilterEndDate: string;
    FilterUserName: string;
    FilterUserId: string;
    FilterCabinetName: string;
    FilterCabinetId: number;
    FilterYear: number;
    FilterHolidayId: string;
    FilterStatus: HolidayStatusEnum;
    FilterTypeApplicationId: number | null;
    emailConnectedUser: string;
}
