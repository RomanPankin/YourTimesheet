import { BehaviorSubject, combineLatest } from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { map } from 'rxjs/operators';

import { DisposableDirective } from './../../common/disposable';
import { ISettings } from './../../models/settings';
import { MessageService } from './../../services/message.service';
import { NumberUtils } from './../../utils/number-utils';
import { Messages } from './../../common/messages';
import { UserService } from './../../services/user.service';
import { UserRepository } from './../../repositories/user.repository';
import { ISelectOption } from './../../components/select/select.component';
import { toSubject } from './../../utils/to-subject';
import { IRole } from './../../models/role';

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageSettingsComponent extends DisposableDirective implements OnInit, OnDestroy {
   public settings: BehaviorSubject<ISettings>;
   public roles: BehaviorSubject<IRole[]>;
   public rolesOptions: BehaviorSubject<ISelectOption[]>;
   public role: BehaviorSubject<ISelectOption> = new BehaviorSubject<ISelectOption>(null);
   public preferredWorkingHours: BehaviorSubject<number> = new BehaviorSubject<number>(0);

   public lastRole: ISelectOption = null;
   public lastpreferredWorkingHours: number = null;

   private _isLoading: boolean = false;
   private _isLoaded: boolean = false;

   constructor(private _userService: UserService,
               private _userRepository: UserRepository,
               private _messageService: MessageService) {
      super();

      this.settings = _userService.currentSettings;
      this.addDisposable(this.settings.subscribe(value => {
         const workingHours = (value?.preferredWorkingHoursPerDay || 0);

         this.preferredWorkingHours.next(workingHours);
         this.lastpreferredWorkingHours = workingHours;
      }));
   }

   public ngOnInit(): void {
      this.roles = <BehaviorSubject<IRole[]>>this._userRepository.getRoles()
         .pipe(toSubject());
      this.rolesOptions = <BehaviorSubject<ISelectOption[]>>this.roles
         .pipe(map(roles => {
            return (roles || []).map(role => {
               const item: ISelectOption = {
                  caption: role.name,
                  value: role.id
               };

               return item;
            });
         }))
         .pipe(toSubject());

      this.addDisposable(
         combineLatest([this.rolesOptions, this.settings])
            .subscribe(([roles, settings]) => {
               if (roles != null && settings != null) {
                  const role = roles.find(x => x.value === settings?.role?.id);

                  this.lastRole = this.lastRole || role;

                  this._isLoaded = true;
                  this.role.next(role);
               }
            })
      );
   }

   public async updateSettings(): Promise<void> {
      if (this._isLoading || !this._isLoaded) {
         return;
      }

      const preferredWorkingHours = NumberUtils.parseNum(this.preferredWorkingHours.value);
      const roleOption = this.role.value;
      const role = (this.roles.value || []).find(x => x.id === roleOption?.value);

      let settings: ISettings = {
         preferredWorkingHoursPerDay: preferredWorkingHours,
         role: role
      };

      const error = this.validateSettings(settings);
      if (error) {
         this._messageService.showError(error);

      } else {
         try {
            this._isLoading = true;

            settings = await this._userRepository.updateSettings(settings).toPromise();
            if (settings == null) {
               throw new Error(Messages.SettingsCantUpdate);
            }

            this._userService.updateSettings(settings);

            this.lastpreferredWorkingHours = preferredWorkingHours;
            this.lastRole = roleOption;

            this._messageService.showMessage(Messages.UserUpdated);

         } catch (e) {
            this._messageService.showError(e);

         } finally {
            this._isLoading = false;
         }
      }
   }

   private validateSettings(settings: ISettings): string {
      if (!settings.role) {
         return Messages.WrongRole;
      }

      return null;
   }
}
