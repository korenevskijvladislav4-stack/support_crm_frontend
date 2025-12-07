import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { baseQueryWithAuth } from './baseQueryWithAuth';

const normalizeApiResponse = (payload: unknown): unknown => {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const typedPayload = payload as Record<string, unknown>;
  const hasMeta = Object.prototype.hasOwnProperty.call(typedPayload, 'meta');
  const hasData = Object.prototype.hasOwnProperty.call(typedPayload, 'data');

  // Если есть meta — оставляем структуру нетронутой (нужна для пагинации и т.п.)
  if (hasMeta || !hasData) {
    return payload;
  }

  // Если meta нет, но есть data — разворачиваем data, чтобы в компонентах остались прежние типы
  return typedPayload.data;
};

// 1. Сначала явно типизируем baseQueryWithAuth

// 2. Затем создаем основной query с reauth
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // 3. Используем типизированную версию
  const result = await baseQueryWithAuth(args, api, extraOptions);

  if ('data' in result) {
    (result as typeof result & { rawData?: unknown }).rawData = result.data;
    result.data = normalizeApiResponse(result.data);
  }

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