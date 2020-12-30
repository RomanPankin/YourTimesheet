import { Observable, BehaviorSubject } from 'rxjs';

export function toSubject<T>() {
   return (source: Observable<T>): BehaviorSubject<T> => {
      const result = new BehaviorSubject<T>(null);
      source
         .subscribe(value => {
               result.next(value);
         });

      return result;
   };
}
