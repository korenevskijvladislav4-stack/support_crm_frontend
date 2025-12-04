import React from 'react';
import { Timeline, Flex, Avatar, Typography } from 'antd';
import { SyncOutlined, CommentOutlined, PaperClipOutlined, UserOutlined } from '@ant-design/icons';
import type { ITicket } from '../../types/ticket.types';
import { getAvatarColor, getInitials } from '../../utils/ticketUtils';

const { Text } = Typography;

interface ActivityTimelineProps {
  activities: ITicket['activities'];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <Timeline>
      {activities.slice(0, 8).map((activity) => (
        <TimelineItem key={activity.id} activity={activity} />
      ))}
    </Timeline>
  );
};

const TimelineItem: React.FC<{ activity: ITicket['activities'][0] }> = ({ activity }) => {
  const { dot, color } = getTimelineConfig(activity.type);

  return (
    <Timeline.Item dot={dot} color={color}>
      <ActivityContent activity={activity} />
    </Timeline.Item>
  );
};

const getTimelineConfig = (type: string) => {
  switch (type) {
    case 'status_changed':
      return { dot: <SyncOutlined />, color: 'blue' as const };
    case 'comment_added':
      return { dot: <CommentOutlined />, color: 'green' as const };
    case 'attachment_added':
      return { dot: <PaperClipOutlined />, color: 'purple' as const };
    default:
      return { dot: <UserOutlined />, color: 'gray' as const };
  }
};

const ActivityContent: React.FC<{ activity: ITicket['activities'][0] }> = ({ activity }) => (
  <div>
    <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
      <Avatar 
        size={24}
        style={{ 
          backgroundColor: getAvatarColor(activity.user_id),
          fontSize: '12px'
        }}
      >
        {getInitials(activity.user?.name, activity.user?.surname)}
      </Avatar>
      <Text strong style={{ fontSize: '14px' }}>
        {activity.user?.name} {activity.user?.surname}
      </Text>
    </Flex>
    <Text style={{ fontSize: '14px', display: 'block', marginBottom: 4, lineHeight: 1.4 }}>
      {activity.description}
    </Text>
    <Text type="secondary" style={{ fontSize: '12px' }}>
      {new Date(activity.created_at).toLocaleString('ru-RU')}
    </Text>
  </div>
);