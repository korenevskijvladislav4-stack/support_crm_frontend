/**
 * Типы для работы с заявками на регистрацию
 */

import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Заявка на регистрацию из API
 */
export interface IAttempt {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  created_at: string;
  is_viewed?: boolean;
}

/**
 * Форма одобрения заявки
 */
export interface IAttemptForm {
  name: string;
  surname: string;
  email: string;
  phone?: string;
  roles: number[];
  team_id: number | null;
  group_id: number | null;
  schedule_type_id: number | null;
  start_date?: string | null;
}

/**
 * Фильтры для списка заявок
 */
export interface IAttemptsFilter extends IBaseFilter {
  search?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  is_viewed?: boolean | null;
}

/**
 * Ответ API списка заявок
 */
export type AttemptsResponse = IPaginatedResponse<IAttempt>;

