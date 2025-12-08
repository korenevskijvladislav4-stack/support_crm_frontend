import React from 'react';
import { Typography } from 'antd';
import {
  UserOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface UsersPageHeaderProps {}

const UsersPageHeader: React.FC<UsersPageHeaderProps> = () => {
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
      </div>
    </div>
  );
};

export default UsersPageHeader;

