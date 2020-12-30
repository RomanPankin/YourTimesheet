import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { DisposableDirective } from './../../common/disposable';

@Component({
  selector: 'app-warning-message',
  templateUrl: './warning-message.component.html',
  styleUrls: ['./warning-message.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarningMessageComponent extends DisposableDirective implements OnInit, OnDestroy  {
   constructor() {
      super();
   }

   public ngOnInit(): void {
   }

   public ngOnDestroy(): void {
      super.ngOnDestroy();
   }
}
