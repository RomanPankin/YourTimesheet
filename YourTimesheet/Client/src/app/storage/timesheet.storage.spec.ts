import { ITimesheetItem } from './../models/timesheet-item';
import { storeTimesheetReducer, ITimesheetAction, TIMESHEET_ADD, TIMESHEET_UPDATE, TIMESHEET_DELETE, TIMESHEET_CLEAR } from './timesheet.storage';

interface IInlineData<S, I, E> {
   description: string;
   state: S;
   input: I;
   expected: E;
}

describe('storeTimesheetReducer', () => {
   beforeEach((() => {
   }));

   it('initial state is empty', () => {
      const result = storeTimesheetReducer(undefined, <ITimesheetAction>{});
      expect(result).toEqual([]);
   });

   // TIMESHEET_ADD
   let inlineData: IInlineData<ITimesheetItem[], ITimesheetItem[], ITimesheetItem[]>[] = [
      { description: 'empty state',
        state: [],
        input: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }]
      },
      { description: 'empty input',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: [],
        expected: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }]
      },
      { description: 'undefined input',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: undefined,
        expected: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }]
      },
      { description: 'existing state',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: [ { id: 2, description: 'item2', date: new Date(), durationInHours: 5 } ],
        expected: [
           { id: 1, description: 'item1', date: new Date(), durationInHours: 2 },
           { id: 2, description: 'item2', date: new Date(), durationInHours: 5 }
        ]
      },
      { description: 'order by date (added less date)',
        state: [ { id: 1, description: 'item1', date: new Date(2020, 2, 20), durationInHours: 2 } ],
        input: [ { id: 2, description: 'item2', date: new Date(2020, 1, 20), durationInHours: 5 } ],
        expected: [
         { id: 2, description: 'item2', date: new Date(2020, 1, 20), durationInHours: 5 } ,
         { id: 1, description: 'item1', date: new Date(2020, 2, 20), durationInHours: 2 }
        ]
      },
      { description: 'order by date (added greater date)',
        state: [ { id: 1, description: 'item1', date: new Date(2020, 2, 20), durationInHours: 2 } ],
        input: [ { id: 2, description: 'item2', date: new Date(2020, 3, 20), durationInHours: 5 } ],
        expected: [
         { id: 1, description: 'item1', date: new Date(2020, 2, 20), durationInHours: 2 },
         { id: 2, description: 'item2', date: new Date(2020, 3, 20), durationInHours: 5 }
        ]
      }
   ];

   inlineData.forEach(data => {
      it(`called TIMESHEET_ADD for ${data.description}`, () => {
         const result = storeTimesheetReducer(data.state, { type: TIMESHEET_ADD, items: data.input });
         expect(result).toEqual(data.expected);
      });
   });

   // TIMESHEET_UPDATE
   inlineData = [
      { description: 'empty state',
        state: [],
        input: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: []
      },
      { description: 'added unknown',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: [ { id: 2, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 } ]
      },
      { description: 'fields updated',
        state: [
           { id: 1, description: 'item1', date: new Date(2020, 1, 1), durationInHours: 1 },
           { id: 2, description: 'item2', date: new Date(2020, 1, 2), durationInHours: 2 }
         ],
        input: [
         { id: 2, description: 'item20', date: new Date(2020, 1, 20), durationInHours: 20 },
         { id: 1, description: 'item10', date: new Date(2020, 1, 10), durationInHours: 10 }
        ],
        expected: [
         { id: 1, description: 'item10', date: new Date(2020, 1, 10), durationInHours: 10 },
         { id: 2, description: 'item20', date: new Date(2020, 1, 20), durationInHours: 20 }
        ]
      }
   ];

   inlineData.forEach(data => {
      it(`called TIMESHEET_UPDATE for ${data.description}`, () => {
         const result = storeTimesheetReducer(data.state, { type: TIMESHEET_UPDATE, items: data.input });
         expect(result).toEqual(data.expected);
      });
   });

   // TIMESHEET_DELETE
   inlineData = [
      { description: 'empty state',
        state: [],
        input: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: []
      },
      { description: 'remove unknown',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 },
                 { id: 2, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: [ { id: 3, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: [
           { id: 1, description: 'item1', date: new Date(), durationInHours: 2 },
           { id: 2, description: 'item1', date: new Date(), durationInHours: 2 }
        ]
      },
      { description: 'remove items',
        state: [
           { id: 1, description: 'item1', date: new Date(2020, 1, 1), durationInHours: 1 },
           { id: 2, description: 'item2', date: new Date(2020, 1, 2), durationInHours: 2 },
           { id: 3, description: 'item2', date: new Date(2020, 1, 2), durationInHours: 2 }
         ],
        input: [
         { id: 3, description: '***', date: new Date(), durationInHours: 10 },
         { id: 1, description: '*', date: new Date(), durationInHours: 20 }
        ],
        expected: [
         { id: 2, description: 'item2', date: new Date(2020, 1, 2), durationInHours: 2 }
        ]
      }
   ];

   inlineData.forEach(data => {
      it(`called TIMESHEET_DELETE for ${data.description}`, () => {
         const result = storeTimesheetReducer(data.state, { type: TIMESHEET_DELETE, items: data.input });
         expect(result).toEqual(data.expected);
      });
   });

   // TIMESHEET_CLEAR
   inlineData = [
      { description: 'empty state',
        state: [],
        input: [],
        expected: []
      },
      { description: 'existing',
        state: [ { id: 1, description: 'item1', date: new Date(), durationInHours: 2 },
                 { id: 2, description: 'item1', date: new Date(), durationInHours: 2 } ],
        input: [ { id: 3, description: 'item1', date: new Date(), durationInHours: 2 }],
        expected: [
        ]
      }
   ];

   inlineData.forEach(data => {
      it(`called TIMESHEET_CLEAR for ${data.description}`, () => {
         const result = storeTimesheetReducer(data.state, { type: TIMESHEET_CLEAR, items: data.input });
         expect(result).toEqual(data.expected);
      });
   });
 });
