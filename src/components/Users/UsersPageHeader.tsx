import React from 'react';
import { Button, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  UserOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface UsersPageHeaderProps {
  onResetFilters: () => void;
  onRefetch?: () => void;
  hasActiveFilters: boolean;
}

const UsersPageHeader: React.FC<UsersPageHeaderProps> = ({
  onResetFilters,
  onRefetch,
  hasActiveFilters
}) => {
  const { token } = theme.useToken();

  return (
    <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
      <div className={styles.headerContent}>
        <div className={styles.headerTitleSection}>
          <Title 
            level={3} 
            className={styles.title}
            style={{ color: token.colorText, marginBottom: 4 }}
          >
            <UserOutlined style={{ color: token.colorPrimary }} />
            Пользователи
          </Title>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            Управление пользователями и их правами доступа
          </Text>
        </div>
        
        <Space size="middle" wrap>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={onResetFilters}
            disabled={!hasActiveFilters}
            size="middle"
          >
            Сбросить
          </Button>
          {onRefetch && (
            <Button 
              icon={<ReloadOutlined />}
              onClick={onRefetch}
              size="middle"
            >
              Обновить
            </Button>
          )}
          <Link to="/users/create">
            <Button type="primary" icon={<PlusOutlined />} size="middle">
              Добавить
            </Button>
          </Link>
        </Space>
      </div>
    </div>
  );
};

export default UsersPageHeader;

