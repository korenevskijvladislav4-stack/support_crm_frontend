import React from 'react';
import { Card, Descriptions, Tag, Space } from 'antd';
import { UserOutlined, TeamOutlined, CalendarOutlined, CheckCircleOutlined, MessageOutlined } from '@ant-design/icons';
import type { QualityMap } from '../../types/quality.types';
import { formatDate } from '../../utils/dateUtils';

interface QualityMapInfoProps {
  qualityMap: QualityMap;
  mode?: 'edit' | 'view';
}

const QualityMapInfo: React.FC<QualityMapInfoProps> = ({ qualityMap, mode = 'edit' }) => {

  return (
    <Card 
      title="Информация о карте качества"
      style={{ marginBottom: 24 }}
    >
      <Descriptions 
        bordered 
        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
        size="middle"
      >
        <Descriptions.Item 
          label={
            <Space>
              <UserOutlined />
              <span>Проверяемый сотрудник</span>
            </Space>
          }
        >
          {qualityMap.user?.name || 'Неизвестный'}
          {qualityMap.user?.surname ? ` ${qualityMap.user.surname}` : ''}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <TeamOutlined />
              <span>Команда</span>
            </Space>
          }
        >
          {qualityMap.team?.name || 'Неизвестная'}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <CalendarOutlined />
              <span>Период проверки</span>
            </Space>
          }
        >
          {formatDate(qualityMap.start_date)} - {formatDate(qualityMap.end_date)}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <CheckCircleOutlined />
              <span>Проверяющий</span>
            </Space>
          }
        >
          {qualityMap.checker?.name || 'Неизвестный'}
        </Descriptions.Item>

        <Descriptions.Item 
          label={
            <Space>
              <MessageOutlined />
              <span>Чатов для проверки</span>
            </Space>
          }
        >
          <Tag color="blue">{qualityMap.chat_ids?.length || 0}/15</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Статус">
          <Tag color={mode === 'edit' ? 'processing' : 'success'}>
            {mode === 'edit' ? 'Редактирование' : 'Просмотр'}
          </Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default QualityMapInfo;

