import React from 'react';
import { Card, Typography, Space, Button, Breadcrumb, Tag } from 'antd';
import { FileTextOutlined, ArrowLeftOutlined, EditOutlined, HomeOutlined } from '@ant-design/icons';
import type { QualityMap } from '../../types/quality.types';
import { formatDateTime } from '../../utils/dateUtils';

const { Title, Text } = Typography;

interface QualityMapDetailHeaderProps {
  qualityMap: QualityMap;
  onBack: () => void;
  onEditMode: () => void;
}

const QualityMapDetailHeader: React.FC<QualityMapDetailHeaderProps> = ({ qualityMap, onBack, onEditMode }) => {
  return (
    <Card style={{ marginBottom: 24 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            { title: <HomeOutlined />, href: '/quality' },
            { title: 'Карты качества', href: '/quality' },
            { title: `Карта #${qualityMap.id}` },
          ]}
        />

        {/* Заголовок и кнопки */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <Space direction="vertical" size="small" style={{ flex: 1, minWidth: 300 }}>
            <Space align="center" wrap>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <FileTextOutlined style={{ color: '#1890ff', fontSize: 28 }} />
                Просмотр карты качества
              </Title>
              <Tag color="success">Режим просмотра</Tag>
            </Space>
            <Space size="middle" split={<span style={{ color: '#d9d9d9' }}>|</span>}>
              <Text type="secondary">
                <strong>ID:</strong> {qualityMap.id}
              </Text>
              <Text type="secondary">
                <strong>Создана:</strong> {formatDateTime(qualityMap.created_at)}
              </Text>
            </Space>
          </Space>
          
          <Space size="middle" wrap>
            <Button 
              icon={<EditOutlined />} 
              type="primary"
              onClick={onEditMode}
              size="large"
            >
              Редактировать
            </Button>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={onBack}
              size="large"
            >
              Назад к списку
            </Button>
          </Space>
        </div>
      </Space>
    </Card>
  );
};

export default QualityMapDetailHeader;

