﻿CREATE TABLE "TIMESHEET" (
	"TIMESHEET_ID"	INTEGER NOT NULL,
	"USER_ID"	INTEGER NOT NULL,
	"WORKING_DATE"	TEXT NOT NULL,
	"WORKING_HOURS"	INTEGER NOT NULL,
	"WORKING_DESCRIPTION"	TEXT NOT NULL,
	PRIMARY KEY("TIMESHEET_ID" AUTOINCREMENT),
	FOREIGN KEY("USER_ID") REFERENCES USERS(USER_ID)
);