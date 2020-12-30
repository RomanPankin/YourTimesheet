import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, OnChanges, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

import { DateUtils } from './../../utils/date-utils';
import { DisposableDirective } from './../../common/disposable';
import { NumberUtils } from './../../utils/number-utils';
import { ITimesheetItem } from './../../models/timesheet-item';
import { UserService } from './../../services/user.service';

export enum TimesheetItemStyle {
   Normal = 'normal',
   Ok = 'ok',
   Fail = 'fail'
}

@Component({
  selector: 'app-timesheet-item',
  templateUrl: './timesheet-item.component.html',
  styleUrls: ['./timesheet-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimesheetItemComponent extends DisposableDirective implements OnInit, OnDestroy, OnChanges {
   @Input() public isEditable: boolean = true;
   @Input() public value: ITimesheetItem;
   @Input() public totalHours: number = 0;
   @Input() public style: TimesheetItemStyle = TimesheetItemStyle.Normal;

   @Output() public itemChanged: EventEmitter<ITimesheetItem> = new EventEmitter<ITimesheetItem>();

   public date: BehaviorSubject<Date> = new BehaviorSubject<Date>(null);
   public duration: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public description: BehaviorSubject<string> = new BehaviorSubject<string>(null);

   public canManageUserTimesheet: Observable<boolean>;

   constructor(private _userService: UserService) {
      super();

      this.canManageUserTimesheet = _userService.currentSettings
         .pipe(map(settings => settings?.role?.manageUserTimesheet));
   }

   public ngOnInit(): void {
      this.refreshValues();

      this.addDisposable(
         combineLatest([this.date, this.duration, this.description])
            .subscribe(([date, duration, description]) => {
               this.itemChanged.next({
                  date: date,
                  durationInHours: NumberUtils.parseNum(duration),
                  description: description
               });
            })
      );
   }

   public ngOnChanges(): void {
      this.refreshValues();
   }

   public formatDate(date: Date): string {
      return DateUtils.format(date, 'dd MMMM');
   }

   private refreshValues(): void {
      this.date.next(this.value?.date);
      this.duration.next((this.value?.durationInHours || '').toString());
      this.description.next(this.value?.description);
   }
}
