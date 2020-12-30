import { IDictionary } from './../models/dictionary';

export class Cache<T = any> {
   private _values: IDictionary<any> = {};

   public clear(): void {
      this._values = {};
   }

   public add(key: string, value: T): void {
      this._values[key] = value;
   }

   public get(key: string): T {
      return this._values[key];
   }

   public exists(key: string): boolean {
      return key in this._values;
   }
}

export interface ICacheable {
   cache: Cache;
}
