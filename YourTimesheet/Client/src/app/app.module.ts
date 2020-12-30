import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Meterial UI
import { MaterialUIModule } from './app.module.imports';

// Storage
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { reducers } from './storage/reducers';

// Repositories
import { UserRepository } from './repositories/user.repository';
import { TimesheetRepository } from './repositories/timesheet.repository';

// Services
import { UserService } from './services/user.service';
import { UserListService } from './services/user-list.service';
import { MessageService } from './services/message.service';
import { TimesheetService } from './services/timesheet.service';

// Custom components
import { AppComponent } from './app.component';
import { UserDialogComponent } from './layout/user-dialog/user-dialog.component';
import { InputComponent } from './components/input/input.component';
import { WarningMessageComponent } from './components/warning-message/warning-message.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UserDialogAuthComponent } from './layout/user-dialog-auth/user-dialog-auth.component';
import { UserDialogRegisterComponent } from './layout/user-dialog-register/user-dialog-register.component';
import { NavMenuComponent } from './layout/nav-menu/nav-menu.component';
import { PageTimesheetComponent } from './layout/page-timesheet/page-timesheet.component';
import { PageSettingsComponent } from './layout/page-settings/page-settings.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { SectionComponent } from './components/section/section.component';
import { TimesheetItemComponent } from './layout/timesheet-item/timesheet-item.component';
import { DotsMenuComponent } from './components/dots-menu/dots-menu.component';
import { SelectComponent } from './components/select/select.component';
import { PageUsersComponent } from './layout/page-users/page-users.component';
import { UserItemComponent } from './layout/user-item/user-item.component';
import { NumberComponent } from './components/number/number.component';

@NgModule({
   declarations: [
      InputComponent,
      WarningMessageComponent,
      SpinnerComponent,
      DatepickerComponent,
      SectionComponent,
      DotsMenuComponent,
      SelectComponent,

      AppComponent,
      UserDialogComponent,
      UserDialogAuthComponent,
      UserDialogRegisterComponent,
      NavMenuComponent,
      PageTimesheetComponent,
      PageSettingsComponent,
      TimesheetItemComponent,
      PageUsersComponent,
      UserItemComponent,
      NumberComponent
   ],
   imports: [
      MaterialUIModule,
      BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
      HttpClientModule,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      StoreModule.forRoot(reducers),
      StoreDevtoolsModule.instrument({
         maxAge: 5
      }),
      RouterModule.forRoot([
         { path: 'settings', component: PageSettingsComponent },
         { path: 'users', component: PageUsersComponent },
         { path: '**', component: PageTimesheetComponent }
      ])
   ],
   providers: [
      MessageService,
      UserService,
      UserListService,
      TimesheetService,

      UserRepository,
      TimesheetRepository
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
