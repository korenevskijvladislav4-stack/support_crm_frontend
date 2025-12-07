/**
 * Типы для работы с критериями качества
 */

import type { ITeamWithPivot } from './team.types';
import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Категория критерия качества
 */
export interface IQualityCriteriaCategory {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * Критерий качества из API
 */
export interface IQualityCriteria {
  id: number;
  name: string;
  description?: string;
  max_score?: number;
  is_global?: boolean;
  is_active?: boolean;
  category?: IQualityCriteriaCategory | null;
  teams?: ITeamWithPivot[];
  timestamps?: {
    created_at?: string;
    updated_at?: string;
  };
}

/**
 * Форма создания/редактирования критерия качества
 */
export interface IQualityCriteriaForm {
  name: string;
  description?: string;
  max_score?: number;
  team_ids?: number[];
  is_global?: boolean;
  category_id?: number | null;
}

/**
 * Значения формы критерия качества
 */
export interface ICriterionFormValues {
  name: string;
  description: string;
  max_score: number;
  team_ids: number[];
  is_global: boolean;
  category_id?: number | null;
}

/**
 * Фильтры для списка критериев качества
 */
export interface IQualityCriteriaFilters extends IBaseFilter {
  search?: string;
  team_id?: number;
  is_global?: 'global' | 'team';
  all?: boolean;
  status?: 'active' | 'deleted' | 'all';
  [key: string]: string | number | boolean | undefined;
}

/**
 * Ответ API списка критериев с пагинацией
 */
export type QualityCriteriaResponse = IPaginatedResponse<IQualityCriteria>;
