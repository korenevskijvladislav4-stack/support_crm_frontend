import React from 'react';
import { Typography } from 'antd';
import {
  TeamOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface AttemptsPageHeaderProps {}

const AttemptsPageHeader: React.FC<AttemptsPageHeaderProps> = () => {
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
      </div>
    </div>
  );
};

export default AttemptsPageHeader;

