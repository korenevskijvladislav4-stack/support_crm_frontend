import React from 'react';
import { Card, Flex, Avatar, Typography, Tag, Space, Badge, Alert, theme } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import type { ITicket, ITicketComment } from '../../types/ticket.types';
import { getAvatarColor, getInitials } from '../../utils/ticketUtils';

const { Text, Paragraph } = Typography;

interface CommentsListProps {
  ticket: ITicket;
  commentForm: React.ReactNode;
}

export const CommentsList: React.FC<CommentsListProps> = ({ ticket, commentForm }) => {
  return (
    <Card 
      title={
        <Flex align="center" gap={8}>
          <CommentOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontSize: '20px', fontWeight: 600 }}>Комментарии</span>
          {ticket.comments && (
            <Badge 
              count={ticket.comments.length} 
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
      {commentForm}
      <CommentsContent comments={ticket.comments} />
    </Card>
  );
};

const CommentsContent: React.FC<{ comments: ITicket['comments'] }> = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <Alert 
        message="Пока нет комментариев" 
        description="Будьте первым, кто оставит комментарий к этому тикету."
        type="info" 
        showIcon 
        style={{ borderRadius: '12px', fontSize: '15px' }}
      />
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

const CommentItem: React.FC<{ comment: ITicketComment }> = ({ comment }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  
  const commentCardStyle: React.CSSProperties = {
    marginBottom: 20,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: '16px',
    background: comment.is_internal 
      ? (isDark ? '#3d2816' : '#fffaf0')
      : token.colorBgContainer,
    boxShadow: token.boxShadow
  };

  return (
    <Card 
      size="small" 
      style={commentCardStyle}
    >
    <Flex gap={16} align="flex-start">
      <CommentAvatar user={comment.user} />
      <CommentContent comment={comment} />
    </Flex>
  </Card>
  );
};


const CommentAvatar: React.FC<{ user: ITicketComment['user'] }> = ({ user }) => (
  <Avatar 
    size={52}
    style={{ 
      backgroundColor: getAvatarColor(user?.id || 0),
      flexShrink: 0,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}
  >
    {getInitials(user?.name, user?.surname)}
  </Avatar>
);

const CommentContent: React.FC<{ comment: ITicketComment }> = ({ comment }) => (
  <div style={{ flex: 1, minWidth: 0 }}>
    <CommentHeader comment={comment} />
    <Paragraph style={commentTextStyle}>
      {comment.content}
    </Paragraph>
  </div>
);

const CommentHeader: React.FC<{ comment: ITicketComment }> = ({ comment }) => (
  <Flex justify="space-between" align="flex-start" style={{ marginBottom: 12 }}>
    <Space size={12} wrap>
      <Text strong style={{ fontSize: '16px' }}>
        {comment.user?.name} {comment.user?.surname}
      </Text>
      {comment.is_internal && (
        <InternalTag />
      )}
      <Text type="secondary" style={{ fontSize: '14px' }}>
        {new Date(comment.created_at).toLocaleString('ru-RU')}
      </Text>
    </Space>
  </Flex>
);

const InternalTag: React.FC = () => (
  <Tag 
    color="orange" 
    style={internalTagStyle}
  >
    👁️ Внутренний
  </Tag>
);

const internalTagStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '12px',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 500
};

const commentTextStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#333'
};