// Re-export permissions
export * from './permissions';

/**
 * Константы пагинации
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
  SIZE_OPTIONS: ['10', '20', '50', '100'] as const,
} as const;

/**
 * Статусы пользователя
 */
export const USER_STATUS = {
  ACTIVE: 'active',
  DEACTIVATED: 'deactivated',
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

/**
 * Цвета ролей для отображения
 */
export const ROLE_COLORS: Record<string, string> = {
  admin: 'red',
  manager: 'blue',
  user: 'green',
  supervisor: 'orange',
  agent: 'purple',
} as const;

/**
 * Статусы смен
 */
export const SHIFT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
} as const;

export type ShiftStatus = typeof SHIFT_STATUS[keyof typeof SHIFT_STATUS];

/**
 * Типы графиков
 */
export const SCHEDULE_TYPES = {
  SHIFT_2_2: '2/2',
  SHIFT_5_2: '5/2',
} as const;

/**
 * Цвета статусов
 */
export const STATUS_COLORS = {
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
  default: '#d9d9d9',
} as const;

/**
 * Ключи localStorage
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
} as const;

/**
 * HTTP статус коды
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Время кэширования (в секундах)
 */
export const CACHE_TIME = {
  SHORT: 60,
  MEDIUM: 300,
  LONG: 600,
} as const;

/**
 * Дефолтные фильтры пользователей
 */
export const DEFAULT_USER_FILTERS = {
  full_name: null,
  team: [],
  group: [],
  roles: [],
  schedule_type: null,
  phone: null,
  email: null,
  status: USER_STATUS.ACTIVE,
} as const;

