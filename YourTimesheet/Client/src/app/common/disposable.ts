import { SubscriptionLike } from 'rxjs';
import { OnDestroy, Directive } from '@angular/core';

export interface IDisposable {
   dispose(): void;
}

export type IDisposableType = IDisposable | SubscriptionLike;

@Directive()
export class DisposableDirective implements IDisposable, OnDestroy {
   private _disposable: IDisposableType[] = [];

   public addDisposable(disposable: IDisposable | SubscriptionLike): void {
      this._disposable.push(disposable);
   }

   public dispose(): void {
      this.freeDisposable(this._disposable);
      this._disposable = [];
   }

   private freeDisposable(disposable: IDisposableType[]): void {
      disposable.forEach(item => {
         if ((<SubscriptionLike>item).unsubscribe) {
            (<SubscriptionLike>item).unsubscribe();
         }

         if ((<IDisposable>item).dispose) {
            (<IDisposable>item).dispose();
         }
      });
   }

   public ngOnDestroy(): void {
      this.dispose();
   }
}
