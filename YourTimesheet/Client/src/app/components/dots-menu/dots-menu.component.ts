import { DisposableDirective } from 'src/app/common/disposable';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-dots-menu',
  templateUrl: './dots-menu.component.html',
  styleUrls: ['./dots-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DotsMenuComponent extends DisposableDirective implements OnInit, OnDestroy {

   constructor() {
      super();
   }

   public ngOnInit(): void {
   }

}
