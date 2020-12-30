import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { BehaviorSubject } from 'rxjs';

import { DisposableDirective } from '../../common/disposable';

export interface ISelectOption {
   caption: string;
   value: string | number;
}

@Component({
   selector: 'app-select',
   templateUrl: './select.component.html',
   styleUrls: ['./select.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public placeholder: string;
   @Input() public options: BehaviorSubject<ISelectOption[]> = new BehaviorSubject(null);
   @Input() public value: BehaviorSubject<ISelectOption> = new BehaviorSubject(null);

   public ngOnInit(): void {
   }

   public onChange(event: MatSelectChange): void {
      this.value.next(
         (this.options.value || []).find(x => x.value === event.value)
      );
   }
}
