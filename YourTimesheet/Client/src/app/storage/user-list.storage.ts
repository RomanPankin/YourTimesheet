import { Action } from '@ngrx/store';

import { ArrayUtils } from './../utils/array-utils';
import { IUser } from './../models/user';

export const USER_LIST_ADD = 'USER_LIST_ADD';
export const USER_LIST_UPDATE = 'USER_LIST_UPDATE';
export const USER_LIST_DELETE = 'USER_LIST_DELETE';
export const USER_LIST_CLEAR = 'USER_LIST_CLEAR';

export interface IUserListAction extends Action {
   users?: IUser[];
}

const INITIAL_USER_LIST_STATE: IUser[] = [];

export function storeUserListReducer(state: IUser[] = INITIAL_USER_LIST_STATE, action: IUserListAction): IUser[] {
   switch (action.type) {
      case USER_LIST_ADD:
         return [...(state || []), ...(action.users || [])];

      case USER_LIST_UPDATE: {
         const actionIds = ArrayUtils.toDictionary(action.users, x => x.id);
         const newState = (state || []).map(item => {
            const addingItem = actionIds[item.id];
            if (!addingItem) {
               return item;
            }

            return addingItem;
         });

         return newState;
      }

      case USER_LIST_DELETE: {
         const actionIds = ArrayUtils.toDictionary(action.users, x => x.id);
         return (state || []).filter(item => !(item.id in actionIds));
      }

      case USER_LIST_CLEAR:
         return [];

      default:
         return state;
   }
}
