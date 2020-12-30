import { BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, Input } from '@angular/core';

import { DisposableDirective } from './../../common/disposable';
import { NumberUtils } from 'src/app/utils/number-utils';
import { InputType } from '../input/input.component';

@Component({
   selector: 'app-number',
   templateUrl: './number.component.html',
   styleUrls: ['./number.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public placeholder: string;
   @Input() public value: BehaviorSubject<number>;

   public valueString: BehaviorSubject<string> = new BehaviorSubject<string>(null);

   public get InputType(): typeof InputType {
      return InputType;
   }

   constructor() {
      super();
   }

   public ngOnInit(): void {
      if (this.value != null) {
         this.addDisposable(this.value.subscribe(value => {
            this.valueString.next(value != null ? value.toString() : null);
         }));
      }

      this.addDisposable(this.valueString.subscribe(value => {
         if (this.value != null) {
            const numberValue = NumberUtils.parseNum(value);

            if (numberValue !== this.value.value) {
               this.value.next(numberValue);
            }
         }
      }));
   }
}
