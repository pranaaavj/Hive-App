import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage or sessionStorage)
import { authApi } from '@/services/authApi';
import userReducer from '../slices/userSlice';
import { configureStore } from '@reduxjs/toolkit';

// Persist configuration
const persistConfig = {
  key: 'user',
  storage,
  whitelist: ['user'], // Only persist the 'user' field
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    user: persistedUserReducer, // Use the persisted version
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }).concat(authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
