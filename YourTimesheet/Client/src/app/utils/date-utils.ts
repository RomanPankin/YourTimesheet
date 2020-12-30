import { format, parseISO } from 'date-fns';

const DATE_ISO_FORMAT = 'yyyy-MM-dd\'T\'HH:mm:ss';

export class DateUtils {
   public static format(date: Date, dateFormat: string): string {
      if (date == null || dateFormat == null) {
         return null;
      }

      return format(date, dateFormat);
   }

   public static formatToISO(date: Date): string {
      if (date == null) {
         return null;
      }

      return format(date, DATE_ISO_FORMAT);
   }

   public static parse(date: string): Date {
      return parseISO(date);
   }
}
