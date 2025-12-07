/**
 * Общие типы для API и приложения
 */

/**
 * Стандартная структура ответа API
 */
export interface IApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Ответ API со списком данных
 */
export interface IListResponse<T> {
  data: T[];
  total?: number;
}

/**
 * Метаданные пагинации
 */
export interface IPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

/**
 * Ответ API с пагинацией
 */
export interface IPaginatedResponse<T> {
  data: T[];
  meta: IPaginationMeta;
}

/**
 * Базовые параметры фильтрации с пагинацией
 */
export interface IBaseFilter {
  page?: number;
  per_page?: number;
  sort_field?: string;
  sort_direction?: 'asc' | 'desc';
}

/**
 * Статусы сущностей
 */
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'completed';

/**
 * Статус одобрения
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

