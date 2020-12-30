import { BehaviorSubject } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, Input } from '@angular/core';

import { SpinnerType } from './../../components/spinner/spinner.component';
import { StringUtils } from './../../utils/string-utils';
import { Messages } from '../../common/messages';
import { DisposableDirective } from './../../common/disposable';
import { UserDialogState } from './../../models/user-dialog-state';
import { UserRepository } from './../../repositories/user.repository';
import { IUser } from '../../models/user';
import { UserService } from './../../services/user.service';
import { MessageService } from './../../services/message.service';
import { InputType } from './../../components/input/input.component';

@Component({
  selector: 'app-user-dialog-register',
  templateUrl: './user-dialog-register.component.html',
  styleUrls: ['./user-dialog-register.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDialogRegisterComponent extends DisposableDirective implements OnInit, OnDestroy {
   @Input() public dialogState: BehaviorSubject<UserDialogState>;

   public emailValue: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public passwordValue: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public passwordConfirmationValue: BehaviorSubject<string> = new BehaviorSubject<string>(null);

   public emailError: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public passwordError: BehaviorSubject<string> = new BehaviorSubject<string>(null);
   public passwordConfirmationError: BehaviorSubject<string> = new BehaviorSubject<string>(null);

   public registerError: BehaviorSubject<string> = new BehaviorSubject<string>(null);

   public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

   public get SpinnerType(): typeof SpinnerType {
      return SpinnerType;
   }

   public get InputType(): typeof InputType {
      return InputType;
   }

   constructor(private _userRepository: UserRepository,
               private _userService: UserService,
               private _messageService: MessageService) {
      super();
   }

   public ngOnInit(): void {
   }

   public back(): void {
      this.dialogState.next(UserDialogState.SignIn);
   }

   public async create(): Promise<void> {
      if (this.isLoading.value) {
         return;
      }

      try {
         this.isLoading.next(true);

         let user: IUser = {
            email: this.emailValue.value,
            pwd: this.passwordValue.value
         };

         if (this.validated(user)) {
            user = await this._userRepository.register(user).toPromise();
            if (user == null) {
               throw new Error(Messages.UserCantBeAuthorized);
            }

            this._userService.setUser(user);
         }

      } catch (e) {
         this._messageService.showError(e);

      } finally {
         this.isLoading.next(false);
      }
   }

   private validated(user: IUser): boolean {
      const emailError = this.validateEmail(user.email);
      this.emailError.next(emailError);

      const passwordError = this.validatePassword(user.pwd);
      this.passwordError.next(passwordError);

      const confirmationValue = this.passwordConfirmationValue.value;
      const confirmationError = this.validateConfirmation(user.pwd, confirmationValue);
      this.passwordConfirmationError.next(confirmationError);

      return !emailError && !passwordError && !confirmationError;
   }

   private validateEmail(value: string): string {
      if (!value?.length) {
         return Messages.EmailEmpty;
      }

      if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value)) {
         return Messages.EmailWrongFormat;
      }

      return null;
   }

   private validatePassword(value: string): string {
      if (!value?.length) {
         return Messages.PasswordCantBeEmpty;
      }

      return null;
   }

   private validateConfirmation(password: string, confirmation: string): string {
      if (password !== confirmation) {
         return Messages.PasswordDoesntMatch;
      }

      return null;
   }
}
