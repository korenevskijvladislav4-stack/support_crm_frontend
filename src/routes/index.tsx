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
  SettingsGroupPage,
  SettingsTeamsPage,
  SettingsRolesPage,
  SettingsQualityCriteriasPage,
  QualityMapsListPage,
  CreateQualityMapPage,
  EditQualityMapPage,
  QualityMapDetailPage,
  QualityDeductionsPage,
  PenaltiesPage,
} from './lazyRoutes';

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
              <PageLoader>
                <UsersListPage />
              </PageLoader>
            }
          />
          <Route
            path="/users/stats"
            element={
              <PageLoader>
                <UsersStatsPage />
              </PageLoader>
            }
          />
          <Route
            path="/users/:id"
            element={
              <PageLoader>
                <UserProfile />
              </PageLoader>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <PageLoader>
                <EditUserPage />
              </PageLoader>
            }
          />

          {/* Attempts */}
          <Route
            path="/attempts"
            element={
              <PageLoader>
                <AttemptsListPage />
              </PageLoader>
            }
          />
          <Route
            path="/attempts/:id"
            element={
              <PageLoader>
                <AttemptApprovePage />
              </PageLoader>
            }
          />

          {/* Schedule */}
          <Route
            path="/schedule"
            element={
              <PageLoader>
                <SchedulePage />
              </PageLoader>
            }
          />
          <Route
            path="/schedule/create"
            element={
              <PageLoader>
                <CreateSchedulePage />
              </PageLoader>
            }
          />

          {/* Groups Stats */}
          <Route
            path="/groups"
            element={
              <PageLoader>
                <GroupsStatsPage />
              </PageLoader>
            }
          />

          {/* Settings */}
          <Route
            path="/settings/groups"
            element={
              <PageLoader>
                <SettingsGroupPage />
              </PageLoader>
            }
          />
          <Route
            path="/settings/teams"
            element={
              <PageLoader>
                <SettingsTeamsPage />
              </PageLoader>
            }
          />
          <Route
            path="/settings/roles"
            element={
              <PageLoader>
                <SettingsRolesPage />
              </PageLoader>
            }
          />
          <Route
            path="/settings/quality_criterias"
            element={
              <PageLoader>
                <SettingsQualityCriteriasPage />
              </PageLoader>
            }
          />

          {/* Quality */}
          <Route
            path="/quality"
            element={
              <PageLoader>
                <QualityMapsListPage />
              </PageLoader>
            }
          />
          <Route
            path="/quality/create"
            element={
              <PageLoader>
                <CreateQualityMapPage onSuccess={onQualitySuccess ?? (() => {})} />
              </PageLoader>
            }
          />
          <Route
            path="/quality/:id/edit"
            element={
              <PageLoader>
                <EditQualityMapPage />
              </PageLoader>
            }
          />
          <Route
            path="/quality/:id"
            element={
              <PageLoader>
                <QualityMapDetailPage />
              </PageLoader>
            }
          />
          <Route
            path="/quality-deductions"
            element={
              <PageLoader>
                <QualityDeductionsPage />
              </PageLoader>
            }
          />

          {/* Penalties */}
          <Route
            path="/penalties"
            element={
              <PageLoader>
                <PenaltiesPage />
              </PageLoader>
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

