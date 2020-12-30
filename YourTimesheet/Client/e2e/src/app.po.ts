import { browser, by, element, ElementFinder } from 'protractor';
import { protractor } from 'protractor/built/ptor';

export class AppPage {
   public navigateToStartPage() {
      return browser.get('https://localhost:44366/');
   }

   public async getUserLoginDialog(): Promise<ElementFinder> {
      const EC = protractor.ExpectedConditions;

      return await browser.driver.wait(function () {
         const el = element(by.css('app-user-dialog'));

         browser.wait(EC.visibilityOf(el), 5000);
         return el;
      });
   }
}
