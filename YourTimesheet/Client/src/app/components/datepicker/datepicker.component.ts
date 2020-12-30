import { DisposableDirective } from './../../common/disposable';
import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatInput } from '@angular/material/input';

@Component({
   selector: 'app-datepicker',
   templateUrl: './datepicker.component.html',
   styleUrls: ['./datepicker.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatepickerComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public value: BehaviorSubject<Date>;
   @Input() public placeholder: Observable<string> | string;
   @Input() public required: boolean = false;

   @ViewChild(MatInput, {static: true}) public matInput: MatInput;

   public formControl: FormControl = new FormControl();
   public placeholderValue: Observable<string>;
   public autofilled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

   constructor() {
      super();
   }

   public ngOnInit(): void {
      this.value = this.value || new BehaviorSubject<Date>(null);
      this.placeholder = this.placeholder || new BehaviorSubject<string>('Choose a date');

      if (typeof this.placeholder === 'string') {
         this.placeholderValue = new BehaviorSubject<string>(this.placeholder);
      } else {
         this.placeholderValue = this.placeholder;
      }

      this.addDisposable(
         this.matInput.stateChanges.subscribe(() => {
            if (this.matInput.autofilled !== this.autofilled.value) {
               this.autofilled.next(this.matInput.autofilled);
            }
         })
      );

      this.addDisposable(
         this.value.subscribe(value => {
            this.formControl.setValue(value);
         })
      );
   }

   public ngOnDestroy(): void {
      super.ngOnDestroy();
   }
}
