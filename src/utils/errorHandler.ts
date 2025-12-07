import { message } from 'antd';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { HTTP_STATUS } from '../constants';

/**
 * Интерфейс ошибки API
 */
interface ApiError {
  message?: string;
  error?: string;
  error_code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Проверить, является ли ошибка FetchBaseQueryError
 */
export const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError => {
  return typeof error === 'object' && error !== null && 'status' in error;
};

/**
 * Получить сообщение об ошибке из ответа API
 */
export const getErrorMessage = (error: unknown): string => {
  if (isFetchBaseQueryError(error)) {
    const data = error.data as ApiError | undefined;
    
    if (data?.message) {
      return data.message;
    }
    
    if (data?.error) {
      return data.error;
    }
    
    if (data?.errors) {
      return Object.values(data.errors).flat().join('. ');
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};

/**
 * Обработать ошибку API и показать уведомление
 */
export const handleApiError = (error: unknown, defaultMessage?: string): void => {
  if (!isFetchBaseQueryError(error)) {
    message.error(defaultMessage || 'Произошла ошибка');
    return;
  }

  const data = error.data as ApiError | undefined;
  
  switch (error.status) {
    case HTTP_STATUS.UNAUTHORIZED:
      message.error('Сессия истекла. Войдите снова.');
      break;
      
    case HTTP_STATUS.FORBIDDEN:
      message.error(data?.message || 'Недостаточно прав для выполнения операции');
      break;
      
    case HTTP_STATUS.NOT_FOUND:
      message.error(data?.message || 'Запрашиваемый ресурс не найден');
      break;
      
    case HTTP_STATUS.CONFLICT:
      message.error(data?.message || 'Конфликт данных');
      break;
      
    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      if (data?.errors) {
        Object.values(data.errors).flat().forEach(err => message.error(err));
      } else {
        message.error(data?.message || 'Ошибка валидации данных');
      }
      break;
      
    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      message.error('Внутренняя ошибка сервера. Попробуйте позже.');
      break;
      
    default:
      message.error(data?.message || defaultMessage || 'Произошла ошибка');
  }
};

/**
 * Обработать успешное действие
 */
export const handleSuccess = (successMessage: string): void => {
  message.success(successMessage);
};

/**
 * Обработать предупреждение
 */
export const handleWarning = (warningMessage: string): void => {
  message.warning(warningMessage);
};

