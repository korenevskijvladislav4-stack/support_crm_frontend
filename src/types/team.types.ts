/**
 * Типы для работы с командами
 */

import type { IRole } from './role.types';
import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Краткий формат команды
 */
export interface ITeamShort {
  id: number;
  name: string;
}

/**
 * Полный формат команды
 */
export interface ITeam extends ITeamShort {
  roles?: IRole[];
  users_count?: number;
}

/**
 * Форма создания/редактирования команды
 */
export interface ITeamForm {
  name: string;
  role_id: number[] | null;
}

/**
 * Фильтры для списка команд
 */
export interface ITeamFilters extends IBaseFilter {
  search?: string;
  all?: boolean;
}

/**
 * Ответ API списка команд с пагинацией
 */
export type TeamsResponse = IPaginatedResponse<ITeam>;

/**
 * Статистика по командам
 */
export interface ITeamStats {
  id: number;
  name: string;
  users: {
    count: number;
  };
  groups: {
    count: number;
    items?: {
      id: number;
      name?: string;
      shift?: {
        type?: string | null;
        number?: string | null;
      };
      supervisor?: {
        id: number;
        name: string;
        surname?: string;
        full_name: string;
      } | null;
      users: {
        count: number;
      };
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

export interface ITeamStatsFilters extends IBaseFilter {
  search?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  [key: string]: string | number | boolean | undefined;
}

export type TeamStatsResponse = IPaginatedResponse<ITeamStats>;

/**
 * Команда с pivot-данными (для связей many-to-many)
 */
export interface ITeamWithPivot extends ITeamShort {
  created_at?: string;
  updated_at?: string;
  pivot?: {
    criteria_id: number;
    team_id: number;
  };
}
