import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { BaseApi } from './base-api';
import { ITimesheetItem } from './../models/timesheet-item';
import { DateUtils } from './../utils/date-utils';

const DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Allows to manipulate with a timesheet (APIs)
 */
@Injectable()
export class TimesheetRepository extends BaseApi {
   constructor(http: HttpClient) {
      super(http);
   }

   public add(item: ITimesheetItem): Observable<ITimesheetItem> {
      return this.httpPost<ITimesheetItem, ITimesheetItem>('/api/timesheet/add', item)
         .pipe(map(x => this.correctItem(x)));
   }

   public update(item: ITimesheetItem): Observable<ITimesheetItem> {
      return this.httpPost<ITimesheetItem, ITimesheetItem>('/api/timesheet/update', item)
         .pipe(map(x => this.correctItem(x)));
   }

   public delete(user: ITimesheetItem): Observable<boolean> {
      return this.httpDelete<boolean>(`/api/timesheet/delete/${user.id}`);
   }

   public list(from: Date, to: Date): Observable<ITimesheetItem[]> {
      const url = `/api/timesheet/list/${from ? DateUtils.format(from, DATE_FORMAT) : '-'}/${to ? DateUtils.format(to, DATE_FORMAT) : '-'}`;

      return this.httpGet<ITimesheetItem[]>(url)
         .pipe(map(x => (x || []).map(value => this.correctItem(value))));
   }

   public export(from: Date, to: Date): Observable<void> {
      const url = `/api/timesheet/export/${from ? DateUtils.format(from, DATE_FORMAT) : '-'}/${to ? DateUtils.format(to, DATE_FORMAT) : '-'}`;

      return this.httpGet<void>(url, true);
   }

   private correctItem(item: ITimesheetItem): ITimesheetItem {
      const date: string = <string><any>item.date;

      return {
         ...item,
         date: DateUtils.parse(date)
      };
   }

   private downLoadFile(data: any, type: string) {
      const blob = new Blob([data], { type: type});
      const url = window.URL.createObjectURL(blob);
      const pwa = window.open(url);
      if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
         alert( 'Please disable your Pop-up blocker and try again.');
      }
  }
}
