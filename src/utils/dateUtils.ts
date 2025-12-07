import dayjs, { type Dayjs } from 'dayjs';

/**
 * Форматы дат
 */
export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD.MM.YYYY',
  DISPLAY_WITH_TIME: 'DD.MM.YYYY HH:mm',
  MONTH_YEAR: 'YYYY-MM',
  TIME: 'HH:mm',
  FULL: 'DD.MM.YYYY HH:mm:ss',
} as const;

/**
 * Форматировать дату для API
 */
export const formatDateForApi = (date: Dayjs | Date | string | null): string | null => {
  if (!date) return null;
  return dayjs(date).format(DATE_FORMATS.API);
};

/**
 * Форматировать дату для отображения
 */
export const formatDateForDisplay = (date: string | Date | null): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_FORMATS.DISPLAY);
};

/**
 * Алиас для formatDateForDisplay
 */
export const formatDate = formatDateForDisplay;

/**
 * Форматировать дату с временем для отображения
 */
export const formatDateTimeForDisplay = (date: string | Date | null): string => {
  if (!date) return '-';
  return dayjs(date).format(DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Алиас для formatDateTimeForDisplay
 */
export const formatDateTime = formatDateTimeForDisplay;

/**
 * Получить начало месяца
 */
export const getStartOfMonth = (date?: Dayjs | Date | string): Dayjs => {
  return dayjs(date).startOf('month');
};

/**
 * Получить конец месяца
 */
export const getEndOfMonth = (date?: Dayjs | Date | string): Dayjs => {
  return dayjs(date).endOf('month');
};

/**
 * Получить количество дней в месяце
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return dayjs(`${year}-${month}-01`).daysInMonth();
};

/**
 * Проверить, является ли дата сегодняшним днём
 */
export const isToday = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Проверить, является ли дата выходным днём
 */
export const isWeekend = (date: string | Date | Dayjs): boolean => {
  const dayOfWeek = dayjs(date).day();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * Получить текущий месяц в формате YYYY-MM
 */
export const getCurrentMonthString = (): string => {
  return dayjs().format(DATE_FORMATS.MONTH_YEAR);
};

/**
 * Парсить строку даты в Dayjs
 */
export const parseDate = (date: string | null): Dayjs | null => {
  if (!date) return null;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : null;
};
