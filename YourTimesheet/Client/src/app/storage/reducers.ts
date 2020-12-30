import { storeTimesheetReducer } from './timesheet.storage';
import { storeUserListReducer } from './user-list.storage';
import { storeUserReducer } from './user.storage';

export const STORE_USER = 'STORE_USER';
export const STORE_USER_LIST = 'STORE_USER_LIST';
export const STORE_TIMESHEET = 'STORE_TIMESHEET';

export const reducers = {
   STORE_USER: storeUserReducer,
   STORE_TIMESHEET: storeTimesheetReducer,
   STORE_USER_LIST: storeUserListReducer
};
