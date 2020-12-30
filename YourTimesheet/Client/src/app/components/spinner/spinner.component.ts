import { DisposableDirective } from './../../common/disposable';
import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy } from '@angular/core';

export enum SpinnerType {
   Loader = 'loader',
   Line = 'line',
   Ellipsis = 'ellipsis',
}

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public spinnerType: SpinnerType = SpinnerType.Loader;

   public get SpinnerType(): typeof SpinnerType {
      return SpinnerType;
   }

   constructor() {
      super();
   }

   public ngOnInit(): void {
   }

   public ngOnDestroy(): void {
      super.ngOnDestroy();
   }
}
