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
