import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Messages } from './../common/messages';
import { DateUtils } from './../utils/date-utils';
import { ICacheable, Cache } from './../common/cache';

const HTTP_STATUS_UNATHORIZED = 401;

/**
 * Base class for all APIs
 */
export class BaseApi {
   public cache: Cache = new Cache();
   public activeRequests: BehaviorSubject<number> = new BehaviorSubject<number>(0);
   public isActive: Observable<boolean> = this.activeRequests
            .pipe(map((activeRequest) => {
               return activeRequest > 0;
            }));

   constructor(protected http: HttpClient) {
   }

   protected httpPost<TInput = any, TOutput = any>(url: string, data: TInput): Observable<TOutput> {
      this.activeRequests.next(this.activeRequests.value + 1);

      return this.processResponse(
         this.http.post<TOutput>(url, this.stringify(data), {
            headers: new HttpHeaders({
               'Content-Type': 'application/json',
            })
         })
      );
   }

   protected httpGet<TOutput = any>(url: string, binary: boolean = false): Observable<TOutput> {
      this.activeRequests.next(this.activeRequests.value + 1);

      return this.processResponse(
         this.http.get<TOutput>(url, {
            responseType: binary ? 'blob' as 'json' : 'json',
            headers: new HttpHeaders({
               'Content-Type': 'application/json',
            })
         })
      );
   }

   protected httpDelete<TOutput = any>(url: string): Observable<TOutput> {
      this.activeRequests.next(this.activeRequests.value + 1);

      return this.processResponse(
         this.http.delete<TOutput>(url, {
            headers: new HttpHeaders({
               'Content-Type': 'application/json',
            })
         })
      );
   }

   private checkForUnauthorized(response: HttpErrorResponse): void {
      if (response && response.status === HTTP_STATUS_UNATHORIZED) {
         // session expired, have to reload the page
         document.location.reload();

         throw new Error(Messages.UserIsAuthorized);
      }
   }

   private processResponse<TOutput>(response: Observable<TOutput>): Observable<TOutput> {
      return response.pipe(
         map(value => {
            this.activeRequests.next(this.activeRequests.value - 1);
            return value;
         }),
         catchError(err => {
            this.checkForUnauthorized(err);

            this.activeRequests.next(this.activeRequests.value - 1);
            return throwError(err);
         })
      );
   }

   private stringify(data: any): string {
      return JSON.stringify(data, (key: string, value: any) => {
         if (value) {
            if (typeof(value) === 'object') {
               for (const i in value) {
                  if (value[i] instanceof Date) {
                     value[i] = DateUtils.formatToISO(value[i]);
                  }
               }
            }

            if (value && value instanceof Date) {
               return DateUtils.formatToISO(value);
            }
         }

         return value;
      });
   }
}
