import { lazy } from 'react';

// Auth pages
export const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
export const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

// Users pages
export const UsersListPage = lazy(() => import('../pages/users/UsersListPage'));
export const UserProfile = lazy(() => import('../pages/users/UserProfile'));
export const EditUserPage = lazy(() => import('../pages/users/EditUserPage'));

// Attempts pages
export const AttemptsListPage = lazy(() => import('../pages/attempts/AttemptsListPage'));
export const AttemptApprovePage = lazy(() => import('../pages/attempts/AttemptApprovePage'));

// Schedule pages
export const SchedulePage = lazy(() => import('../pages/schedule/SchedulePage'));
export const CreateSchedulePage = lazy(() => import('../pages/schedule/CreateSchedulePage'));

// Groups / Reports pages
export const GroupsStatsPage = lazy(() => import('../pages/groups/GroupsStatsPage'));
export const UsersStatsPage = lazy(() => import('../pages/users/UsersStatsPage'));
export const TeamsStatsPage = lazy(() => import('../pages/teams/TeamsStatsPage'));
// Settings pages
export const SettingsGroupPage = lazy(() => import('../pages/settings/SettingsGroupPage'));
export const SettingsTeamsPage = lazy(() => import('../pages/settings/SettingsTeamsPage'));
export const SettingsRolesPage = lazy(() => import('../pages/settings/SettingsRolesPage'));
export const SettingsQualityCriteriasPage = lazy(() => import('../pages/settings/SettingsQualityCriteriasPage'));

// Quality pages
export const QualityMapsListPage = lazy(() => import('../pages/quality/QualityMapListPage'));
export const CreateQualityMapPage = lazy(() => import('../pages/quality/CreateQualityMapPage'));
export const EditQualityMapPage = lazy(() => import('../pages/quality/EditQualityPage'));
export const QualityMapDetailPage = lazy(() => import('../pages/quality/QualityMapDetailPage'));
export const QualityDeductionsPage = lazy(() => import('../pages/quality/QualityDeductionsPage'));

// Penalties pages
export const PenaltiesPage = lazy(() => import('../pages/penalties/PenaltiesPage'));

