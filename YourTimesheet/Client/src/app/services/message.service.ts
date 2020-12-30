import { Injectable, EventEmitter } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

const MESSAGE_DURATION = 4000;

export enum MessageType {
   Message = 'message',
   Error = 'error'
}

export interface IError {
   error: boolean;
   msg: string;
}

export interface IMessage {
   message: string;
   type: MessageType;
}

/**
 * Allows to diaplay messages
 */
@Injectable({
   providedIn: 'root'
})
export class MessageService {
   constructor (private snackBar: MatSnackBar) {
   }

   public static fromError(data: any): string {
      if (!data) {
         return null;
      }

      if (data instanceof Error) {
         return data.message;
      }

      if (data instanceof HttpErrorResponse) {
         if (data.error) {
            if (typeof data.error === 'string') {
               return data.error;
            }

            if (data.error.title) {
               return data.error.title;
            }
         }

         return data.message;
      }

      if (typeof data === 'string') {
         return <string>data;
      }

      if ('error' in data) {
         return (<IError>data).msg;
      }

      return null;
   }

   public showMessage(message: string): void {
      this.snackBar.open(message, null, {
         duration: MESSAGE_DURATION,
         panelClass: ['-g-message-type-message']
      });
   }

   public showError(message: any): void {
      message = MessageService.fromError(message);

      this.snackBar.open(message, null, {
         duration: MESSAGE_DURATION,
         panelClass: ['-g-message-type-error']
      });
   }
}
