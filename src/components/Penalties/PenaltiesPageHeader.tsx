import React from 'react';
import { Button, Space, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface PenaltiesPageHeaderProps {
  onResetFilters: () => void;
  onRefetch?: () => void;
  hasActiveFilters: boolean;
  onCreateClick: () => void;
}

const PenaltiesPageHeader: React.FC<PenaltiesPageHeaderProps> = ({
  onResetFilters,
  onRefetch,
  hasActiveFilters,
  onCreateClick
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
            <ExclamationCircleOutlined style={{ color: token.colorError }} />
            Штрафная таблица
          </Title>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            Управление нарушениями регламента пользователями
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
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={onCreateClick}
            size="middle"
          >
            Создать штраф
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default PenaltiesPageHeader;

