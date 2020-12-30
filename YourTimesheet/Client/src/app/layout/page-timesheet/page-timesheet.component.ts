import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { IGroup } from './../../models/group';
import { ITimesheetItem } from './../../models/timesheet-item';
import { DisposableDirective } from './../../common/disposable';
import { TimesheetService } from './../../services/timesheet.service';
import { TimesheetRepository } from './../../repositories/timesheet.repository';
import { ArrayUtils } from './../../utils/array-utils';
import { DateUtils } from './../../utils/date-utils';
import { ITimesheetItemEditable } from './../../models/timesheet-item-editable';
import { MessageService } from './../../services/message.service';
import { Messages } from './../../common/messages';
import { TimesheetItemStyle } from '../timesheet-item/timesheet-item.component';
import { StringUtils } from './../../utils/string-utils';
import { IDictionary } from './../../models/dictionary';
import { UserService } from './../../services/user.service';
import { DownloadUtils } from './../../utils/download-utils';

const DEFAULT_GROUP_FORMAT = 'yyyy, MMMM';
const DEFAULT_FULL_FORMAT = 'yyyy-MM-dd';

@Component({
  selector: 'app-page-timesheet',
  templateUrl: './page-timesheet.component.html',
  styleUrls: ['./page-timesheet.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTimesheetComponent extends DisposableDirective implements OnInit, OnDestroy {
   public itemToAdd: ITimesheetItem;

   public timesheet: Observable<ITimesheetItem[]>;
   public timesheetGroupped: Observable<IGroup<ITimesheetItemEditable>[]>;
   public preferredWorkingHours: Observable<number>;

   public filterFrom: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);
   public filterTo: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);
   public filterApplied: Observable<boolean>;

   public isLoaded: boolean = false;
   private _isLoading: boolean = false;

   private _lastFilterFrom: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);
   private _lastFilterTo: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);

   public get TimesheetItemStyle(): typeof TimesheetItemStyle {
      return TimesheetItemStyle;
   }

   constructor(private _timesheetService: TimesheetService,
               private _timesheetRepository: TimesheetRepository,
               private _userService: UserService,
               private _messageService: MessageService) {
      super();

      let totalHoursPerDay: IDictionary<number> = {};

      this.preferredWorkingHours = _userService.currentSettings
         .pipe(map(settings => settings?.preferredWorkingHoursPerDay));

      this.timesheet = _timesheetService.timesheet;
      this.timesheetGroupped = this.timesheet
         .pipe(map(items => {
            totalHoursPerDay = {};

            items.forEach(item => {
               const id = this.getItemId(item);

               totalHoursPerDay[id] = (totalHoursPerDay[id] || 0) + item.durationInHours;
            });

            return items;
         }))
         .pipe(map(items => {
            return ArrayUtils.groupBy(
               items.map<ITimesheetItemEditable>(x => {
                  const id = this.getItemId(x);
                  const result: ITimesheetItemEditable = {
                     ...x,

                     isEditable: false,
                     totalHoursPerDay: totalHoursPerDay[id]
                  };

                  return result;
               }),
               item => DateUtils.format(item.date, DEFAULT_GROUP_FORMAT)
            );
         }));

      this.filterApplied = combineLatest([this.filterFrom, this.filterTo, this._lastFilterFrom, this._lastFilterTo])
         .pipe(map(([filterFrom, filterTo, lastFilterFrom, lastFilterTo]) => {
            return (filterFrom || new Date()).getTime() === (lastFilterFrom || new Date()).getTime() &&
                   (filterTo || new Date()).getTime() === (lastFilterTo || new Date()).getTime();
         }));
   }

   public ngOnInit(): void {
      this.loadItemsFromRepository(null, null);
   }

   public ngOnDestroy(): void {
      this._timesheetService.clearTimesheetItems();

      super.ngOnDestroy();
   }

   public async addItem(item: ITimesheetItem): Promise<void> {
      if (this._isLoading) {
         return;
      }

      const errors = this.validateItem(item);
      if (errors) {
         this._messageService.showError(errors);

      } else {
         if (await this.addItemToRepository(item)) {
            this.itemToAdd = { durationInHours: null, description: null, date: null };
         }
      }
   }

   public deleteItem(item: ITimesheetItemEditable): void {
      if (this._isLoading) {
         return;
      }

      this.deleteItemToRepository(item);
   }

   public async changeItem(item: ITimesheetItemEditable, newValues: ITimesheetItem): Promise<void> {
      if (this._isLoading) {
         return;
      }

      if (newValues) {
         const errors = this.validateItem(newValues);
         if (errors) {
            this._messageService.showError(errors);

         } else {
            const changedItem: ITimesheetItem = {
               ...newValues,

               id: item.id
            };

            if (await this.addItemToRepository(changedItem)) {
               item.isEditable = false;
            }
         }

      } else {
         item.isEditable = false;
      }
   }

   public editItem(item: ITimesheetItemEditable): void {
      if (this._isLoading) {
         return;
      }

      item.isEditable = true;
      item.changedValues = null;
   }

   public applyFilter(): void {
      if (this._isLoading) {
         return;
      }

      const [fromValue, toValue] = this.getDates();
      this.loadItemsFromRepository(fromValue, toValue);
   }

   public clearFilter(): void {
      if (this._isLoading) {
         return;
      }

      this.filterFrom.next(null);
      this.filterTo.next(null);

      this.applyFilter();
   }

   public async exportData(): Promise<void> {
      if (this._isLoading) {
         return;
      }

      const [fromValue, toValue] = this.getDates();

      try {
         this._isLoading = true;

         const data = await this._timesheetRepository.export(fromValue, toValue).toPromise();
         DownloadUtils.downloadFile(data, 'export.html', 'application/html');

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
      }
   }

   private getDates(): Date[] {
      let fromValue = this.filterFrom.value;
      let toValue = this.filterTo.value;

      if (fromValue && toValue && fromValue.getTime() > toValue.getTime()) {
         // swap values
         this.filterFrom.next(toValue);
         this.filterTo.next(fromValue);

         [fromValue, toValue] = [toValue, fromValue];
      }

      return [fromValue, toValue];
   }

   private validateItem(item: ITimesheetItem): string {
      if (item.date == null) {
         return Messages.TimesheetItemEmptyDate;
      }

      if (item.durationInHours <= 0) {
         return Messages.TimesheetItemEmptyDuration;
      }

      if (StringUtils.isNullOrEmpty(item.description)) {
         return Messages.TimesheetItemEmptyDescription;
      }

      return null;
   }

   private async loadItemsFromRepository(from: Date, to: Date): Promise<void> {
      if (this._isLoading) {
         return;
      }

      try {
         this._isLoading = true;

         this._lastFilterFrom.next(from);
         this._lastFilterTo.next(to);

         this._timesheetService.clearTimesheetItems();
         const items = await this._timesheetRepository.list(from, to).toPromise();
         this._timesheetService.addTimesheetItems(items);

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
         this.isLoaded = false;
      }
   }

   private async addItemToRepository(item: ITimesheetItem): Promise<boolean> {
      if (this._isLoading) {
         return;
      }

      const raiseException = (value: ITimesheetItem, message: string) => {
         if (value == null) {
            throw new Error(message);
         }
      };

      try {
         this._isLoading = true;

         if (item.id) {
            // update item
            item = await this._timesheetRepository.update(item).toPromise();
            raiseException(item, Messages.TimesheetCantUpdateItem);

            this._timesheetService.updateTimesheetItems([item]);

            this._messageService.showMessage(Messages.TimesheetItemUpdated);

         } else {
            // add item
            item = await this._timesheetRepository.add(item).toPromise();
            raiseException(item, Messages.TimesheetCantAddItem);

            this._timesheetService.addTimesheetItems([item]);

            this._messageService.showMessage(Messages.TimesheetItemAdded);
         }

      } catch (e) {
         this._messageService.showError(e);
         return false;

      } finally {
         this._isLoading = false;
      }

      return true;
   }

   private async deleteItemToRepository(item: ITimesheetItem): Promise<void> {
      if (this._isLoading) {
         return;
      }

      try {
         this._isLoading = true;

         if (await this._timesheetRepository.delete(item).toPromise()) {
            this._timesheetService.deleteTimesheetItems([item]);

         } else {
            throw new Error(Messages.TimesheetCantDeleteItem);
         }

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
      }
   }

   private getItemId(item: ITimesheetItem): string {
      return (item.user || '') + '-' + DateUtils.format(item.date, DEFAULT_FULL_FORMAT);
   }
}
