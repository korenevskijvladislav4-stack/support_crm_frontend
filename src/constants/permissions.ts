/**
 * Константы permissions системы
 * Должны соответствовать permissions на backend
 */

// ============ ПОЛЬЗОВАТЕЛИ ============
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_DEACTIVATE: 'users.deactivate',
  USERS_ACTIVATE: 'users.activate',
  USERS_TRANSFER: 'users.transfer',

  // Attempts
  ATTEMPTS_VIEW: 'attempts.view',
  ATTEMPTS_APPROVE: 'attempts.approve',
  ATTEMPTS_DELETE: 'attempts.delete',

  // Teams
  TEAMS_LIST: 'teams.list',     // Для API (select, фильтры)
  TEAMS_VIEW: 'teams.view',     // Для страницы настроек
  TEAMS_CREATE: 'teams.create',
  TEAMS_UPDATE: 'teams.update',
  TEAMS_DELETE: 'teams.delete',

  // Groups
  GROUPS_LIST: 'groups.list',   // Для API (select, фильтры)
  GROUPS_VIEW: 'groups.view',   // Для страницы настроек
  GROUPS_CREATE: 'groups.create',
  GROUPS_UPDATE: 'groups.update',
  GROUPS_DELETE: 'groups.delete',

  // Roles
  ROLES_LIST: 'roles.list',     // Для API (select, фильтры)
  ROLES_VIEW: 'roles.view',     // Для страницы настроек
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  // Schedule
  SCHEDULE_VIEW: 'schedule.view',
  SCHEDULE_CREATE: 'schedule.create',

  // Shift Requests
  SHIFT_REQUESTS_VIEW: 'shift-requests.view',
  SHIFT_REQUESTS_CREATE: 'shift-requests.create',
  SHIFT_REQUESTS_UPDATE: 'shift-requests.update',
  SHIFT_REQUESTS_DELETE: 'shift-requests.delete',
  SHIFT_REQUESTS_APPROVE: 'shift-requests.approve',
  SHIFT_REQUESTS_REJECT: 'shift-requests.reject',
  SHIFT_REQUESTS_CREATE_DIRECT: 'shift-requests.create-direct',

  // Extra Shifts
  EXTRA_SHIFTS_VIEW: 'extra-shifts.view',
  EXTRA_SHIFTS_CREATE: 'extra-shifts.create',
  EXTRA_SHIFTS_APPROVE: 'extra-shifts.approve',
  EXTRA_SHIFTS_REJECT: 'extra-shifts.reject',

  // Penalties
  PENALTIES_VIEW: 'penalties.view',
  PENALTIES_CREATE: 'penalties.create',
  PENALTIES_UPDATE: 'penalties.update',
  PENALTIES_APPROVE: 'penalties.approve',
  PENALTIES_REJECT: 'penalties.reject',

  // Quality
  QUALITY_VIEW: 'quality.view',

  // Quality Maps
  QUALITY_MAPS_VIEW: 'quality-maps.view',
  QUALITY_MAPS_CREATE: 'quality-maps.create',
  QUALITY_MAPS_UPDATE: 'quality-maps.update',
  QUALITY_MAPS_DELETE: 'quality-maps.delete',

  // Quality Criteria
  QUALITY_CRITERIA_LIST: 'quality-criteria.list',   // Для API (формы создания карт)
  QUALITY_CRITERIA_VIEW: 'quality-criteria.view',   // Для страницы настроек
  QUALITY_CRITERIA_CREATE: 'quality-criteria.create',
  QUALITY_CRITERIA_UPDATE: 'quality-criteria.update',
  QUALITY_CRITERIA_DELETE: 'quality-criteria.delete',

  // Quality Criteria Categories
  QUALITY_CRITERIA_CATEGORIES_VIEW: 'quality-criteria-categories.view',
  QUALITY_CRITERIA_CATEGORIES_CREATE: 'quality-criteria-categories.create',
  QUALITY_CRITERIA_CATEGORIES_UPDATE: 'quality-criteria-categories.update',
  QUALITY_CRITERIA_CATEGORIES_DELETE: 'quality-criteria-categories.delete',

  // Quality Deductions
  QUALITY_DEDUCTIONS_VIEW: 'quality-deductions.view',
  QUALITY_DEDUCTIONS_CREATE: 'quality-deductions.create',
  QUALITY_CALL_DEDUCTIONS_CREATE: 'quality-call-deductions.create',

  // Quality Reviews
  QUALITY_REVIEWS_VIEW: 'quality-reviews.view',
  QUALITY_REVIEWS_CREATE: 'quality-reviews.create',
  QUALITY_REVIEWS_UPDATE: 'quality-reviews.update',

  // System
  PERMISSIONS_VIEW: 'permissions.view',
  SCHEDULE_TYPES_VIEW: 'schedule-types.view',
  SYSTEM_ADMIN: 'system.admin',
  SYSTEM_SETTINGS: 'system.settings',
  SYSTEM_BACKUP: 'system.backup',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Группы permissions для удобства
 */
