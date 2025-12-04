import React from 'react';
import { Flex, Avatar, Typography } from 'antd';
import { getAvatarColor, getInitials } from '../../utils/ticketUtils';

const { Text } = Typography;

interface UserInfoProps {
  user?: { id: number; name?: string; surname?: string; email?: string };
  label: string;
}

export const UserInfo: React.FC<UserInfoProps> = ({ user, label }) => (
  <Flex justify="space-between" align="center">
    <Text strong style={{ color: '#666', fontSize: '14px' }}>{label}:</Text>
    <Flex align="center" gap={12}>
      <Avatar 
        size="large"
        style={{ 
          backgroundColor: getAvatarColor(user?.id || 0),
          fontSize: '14px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        {getInitials(user?.name, user?.surname)}
      </Avatar>
      <div style={{ textAlign: 'right' }}>
        <Text strong style={{ fontSize: '15px' }}>
          {user?.name} {user?.surname}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: '13px' }}>
          {user?.email}
        </Text>
      </div>
    </Flex>
  </Flex>
);