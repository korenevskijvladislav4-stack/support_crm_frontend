/**
 * Типы для работы с картами качества
 */

import type { Dayjs } from 'dayjs';
import type { IBaseFilter, IPaginatedResponse } from './common.types';
import type { IUserShort } from './user.types';
import type { ITeamShort } from './team.types';
import type { IQualityCriteria } from './quality-criteria.types';

// ============ КАРТЫ КАЧЕСТВА ============

/**
 * Вычеты по чатам
 */
export interface IQualityDeduction {
  id: number;
  quality_map_id: number;
  criteria_id: number;
  chat_id: string;
  deduction: number;
  comment: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  criterion?: IQualityCriteria;
  createdBy?: IUserShort;
}

/**
 * Вычеты по звонкам
 */
export interface IQualityCallDeduction {
  id: number;
  quality_map_id: number;
  criteria_id: number;
  call_id: string;
  deduction: number;
  comment: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  criterion?: IQualityCriteria;
  createdBy?: IUserShort;
}

/**
 * Снятие (для списков)
 */
export interface IQualityDeductionListItem {
  id: number;
  quality_map_id: number;
  user?: IUserShort | null;
  team?: ITeamShort | null;
  criterion?: IQualityCriteria | null;
  chat_id: string;
  deduction: number;
  comment: string;
  created_by: number;
  createdBy?: IUserShort | null;
  created_at: string;
  created?: {
    by?: (IUserShort & { full_name?: string }) | null;
    at?: string;
  };
  period?: {
    start?: string | null;
    end?: string | null;
  };
  period_start?: string;
  period_end?: string;
}

/**
 * Карта качества (полная)
 */
export interface IQualityMap {
  id: number;
  status: 'active' | 'completed';
  period: {
    start: string;
    end: string;
  };
  user: {
    id: number;
    name: string;
    surname?: string;
  };
  team: {
    id: number;
    name: string;
  };
  checker: {
    id: number;
    name: string;
    surname?: string;
  };
  chat_ids: string[];
  call_ids?: string[];
  comment: string | null;
  progress: {
    chats: { total: number; checked: number };
    calls: { total: number; checked: number };
  };
  score: number;
  criteria: IQualityMapCriterion[];
  deductions?: IQualityDeduction[];
  call_deductions?: IQualityCallDeduction[];
  timestamps: {
    created_at: string;
    updated_at: string;
  };
}

/**
 * Элемент списка карт качества
 */
export interface IQualityMapListItem {
  id: number;
  status: 'active' | 'completed';
  period: {
    start: string;
    end: string;
  };
  user: {
    id: number;
    name: string;
    surname?: string;
  };
  team: {
    id: number;
    name: string;
  };
  checker: {
    id: number;
    name: string;
    surname?: string;
  };
  progress: {
    chats: { total: number; checked: number };
    calls: { total: number; checked: number };
  };
  score: number;
  timestamps: {
    created_at: string;
    updated_at: string;
  };
}

// ============ ФОРМЫ И ЗАПРОСЫ ============

/**
 * Форма создания карты качества
 */
export interface ICreateQualityMapRequest {
  user_id: number;
  team_id: number;
  start_date: string;
  end_date: string;
  chat_count: number;
  calls_count?: number;
}

/**
 * Форма создания вычета (чат)
 */
export interface ICreateDeductionRequest {
  quality_map_id: number;
  criteria_id: number;
  chat_id: string;
  deduction: number;
  comment: string;
}

/**
 * Форма создания вычета (звонок)
 */
export interface ICreateCallDeductionRequest {
  quality_map_id: number;
  criteria_id: number;
  call_id: string;
  deduction: number;
  comment: string;
}

/**
 * Обновление ID чатов
 */
export interface IUpdateChatIdsRequest {
  chat_ids: string[];
}

/**
 * Обновление ID звонков
 */
export interface IUpdateCallIdsRequest {
  call_ids: string[];
}

// ============ ФИЛЬТРЫ ============

/**
 * Фильтры для списка карт качества
 */
export interface IQualityMapsFilter extends IBaseFilter {
  team_id?: number;
  user_id?: number;
  group_id?: number;
  checker_id?: number;
  status?: 'active' | 'completed' | 'all';
  search?: string;
  start_date?: string;
}

/**
 * Фильтры для списка снятий
 */
export interface IQualityDeductionsFilter extends IBaseFilter {
  user_id?: number;
  team_id?: number;
  criteria_id?: number;
  created_by?: number;
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Ответ API списка карт качества
 */
export type QualityMapListResponse = IPaginatedResponse<IQualityMapListItem>;
export type QualityDeductionListResponse = IPaginatedResponse<IQualityDeductionListItem>;

// ============ UI ТИПЫ ============

/**
 * Значения формы карты качества
 */
export interface IQualityMapFormValues {
  user_id: number;
  team_id: number;
  dates: [Dayjs, Dayjs];
  chat_count: number;
  calls_count?: number;
}

export interface IQualityMapCriterion {
  id: number; // snapshot id
  criteria_id?: number | null; // original criterion id
  name: string;
  description?: string;
  max_score?: number;
  category?: {
    id: number;
    name: string;
  } | null;
}

/**
 * Значения формы вычета
 */
export interface IDeductionFormValues {
  deduction: number;
  comment: string;
}

/**
 * Значения формы редактирования чата
 */
export interface IEditChatModalValues {
  chatName: string;
}

/**
 * Значения формы редактирования звонка
 */
export interface IEditCallModalValues {
  callName: string;
}

/**
 * Выбранная ячейка в таблице качества
 */
export interface ISelectedCell {
  criteriaId: number;
  chatIndex: number;
  existingDeduction?: IQualityDeduction;
}

/**
 * Строка таблицы качества
 */
export interface IQualityTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal: boolean;
  [key: string]: unknown;
}

// ============ ПЕРЕЭКСПОРТ ДЛЯ ОБРАТНОЙ СОВМЕСТИМОСТИ ============

/** @deprecated Используйте IUserShort из user.types.ts */
export type User = IUserShort;

/** @deprecated Используйте ITeamShort из team.types.ts */
export type Team = ITeamShort;

/** @deprecated Используйте IQualityCriteria из quality-criteria.types.ts */
export type QualityCriterion = IQualityCriteria;

/** @deprecated Используйте IQualityDeduction */
export type QualityDeduction = IQualityDeduction;

/** @deprecated Используйте IQualityCallDeduction */
export type QualityCallDeduction = IQualityCallDeduction;

/** @deprecated Используйте IQualityMap */
export type QualityMap = IQualityMap;
