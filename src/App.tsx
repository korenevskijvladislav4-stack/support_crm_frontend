import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/auth/AuthPage'
import MainLayout from './layouts/MainLayout'
import UsersListPage from './pages/users/UsersListPage'
import { ConfigProvider, Spin, theme, App as AntApp } from 'antd'
import RegisterPage from './pages/auth/RegisterPage'
import AttemptsListPage from './pages/attempts/AttemptsListPage'
import AttemptApprovePage from './pages/attempts/AttemptApprovePage'
import SchedulePage from './pages/schedule/SchedulePage'
import CreateSchedulePage from './pages/schedule/CreateSchedulePage'
import GroupsPage from './pages/groups/GroupsPage'
import SettingsGroupPage from './pages/settings/SettingsGroupPage'
import EditUserPage from './pages/users/EditUserPage'
import SettingsTeamsPage from './pages/settings/SettingsTeamsPage'
import SettingsRolesPage from './pages/settings/SettingsRolesPage'
import SettingsQualityCriteriasPage from './pages/settings/SettingsQualityCriteriasPage'
import UserProfile from './pages/users/UserProfile'
import { useState, useEffect } from 'react'
import TicketsListPage from './pages/tickets/TicketsListPage'
import CreateTicketPage from './pages/tickets/CreateTicketPage'
import TicketViewPage from './pages/tickets/TicketViewPage'
import EditTicketPage from './pages/tickets/EditTicketPage'
import SettingsTicketTypesPage from './pages/settings/SettingsTicketTypesPage'
import CreateQualityMapPage from './pages/quality/CreateQualityMapPage'
import EditQualityMapPage from './pages/quality/EditQualityPage'
import QualityMapDetailPage from './pages/quality/QualityMapDetailPage'
import QualityMapsListPage from './pages/quality/QualityMapListPage'
import PenaltiesPage from './pages/penalties/PenaltiesPage'

const { defaultAlgorithm, darkAlgorithm } = theme

