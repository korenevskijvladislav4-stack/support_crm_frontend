import React from 'react';
import { Button, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import {
  LineChartOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { theme } from 'antd';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface QualityMapPageHeaderProps {
  canCreate?: boolean;
}

const QualityMapPageHeader: React.FC<QualityMapPageHeaderProps> = ({
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
            <LineChartOutlined style={{ color: token.colorPrimary }} />
            Карты качества
          </Title>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            Управление картами качества сотрудников
          </Text>
        </div>
        
        <Space size="middle" wrap>
          {canCreate && (
            <Link to="/quality/create">
              <Button type="primary" icon={<PlusOutlined />} size="middle">
                Создать карту
              </Button>
            </Link>
          )}
        </Space>
      </div>
    </div>
  );
};

export default QualityMapPageHeader;
