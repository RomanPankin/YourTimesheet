import { UserEditType } from './user-edit-type';
import { IUser } from './user';

export interface IUserEditable extends IUser {
   editableType: UserEditType;
   changedValues?: IUser;
}
