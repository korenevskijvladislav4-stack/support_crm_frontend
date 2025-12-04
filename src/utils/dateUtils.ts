// utils/dateUtils.ts
import dayjs from 'dayjs';

/**
 * Форматирует дату в формате ДД-ММ-ГГГГ ЧЧ:ММ
 * @param dateString - строка даты в любом формате
 * @returns отформатированная дата
 */
export const formatDate = (dateInput: string | Date): string => {
  return dayjs(dateInput).format('DD.MM.YYYY');
};

export const formatDateTime = (dateInput: string | Date): string => {
  return dayjs(dateInput).format('DD.MM.YYYY HH:mm');
};

/**
 * Форматирует время в формате ЧЧ:ММ
 * @param dateString - строка даты в любом формате
 * @returns отформатированное время
 */
export const formatTime = (dateString: Date): string => {
  return dayjs(dateString).format('HH:mm');
};

/**
 * Проверяет валидность даты
 * @param dateString - строка даты
 * @returns true если дата валидна
 */
export const isValidDate = (dateString: Date): boolean => {
  return dayjs(dateString).isValid();
};