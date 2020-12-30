import { Component, OnInit, OnDestroy, Input } from '@angular/core';

import { DisposableDirective } from './../../common/disposable';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.less']
})
export class SectionComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public title: string;

   constructor() {
      super();
   }

   public ngOnInit(): void {
   }
}
