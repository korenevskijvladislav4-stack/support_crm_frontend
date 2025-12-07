/**
 * Типы для работы с разрешениями
 */

/**
 * Разрешение из API
 */
export interface IPermission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

