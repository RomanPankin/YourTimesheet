import { AppPage } from './app.po';

describe('App', () => {
   let page: AppPage;

   beforeEach(() => {
      page = new AppPage();
   });

   it('should display login page', async () => {
      page.navigateToStartPage();

      expect((await page.getUserLoginDialog()).isPresent()).toBeTruthy();
   });
});
