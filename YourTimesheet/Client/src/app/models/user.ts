import { ISettings } from './settings';

export interface IUser {
  id?: number;
  email: string;
  pwd?: string;
  settings?: ISettings;
}
