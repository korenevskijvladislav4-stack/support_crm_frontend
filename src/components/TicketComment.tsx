import React from 'react';
import { Card, Avatar, Typography, Tag, Space, Flex, Button } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ITicketComment } from '../types/ticket.types';

const { Text, Paragraph } = Typography;

interface TicketCommentProps {
  comment: ITicketComment;
  onEdit?: (comment: ITicketComment) => void;
  onDelete?: (comment: ITicketComment) => void;
  canEdit?: boolean;
}

const TicketComment: React.FC<TicketCommentProps> = ({ 
  comment, 
  onEdit, 
  onDelete, 
  canEdit = false 
}) => {
  const getInitials = (name?: string, surname?: string) => {
    return `${name?.[0] || ''}${surname?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (userId: number) => {
    const colors = [
      '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
      '#fa541c', '#13c2c2', '#eb2f96', '#a0d911', '#2f54eb'
    ];
    return colors[userId % colors.length];
  };

  return (
    <Card 
      size="small" 
      style={{ 
        marginBottom: 16,
        border: '1px solid #f0f0f0',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Flex gap={12} align="flex-start">
        {/* Аватар */}
        <Avatar 
          size={40}
          style={{ 
            backgroundColor: getAvatarColor(comment.user_id),
            flexShrink: 0
          }}
          icon={!comment.user?.name ? <UserOutlined /> : undefined}
        >
          {comment.user?.name && getInitials(comment.user.name, comment.user.surname)}
        </Avatar>

        {/* Содержание комментария */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Заголовок с именем и временем */}
          <Flex justify="space-between" align="flex-start" style={{ marginBottom: 8 }}>
            <Space size={8}>
              <Text strong style={{ fontSize: '14px' }}>
                {comment.user?.name} {comment.user?.surname}
              </Text>
              
              {comment.is_internal && (
                <Tag 
                  color="orange" 
                  style={{ 
                    margin: 0, 
                    fontSize: '11px',
                    border: 'none',
                    borderRadius: '6px'
                  }}
                >
                  Внутренний
                </Tag>
              )}
              
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {new Date(comment.created_at).toLocaleString('ru-RU')}
              </Text>
            </Space>

            {/* Действия */}
            {canEdit && (
              <Space size={0}>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={() => onEdit?.(comment)}
                  style={{ color: '#1890ff' }}
                />
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  size="small"
                  onClick={() => onDelete?.(comment)}
                  style={{ color: '#ff4d4f' }}
                />
              </Space>
            )}
          </Flex>

          {/* Текст комментария */}
          <Paragraph 
            style={{ 
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontSize: '14px',
              lineHeight: 1.5,
              color: '#333'
            }}
          >
            {comment.content}
          </Paragraph>

          {/* Индикатор редактирования */}
          {comment.created_at !== comment.updated_at && (
            <Text type="secondary" style={{ fontSize: '11px', marginTop: 8, display: 'block' }}>
              ✏️ Отредактировано {new Date(comment.updated_at).toLocaleString('ru-RU')}
            </Text>
          )}
        </div>
      </Flex>
    </Card>
  );
};

export default TicketComment;