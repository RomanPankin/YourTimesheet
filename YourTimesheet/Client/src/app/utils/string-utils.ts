export class StringUtils {
   public static format(text: string, ...args): string {
      return text.replace(/{(\d+)}/g, (match, number) => {
         return args[number];
       });
   }

   public static isNullOrEmpty(text: string): boolean {
      return (text || '').trim().length === 0;
   }
}
