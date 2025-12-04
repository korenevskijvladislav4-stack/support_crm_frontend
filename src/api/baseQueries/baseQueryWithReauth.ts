import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { baseQueryWithAuth } from './baseQueryWithAuth';

// 1. Сначала явно типизируем baseQueryWithAuth

// 2. Затем создаем основной query с reauth
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 3. Используем типизированную версию
  const result = await baseQueryWithAuth(args, api, extraOptions);

  if (result?.error?.status === 401) {
    localStorage.removeItem('auth_token');

    // 4. Возвращаем явно типизированную ошибку
    return {
      error: {
        status: 401,
        data: {
          message: 'Session expired',
          code: 'AUTH_REQUIRED'
        }
      }
    };
  }

  return result;
};