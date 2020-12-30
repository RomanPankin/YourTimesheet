import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, OnDestroy, Input,
  ViewChild, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged } from 'rxjs/operators';
import { MatInput } from '@angular/material/input';

import { DisposableDirective } from './../../common/disposable';

export interface IValidateData {
   showError?: boolean;
   hasErrors?: boolean;
}

export enum InputType {
   Text = 'text',
   Password = 'password',
   Number = 'number',
   Email = 'email'
}

@Component({
   selector: 'app-input',
   templateUrl: './input.component.html',
   styleUrls: ['./input.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public placeholder: string;
   @Input() public type: InputType = InputType.Text;
   @Input() public value: BehaviorSubject<string>;

   @Output() public change: EventEmitter<string> = new EventEmitter<string>();

   @ViewChild(MatInput, {static: true}) public matInput: MatInput;

   public formControl: FormControl = new FormControl();
   public autofilled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

   constructor() {
      super();
   }

   public ngOnInit(): void {
      this.value = this.value || new BehaviorSubject<string>('');

      this.addDisposable(
         this.formControl.valueChanges
            .pipe(distinctUntilChanged())
            .subscribe(value => {
               if (this.value) {
                  this.value.next(value);
               }

               this.change.emit(value);
            })
      );

      this.addDisposable(
         this.matInput.stateChanges.subscribe(() => {
            if (this.matInput.autofilled !== this.autofilled.value) {
               this.autofilled.next(this.matInput.autofilled);
            }
         })
      );

      this.addDisposable(
         this.value
            .pipe(distinctUntilChanged())
            .subscribe(value => {
               this.formControl.setValue(value);
            })
      );
   }
}
