import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';

import { STORE_USER_LIST } from './../storage/reducers';
import { IUserState } from './../storage/user.storage';
import { IUser } from './../models/user';
import { toSubject } from '../utils/to-subject';
import { IUserListAction, USER_LIST_ADD, USER_LIST_UPDATE, USER_LIST_DELETE, USER_LIST_CLEAR } from './../storage/user-list.storage';

/**
 * Allows to manipulate with a user's list
 */
@Injectable()
export class UserListService {
   public users: BehaviorSubject<IUser[]>;

   private _userListStore: Store<IUser[]>;

   constructor(store: Store<any>) {
      this._userListStore = <Store<IUser[]>>store.pipe<IUserState>(select(STORE_USER_LIST));
      this.users = <BehaviorSubject<IUser[]>>this._userListStore
         .pipe(toSubject());
   }

   public addUsers(users: IUser[]): void {
      if (users && users.length) {
         this._userListStore.dispatch<IUserListAction>({ type: USER_LIST_ADD, users: users});
      }
   }

   public updateUsers(users: IUser[]): void {
      if (users && users.length) {
         this._userListStore.dispatch<IUserListAction>({ type: USER_LIST_UPDATE, users: users});
      }
   }

   public deleteUsers(users: IUser[]): void {
      if (users && users.length) {
         this._userListStore.dispatch<IUserListAction>({ type: USER_LIST_DELETE, users: users});
      }
   }

   public clearUsers(): void {
      this._userListStore.dispatch<IUserListAction>({ type: USER_LIST_CLEAR });
   }
}
