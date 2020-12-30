import { Action } from '@ngrx/store';
import { ArrayUtils } from '../utils/array-utils';
import { ITimesheetItem } from './../models/timesheet-item';

export const TIMESHEET_ADD = 'TIMESHEET_ADD';
export const TIMESHEET_UPDATE = 'TIMESHEET_UPDATE';
export const TIMESHEET_DELETE = 'TIMESHEET_DELETE';
export const TIMESHEET_CLEAR = 'TIMESHEET_CLEAR';

export interface ITimesheetAction extends Action {
   items?: ITimesheetItem[];
}

const INITIAL_TIMESHEET_STATE: ITimesheetItem[] = [];

function sortFunction(a: ITimesheetItem, b: ITimesheetItem): number {
   const dates = a.date.getTime() - b.date.getTime();
   if (dates) {
      return dates;
   }

   return a.id - b.id;
}

export function storeTimesheetReducer(state: ITimesheetItem[] = INITIAL_TIMESHEET_STATE, action: ITimesheetAction): ITimesheetItem[] {
   switch (action.type) {
      case TIMESHEET_ADD:
         return [...(state || []), ...(action.items || [])].sort(sortFunction);

      case TIMESHEET_UPDATE: {
         const actionIds = ArrayUtils.toDictionary(action.items, x => x.id);
         const newState = (state || []).map(item => {
            const addingItem = actionIds[item.id];
            if (!addingItem) {
               return item;
            }

            return addingItem;
         });

         return newState.sort(sortFunction);
      }

      case TIMESHEET_DELETE: {
         const actionIds = ArrayUtils.toDictionary(action.items, x => x.id);
         return (state || []).filter(item => !(item.id in actionIds));
      }

      case TIMESHEET_CLEAR:
         return [];

      default:
         return state;
   }
}
