import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialUIModule } from './../../app.module.imports';
import { ISettings } from './../../models/settings';
import { UserService } from './../../services/user.service';
import { TimesheetItemComponent } from './timesheet-item.component';
import { InputComponent } from './../../components/input/input.component';
import { DatepickerComponent } from './../../components/datepicker/datepicker.component';
import { ITimesheetItem } from './../../models/timesheet-item';

@Component({
   template: '<app-timesheet-item [value]="value"></app-timesheet-item>'
})
class TimesheetItemHostComponent {
   value: ITimesheetItem;
}

describe('TimesheetItemComponent', () => {
   let component: TimesheetItemHostComponent;
   let fixture: ComponentFixture<TimesheetItemHostComponent>;

   const userServiceMock = jasmine.createSpyObj('UserService', {}, {
      currentSettings: new BehaviorSubject<ISettings>({ preferredWorkingHoursPerDay: 10, role: null })
   });

   beforeEach(async () => {
      await TestBed.configureTestingModule({
         declarations: [
            TimesheetItemHostComponent,
            TimesheetItemComponent,
            InputComponent,
            DatepickerComponent
         ],
         imports: [
            MaterialUIModule,
            FormsModule,
            ReactiveFormsModule,
            BrowserAnimationsModule
         ],
         providers: [
            { provide: UserService, useValue: userServiceMock },
         ]
      })
      .compileComponents();
   });

   beforeEach(() => {
      fixture = TestBed.createComponent(TimesheetItemHostComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
   });

   it('should create', () => {
      expect(component).toBeTruthy();
   });

   it('test initial values', () => {
      expect(fixture.nativeElement.querySelector('.working-description input').value).toEqual('');
      expect(fixture.nativeElement.querySelector('.working-date input').value).toEqual('');
      expect(fixture.nativeElement.querySelector('.working-hours input').value).toEqual('');
   });

   it('test changed values', () => {
      component.value = { description: 'description', date: new Date(2020, 1, 10), durationInHours: 10 };
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.working-description input').value).toEqual('description');
      expect(fixture.nativeElement.querySelector('.working-date input').value).toEqual('2/10/2020');
      expect(fixture.nativeElement.querySelector('.working-hours input').value).toEqual('10');
   });
});
