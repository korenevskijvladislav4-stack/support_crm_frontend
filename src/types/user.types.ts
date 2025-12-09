/**
 * Типы для работы с пользователями
 */

import type { IRole } from './role.types';
import type { IShift } from './shift.types';
import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Модель текущего авторизованного пользователя (с permissions)
 */
export interface IUserModel {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  roles: IRole[];
  team: string | null;
  team_id: number | null;
  group: string | null;
  group_id: number | null;
  schedule_type: string | null;
  schedule_type_id: number | null;
  created_at?: string;
  /** Все permissions пользователя (из всех ролей) */
  permissions: string[];
}

/**
 * Форма редактирования пользователя
 */
export interface IUserForm {
  name: string;
  surname: string;
  roles: number[];
  team_id: number | null;
  schedule_type_id: number | null;
  group_id: number | null;
  email: string;
  phone?: string;
}

/**
 * Пользователь из API (список, профиль)
 */
export interface IUser {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  roles: string[];
  team: string | null;
  team_id: number | null;
  group: string | null;
  group_id: number | null;
  schedule_type: string | null;
  status?: 'active' | 'deactivated';
  created_at?: string;
}

/**
 * Краткий пользователь (для списков выбора)
 */
export interface IUserShort {
  id: number;
  name: string;
  surname?: string;
  email?: string;
  fullname?: string;
}

/**
 * Фильтры для списка пользователей
 */
export interface IUserFilters extends IBaseFilter {
  full_name?: string | null;
  group?: number[];
  team?: number[];
  roles?: number[];
  schedule_type?: string | null;
  phone?: string | null;
  email?: string | null;
  status?: 'active' | 'deactivated';
}

/**
 * Ответ API списка пользователей
 */
export type UsersResponse = IPaginatedResponse<IUser>;

/**
 * Пользователь с расписанием смен (для календаря)
 */
export interface IUserWithShifts {
  id: number;
  name: string;
  surname: string;
  shifts: IShift[];
}

/**
 * Статистика пользователя
 */
export interface IUserStats {
  id: number;
  name: string;
  surname?: string;
  full_name?: string;
  team?: {
    id: number;
    name: string;
  } | null;
  group?: {
    id: number;
    name: string;
  } | null;
  quality: {
    avg: number | null;
    checks_count: number;
  };
  penalties: {
    count: number;
    hours: number;
  };
  worked_hours: number;
}

export interface IUserStatsFilters extends IBaseFilter {
  search?: string;
  team_id?: number;
  group_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | undefined;
}

export type UserStatsResponse = IPaginatedResponse<IUserStats>;

// Полный профиль пользователя (для /users/{id}/show)
export interface IUserProfileComment {
  id: number;
  comment: string;
  author: {
    id: number;
    name: string;
    surname?: string;
    full_name?: string;
  } | null;
  created_at: string;
}

export interface IUserDeductionStat {
  criterion: {
    id: number;
    name: string | null;
  };
  count: number;
  total_deduction: number;
}

export interface IUserProfileFull {
  id: number;
  name: string;
  surname?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'deactivated';
  created_at?: string;
  team?: {
    id: number;
    name: string;
  } | null;
  group?: {
    id: number;
    name: string;
  } | null;
  schedule_type?: {
    id: number;
    name: string;
  } | null;
  schedule: {
    current_month_hours: number;
    total_hours: number;
    current_month_shifts: number;
    total_shifts: number;
  };
  penalties: {
    count: number;
    hours: number;
  };
  roles?: { id: number; name: string }[];
  penalties_list?: {
    id: number;
    violation_date: string;
    hours_to_deduct: number;
    status: string;
  }[];
  deductions: IUserDeductionStat[];
  quality_maps?: {
    id: number;
    period: { start?: string; end?: string };
    status: string;
    score: number;
  }[];
  comments: IUserProfileComment[];
  timestamps?: {
    created_at?: string;
    updated_at?: string;
  };
}
