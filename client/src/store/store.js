import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import contactsSlice from './slices/contactsSlice';
import dealsSlice from './slices/dealsSlice';
import campaignsSlice from './slices/campaignsSlice';
import ticketsSlice from './slices/ticketsSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    contacts: contactsSlice,
    deals: dealsSlice,
    campaigns: campaignsSlice,
    tickets: ticketsSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});