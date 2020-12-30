import { ICacheable, Cache } from './cache';
import { Observable, from } from 'rxjs';
import { tap, share } from 'rxjs/operators';

export enum CacheResultMode {
   All,
   LastValue
}

export interface ICacheResultOptions {
   mode?: CacheResultMode;
   cache?: Cache<any>;
}

export function CacheResult(options?: ICacheResultOptions): any {
   return function (target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
      const initialFunction: Function = target[propertyKey];
      const onlyLast = options && options.mode === CacheResultMode.LastValue;
      const localCache = options ? options.cache : null;

      descriptor.value = function(...args: any[]): any {
         const cache = localCache || (<ICacheable>this).cache;
         const key = cache ? propertyKey + '/' + JSON.stringify(args) : null;

         if (cache && key && cache.exists(key)) {
            return cache.get(key);

         } else {
            let result = initialFunction.apply(this, args);
            if (result && result instanceof Observable) {
               result = result.pipe(share()).pipe(tap(response => {
                  cache.add(key, from([response]));
               }));
            }

            if (cache && key) {
               if (onlyLast) {
                  cache.clear();
               }

               cache.add(key, result);
            }

            return result;
         }
      };
   };
}
