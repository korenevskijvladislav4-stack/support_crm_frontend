import React from 'react';
import { Button, Flex, Typography, Popconfirm } from 'antd';
import { EditOutlined, StopOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { IUser } from '../../types/user.types';
import styles from '../../styles/users/user-profile.module.css';

const { Title, Text } = Typography;

interface UserProfileHeaderProps {
  user: IUser | undefined;
  userId: number | null;
  onDeactivate: () => Promise<void>;
  isDeactivating: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  userId,
  onDeactivate,
  isDeactivating
}) => {
  return (
    <Flex justify="space-between" align="flex-start" className={styles.headerContainer}>
      <div>
        <Title level={1} className={styles.title}>
          <div className={styles.avatar}>
            {user?.name?.[0]}{user?.surname?.[0]}
          </div>
          Профиль пользователя
        </Title>
        <Text type="secondary" className={styles.description}>
          Детальная информация и статистика работы
        </Text>
      </div>
      
      <Flex gap={8}>
        <Link to={`/users/${userId}/edit`}>
          <Button type="primary" size="large" icon={<EditOutlined />}>
            Редактировать
          </Button>
        </Link>
        <Popconfirm
          title="Деактивация пользователя"
          description="Вы уверены, что хотите деактивировать этого пользователя? Все его сессии будут завершены."
          okText="Да, деактивировать"
          cancelText="Отмена"
          okType="danger"
          onConfirm={onDeactivate}
        >
          <Button 
            danger 
            size="large" 
            icon={<StopOutlined />}
            loading={isDeactivating}
          >
            Деактивировать
          </Button>
        </Popconfirm>
      </Flex>
    </Flex>
  );
};

export default UserProfileHeader;

