/**
 * Типы для работы с расписанием
 */

import type { ApprovalStatus } from './common.types';

// ============ ОПТИМИЗИРОВАННАЯ СТРУКТУРА API ============

/**
 * Пользователь в расписании
 */
export interface IScheduleUser {
  id: number;
  name: string;
  surname: string;
  group_id: number;
  total_hours: number;
}

/**
 * Данные смены в расписании
 */
export interface IScheduleShift {
  id: number;
  user_shift_id: number | null;
  duration: number;
  status: ApprovalStatus;
}

/**
 * Группа в расписании
 */
export interface IScheduleGroup {
  id: number;
  name: string;
  shift_number: string;
  supervisor_id: number | null;
  user_ids: number[];
}

/**
 * Карта смен: ключ "userId_day" -> данные смены
 */
export type ShiftsMap = Record<string, IScheduleShift>;

/**
 * Оптимизированный ответ API расписания
 */
export interface ISchedule {
  users: IScheduleUser[];
  shifts: ShiftsMap;
  groups: IScheduleGroup[];
  days_in_month: number;
}

// ============ ФОРМЫ И ФИЛЬТРЫ ============

/**
 * Форма создания расписания
 */
export interface IScheduleForm {
  team_id: number;
  top_start?: string;
  bottom_start?: string;
}

/**
 * Фильтры для расписания
 */
export interface IScheduleFilterForm {
  month: string;
  team_id: number | null | undefined;
  shift_type: string;
}

/**
 * Строка таблицы расписания (для рендеринга)
 */
export interface IScheduleTableRow {
  id: number;
  name: string;
  surname: string;
  group_id: number;
  total_hours: number;
  is_supervisor: boolean;
}

// ============ ТИП ГРАФИКА ============

/**
 * Тип графика работы
 */
export interface IScheduleType {
  id: number;
  name: string;
}

// ============ ГЕНЕРАЦИЯ ГРАФИКА ============

/**
 * Статус генерации графика
 */
export type ScheduleGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Ответ при запуске генерации графика
 */
export interface IScheduleGenerationResponse {
  generation_id: number;
  status: ScheduleGenerationStatus;
  total_users: number;
}

/**
 * Статус генерации графика
 */
export interface IScheduleGenerationStatus {
  id: number;
  status: ScheduleGenerationStatus;
  progress: number;
  total_users: number;
  processed_users: number;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
}

// ============ УТИЛИТЫ ============

/**
 * Тип значения поля формы расписания
 */
export type FormFieldValue = string | number | null;
