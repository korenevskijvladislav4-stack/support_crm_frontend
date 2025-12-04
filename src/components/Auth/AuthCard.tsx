import React from 'react';
import { Card, Typography, theme } from 'antd';
import styles from '../../styles/auth/auth-page.module.css';

const { Title, Text } = Typography;

interface AuthCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  description,
  icon,
  children
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';

  return (
    <div className={styles.authCardWrapper}>
      <Card
        className={styles.authCard}
        bodyStyle={{ 
          padding: '32px',
          backgroundColor: token.colorBgContainer
        }}
        style={{
          backgroundColor: token.colorBgContainer,
          borderColor: token.colorBorder
        }}
      >
        <div className={styles.header}>
          <div 
            className={styles.headerIcon}
            style={{
              background: isDark 
                ? `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {icon}
          </div>
          <Title 
            level={2} 
            className={styles.title}
            style={{ color: token.colorText }}
          >
            {title}
          </Title>
          <Text type="secondary" className={styles.description}>
            {description}
          </Text>
        </div>

        {children}
      </Card>
    </div>
  );
};

export default AuthCard;

