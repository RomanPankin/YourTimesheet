import { trigger, transition, animate, style } from '@angular/animations';
import { BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';

import { DisposableDirective } from './../../common/disposable';
import { UserDialogState } from './../../models/user-dialog-state';
import { skip } from 'rxjs/operators';

@Component({
   selector: 'app-user-dialog',
   templateUrl: './user-dialog.component.html',
   styleUrls: ['./user-dialog.component.less'],
   animations: [
      trigger('dialogSignInState', [
         transition('void => visible', [
            style({ transform: 'translate(-100%,0px)' }),
            animate('400ms', style({ transform: 'translate(0px, 0px)' })),
         ]),
         transition(':leave', [
            animate('400ms', style({ transform: 'translate(-100%,0px)' }))
         ])
      ]),

      trigger('dialogRegisterState', [
         transition(':enter', [
            style({ transform: 'translate(100%,0px)' }),
            animate('400ms', style({ transform: 'translate(0px, 0px)' })),
         ]),
            transition(':leave', [
            animate('400ms', style({ transform: 'translate(100%,0px)' }))
         ])
      ])
   ],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDialogComponent extends DisposableDirective implements OnInit, OnDestroy {
   public isFirstAppearance: boolean = true;
   public dialogState: BehaviorSubject<UserDialogState> = new BehaviorSubject<UserDialogState>(UserDialogState.SignIn);

   public get UserDialogState(): typeof UserDialogState {
      return UserDialogState;
   }

   constructor() {
      super();
   }

   public ngOnInit(): void {
      this.addDisposable(
         this.dialogState.pipe(skip(1))
            .subscribe(() => {
               this.isFirstAppearance = false;
            })
      );
   }
}
