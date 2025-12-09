/**
 * Типы для работы со сменами
 */

import type { ApprovalStatus } from './common.types';

/**
 * Смена из API
 */
export interface IShift {
  id: number;
  user_shift_id?: number;
  date: string;
  duration: number;
  status: ApprovalStatus;
  is_active: boolean;
}

/**
 * Запрос смены из API
 */
export interface IShiftRequest {
  id: number;
  user_id: number;
  shift_id: number;
  duration: number;
  status: ApprovalStatus;
  is_active: boolean;
  is_viewed?: boolean;
  role_peer_count?: number | null;
  shift?: {
    id: number;
    date: string;
  };
  user?: {
    id: number;
    fullname: string;
    team_id?: number | null;
  };
}

/**
 * Форма создания запроса смены
 */
export interface ICreateShiftRequest {
  shift_id?: number;
  date?: string;
  duration: number;
  user_id?: number;
}

/**
 * Форма создания прямой смены
 */
export interface ICreateDirectShiftRequest {
  shift_id?: number;
  date?: string;
  duration: number;
  user_id: number;
}

