import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IUser } from './../models/user';
import { BaseApi } from './base-api';
import { ISettings } from './../models/settings';
import { IRole } from './../models/role';
import { CacheResult } from '../common/cache-result';

/**
 * Allows to manipulate with a user (APIs)
 */
@Injectable()
export class UserRepository extends BaseApi {
   constructor(http: HttpClient) {
      super(http);
   }

   public register(user: IUser): Observable<IUser> {
      return this.httpPost<IUser, IUser>('/api/user/register', user);
   }

   public login(user: IUser): Observable<IUser> {
      return this.httpPost<IUser, IUser>('/api/user/login', user);
   }

   public logout(): Observable<void> {
      return this.httpDelete<void>('/api/user/logout');
   }

   public get(): Observable<IUser> {
      return this.httpGet<IUser>('/api/user/get');
   }

   public delete(user: IUser): Observable<boolean> {
      return this.httpDelete<boolean>(`/api/user/delete/${user?.id}`);
   }

   public updateSettings(settings: ISettings): Observable<ISettings> {
      return this.httpPost<ISettings, ISettings>('/api/user/updatesettings', settings);
   }

   public updateSettingsForUser(settings: ISettings, user: IUser): Observable<ISettings> {
      return this.httpPost<ISettings, ISettings>(`/api/user/updatesettings/${user?.id}`, settings);
   }

   public updatePassword(password: string): Observable<boolean> {
      return this.httpPost<IUser, boolean>(`/api/user/updatepassword`, <IUser>{ pwd: password });
   }

   public updatePasswordForUser(password: string, user: IUser): Observable<boolean> {
      return this.httpPost<IUser, boolean>(`/api/user/updatepassword/${user?.id}`, <IUser>{ pwd: password });
   }

   @CacheResult()
   public getRoles(): Observable<IRole[]> {
      return this.httpGet<IRole[]>('/api/user/roles');
   }

   public getUsers(): Observable<IUser[]> {
      return this.httpGet<IUser[]>('/api/user/list');
   }
}
