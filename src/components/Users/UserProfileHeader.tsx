import React from 'react';
import { Button, Flex, Typography, Popconfirm } from 'antd';
import { EditOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import type { IUser, IUserProfileFull } from '../../types/user.types';
import styles from '../../styles/users/user-profile.module.css';

const { Title, Text } = Typography;

interface UserProfileHeaderProps {
  user: IUser | IUserProfileFull | undefined;
  userId: number | null;
  onChangeStatus: () => Promise<void>;
  isChangingStatus: boolean;
  isDeactivated: boolean;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  userId,
  onChangeStatus,
  isChangingStatus,
  isDeactivated
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
          title={isDeactivated ? "Активация пользователя" : "Деактивация пользователя"}
          description={
            isDeactivated
              ? "Вы уверены, что хотите активировать этого пользователя?"
              : "Вы уверены, что хотите деактивировать этого пользователя? Все его сессии будут завершены."
          }
          okText={isDeactivated ? "Да, активировать" : "Да, деактивировать"}
          cancelText="Отмена"
          okType={isDeactivated ? "primary" : "danger"}
          onConfirm={onChangeStatus}
        >
          <Button 
            type={isDeactivated ? "primary" : "default"}
            danger={!isDeactivated}
            size="large" 
            icon={isDeactivated ? <CheckCircleOutlined /> : <StopOutlined />}
            loading={isChangingStatus}
          >
            {isDeactivated ? "Активировать" : "Деактивировать"}
          </Button>
        </Popconfirm>
      </Flex>
    </Flex>
  );
};

export default UserProfileHeader;

