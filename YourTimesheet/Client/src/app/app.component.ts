import { MessageService } from './services/message.service';
import { UserRepository } from './repositories/user.repository';
import { Observable } from 'rxjs';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { UserService } from './services/user.service';
import { DisposableDirective } from './common/disposable';

@Component({
   selector: 'app-root',
   templateUrl: './app.component.html',
   styleUrls: ['./app.component.less'],
   changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent extends DisposableDirective {
   public isUserLoggedIn: Observable<boolean>;
   public isUserLoaded: Observable<boolean>;

   constructor (private _userService: UserService,
                private _userRepository: UserRepository,
                private _messageService: MessageService) {
      super();

      this.isUserLoggedIn = _userService.isUserLoggedIn;
      this.isUserLoaded = _userService.isUserLoaded;

      this.loadUserInfo();
   }

   private async loadUserInfo(): Promise<void> {
      try {
         const user = await this._userRepository.get().toPromise();
         this._userService.setUser(user);

      } catch (e) {
         this._messageService.showError(e);
      }
   }
}
