import React from 'react';
import { Card, Flex, Space, Typography, Badge, Alert, Tag } from 'antd';
import { RocketOutlined, PaperClipOutlined, HistoryOutlined, TeamOutlined } from '@ant-design/icons';
import type { ITicket, ITicketAttachment, ITicketStatus } from '../../types/ticket.types';
import { StatusSelector } from './StatusSelector';
import { AttachmentsList } from './AttachmentsList';
import { ActivityTimeline } from './ActivityTimeline';
import { UserInfo } from './UserInfo';

const { Text } = Typography;

interface TicketManagementProps {
  ticket: ITicket;
  statuses: ITicketStatus[];
  isChangingStatus: boolean;
  isDownloading: number | null;
  onStatusChange: (statusId: number) => void;
  onDownload: (attachment: ITicketAttachment) => void;
  onDelete: (attachmentId: number) => void;
  onPreview: (attachment: ITicketAttachment) => void;
}

export const TicketManagement: React.FC<TicketManagementProps> = ({
  ticket,
  statuses,
  isChangingStatus,
  isDownloading,
  onStatusChange,
  onDownload,
  onDelete,
  onPreview
}) => {
  return (
    <Flex vertical gap={24}>
      <ManagementCard 
        title="Управление тикетом"
        icon={<RocketOutlined style={{ color: '#1890ff' }} />}
      >
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <StatusSelector 
            ticket={ticket}
            statuses={statuses}
            isChanging={isChangingStatus}
            onStatusChange={onStatusChange}
          />
          
          <UserInfo 
            user={ticket.creator}
            label="Создатель"
          />
          
          <TeamInfo team={ticket.team} />
          <DateInfo label="Создан" date={ticket.created_at} />
          <DateInfo label="Обновлен" date={ticket.updated_at} />
        </Space>
      </ManagementCard>

      <ManagementCard 
        title="Вложения"
        icon={<PaperClipOutlined style={{ color: '#52c41a' }} />}
        badge={ticket.attachments?.length}
      >
        {ticket.attachments && ticket.attachments.length > 0 ? (
          <AttachmentsList
            attachments={ticket.attachments}
            isDownloading={isDownloading}
            onDownload={onDownload}
            onDelete={onDelete}
            onPreview={onPreview}
          />
        ) : (
          <Alert 
            message="Нет прикрепленных файлов" 
            type="info" 
            showIcon 
            style={{ borderRadius: '12px' }}
          />
        )}
      </ManagementCard>

      <ManagementCard 
        title="История активности"
        icon={<HistoryOutlined style={{ color: '#722ed1' }} />}
      >
        {ticket.activities && ticket.activities.length > 0 ? (
          <ActivityTimeline activities={ticket.activities} />
        ) : (
          <Alert 
            message="История активности отсутствует" 
            type="info" 
            showIcon 
            style={{ borderRadius: '12px' }}
          />
        )}
      </ManagementCard>
    </Flex>
  );
};

// Вспомогательные компоненты
const ManagementCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  badge?: number;
  children: React.ReactNode;
}> = ({ title, icon, badge, children }) => (
  <Card 
    title={
      <Flex align="center" gap={8}>
        {icon}
        <span style={{ fontSize: '18px', fontWeight: 600 }}>{title}</span>
        {badge !== undefined && (
          <Badge 
            count={badge} 
            style={{ 
              backgroundColor: '#52c41a',
              fontSize: '12px'
            }} 
          />
        )}
      </Flex>
    }
    style={{ 
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
    }}
  >
    {children}
  </Card>
);

const TeamInfo: React.FC<{ team: ITicket['team'] }> = ({ team }) => (
  <Flex justify="space-between" align="center">
    <Text strong style={{ color: '#666', fontSize: '14px' }}>Команда:</Text>
    {team ? (
      <Tag icon={<TeamOutlined />} color="blue" style={{ margin: 0, fontSize: '13px', padding: '6px 12px' }}>
        {team.name}
      </Tag>
    ) : (
      <Text type="secondary" style={{ fontSize: '14px' }}>Не назначена</Text>
    )}
  </Flex>
);

const DateInfo: React.FC<{ label: string; date: string }> = ({ label, date }) => (
  <Flex justify="space-between" align="center">
    <Text strong style={{ color: '#666', fontSize: '14px' }}>{label}:</Text>
    <div style={{ textAlign: 'right' }}>
      <Text style={{ fontSize: '14px' }}>
        {new Date(date).toLocaleDateString('ru-RU')}
      </Text>
      <br />
      <Text type="secondary" style={{ fontSize: '12px' }}>
        {new Date(date).toLocaleTimeString('ru-RU')}
      </Text>
    </div>
  </Flex>
);