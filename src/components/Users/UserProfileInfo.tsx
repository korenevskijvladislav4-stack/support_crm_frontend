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
import type { IUser, IUserProfileFull } from '../../types/user.types';
import { theme } from 'antd';
import styles from '../../styles/users/user-profile.module.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

const { Title, Text } = Typography;

interface UserProfileInfoProps {
  user: IUser | IUserProfileFull | undefined;
}

const UserProfileInfo: React.FC<UserProfileInfoProps> = ({ user }) => {
  const { token } = theme.useToken();

  const roles: { id: number | string; name: string }[] = Array.isArray((user as IUserProfileFull)?.roles)
    ? (user as IUserProfileFull).roles!.map((r) => ({ id: r.id, name: r.name }))
    : Array.isArray((user as IUser)?.roles)
      ? (user as IUser).roles.map((name, idx) => ({ id: idx, name }))
      : [];
  const groupLabel = typeof user?.group === 'string' ? user.group : user?.group?.name;
  const teamLabel = typeof user?.team === 'string' ? user.team : user?.team?.name;
  const scheduleTypeLabel = typeof (user as IUser)?.schedule_type === 'string'
    ? (user as IUser)?.schedule_type
    : (user as IUserProfileFull)?.schedule_type?.name;
  const createdAtFormatted = user?.created_at
    ? dayjs(user.created_at).locale('ru').format('DD.MM.YYYY HH:mm')
    : null;

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
          {roles.map((role) => (
            <Tag 
              key={role.id} 
              color={
                role.name === 'admin' ? 'red' : 
                role.name === 'manager' ? 'blue' : 
                role.name === 'supervisor' ? 'orange' : 'green'
              }
              icon={<SafetyCertificateOutlined />}
            >
              {role.name}
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
      children: groupLabel ? (
        <Tag color="blue" icon={<TeamOutlined />}>
          {groupLabel}
        </Tag>
      ) : <Text type="secondary">Не указана</Text>,
    },
    {
      key: '6',
      label: (
        <Text strong style={{ color: token.colorText }}>
          <TeamOutlined style={{ marginRight: 8 }} />
          Отдел
        </Text>
      ),
      children: teamLabel ? (
        <Tag color="green" icon={<TeamOutlined />}>
          {teamLabel}
        </Tag>
      ) : <Text type="secondary">Не указан</Text>,
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
          status={scheduleTypeLabel === 'День' ? 'success' : 'processing'} 
          text={
            <Text strong>
              {scheduleTypeLabel || 'Не указан'}
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
      children: createdAtFormatted || <Text type="secondary">Не указана</Text>,
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
      style={{ minHeight: 520 }}
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

