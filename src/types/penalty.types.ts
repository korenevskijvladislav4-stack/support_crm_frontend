/**
 * Типы для работы со штрафами
 */

import type { ApprovalStatus, IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Штраф из API
 */
export interface IPenalty {
  id: number;
  user_id: number;
  user?: {
    id: number;
    fullname: string;
  };
  created_by: number;
  creator?: {
    id: number;
    fullname: string;
  };
  hours_to_deduct: number;
  comment: string;
  chat_id?: string;
  violation_date?: string;
  status: ApprovalStatus;
  created_at: string;
}

/**
 * Форма создания/редактирования штрафа
 */
export interface IPenaltyForm {
  user_id: number | null;
  hours_to_deduct: number | null;
  comment: string;
  chat_id?: string;
  violation_date?: string;
  status?: ApprovalStatus;
}

/**
 * Статус фильтра штрафов (включая 'all')
 */
export type PenaltyFilterStatus = ApprovalStatus | 'all';

/**
 * Фильтры для списка штрафов
 */
export interface IPenaltiesFilter extends IBaseFilter {
  search?: string;
  user_id?: number;
  group_id?: number;
  created_by?: number;
  created_at?: string;
  violation_date?: string;
  status?: PenaltyFilterStatus;
}

/**
 * Ответ API списка штрафов
 */
export type PenaltiesResponse = IPaginatedResponse<IPenalty>;
