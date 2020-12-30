import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { STORE_USER } from './../storage/reducers';
import { IUserState, IUserAction, USER_SET, USER_RESET, USER_UPDATE_SETTINGS } from './../storage/user.storage';
import { IUser } from './../models/user';
import { ISettings } from './../models/settings';
import { toSubject } from '../utils/to-subject';

/**
 * Allows to manipulate with a user
 */
@Injectable()
export class UserService {
   public currentUser: BehaviorSubject<IUser>;
   public currentSettings: BehaviorSubject<ISettings>;

   public isUserLoaded: Observable<boolean>;
   public isUserLoggedIn: Observable<boolean>;

   private _userStore: Store<IUserState>;

   constructor(store: Store<any>) {
      this._userStore = <Store<IUserState>>store.pipe<IUserState>(select(STORE_USER));
      this.currentUser = <BehaviorSubject<IUser>>this._userStore
         .pipe(map(x => x?.user))
         .pipe(toSubject());
      this.currentSettings = <BehaviorSubject<ISettings>>this.currentUser
         .pipe(map(x => x?.settings))
         .pipe(toSubject());

      this.isUserLoaded = <Observable<boolean>>this._userStore.pipe(map(x => x && x.loaded));
      this.isUserLoggedIn = <Observable<boolean>>this._userStore.pipe(map(x => x && x.loaded && !!x.user));
   }

   public setUser(user: IUser): void {
      if (user) {
         this._userStore.dispatch<IUserAction>({ type: USER_SET, userState: {user: user }});
      } else {
         this._userStore.dispatch<IUserAction>({ type: USER_RESET, userState: {loaded: true} });
      }
   }

   public updateSettings(settings: ISettings): void {
      if (settings) {
         this._userStore.dispatch<IUserAction>({ type: USER_UPDATE_SETTINGS, userState: {user: <IUser>{ settings: settings } }});
      }
   }
}
