/**
 * Типы для работы с ролями
 */

import type { IBaseFilter, IPaginatedResponse } from './common.types';

/**
 * Роль из API
 */
export interface IRole {
  id: number;
  name: string;
  permissions: string[];
  users_count?: number;
}

/**
 * Форма создания/редактирования роли
 */
export interface IRoleForm {
  name: string;
  permissions: string[];
}

export type ICreateRoleForm = IRoleForm;

/**
 * Фильтры для списка ролей
 */
export interface IRoleFilters extends IBaseFilter {
  search?: string;
  all?: boolean;
}

/**
 * Ответ API списка ролей с пагинацией
 */
export type RolesResponse = IPaginatedResponse<IRole>;
