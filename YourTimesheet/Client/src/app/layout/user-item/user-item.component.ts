import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { DisposableDirective } from './../../common/disposable';
import { IUser } from './../../models/user';
import { ISelectOption } from './../../components/select/select.component';
import { InputType } from './../../components/input/input.component';
import { UserEditType } from './../../models/user-edit-type';
import { toSubject } from './../..//utils/to-subject';
import { IRole } from './../../models/role';
import { UserRepository } from './../../repositories/user.repository';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserItemComponent extends DisposableDirective implements OnInit, OnDestroy, OnChanges {
   @Input() public editableType: UserEditType = UserEditType.None;
   @Input() public value: IUser;

   @Output() public itemChanged: EventEmitter<IUser> = new EventEmitter<IUser>();

   public roles: BehaviorSubject<IRole[]>;
   public rolesOptions: BehaviorSubject<ISelectOption[]>;

   public password: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public preferredHours: BehaviorSubject<number> = new BehaviorSubject<number>(null);
   public role: BehaviorSubject<ISelectOption> = new BehaviorSubject<ISelectOption>(null);

   public get UserEditType(): typeof UserEditType {
      return UserEditType;
   }

   public get InputType(): typeof InputType {
      return InputType;
   }

   constructor(private _userRepository: UserRepository) {
      super();

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
         this.rolesOptions
            .subscribe(() => {
               this.refreshValues();
            })
      );
   }

   public ngOnInit(): void {
      this.refreshValues();

      this.addDisposable(
         combineLatest([this.password, this.preferredHours, this.role])
            .subscribe(([password, preferredHours, role]) => {
               this.itemChanged.next({
                  ...(this.value || {}),

                  email: this.value?.email,
                  pwd: password,
                  settings: {
                     ...(this.value?.settings || {}),

                     preferredWorkingHoursPerDay: preferredHours,
                     role: {
                        id: <number>role?.value
                     }
                  }
               });
            })
      );
   }

   public ngOnChanges(): void {
      this.refreshValues();
   }

   private refreshValues(): void {
      if (this.value) {
         if (this.preferredHours) {
            this.preferredHours.next(this.value.settings?.preferredWorkingHoursPerDay);
         }

         if (this.role) {
            const roles = this.rolesOptions.value;
            if (roles != null) {
               const role = roles.find(x => x.value === this.value.settings?.role?.id);
               this.role.next(role);
            }
         }
      }
   }
}
