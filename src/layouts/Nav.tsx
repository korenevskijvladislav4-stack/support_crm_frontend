import React, { useMemo } from 'react';
import {
  LineChartOutlined,
  FieldTimeOutlined,
  LogoutOutlined,
  NumberOutlined,
  PlusOutlined,
  SettingOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  BulbOutlined,
  BulbFilled,
  CrownOutlined,
  MessageOutlined,
  BarChartOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu, Switch, Tooltip, Avatar, Typography, theme } from 'antd';
import styles from "../styles/nav-layout.module.css"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSignOutMutation } from '../api/authApi';
import { useTypedSelector } from '../hooks/store';
import { usePermissions } from '../hooks/usePermissions';
import { PERMISSIONS } from '../constants/permissions';

const { Content, Sider } = Layout;
const { Text } = Typography;

interface NavProps {
  children?: React.ReactNode;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const Nav: React.FC<NavProps> = ({ children, onToggleTheme, isDarkMode }) => {
  const { token } = theme.useToken();
  const [signOut] = useSignOutMutation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useTypedSelector((state) => state.auth.user);
  const { hasPermission, hasAnyPermission } = usePermissions();

  const onSignOutClick = async() => {
    await signOut().unwrap();
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  // Генерация меню на основе permissions
  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];

    // Пользователи (список)
    if (hasPermission(PERMISSIONS.USERS_VIEW)) {
      items.push({
        key: '/users',
        icon: <SolutionOutlined style={{ fontSize: '16px' }} />,
        label: <Link to='/users'>Пользователи</Link>,
      });
    }

    // Заявки на регистрацию
    if (hasPermission(PERMISSIONS.ATTEMPTS_VIEW)) {
      items.push({
        key: '/attempts',
        icon: <PlusOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/attempts">Регистрация</Link>,
      });
    }

    // График смен
    if (hasPermission(PERMISSIONS.SCHEDULE_VIEW)) {
      items.push({
        key: '/schedule',
        icon: <NumberOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/schedule">График смен</Link>,
      });
    }

    // Запросы смен
    if (hasAnyPermission([PERMISSIONS.SHIFT_REQUESTS_MANAGE, PERMISSIONS.SCHEDULE_MANAGE])) {
      items.push({
        key: '/shift-requests',
        icon: <FieldTimeOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/shift-requests">Запросы смен</Link>,
      });
    }

    // Качество
    if (hasAnyPermission([PERMISSIONS.QUALITY_VIEW, PERMISSIONS.QUALITY_MAPS_VIEW])) {
      items.push({
        key: '/quality',
        icon: <LineChartOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/quality">Качество</Link>,
      });
    }

    // Снятия качества
    if (hasPermission(PERMISSIONS.QUALITY_DEDUCTIONS_VIEW)) {
      items.push({
        key: '/quality-deductions',
        icon: <FieldTimeOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/quality-deductions">Снятия качества</Link>,
      });
    }

    // Штрафная таблица
    if (hasPermission(PERMISSIONS.PENALTIES_VIEW)) {
      items.push({
        key: '/penalties',
        icon: <ExclamationCircleOutlined style={{ fontSize: '16px' }} />,
        label: <Link to="/penalties">Штрафная таблица</Link>,
      });
    }

    // Отчеты (команды / группы / пользователи)
    if (hasAnyPermission([PERMISSIONS.TEAM_STATS_VIEW, PERMISSIONS.GROUP_STATS_VIEW, PERMISSIONS.USER_STATS_VIEW])) {
      const reportChildren: MenuProps['items'] = [];

      if (hasPermission(PERMISSIONS.TEAM_STATS_VIEW)) {
        reportChildren.push({
          key: '/teams/stats',
          icon: <TeamOutlined style={{ fontSize: '14px' }} />,
          label: <Link to="/teams/stats">Команды</Link>,
        });
      }

      if (hasPermission(PERMISSIONS.GROUP_STATS_VIEW)) {
        reportChildren.push({
          key: '/groups',
          icon: <TeamOutlined style={{ fontSize: '14px' }} />,
          label: <Link to="/groups">Группы</Link>,
        });
      }

      if (hasPermission(PERMISSIONS.USER_STATS_VIEW)) {
        reportChildren.push({
          key: '/users/stats',
          icon: <BarChartOutlined style={{ fontSize: '14px' }} />,
          label: <Link to="/users/stats">Пользователи</Link>,
        });
      }

      if (reportChildren.length > 0) {
        items.push({
          key: 'reports',
          icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
          label: 'Отчеты',
          children: reportChildren,
        });
      }
    }

    // Настройки - показываем если есть хотя бы один permission на настройки
    const hasSettingsAccess = hasAnyPermission([
      PERMISSIONS.GROUPS_VIEW,
      PERMISSIONS.TEAMS_VIEW,
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.QUALITY_CRITERIA_VIEW,
    ]);

    if (hasSettingsAccess) {
      const settingsChildren: MenuProps['items'] = [];

      if (hasPermission(PERMISSIONS.GROUPS_VIEW)) {
        settingsChildren.push({
          key: '/settings/groups',
          icon: <TeamOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/groups'>Управление группами</Link>,
        });
      }

      if (hasPermission(PERMISSIONS.TEAMS_VIEW)) {
        settingsChildren.push({
          key: '/settings/teams',
          icon: <UserOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/teams'>Управление отделами</Link>,
        });
      }

      if (hasPermission(PERMISSIONS.ROLES_VIEW)) {
        settingsChildren.push({
          key: '/settings/roles',
          icon: <CrownOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/roles'>Управление ролями</Link>,
        });
      }

      if (hasPermission(PERMISSIONS.QUALITY_CRITERIA_VIEW)) {
        settingsChildren.push({
          key: '/settings/quality_criterias',
          icon: <LineChartOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/quality_criterias'>Критерии качества</Link>,
        });
      }

      if (settingsChildren.length > 0) {
        items.push({
          type: 'divider',
          style: { 
            margin: '8px 0', 
            borderColor: isDarkMode ? '#303030' : '#f0f0f0' 
          },
        });

        items.push({
          key: 'settings',
          icon: <SettingOutlined style={{ fontSize: '16px' }} />,
          label: 'Настройки системы',
          children: settingsChildren,
        });
      }
    }

    return items;
  }, [hasPermission, hasAnyPermission, isDarkMode]);

  const bottomMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: currentUser?.id ? (
        <Link to={`/users/${currentUser.id}`} style={{ color: 'inherit' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px 16px',
            borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0'
          }}>
            <Avatar 
              size="small" 
              style={{ 
                backgroundColor: '#1890ff',
                flexShrink: 0
              }}
            >
              {currentUser?.name?.[0]}{currentUser?.surname?.[0]}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text 
                strong 
                style={{ 
                  fontSize: '12px',
                  color: isDarkMode ? '#fff' : '#000',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              >
                {currentUser?.name} {currentUser?.surname}
              </Text>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '10px',
                  display: 'block',
                  lineHeight: '1.2'
                }}
              >
                {currentUser?.roles?.[0]?.name || 'Пользователь'}
              </Text>
            </div>
          </div>
        </Link>
      ) : null,
      style: { 
        height: 'auto', 
        padding: 0,
      },
    },
    {
      key: 'theme-switcher',
      label: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '8px 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BulbOutlined style={{ fontSize: '14px' }} />
            <span style={{ fontSize: '13px' }}>Тема</span>
          </div>
          <Tooltip 
            title={isDarkMode ? 'Светлая тема' : 'Темная тема'}
            styles={{ 
              body: {
                backgroundColor: token.colorBgElevated,
                color: token.colorText,
                border: `1px solid ${token.colorBorder}`
              }
            }}
          >
            <Switch
              size="small"
              checked={isDarkMode}
              onChange={onToggleTheme}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
              style={{
                backgroundColor: isDarkMode ? '#1890ff' : '#ccc',
              }}
            />
          </Tooltip>
        </div>
      ),
      style: { height: 'auto', padding: 0 },
    },
    { 
      key: 'logout', 
      label: (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '8px 16px',
          color: '#ff4d4f'
        }}>
          <LogoutOutlined style={{ fontSize: '14px' }} />
          <span style={{ fontSize: '13px' }}>Выйти</span>
        </div>
      ),
      onClick: () => onSignOutClick(),
      style: { 
        height: 'auto', 
        padding: 0,
      }
    }
  ];

  return (
    <Layout hasSider style={{ height: '100vh', width: '100%' }}>
      <Sider 
        className={styles.navScrollbar}
        width={260}
        breakpoint="lg"
        collapsedWidth={0}
        style={{ 
          height: '100vh',
          background: isDarkMode ? '#141414' : '#fff',
          borderRight: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
          ['--scrollbar-thumb' as any]: isDarkMode ? '#434343' : '#bfbfbf',
          ['--scrollbar-track' as any]: isDarkMode ? '#1f1f1f' : '#f5f5f5',
        }} 
        theme={isDarkMode ? 'dark' : 'light'}
      >
        {/* Логотип и заголовок */}
        <div style={{
          padding: '20px 16px',
          textAlign: 'center',
          borderBottom: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          background: isDarkMode ? '#141414' : '#fff'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              <MessageOutlined />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ 
                color: isDarkMode ? '#fff' : '#000',
                margin: 0,
                fontSize: '16px',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                SupportCRM
              </h3>
              <Text 
                type="secondary" 
                style={{ 
                  fontSize: '11px',
                  fontWeight: '400'
                }}
              >
                Система поддержки
              </Text>
            </div>
          </div>
        </div>

        {/* Основное меню */}
        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Menu 
            theme={isDarkMode ? 'dark' : 'light'} 
            mode="inline" 
            items={menuItems} 
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['settings']}
            style={{ 
              border: 'none',
              background: 'transparent',
              fontSize: '14px'
            }}
            className="custom-menu"
          />
        </div>
        
        {/* Нижнее меню (пользователь и настройки) */}
        <div style={{
          borderTop: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          background: 'transparent'
        }}>
          <Menu
            theme={isDarkMode ? 'dark' : 'light'}
            mode="inline"
            items={bottomMenuItems}
            selectedKeys={[]}
            style={{
              background: 'transparent',
              border: 'none'
            }}
            selectable={false}
          />
        </div>
      </Sider>
      
      <Layout className={styles.layout}>
        <Content className={styles.content} style={{
          background: isDarkMode ? '#0a0a0a' : '#f5f5f5',
          padding: '24px',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Nav;
