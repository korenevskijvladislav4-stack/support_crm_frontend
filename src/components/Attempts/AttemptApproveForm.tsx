import React from 'react';
import { Card, Form, Input, Select, Divider, Row, Col, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, SafetyCertificateOutlined, CalendarOutlined } from '@ant-design/icons';
import type { IAttemptForm } from '../../types/attempt.types';
import type { ITeam } from '../../types/team.types';
import type { IGroup } from '../../types/group.types';
import type { IRole } from '../../types/role.types';
import type { IScheduleType } from '../../types/schedule.types';
import styles from '../../styles/attempts/attempt-approve.module.css';

const { Text } = Typography;
const { Option } = Select;

interface AttemptApproveFormProps {
  form: IAttemptForm;
  onFormChange: (field: keyof IAttemptForm, value: string | number | number[] | null) => void;
  teams?: ITeam[];
  groups?: IGroup[];
  availableRoles: IRole[];
  scheduleTypes?: IScheduleType[];
  getRoleColor: (roleId: number) => string;
  onGroupSelect?: (groupId: number | null) => void;
}

const AttemptApproveForm: React.FC<AttemptApproveFormProps> = ({
  form,
  onFormChange,
  teams,
  groups,
  availableRoles,
  scheduleTypes,
  onGroupSelect
}) => {
  return (
    <Card 
      title={
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <span>Информация о сотруднике</span>
        </Space>
      }
      className={styles.formCard}
    >
      <Form
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
        size="middle"
      >
        <Divider orientation="left">Личная информация</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Имя" required>
              <Input 
                value={form.name}
                onChange={(e) => onFormChange('name', e.target.value)}
                placeholder="Введите имя"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Фамилия" required>
              <Input 
                value={form.surname}
                onChange={(e) => onFormChange('surname', e.target.value)}
                placeholder="Введите фамилию"
                prefix={<UserOutlined />}
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Email" required>
          <Input 
            value={form.email}
            onChange={(e) => onFormChange('email', e.target.value)}
            placeholder="Введите email"
            prefix={<MailOutlined />}
            size="large"
          />
        </Form.Item>

        <Form.Item label="Телефон">
          <Input 
            value={form.phone}
            onChange={(e) => onFormChange('phone', e.target.value)}
            placeholder="Введите номер телефона"
            prefix={<PhoneOutlined />}
            size="large"
          />
        </Form.Item>

        <Divider orientation="left">Организационная структура</Divider>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Отдел" required>
              <Select
                value={form.team_id}
                onChange={(value) => {
                  const newTeam = teams?.find(t => t.id === value);
                  const newTeamRoleIds = newTeam?.roles?.map(r => r.id) || [];
                  const validRoles = form.roles.filter(roleId => newTeamRoleIds.includes(roleId));
                  
                  onFormChange('team_id', value);
                  onFormChange('roles', validRoles);
                }}
                placeholder="Выберите отдел"
                optionFilterProp="children"
                size="large"
                allowClear
              >
                {teams?.map((team) => (
                  <Option key={team.id} value={team.id}>
                    <Space>
                      <TeamOutlined />
                      {team.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Группа" required>
              <Select
                value={form.group_id}
                onChange={(value) => {
                  onFormChange('group_id', value);
                  if (onGroupSelect) {
                    onGroupSelect(value);
                  }
                }}
                placeholder="Выберите группу"
                optionFilterProp="children"
                size="large"
                allowClear
              >
                {groups?.map((group) => (
                  <Option key={group.id} value={group.id}>
                    <Space>
                      <TeamOutlined />
                      {group.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Права доступа</Divider>
        <Form.Item label="Роли" required>
          <Select
            mode="multiple"
            value={form.roles}
            onChange={(selectedValues) => onFormChange('roles', selectedValues)}
            placeholder={form.team_id ? "Выберите роли" : "Сначала выберите отдел"}
            optionFilterProp="children"
            size="large"
            allowClear
            disabled={!form.team_id}
          >
            {availableRoles.map((role) => (
              <Option key={role.id} value={role.id}>
                <Space>
                  <SafetyCertificateOutlined />
                  {role.name}
                </Space>
              </Option>
            ))}
          </Select>
          <Text type="secondary" className={styles.helpText}>
            {form.team_id 
              ? `Выберите одну или несколько ролей из доступных в отделе "${teams?.find(t => t.id === form.team_id)?.name}"`
              : "Сначала выберите отдел, чтобы увидеть доступные роли"
            }
          </Text>
        </Form.Item>

        <Divider orientation="left">График работы</Divider>
        <Form.Item label="Тип графика" required>
          <Select
            value={form.schedule_type_id}
            onChange={(value) => onFormChange('schedule_type_id', value)}
            placeholder="Выберите график работы"
            optionFilterProp="children"
            size="large"
            allowClear
          >
            {scheduleTypes?.map((scheduleType) => (
              <Option key={scheduleType.id} value={scheduleType.id}>
                <Space>
                  <CalendarOutlined />
                  {scheduleType.name}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AttemptApproveForm;