function App() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth()
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    if (saved) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Устанавливаем data-theme атрибут для CSS переменных
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  // Слушаем изменения системной темы
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (isLoading)
    return (
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <div 
          style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: isDarkMode ? '#0d1117' : '#f0f2f5'
          }}
        >
          <Spin size="large" />
        </div>
      </ConfigProvider>
    )

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#1890ff',
          colorBgBase: isDarkMode ? '#0d1117' : '#ffffff',
          colorBgContainer: isDarkMode ? '#161b22' : '#ffffff',
          colorBgElevated: isDarkMode ? '#1c2128' : '#ffffff',
          colorBgLayout: isDarkMode ? '#0d1117' : '#f0f2f5',
          colorTextBase: isDarkMode ? '#c9d1d9' : '#000000',
          colorText: isDarkMode ? '#c9d1d9' : '#000000',
          colorTextSecondary: isDarkMode ? '#8b949e' : '#595959',
          colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
          colorBorderSecondary: isDarkMode ? '#21262d' : '#f0f0f0',
          borderRadius: 6,
          wireframe: false,
          fontSize: 14,
          sizeStep: 4,
          sizeUnit: 4,
          boxShadow: isDarkMode 
            ? '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.2)'
            : '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
        },
        components: {
          Layout: {
            bodyBg: isDarkMode ? '#0d1117' : '#f0f2f5',
            headerBg: isDarkMode ? '#161b22' : '#001529',
            siderBg: isDarkMode ? '#161b22' : '#001529',
          },
          Menu: {
            darkItemBg: isDarkMode ? '#161b22' : '#001529',
            darkItemSelectedBg: isDarkMode ? '#1f6feb' : '#1890ff',
            darkItemHoverBg: isDarkMode ? '#21262d' : '#1f1f1f',
            darkSubMenuItemBg: isDarkMode ? '#0d1117' : '#000c17',
            itemSelectedBg: isDarkMode ? '#1f6feb' : '#e6f7ff',
            itemHoverBg: isDarkMode ? '#21262d' : '#f5f5f5',
            colorText: isDarkMode ? '#c9d1d9' : '#rgba(255, 255, 255, 0.65)',
            colorTextSecondary: isDarkMode ? '#8b949e' : '#rgba(255, 255, 255, 0.45)',
          },
          Table: {
            colorBgContainer: isDarkMode ? '#161b22' : '#ffffff',
            borderColor: isDarkMode ? '#30363d' : '#f0f0f0',
            headerBg: isDarkMode ? '#1c2128' : '#fafafa',
            headerColor: isDarkMode ? '#c9d1d9' : '#000000',
            rowHoverBg: isDarkMode ? '#1c2128' : '#fafafa',
            colorTextHeading: isDarkMode ? '#c9d1d9' : '#000000',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorFillSecondary: isDarkMode ? '#21262d' : '#fafafa',
          },
          Card: {
            colorBgContainer: isDarkMode ? '#161b22' : '#ffffff',
            colorBorderSecondary: isDarkMode ? '#30363d' : '#f0f0f0',
            colorTextHeading: isDarkMode ? '#c9d1d9' : '#000000',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
          },
          Input: {
            colorBgContainer: isDarkMode ? '#0d1117' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextPlaceholder: isDarkMode ? '#6e7681' : '#bfbfbf',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
            activeBorderColor: isDarkMode ? '#1f6feb' : '#1890ff',
            hoverBorderColor: isDarkMode ? '#1f6feb' : '#40a9ff',
          },
          InputNumber: {
            colorBgContainer: isDarkMode ? '#0d1117' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
          },
          Select: {
            colorBgContainer: isDarkMode ? '#0d1117' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextPlaceholder: isDarkMode ? '#6e7681' : '#bfbfbf',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
            optionSelectedBg: isDarkMode ? '#1f6feb' : '#e6f7ff',
            optionActiveBg: isDarkMode ? '#21262d' : '#f5f5f5',
            colorFillSecondary: isDarkMode ? '#21262d' : '#fafafa',
          },
          DatePicker: {
            colorBgContainer: isDarkMode ? '#0d1117' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextPlaceholder: isDarkMode ? '#6e7681' : '#bfbfbf',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
            cellHoverBg: isDarkMode ? '#21262d' : '#f5f5f5',
          },
          Modal: {
            colorBgElevated: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextHeading: isDarkMode ? '#c9d1d9' : '#000000',
            colorIcon: isDarkMode ? '#c9d1d9' : '#000000',
            colorIconHover: isDarkMode ? '#ffffff' : '#000000',
          },
          Drawer: {
            colorBgElevated: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextHeading: isDarkMode ? '#c9d1d9' : '#000000',
          },
          Button: {
            defaultBg: isDarkMode ? '#21262d' : '#ffffff',
            defaultBorderColor: isDarkMode ? '#30363d' : '#d9d9d9',
            defaultColor: isDarkMode ? '#c9d1d9' : '#000000',
            defaultHoverBg: isDarkMode ? '#30363d' : '#ffffff',
            defaultHoverBorderColor: isDarkMode ? '#1f6feb' : '#40a9ff',
            defaultHoverColor: isDarkMode ? '#ffffff' : '#40a9ff',
            defaultActiveBg: isDarkMode ? '#1c2128' : '#ffffff',
            defaultActiveBorderColor: isDarkMode ? '#1f6feb' : '#096dd9',
            primaryShadow: isDarkMode ? '0 2px 0 rgba(31, 111, 235, 0.1)' : '0 2px 0 rgba(24, 144, 255, 0.1)',
          },
          Form: {
            labelColor: isDarkMode ? '#c9d1d9' : '#000000',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextDescription: isDarkMode ? '#8b949e' : '#595959',
          },
          Popover: {
            colorBgElevated: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
          },
          Dropdown: {
            colorBgElevated: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextDescription: isDarkMode ? '#8b949e' : '#595959',
            controlItemBgHover: isDarkMode ? '#21262d' : '#f5f5f5',
            controlItemBgActive: isDarkMode ? '#1f6feb' : '#e6f7ff',
            controlItemBgActiveHover: isDarkMode ? '#1f6feb' : '#bae7ff',
          },
          Tabs: {
            colorBgContainer: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextDescription: isDarkMode ? '#8b949e' : '#595959',
            itemHoverColor: isDarkMode ? '#1f6feb' : '#1890ff',
            itemSelectedColor: isDarkMode ? '#1f6feb' : '#1890ff',
            itemActiveColor: isDarkMode ? '#1f6feb' : '#1890ff',
            inkBarColor: isDarkMode ? '#1f6feb' : '#1890ff',
          },
          Segmented: {
            colorBgLayout: isDarkMode ? '#0d1117' : '#f0f0f0',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextLabel: isDarkMode ? '#c9d1d9' : '#000000',
            itemSelectedBg: isDarkMode ? '#161b22' : '#ffffff',
            itemHoverBg: isDarkMode ? '#21262d' : '#f5f5f5',
            itemActiveBg: isDarkMode ? '#1f6feb' : '#1890ff',
            itemColor: isDarkMode ? '#c9d1d9' : '#000000',
            itemSelectedColor: isDarkMode ? '#ffffff' : '#000000',
            itemHoverColor: isDarkMode ? '#ffffff' : '#000000',
          },
          Tag: {
            colorBgContainer: isDarkMode ? '#21262d' : '#fafafa',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
          },
          Tooltip: {
            colorBgSpotlight: isDarkMode ? '#161b22' : '#ffffff',
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextLightSolid: isDarkMode ? '#c9d1d9' : '#000000',
            colorBorder: isDarkMode ? '#30363d' : '#d9d9d9',
            borderRadius: 6,
          },
          Typography: {
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextHeading: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextSecondary: isDarkMode ? '#8b949e' : '#595959',
          },
          Divider: {
            colorSplit: isDarkMode ? '#30363d' : '#f0f0f0',
          },
          Statistic: {
            colorText: isDarkMode ? '#c9d1d9' : '#000000',
            colorTextDescription: isDarkMode ? '#8b949e' : '#595959',
          },
        },
      }}
    >
      <AntApp>
        <Routes>
          {
            isAuthenticated ? (
              <Route element={<MainLayout onToggleTheme={toggleTheme} isDarkMode={isDarkMode} />}>
                <Route path="/users" element={<UsersListPage />} />
                <Route path="/users/:id" element={<UserProfile />} />
                <Route path="/users/:id/edit" element={<EditUserPage />} />
                <Route path="/attempts" element={<AttemptsListPage />} />
                <Route path="/attempts/:id" element={<AttemptApprovePage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/schedule/create" element={<CreateSchedulePage />} />
                <Route path="/groups" element={<GroupsPage />} />
                <Route path="/settings/groups" element={<SettingsGroupPage />} />
                <Route path="/settings/teams" element={<SettingsTeamsPage />} />
                <Route path="/settings/roles" element={<SettingsRolesPage />} />
                <Route path="/settings/ticket_types" element={<SettingsTicketTypesPage />} />
                <Route path="/settings/quality_criterias" element={<SettingsQualityCriteriasPage />} />
                <Route path="/quality" element={<QualityMapsListPage />} />
                <Route path="/quality/create" element={<CreateQualityMapPage onSuccess={(id) => navigate(`/quality/${id}`)} />} />
                <Route path="/quality/:id/edit" element={<EditQualityMapPage />} />
                <Route path="/quality/:id" element={<QualityMapDetailPage />} />

                <Route path="/tickets" element={<TicketsListPage />} />
                <Route path="/tickets/:id" element={<TicketViewPage />} />
                <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
                <Route path="/tickets/create" element={<CreateTicketPage />} />
                <Route path="/penalties" element={<PenaltiesPage />} />
                <Route path="*" element={<Navigate to="/users" replace />} />
              </Route>
            )
              :
              (
                <>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/registration" element={<RegisterPage />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </>
              )
          }
        </Routes>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
