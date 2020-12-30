# YourTimesheet project

Write an application for time management system

1. User must be able to create an account and log in. (If a mobile application, this means that more users can use the app from the same phone).
2. User can add (and edit and delete) a row describing what they have worked on, what date, and for how long.
3. User can add a setting (Preferred working hours per day).
4. If on a particular date a user has worked under the PreferredWorkingHourPerDay, these rows are red, otherwise green.
5. Implement at least three roles with different permission levels: a regular user would only be able to CRUD on their owned records, a user manager would be able to CRUD users, and an admin would be able to CRUD all records and users.
6. Filter entries by date from-to.
7. Export the filtered times to a sheet in HTML:
  * Date: 2018.05.21
  * Total time: 9h
  * Notes:
    * Note1
    * Note2
    * Note3
	
8. REST API. Make it possible to perform all user actions via the API, including authentication (If a mobile application and you don’t know how to create your own backend you can use Firebase.com or similar services to create the API).
9. In any case, you should be able to explain how a REST API works and demonstrate that by creating functional tests that use the REST Layer directly. Please be prepared to use REST clients like Postman, cURL, etc. for this purpose.
10. If it’s a web application, it must be a single-page application. All actions need to be done client-side using AJAX, refreshing the page is not acceptable. (If a mobile application, disregard this).
11. Functional UI/UX design is needed. You are not required to create a unique design, however, do follow best practices to make the project as functional as possible.
12. Bonus: unit and e2e tests.
