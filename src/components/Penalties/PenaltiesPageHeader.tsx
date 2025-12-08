import React from 'react';
import { Button, Space, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface PenaltiesPageHeaderProps {
  onCreateClick: () => void;
  canCreate?: boolean;
}

const PenaltiesPageHeader: React.FC<PenaltiesPageHeaderProps> = ({
  onCreateClick,
  canCreate = false
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
          {canCreate && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onCreateClick}
              size="middle"
            >
              Создать штраф
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default PenaltiesPageHeader;
