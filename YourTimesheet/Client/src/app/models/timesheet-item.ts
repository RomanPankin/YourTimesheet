export interface ITimesheetItem {
   id?: number;
   description: string;
   date: Date;
   durationInHours: number;
   user?: string;
}
