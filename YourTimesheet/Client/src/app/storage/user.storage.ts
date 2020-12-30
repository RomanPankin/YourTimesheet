import { Action } from '@ngrx/store';
import { ISettings } from '../models/settings';
import { IUser } from './../models/user';

export const USER_SET = 'USER_SET';
export const USER_RESET = 'USER_RESET';
export const USER_UPDATE_SETTINGS = 'USER_UPDATE_SETTINGS';

export interface IUserState {
   user?: IUser;
   loaded?: boolean;
}

export interface IUserAction extends Action {
   userState?: IUserState;
}

const INITIAL_USER_STATE: IUserState = {
   loaded: false
};

export function storeUserReducer(state: IUserState = INITIAL_USER_STATE, action: IUserAction): IUserState {
   switch (action.type) {
      case USER_SET:
         return {
            user: {...action.userState.user},
            loaded: true
         };

      case USER_RESET:
         return {
            user: null,
            loaded: action.userState && action.userState.loaded != null ? action.userState.loaded : state.loaded
         };

      case USER_UPDATE_SETTINGS:
         return {
            user: {
               ...state.user,
               settings: {...(action.userState?.user?.settings || <ISettings>{})}
            },
            loaded: true
         };

      default:
         return state;
   }
}
