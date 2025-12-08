/**
 * Константы permissions системы
 * Должны соответствовать permissions на backend
 */

// ============ ПОЛЬЗОВАТЕЛИ ============
export const PERMISSIONS = {
  // Users
  USERS_VIEW: 'users.view',
  USERS_VIEW_OWN: 'users.view-own',
  USERS_MANAGE: 'users.manage',

  // Attempts
  ATTEMPTS_VIEW: 'attempts.view',
  ATTEMPTS_MANAGE: 'attempts.manage',

  // Teams
  TEAMS_LIST: 'teams.list',
  TEAMS_VIEW: 'teams.view',
  TEAMS_MANAGE: 'teams.manage',

  // Groups
  GROUPS_LIST: 'groups.list',
  GROUPS_VIEW: 'groups.view',
  GROUPS_MANAGE: 'groups.manage',

  // Roles
  ROLES_LIST: 'roles.list',
  ROLES_VIEW: 'roles.view',
  ROLES_MANAGE: 'roles.manage',

  // Schedule
  SCHEDULE_VIEW: 'schedule.view',
  SCHEDULE_MANAGE: 'schedule.manage',

  // Shift Requests
  SHIFT_REQUESTS_VIEW: 'shift-requests.view',
  SHIFT_REQUESTS_MANAGE: 'shift-requests.manage',

  // Extra Shifts
  EXTRA_SHIFTS_VIEW: 'extra-shifts.view',
  EXTRA_SHIFTS_MANAGE: 'extra-shifts.manage',

  // Penalties
  PENALTIES_VIEW: 'penalties.view',
  PENALTIES_MANAGE: 'penalties.manage',

  // Quality
  QUALITY_VIEW: 'quality.view',
  QUALITY_MANAGE: 'quality.manage',

  // Quality Maps
  QUALITY_MAPS_VIEW: 'quality-maps.view',
  QUALITY_MAPS_MANAGE: 'quality-maps.manage',

  // Quality Criteria
  QUALITY_CRITERIA_LIST: 'quality-criteria.list',
  QUALITY_CRITERIA_VIEW: 'quality-criteria.view',
  QUALITY_CRITERIA_MANAGE: 'quality-criteria.manage',

  // Quality Criteria Categories
  QUALITY_CRITERIA_CATEGORIES_LIST: 'quality-criteria-categories.list',
  QUALITY_CRITERIA_CATEGORIES_VIEW: 'quality-criteria-categories.view',
  QUALITY_CRITERIA_CATEGORIES_MANAGE: 'quality-criteria-categories.manage',

  // Quality Deductions
  QUALITY_DEDUCTIONS_VIEW: 'quality-deductions.view',
  QUALITY_DEDUCTIONS_MANAGE: 'quality-deductions.manage',

  // Quality Reviews
  QUALITY_REVIEWS_VIEW: 'quality-reviews.view',
  QUALITY_REVIEWS_MANAGE: 'quality-reviews.manage',

  // Reports / Stats
  TEAM_STATS_VIEW: 'team-stats.view',
  TEAM_STATS_MANAGE: 'team-stats.manage',
  GROUP_STATS_VIEW: 'group-stats.view',
  GROUP_STATS_MANAGE: 'group-stats.manage',
  USER_STATS_VIEW: 'user-stats.view',
  USER_STATS_MANAGE: 'user-stats.manage',

  // System
  PERMISSIONS_VIEW: 'permissions.view',
  PERMISSIONS_MANAGE: 'permissions.manage',
  SCHEDULE_TYPES_VIEW: 'schedule-types.view',
  SCHEDULE_TYPES_MANAGE: 'schedule-types.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Группы permissions для удобства
 */
export const PERMISSION_GROUPS = {
  USERS: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_VIEW_OWN,
    PERMISSIONS.USERS_MANAGE,
  ],
  TEAMS: [
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.TEAMS_MANAGE,
  ],
  GROUPS: [
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.GROUPS_MANAGE,
  ],
  ROLES: [
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_MANAGE,
  ],
  SCHEDULE: [
    PERMISSIONS.SCHEDULE_VIEW,
    PERMISSIONS.SCHEDULE_MANAGE,
    PERMISSIONS.SHIFT_REQUESTS_VIEW,
    PERMISSIONS.SHIFT_REQUESTS_MANAGE,
  ],
  PENALTIES: [
    PERMISSIONS.PENALTIES_VIEW,
    PERMISSIONS.PENALTIES_MANAGE,
  ],
  QUALITY: [
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.QUALITY_MANAGE,
    PERMISSIONS.QUALITY_MAPS_VIEW,
    PERMISSIONS.QUALITY_MAPS_MANAGE,
    PERMISSIONS.QUALITY_CRITERIA_VIEW,
    PERMISSIONS.QUALITY_CRITERIA_MANAGE,
    PERMISSIONS.QUALITY_CRITERIA_CATEGORIES_VIEW,
    PERMISSIONS.QUALITY_CRITERIA_CATEGORIES_MANAGE,
    PERMISSIONS.QUALITY_DEDUCTIONS_VIEW,
    PERMISSIONS.QUALITY_DEDUCTIONS_MANAGE,
    PERMISSIONS.QUALITY_REVIEWS_VIEW,
    PERMISSIONS.QUALITY_REVIEWS_MANAGE,
  ],
  REPORTS: [
    PERMISSIONS.TEAM_STATS_VIEW,
    PERMISSIONS.TEAM_STATS_MANAGE,
    PERMISSIONS.GROUP_STATS_VIEW,
    PERMISSIONS.GROUP_STATS_MANAGE,
    PERMISSIONS.USER_STATS_VIEW,
    PERMISSIONS.USER_STATS_MANAGE,
  ],
  SETTINGS: [
    PERMISSIONS.TEAMS_VIEW,
    PERMISSIONS.GROUPS_VIEW,
    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.QUALITY_CRITERIA_VIEW,
    PERMISSIONS.SCHEDULE_TYPES_VIEW,
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
  TEAM_STATS: PERMISSIONS.TEAM_STATS_VIEW,
  GROUP_STATS: PERMISSIONS.GROUP_STATS_VIEW,
  USER_STATS: PERMISSIONS.USER_STATS_VIEW,
  PERMISSIONS: PERMISSIONS.PERMISSIONS_VIEW,
} as const;

