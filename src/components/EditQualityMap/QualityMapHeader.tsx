import React from 'react';
import { Typography, Space, Button, Tag, Breadcrumb, theme } from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  EditOutlined,
  HomeOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import type { QualityMap } from '../../types/quality.types';
import styles from '../../styles/users/users-page.module.css';

const { Title, Text } = Typography;

interface QualityMapHeaderProps {
  qualityMap: QualityMap;
  mode: 'edit' | 'view';
  onBack: () => void;
  onToggleMode: () => void;
  canEdit?: boolean;
}

const QualityMapHeader: React.FC<QualityMapHeaderProps> = ({ 
  qualityMap, 
  mode,
  onBack, 
  onToggleMode,
  canEdit = true,
}) => {
  const { token } = theme.useToken();
  const isEditMode = mode === 'edit';

  return (
    <div className={styles.headerContainer} style={{ marginBottom: 16 }}>
      {/* Breadcrumbs */}
      <Breadcrumb
        style={{ marginBottom: 12 }}
        items={[
          { title: <><HomeOutlined /> Главная</>, href: '/' },
          { title: 'Карты качества', href: '/quality' },
          { title: `Карта #${qualityMap.id}` },
        ]}
      />

      <div className={styles.headerContent}>
        <div className={styles.headerTitleSection}>
          <Space align="center" size={12}>
            <Title 
              level={3} 
              className={styles.title}
              style={{ color: token.colorText, marginBottom: 0 }}
            >
              <LineChartOutlined style={{ color: token.colorPrimary }} />
              {isEditMode ? 'Редактирование карты качества' : 'Просмотр карты качества'}
            </Title>
            <Tag color={isEditMode ? 'processing' : 'success'}>
              {isEditMode ? 'Редактирование' : 'Просмотр'}
            </Tag>
          </Space>
          <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
            {qualityMap.user?.name} {qualityMap.user?.surname} • {qualityMap.team?.name}
          </Text>
        </div>
        
        <Space size="middle" wrap>
          {canEdit && (
            <Button 
              icon={isEditMode ? <EyeOutlined /> : <EditOutlined />}
              type={isEditMode ? 'default' : 'primary'}
              onClick={onToggleMode}
              size="middle"
            >
              {isEditMode ? 'Просмотр' : 'Редактировать'}
            </Button>
          )}
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={onBack}
            size="middle"
          >
            К списку
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default QualityMapHeader;
