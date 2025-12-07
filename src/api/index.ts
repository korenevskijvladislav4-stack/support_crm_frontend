/**
 * Централизованный экспорт всех API
 */
import { authApi } from './authApi';
import { usersApi } from './usersApi';
import { attemptsApi } from './attemptsApi';
import { groupsApi } from './groupsApi';
import { teamsApi } from './teamsApi';
import { rolesApi } from './rolesApi';
import { scheduleTypesApi } from './scheduleTypesApi';
import { scheduleApi } from './scheduleApi';
import { permissionsApi } from './permissionsApi';
import { qualityApi } from './qualityApi';
import { qualityCriteriasApi } from './qualityCriteriasApi';
import { shiftRequestApi } from './shiftRequestApi';
import { penaltiesApi } from './penaltiesApi';

/**
 * Массив всех API для автоматической регистрации в store
 */
export const apis = [
  authApi,
  usersApi,
  attemptsApi,
  groupsApi,
  teamsApi,
  rolesApi,
  scheduleTypesApi,
  scheduleApi,
  permissionsApi,
  qualityApi,
  qualityCriteriasApi,
  shiftRequestApi,
  penaltiesApi,
] as const;

/**
 * Получить reducers для всех API
 */
export const getApiReducers = () => {
  return Object.fromEntries(
    apis.map(api => [api.reducerPath, api.reducer])
  );
};

/**
 * Получить middleware для всех API
 */
export const getApiMiddleware = () => {
  return apis.map(api => api.middleware);
};

// Re-export APIs
export { authApi } from './authApi';
export { usersApi } from './usersApi';
export { attemptsApi } from './attemptsApi';
export { groupsApi } from './groupsApi';
export { teamsApi } from './teamsApi';
export { rolesApi } from './rolesApi';
export { scheduleTypesApi } from './scheduleTypesApi';
export { scheduleApi } from './scheduleApi';
export { permissionsApi } from './permissionsApi';
export { qualityApi } from './qualityApi';
export { qualityCriteriasApi } from './qualityCriteriasApi';
export { shiftRequestApi } from './shiftRequestApi';
export { penaltiesApi } from './penaltiesApi';

