import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Default storage (localStorage or sessionStorage)
import { authApi } from '@/services/authApi';
import userReducer from '../slices/userSlice';
import { configureStore } from '@reduxjs/toolkit';
import { postApi } from '@/services/postApi';
import { commentApi } from '@/services/commentApi';

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
    [postApi.reducerPath]:postApi.reducer,
    [commentApi.reducerPath]:commentApi.reducer,
    user: persistedUserReducer, // Use the persisted version
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
    }).concat(authApi.middleware,postApi.middleware,commentApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