export const PERMISSION_GROUPS = {
  USERS: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_DEACTIVATE,
    PERMISSIONS.USERS_ACTIVATE,
    PERMISSIONS.USERS_TRANSFER,
  ],
  TEAMS: [
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.TEAMS_UPDATE,
    PERMISSIONS.TEAMS_DELETE,
  ],
  GROUPS: [
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.GROUPS_UPDATE,
    PERMISSIONS.GROUPS_DELETE,
  ],
  ROLES: [
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,
    PERMISSIONS.ROLES_DELETE,
  ],
  SCHEDULE: [
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_CREATE,
    PERMISSIONS.SHIFT_REQUESTS_VIEW,
    PERMISSIONS.SHIFT_REQUESTS_CREATE,
    PERMISSIONS.SHIFT_REQUESTS_UPDATE,
    PERMISSIONS.SHIFT_REQUESTS_DELETE,
    PERMISSIONS.SHIFT_REQUESTS_APPROVE,
    PERMISSIONS.SHIFT_REQUESTS_REJECT,
    PERMISSIONS.SHIFT_REQUESTS_CREATE_DIRECT,
  ],
  PENALTIES: [
    PERMISSIONS.PENALTIES_VIEW,
    PERMISSIONS.PENALTIES_CREATE,
    PERMISSIONS.PENALTIES_UPDATE,
    PERMISSIONS.PENALTIES_APPROVE,
    PERMISSIONS.PENALTIES_REJECT,
  ],
  QUALITY: [
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.QUALITY_MAPS_VIEW,
    PERMISSIONS.QUALITY_MAPS_CREATE,
    PERMISSIONS.QUALITY_MAPS_UPDATE,
    PERMISSIONS.QUALITY_MAPS_DELETE,
    PERMISSIONS.QUALITY_CRITERIA_VIEW,
    PERMISSIONS.QUALITY_CRITERIA_CREATE,
    PERMISSIONS.QUALITY_CRITERIA_UPDATE,
    PERMISSIONS.QUALITY_CRITERIA_DELETE,
    PERMISSIONS.QUALITY_DEDUCTIONS_VIEW,
    PERMISSIONS.QUALITY_DEDUCTIONS_CREATE,
    PERMISSIONS.QUALITY_CALL_DEDUCTIONS_CREATE,
  ],
  SETTINGS: [
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_CREATE,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_CREATE,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.QUALITY_CRITERIA_VIEW,
    PERMISSIONS.QUALITY_CRITERIA_CREATE,
  ],
} as const;

/**
 * Permissions для навигации
 */
export const NAV_PERMISSIONS = {
  USERS: PERMISSIONS.USERS_VIEW,
  ATTEMPTS: PERMISSIONS.ATTEMPTS_VIEW,
  SCHEDULE: PERMISSIONS.SCHEDULE_VIEW,
  GROUPS: PERMISSIONS.GROUPS_VIEW,
  PENALTIES: PERMISSIONS.PENALTIES_VIEW,
  QUALITY: PERMISSIONS.QUALITY_VIEW,
  QUALITY_MAPS: PERMISSIONS.QUALITY_MAPS_VIEW,
  QUALITY_DEDUCTIONS: PERMISSIONS.QUALITY_DEDUCTIONS_VIEW,
  SETTINGS_TEAMS: PERMISSIONS.TEAMS_VIEW,
  SETTINGS_GROUPS: PERMISSIONS.GROUPS_VIEW,
  SETTINGS_ROLES: PERMISSIONS.ROLES_VIEW,
  SETTINGS_CRITERIA: PERMISSIONS.QUALITY_CRITERIA_VIEW,
} as const;

