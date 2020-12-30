import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { DisposableDirective } from './../../common/disposable';
import { UserService } from './../../services/user.service';
import { MessageService } from './../../services/message.service';
import { UserRepository } from './../../repositories/user.repository';
import { IUser } from './../../models/user';
import { IUserEditable } from './../../models/user-editable';
import { UserListService } from './../../services/user-list.service';
import { Messages } from './../../common/messages';
import { UserEditType } from './../../models/user-edit-type';

@Component({
   selector: 'app-page-users',
   templateUrl: './page-users.component.html',
   styleUrls: ['./page-users.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageUsersComponent extends DisposableDirective implements OnInit, OnDestroy {
   public canManageUsers: Observable<boolean>;
   public users: Observable<IUserEditable[]>;

   private _isLoading: boolean;

   public get UserEditType(): typeof UserEditType {
      return UserEditType;
   }

   constructor(private _userService: UserService,
               private _userListService: UserListService,
               private _userRepository: UserRepository,
               private _messageService: MessageService,
               private _ref: ChangeDetectorRef) {
      super();

      this.canManageUsers = _userService.currentSettings
         .pipe(map(settings => settings?.role?.manageUserList));

      this.users = _userListService.users
         .pipe(map(users => {
            return users.map(user => {
               const userEditable: IUserEditable = {
                  ...user,

                  editableType: UserEditType.None,
                  changedValues: null
               };

               return userEditable;
            });
         }));
   }

   public ngOnInit(): void {
      this.loadUsers();
   }

   public ngOnDestroy(): void {
      this._userListService.clearUsers();

      super.ngOnDestroy();
   }

   public async deleteUser(user: IUser): Promise<void> {
      if (this._isLoading) {
         return;
      }

      try {
         this._isLoading = true;

         if (await this._userRepository.delete(user).toPromise()) {
            this._userListService.deleteUsers([user]);
         }

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
      }
   }

   public editItem(item: IUserEditable, editType: UserEditType): void {
      if (this._isLoading) {
         return;
      }

      item.editableType = editType;
      item.changedValues = null;
   }

   public async changeItem(item: IUserEditable, newValues: IUser): Promise<void> {
      if (this._isLoading) {
         return;
      }

      const editableType = item.editableType;

      try {
         this._isLoading = true;

         if (newValues) {
            const errors = this.validateItem(newValues, item.editableType);
            if (errors) {
               this._messageService.showError(errors);

            } else {
               if (editableType === UserEditType.Password) {
                  // change password
                  await this._userRepository.updatePasswordForUser(newValues.pwd, item).toPromise();

               } else {
                  // change user settings
                  const newSettings = await this._userRepository.updateSettingsForUser(newValues.settings, item).toPromise();
                  const newUser: IUser = {
                     ...item,

                     settings: newSettings
                  };

                  this._userListService.updateUsers([newUser]);

                  if (this._userService.currentUser.value?.id === newUser.id) {
                     this._userService.updateSettings(newSettings);
                  }
               }

               this._messageService.showMessage(Messages.UserUpdated);

               item.editableType = UserEditType.None;
               item.changedValues = null;

               this._ref.markForCheck();
            }
         }

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
      }
   }

   public cancelEditing(item: IUserEditable): void {
      if (this._isLoading) {
         return;
      }

      item.editableType = UserEditType.None;
   }

   private validateItem(item: IUser, userEditableType: UserEditType): string {
      if (userEditableType === UserEditType.Password) {
         if (item.pwd == null) {
            return Messages.PasswordCantBeEmpty;
         }

      } else if (userEditableType === UserEditType.Settings) {
         if (item.settings?.role == null) {
            return Messages.WrongRole;
         }
      }

      return null;
   }

   private async loadUsers(): Promise<void> {
      if (this._isLoading) {
         return;
      }

      try {
         this._isLoading = true;

         const users = await this._userRepository.getUsers().toPromise();
         this._userListService.addUsers(users);

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this._isLoading = false;
      }
   }
}
