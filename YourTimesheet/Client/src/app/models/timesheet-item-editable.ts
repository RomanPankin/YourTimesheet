import { ITimesheetItem } from './timesheet-item';

export interface ITimesheetItemEditable extends ITimesheetItem {
   totalHoursPerDay: number;

   isEditable: boolean;
   changedValues?: ITimesheetItem;
}
