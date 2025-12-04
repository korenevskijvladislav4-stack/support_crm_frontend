import React from 'react';
import { Card, Descriptions, Avatar, Space, Tag, Typography, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import type { IUserForm } from '../../types/user.types';
import type { ITeam } from '../../types/teams.type';
import type { IGroup } from '../../types/groups.types';
import type { IRole } from '../../types/role.types';
import type { IScheduleType } from '../../types/schedule-type.types';
import styles from '../../styles/users/edit-user.module.css';

const { Title, Text } = Typography;

interface UserPreviewProps {
  form: IUserForm;
  teams?: ITeam[];
  groups?: IGroup[];
  availableRoles: IRole[];
  allRoles?: IRole[];
  scheduleTypes?: IScheduleType[];
  getRoleColor: (roleId: number) => string;
}

const UserPreview: React.FC<UserPreviewProps> = ({
  form,
  teams,
  groups,
  availableRoles,
  allRoles,
  scheduleTypes,
  getRoleColor
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
          {form.phone && (
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {form.phone}
            </Text>
          )}
        </div>

        <Descriptions column={1} size="small">
          <Descriptions.Item label="Email">
            {form.email || <Text type="secondary">Не указан</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Телефон">
            {form.phone || <Text type="secondary">Не указан</Text>}
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
        description="Изменения вступят в силу сразу после сохранения."
        type="info"
        showIcon
        className={styles.alert}
      />
    </>
  );
};

export default UserPreview;

