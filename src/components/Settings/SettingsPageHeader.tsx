import React, { type ReactNode, useState, useEffect } from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { Title, Text } = Typography;
const { useToken } = theme;

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  onCreateClick?: () => void;
  onRefreshClick?: () => void;
  createButtonText?: string;
  isLoading?: boolean;
  extra?: ReactNode;
}

const SettingsPageHeader: React.FC<SettingsPageHeaderProps> = ({
  title,
  description,
  icon,
  onCreateClick,
  onRefreshClick,
  createButtonText = 'Создать',
  isLoading = false,
  extra,
}) => {
  const { token } = useToken();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ flex: '1 1 auto', minWidth: 200 }}>
          <Title 
            level={2} 
            style={{ 
              margin: 0, 
              marginBottom: 8,
              display: 'flex', 
              alignItems: 'center', 
              gap: 12,
              color: token.colorText,
              fontSize: isMobile ? 20 : 24
            }}
          >
            {icon}
            {title}
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {description}
          </Text>
        </div>
        
        <Space 
          size="middle"
          wrap
          style={{ 
            flex: '0 0 auto'
          }}
        >
          {onRefreshClick && (
            <Button 
              icon={<ReloadOutlined />}
              onClick={onRefreshClick}
              loading={isLoading}
            >
              {!isMobile && 'Обновить'}
            </Button>
          )}
          {onCreateClick && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large"
              onClick={onCreateClick}
            >
              {createButtonText}
            </Button>
          )}
          {extra}
        </Space>
      </div>
    </div>
  );
};

export default SettingsPageHeader;

