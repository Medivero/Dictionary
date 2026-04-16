import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface INotification {
  type: 'error' | 'message' | 'warning';
  text: string;
}

export interface INotifications {
  last: INotification;
  history: INotification[];
}

const initialState: INotifications = {
  last: {
    type: 'message',
    text: '',
  },
  history: [],
};

export const notifticationSlice = createSlice({
  name: 'notificationStore',
  initialState,
  reducers: {
    sendNotification: (state, action: PayloadAction<INotification>) => {
      state.last = action.payload;
      state.history.push(action.payload);
    },
  },
});

export const { sendNotification } = notifticationSlice.actions;
