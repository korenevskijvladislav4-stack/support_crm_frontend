/**
 * Типы для работы с группами
 */

import type { IUserWithShifts } from './user.types';
import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Супервайзер группы
 */
export interface IGroupSupervisor {
  id: number;
  fullname: string;
}

/**
 * Группа из API
 */
export interface IGroup {
  id: number;
  name: string;
  shift: {
    type: string;
    number: string;
  };
  team: {
    id: number;
    name: string;
  } | null;
  supervisor?: {
    id: number;
    name: string;
    surname?: string;
    full_name: string;
  } | null;
  users?: {
    count?: number;
  };
}

/**
 * Группа с пользователями и сменами (для расписания)
 */
export interface IGroupWithUsers {
  id: number;
  name: string;
  shift_number: string;
  users: IUserWithShifts[];
}

/**
 * Форма создания/редактирования группы
 */
export interface IGroupForm {
  name: string;
  team_id: number | null;
  shift_type: string | null;
  shift_number: string | null;
  supervisor_id?: number | null;
}

/**
 * Фильтры для списка групп
 */
export interface IGroupFilters extends IBaseFilter {
  search?: string;
  team_id?: number;
  shift_type?: string;
  all?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Ответ API списка групп с пагинацией
 */
export type GroupsResponse = IPaginatedResponse<IGroup>;

/**
 * Статус группы для UI
 */
export type GroupStatusType = 'success' | 'processing' | 'default' | 'error' | 'warning';

/**
 * Статистика группы
 */
export interface IGroupStats {
  id: number;
  name: string;
  shift: {
    type: string;
    number: string;
  };
  team: {
    id: number;
    name: string;
  } | null;
  supervisor: {
    id: number;
    name: string;
    surname?: string;
    full_name: string;
  } | null;
  users: {
    count: number;
    items?: {
      id: number;
      name?: string;
      surname?: string;
      full_name?: string;
      quality: {
        avg: number | null;
        checks_count: number;
      };
      penalties: {
        count: number;
        hours: number;
      };
    }[];
  };
  quality: {
    avg: number | null;
    checks_count: number;
  };
  penalties: {
    count: number;
    hours: number;
  };
}

/**
 * Фильтры для статистики групп
 */
export interface IGroupStatsFilters extends IBaseFilter {
  search?: string;
  team_id?: number;
  shift_type?: string;
  shift_number?: string;
  supervisor_id?: number;
  date_from?: string;
  date_to?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Ответ API статистики групп
 */
export type GroupStatsResponse = IPaginatedResponse<IGroupStats>;
