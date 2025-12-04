import React from 'react';
import { Button, Space, Typography } from 'antd';
import {
  TeamOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface AttemptsPageHeaderProps {
  onResetFilters: () => void;
  onRefetch?: () => void;
  hasActiveFilters: boolean;
}

const AttemptsPageHeader: React.FC<AttemptsPageHeaderProps> = ({
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
            <TeamOutlined style={{ color: token.colorPrimary }} />
            Заявки на регистрацию
          </Title>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            Управление заявками новых пользователей
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
        </Space>
      </div>
    </div>
  );
};

export default AttemptsPageHeader;

