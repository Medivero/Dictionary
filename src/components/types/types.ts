import { INotifications } from '../../features/notifications/notificationSlicer';
import { IAuthState } from '../../features/auth/authSlice';

export interface IForm {
  id: number;
  name: string;
  translate: string;
}

export interface IDictionartyWords {
  storage: IForm[];
  search: string;
  loaded: boolean;
}

export interface IState {
  dictionary: IDictionartyWords;
  notifications: INotifications;
  auth: IAuthState;
}
