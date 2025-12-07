import React from 'react';
import { Card, Descriptions, Avatar, Space, Tag, Typography, Alert, Button } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { IAttemptForm } from '../../types/attempt.types';
import type { ITeam } from '../../types/team.types';
import type { IGroup } from '../../types/group.types';
import type { IRole } from '../../types/role.types';
import type { IScheduleType } from '../../types/schedule.types';
import styles from '../../styles/attempts/attempt-approve.module.css';

const { Title, Text } = Typography;

interface AttemptPreviewProps {
  form: IAttemptForm;
  teams?: ITeam[];
  groups?: IGroup[];
  availableRoles: IRole[];
  allRoles?: IRole[];
  scheduleTypes?: IScheduleType[];
  getRoleColor: (roleId: number) => string;
  onApprove: () => void;
  isApproving: boolean;
  isValid: boolean;
}

const AttemptPreview: React.FC<AttemptPreviewProps> = ({
  form,
  teams,
  groups,
  availableRoles,
  allRoles,
  scheduleTypes,
  getRoleColor,
  onApprove,
  isApproving,
  isValid
}) => {
  return (
    <>
      <Card 
        title="Предпросмотр профиля"
        className={styles.previewCard}
      >
        <div className={styles.avatarContainer}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <Title level={4} className={styles.userName}>
            {form.name} {form.surname}
          </Title>
          <Text type="secondary">{form.email}</Text>
        </div>

        <Descriptions column={1} size="small">
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              <Text>{form.email}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            {form.phone ? (
              <Space>
                <PhoneOutlined />
                <Text>{form.phone}</Text>
              </Space>
            ) : (
              <Text type="secondary">Не указан</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Отдел">
            {form.team_id ? 
              teams?.find(t => t.id === form.team_id)?.name : 
              <Text type="secondary">Не выбран</Text>
            }
          </Descriptions.Item>
          <Descriptions.Item label="Группа">
            {form.group_id ? 
              groups?.find(g => g.id === form.group_id)?.name : 
              <Text type="secondary">Не выбрана</Text>
            }
          </Descriptions.Item>
          <Descriptions.Item label="График">
            {form.schedule_type_id ? 
              scheduleTypes?.find(s => s.id === form.schedule_type_id)?.name : 
              <Text type="secondary">Не выбран</Text>
            }
          </Descriptions.Item>
          <Descriptions.Item label="Роли">
            <div className={styles.rolesContainer}>
              {form.roles.length > 0 ? (
                <Space size={[0, 4]} wrap>
                  {form.roles.map(roleId => {
                    const role = availableRoles.find(r => r.id === roleId) || allRoles?.find(r => r.id === roleId);
                    return role ? (
                      <Tag 
                        key={role.id} 
                        color={getRoleColor(role.id)}
                        className={styles.roleTag}
                      >
                        {role.name}
                      </Tag>
                    ) : null;
                  })}
                </Space>
              ) : (
                <Text type="secondary">Не выбраны</Text>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Alert
        message="Внимание"
        description="После одобрения заявки будет создана учетная запись пользователя с выбранными правами доступа."
        type="info"
        showIcon
        className={styles.alert}
      />

      <Card>
        <Button 
          type="primary" 
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={onApprove}
          loading={isApproving}
          disabled={!isValid}
          className={styles.approveButton}
          block
        >
          Одобрить заявку
        </Button>
        
        {!isValid && (
          <Text type="secondary" className={styles.helpText}>
            Заполните все обязательные поля
          </Text>
        )}
      </Card>
    </>
  );
};

export default AttemptPreview;

