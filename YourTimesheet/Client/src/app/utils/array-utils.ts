import { IDictionary } from '../models/dictionary';
import { IGroup } from '../models/group';

export class ArrayUtils {
   public static toDictionary<T>(array: T[], id: (item: T) => any): IDictionary<T> {
      if (!array) {
         return {};
      }

      const result = {};
      array.forEach(x => result[id(x)] = x);

      return result;
   }

   public static groupBy<T>(array: T[], groupId: (item: T) => any): IGroup<T>[] {
      const result: IGroup<T>[] = [];
      const resultIndexed: IDictionary<IGroup<T>> = {};

      array.forEach(item => {
         const groupIdValue = groupId(item);

         let cell = resultIndexed[groupIdValue];
         if (!cell) {
            cell = { title: groupIdValue, items: []};
            resultIndexed[groupIdValue] = cell;
            result.push(cell);
         }

         cell.items.push(item);
      });

      return result;
   }
}
