import { useNavigate } from 'react-router-dom';
import { ConfigProvider, Spin, App as AntApp } from 'antd';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { getThemeConfig, getLoadingBgColor } from './theme';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleQualitySuccess = (id: number) => {
    navigate(`/quality/${id}`);
  };

  // Показываем загрузчик пока проверяем авторизацию
  if (isLoading) {
    return (
      <ConfigProvider theme={getThemeConfig(isDarkMode)}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: getLoadingBgColor(isDarkMode),
          }}
        >
          <Spin size="large" />
        </div>
      </ConfigProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ConfigProvider theme={getThemeConfig(isDarkMode)}>
        <AntApp>
          <AppRoutes
            isAuthenticated={isAuthenticated}
            onToggleTheme={toggleTheme}
            isDarkMode={isDarkMode}
            onQualitySuccess={handleQualitySuccess}
          />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
