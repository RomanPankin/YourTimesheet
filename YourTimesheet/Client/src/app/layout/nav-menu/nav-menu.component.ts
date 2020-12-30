import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DisposableDirective } from './../../common/disposable';
import { MessageService } from './../../services/message.service';
import { UserRepository } from './../../repositories/user.repository';
import { UserService } from './../../services/user.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavMenuComponent extends DisposableDirective implements OnInit, OnDestroy {
   public isExpanded = false;
   public userName: Observable<string>;
   public canManageUserList: Observable<boolean>;

   constructor(private _userService: UserService,
               private _userRepository: UserRepository,
               private _messageService: MessageService,
               private _router: Router ) {
      super();

      this.userName = _userService.currentUser
         .pipe(map(user => user?.email));

      this.canManageUserList = _userService.currentSettings
         .pipe(map(settings => settings?.role?.manageUserList));
   }

   public ngOnInit(): void {
   }

   public collapse() {
      this.isExpanded = false;
   }

   public toggle() {
      this.isExpanded = !this.isExpanded;
   }

   public async logout(): Promise<void> {
      try {
         await this._userRepository.logout().toPromise();
         this._userService.setUser(null);

         this._router.navigate(['/']);

      } catch (e) {
         this._messageService.showError(e);
      }
   }
}
