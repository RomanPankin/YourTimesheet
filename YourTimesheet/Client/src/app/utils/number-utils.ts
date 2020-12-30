export class NumberUtils {
   public static parseNum(value: string | number): number {
      if (value === null) {
         return null;
      }

      const result = +value;
      return isNaN(result) ? null : result;
   }
}
