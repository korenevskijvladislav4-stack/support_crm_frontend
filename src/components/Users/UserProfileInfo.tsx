import React from 'react';
import { Card, Descriptions, Button, Flex, Tag, Typography, Badge } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import type { IUser } from '../../types/user.types';
import { theme } from 'antd';
import styles from '../../styles/users/user-profile.module.css';

const { Title, Text } = Typography;

interface UserProfileInfoProps {
  user: IUser | undefined;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  const { token } = theme.useToken();

  const items = [
    {
      key: '1',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <UserOutlined style={{ marginRight: 8 }} />
          ФИО
        </Text>
      ),
      children: (
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          {user?.name} {user?.surname}
        </Title>
      ),
    },
    {
      key: '2',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <MailOutlined style={{ marginRight: 8 }} />
          Email
        </Text>
      ),
      children: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text>{user?.email}</Text>
          <Button type="link" size="small" icon={<MailOutlined />}>
            Написать
          </Button>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <PhoneOutlined style={{ marginRight: 8 }} />
          Телефон
        </Text>
      ),
      children: user?.phone || (
        <Text type="secondary">Не указан</Text>
      ),
    },
    {
      key: '4',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <SafetyCertificateOutlined style={{ marginRight: 8 }} />
          Должность
        </Text>
      ),
      children: (
        <Flex gap={4} wrap="wrap">
          {user?.roles?.map((role, index) => (
            <Tag 
              key={index} 
              color={
                role === 'admin' ? 'red' : 
                role === 'manager' ? 'blue' : 
                role === 'supervisor' ? 'orange' : 'green'
              }
              icon={<SafetyCertificateOutlined />}
            >
              {role}
            </Tag>
          ))}
        </Flex>
      ),
    },
    {
      key: '5',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Группа
        </Text>
      ),
      children: (
        <Tag color="blue" icon={<TeamOutlined />}>
          {user?.group}
        </Tag>
      ),
    },
    {
      key: '6',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Отдел
        </Text>
      ),
      children: (
        <Tag color="green" icon={<TeamOutlined />}>
          {user?.team}
        </Tag>
      ),
    },
    {
      key: '7',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          График работы
        </Text>
      ),
      children: (
        <Badge 
          status={user?.schedule_type === 'День' ? 'success' : 'processing'} 
          text={
            <Text strong>
              {user?.schedule_type} 
              <Text type="secondary" style={{ marginLeft: 8 }}>
                (9:00 - 18:00)
              </Text>
            </Text>
          } 
        />
      ),
    },
    {
      key: '8',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Дата регистрации
        </Text>
      ),
      children: '15 марта 2023 года',
    },
  ];

  return (
    <Card 
      title={
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Основная информация
        </span>
      }
      className={styles.infoCard}
    >
      <Descriptions 
        items={items} 
        column={1}
        bordered
        size="middle"
        labelStyle={{ 
          fontWeight: 600, 
          width: '200px',
          background: token.colorFillTertiary,
          color: token.colorText
        }}
        contentStyle={{
          background: token.colorBgContainer,
          color: token.colorText
        }}
      />
    </Card>
  );
};

export default UserProfileInfo;

