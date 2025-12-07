import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/authSlice';
import { apis, getApiReducers, getApiMiddleware } from '../api';
import { STORAGE_KEYS } from '../constants';

/**
 * Предзагруженное состояние из localStorage
 */
const preloadedState = {
  auth: {
    token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    user: null,
    isLoading: false,
  },
};

/**
 * Корневой reducer с автоматической регистрацией API reducers
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ...getApiReducers(),
});

/**
 * Конфигурация Redux store
 */
export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем проверку сериализации для RTK Query
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(getApiMiddleware()) as any,
  devTools: import.meta.env.MODE !== 'production',
});

/**
 * Инициализация: загрузка текущего пользователя если есть токен
 */
if (localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)) {
  const authApi = apis.find(api => api.reducerPath === 'authApi');
  if (authApi && 'endpoints' in authApi) {
    store.dispatch<any>((authApi as typeof apis[0]).endpoints.currentUser.initiate());
  }
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
