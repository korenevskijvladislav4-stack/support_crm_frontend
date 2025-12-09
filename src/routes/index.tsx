import { Suspense, type FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import MainLayout from '../layouts/MainLayout';
import {
  AuthPage,
  RegisterPage,
  UsersListPage,
  UserProfile,
  EditUserPage,
  AttemptsListPage,
  AttemptApprovePage,
  SchedulePage,
  CreateSchedulePage,
  GroupsStatsPage,
  UsersStatsPage,
  TeamsStatsPage,
  SettingsGroupPage,
  SettingsTeamsPage,
  SettingsRolesPage,
  SettingsQualityCriteriasPage,
  ShiftRequestsPage,
  QualityMapsListPage,
  CreateQualityMapPage,
  EditQualityMapPage,
  QualityMapDetailPage,
  QualityDeductionsPage,
  PenaltiesPage,
} from './lazyRoutes';
import PermissionGuard from '../components/PermissionGuard';
import { PERMISSIONS } from '../constants/permissions';

interface PageLoaderProps {
  children: React.ReactNode;
}

/**
 * Компонент-обёртка для lazy-loaded страниц
 */
const PageLoader: FC<PageLoaderProps> = ({ children }) => (
  <Suspense
    fallback={
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          width: '100%',
        }}
      >
        <Spin size="large" />
      </div>
    }
  >
    {children}
  </Suspense>
);

interface AppRoutesProps {
  isAuthenticated: boolean;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onQualitySuccess?: (id: number) => void;
}

/**
 * Компонент маршрутизации приложения
 */
export const AppRoutes: FC<AppRoutesProps> = ({
  isAuthenticated,
  onToggleTheme,
  isDarkMode,
  onQualitySuccess,
}) => {
  if (isAuthenticated) {
    return (
      <Routes>
        <Route element={<MainLayout onToggleTheme={onToggleTheme} isDarkMode={isDarkMode} />}>
          {/* Users */}
          <Route
            path="/users"
            element={
              <PermissionGuard permission={PERMISSIONS.USERS_VIEW}>
                <PageLoader>
                  <UsersListPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/users/stats"
            element={
              <PermissionGuard permission={PERMISSIONS.USER_STATS_VIEW}>
                <PageLoader>
                  <UsersStatsPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PermissionGuard anyOf={[PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_VIEW_OWN, PERMISSIONS.USERS_MANAGE]}>
                <PageLoader>
                  <UserProfile />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <PermissionGuard permission={PERMISSIONS.USERS_MANAGE}>
                <PageLoader>
                  <EditUserPage />
                </PageLoader>
              </PermissionGuard>
            }
          />

          {/* Attempts */}
          <Route
            path="/attempts"
            element={
              <PermissionGuard permission={PERMISSIONS.ATTEMPTS_VIEW}>
                <PageLoader>
                  <AttemptsListPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/attempts/:id"
            element={
              <PermissionGuard permission={PERMISSIONS.ATTEMPTS_MANAGE}>
                <PageLoader>
                  <AttemptApprovePage />
                </PageLoader>
              </PermissionGuard>
            }
          />

          {/* Schedule */}
          <Route
            path="/schedule"
            element={
              <PermissionGuard permission={PERMISSIONS.SCHEDULE_VIEW}>
                <PageLoader>
                  <SchedulePage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/schedule/create"
            element={
              <PermissionGuard permission={PERMISSIONS.SCHEDULE_MANAGE}>
                <PageLoader>
                  <CreateSchedulePage />
                </PageLoader>
              </PermissionGuard>
            }
          />

          {/* Groups Stats */}
          <Route
            path="/groups"
            element={
              <PermissionGuard permission={PERMISSIONS.GROUP_STATS_VIEW}>
                <PageLoader>
                  <GroupsStatsPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/teams/stats"
            element={
              <PageLoader>
                <TeamsStatsPage />
              </PageLoader>
            }
          />

          {/* Settings */}
          <Route
            path="/settings/groups"
            element={
              <PermissionGuard permission={PERMISSIONS.GROUPS_VIEW}>
                <PageLoader>
                  <SettingsGroupPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/settings/teams"
            element={
              <PermissionGuard permission={PERMISSIONS.TEAMS_VIEW}>
                <PageLoader>
                  <SettingsTeamsPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/settings/roles"
            element={
              <PermissionGuard permission={PERMISSIONS.ROLES_VIEW}>
                <PageLoader>
                  <SettingsRolesPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/settings/quality_criterias"
            element={
              <PermissionGuard permission={PERMISSIONS.QUALITY_CRITERIA_VIEW}>
                <PageLoader>
                  <SettingsQualityCriteriasPage />
                </PageLoader>
              </PermissionGuard>
            }
          />

          {/* Quality */}
          <Route
            path="/quality"
            element={
              <PermissionGuard anyOf={[
                PERMISSIONS.QUALITY_MAPS_VIEW,
                PERMISSIONS.QUALITY_MAPS_MANAGE,
                PERMISSIONS.QUALITY_VIEW,
                PERMISSIONS.QUALITY_MANAGE,
              ]}>
                <PageLoader>
                  <QualityMapsListPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/quality/create"
            element={
              <PermissionGuard permission={PERMISSIONS.QUALITY_MAPS_MANAGE}>
                <PageLoader>
                  <CreateQualityMapPage onSuccess={onQualitySuccess ?? (() => {})} />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/quality/:id/edit"
            element={
              <PermissionGuard permission={PERMISSIONS.QUALITY_MAPS_MANAGE}>
                <PageLoader>
                  <EditQualityMapPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/quality/:id"
            element={
              <PermissionGuard anyOf={[
                PERMISSIONS.QUALITY_MAPS_VIEW,
                PERMISSIONS.QUALITY_MAPS_MANAGE,
                PERMISSIONS.QUALITY_VIEW,
                PERMISSIONS.QUALITY_MANAGE,
              ]}>
                <PageLoader>
                  <QualityMapDetailPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
          <Route
            path="/quality-deductions"
            element={
              <PermissionGuard permission={PERMISSIONS.QUALITY_DEDUCTIONS_VIEW}>
                <PageLoader>
                  <QualityDeductionsPage />
                </PageLoader>
              </PermissionGuard>
            }
          />

          {/* Penalties */}
          <Route
            path="/penalties"
            element={
              <PermissionGuard permission={PERMISSIONS.PENALTIES_VIEW}>
                <PageLoader>
                  <PenaltiesPage />
                </PageLoader>
              </PermissionGuard>
            }
          />
      <Route
        path="/shift-requests"
        element={
          <PermissionGuard anyOf={[PERMISSIONS.SHIFT_REQUESTS_MANAGE, PERMISSIONS.SCHEDULE_MANAGE]}>
            <PageLoader>
              <ShiftRequestsPage />
            </PageLoader>
          </PermissionGuard>
        }
      />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PageLoader>
            <AuthPage />
          </PageLoader>
        }
      />
      <Route
        path="/registration"
        element={
          <PageLoader>
            <RegisterPage />
          </PageLoader>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

