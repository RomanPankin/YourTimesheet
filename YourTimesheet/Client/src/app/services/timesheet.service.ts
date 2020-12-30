import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import { STORE_TIMESHEET } from '../storage/reducers';
import { ITimesheetItem } from '../models/timesheet-item';
import { ITimesheetAction, TIMESHEET_ADD, TIMESHEET_DELETE, TIMESHEET_UPDATE, TIMESHEET_CLEAR } from '../storage/timesheet.storage';

/**
 * Allows to manipulate with a timesheet (locally)
 */
@Injectable()
export class TimesheetService {
   public timesheet: Observable<ITimesheetItem[]>;
   private _timesheetStore: Store<ITimesheetItem[]>;

   constructor(store: Store<any>) {
      this._timesheetStore = <Store<ITimesheetItem[]>>store.pipe<ITimesheetItem[]>(select(STORE_TIMESHEET));
      this.timesheet = <Observable<ITimesheetItem[]>>this._timesheetStore;
   }

   public addTimesheetItems(items: ITimesheetItem[]): void {
      if (items && items.length) {
         this._timesheetStore.dispatch<ITimesheetAction>({ type: TIMESHEET_ADD, items: items});
      }
   }

   public updateTimesheetItems(items: ITimesheetItem[]): void {
      if (items && items.length) {
         this._timesheetStore.dispatch<ITimesheetAction>({ type: TIMESHEET_UPDATE, items: items});
      }
   }

   public deleteTimesheetItems(items: ITimesheetItem[]): void {
      if (items && items.length) {
         this._timesheetStore.dispatch<ITimesheetAction>({ type: TIMESHEET_DELETE, items: items});
      }
   }

   public clearTimesheetItems(): void {
      this._timesheetStore.dispatch<ITimesheetAction>({ type: TIMESHEET_CLEAR });
   }
}
