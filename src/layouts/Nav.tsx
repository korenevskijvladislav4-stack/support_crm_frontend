import React from 'react';
import {
  LineChartOutlined,
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

  const onSignOutClick = async() => {
    await signOut().unwrap();
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/users',
      icon: <SolutionOutlined style={{ fontSize: '16px' }} />,
      label: <Link to='/users'>Пользователи</Link>,
      className: location.pathname === '/users' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/attempts',
      icon: <PlusOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/attempts">Регистрация</Link>,
      className: location.pathname === '/attempts' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/schedule',
      icon: <NumberOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/schedule">График смен</Link>,
      className: location.pathname === '/schedule' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/groups',
      icon: <TeamOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/groups">Группы</Link>,
      className: location.pathname === '/groups' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/qualities',
      icon: <LineChartOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/quality">Качество</Link>,
      className: location.pathname === '/quality' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/tickets',
      icon: <LineChartOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/tickets">Тикеты</Link>,
      className: location.pathname === '/tickets' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/penalties',
      icon: <ExclamationCircleOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/penalties">Штрафная таблица</Link>,
      className: location.pathname === '/penalties' ? 'ant-menu-item-selected' : '',
    },
    {
      key: '/reports',
      icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/reports">Отчеты</Link>,
      className: location.pathname === '/reports' ? 'ant-menu-item-selected' : '',
    },
    {
      type: 'divider',
      style: { 
        margin: '8px 0', 
        borderColor: isDarkMode ? '#303030' : '#f0f0f0' 
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
      label: 'Настройки системы',
      children: [
        {
          key: '/settings/groups',
          icon: <TeamOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/groups'>Управление группами</Link>,
        },
        {
          key: '/settings/teams',
          icon: <UserOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/teams'>Управление отделами</Link>,
        },
        {
          key: '/settings/roles',
          icon: <CrownOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/roles'>Управление ролями</Link>,
        },
        {
          key: '/settings/quality_criterias',
          icon: <LineChartOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/quality_criterias'>Критерии качества</Link>,
        },
        {
          key: '/settings/ticket_types',
          icon: <LineChartOutlined style={{ fontSize: '14px' }} />,
          label: <Link to='/settings/ticket_types'>Типы запросов</Link>,
        },
      ],
    },
  ];

  const bottomMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
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
      ),
      style: { 
        height: 'auto', 
        padding: 0,
        cursor: 'default'
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
        width={260}
        breakpoint="lg"
        collapsedWidth={0}
        style={{ 
          height: '100vh',
          background: isDarkMode ? '#141414' : '#fff',
          borderRight: isDarkMode ? '1px solid #303030' : '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
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
        <div style={{ padding: '16px 0', flex: 1 }}>
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