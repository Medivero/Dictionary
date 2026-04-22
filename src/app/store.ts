import { configureStore } from '@reduxjs/toolkit';
import { notifticationSlice } from '../features/notifications/notificationSlicer';
import { dictionaryHistorySlice } from '../features/dictionary/dictionarySlicer';
import { authSlice } from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    dictionary: dictionaryHistorySlice.reducer,
    notifications: notifticationSlice.reducer,
    auth: authSlice.reducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
