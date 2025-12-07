import React from 'react';
import { Modal, Form, Input, Select, Typography, Divider, Row, Col } from 'antd';
import { TeamOutlined, UserOutlined, ClockCircleOutlined, CalendarOutlined, ExclamationCircleOutlined, CrownOutlined } from '@ant-design/icons';
import type { IGroup, IGroupForm } from '../../../types/group.types';
import type { ITeam } from '../../../types/team.types';
import type { IUser } from '../../../types/user.types';
import { theme } from 'antd';
import styles from '../../../styles/settings/settings-modals.module.css';

const { Text } = Typography;

interface GroupModalProps {
  open: boolean;
  editingGroup: IGroup | null;
  onOk: () => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm<IGroupForm>>[0];
  groupName: string;
  onGroupNameChange: (value: string) => void;
  teamId: number | null;
  onTeamIdChange: (value: number | null) => void;
  shiftType: string | null;
  onShiftTypeChange: (value: string | null) => void;
  shiftNumber: string | null;
  onShiftNumberChange: (value: string | null) => void;
  supervisorId: number | null;
  onSupervisorIdChange: (value: number | null) => void;
  teams?: ITeam[];
  users?: IUser[];
  isLoadingTeams: boolean;
  isLoadingUsers?: boolean;
  isSubmitting: boolean;
}

const GroupModal: React.FC<GroupModalProps> = ({
  open,
  editingGroup,
  onOk,
  onCancel,
  form,
  groupName,
  onGroupNameChange,
  teamId,
  onTeamIdChange,
  shiftType,
  onShiftTypeChange,
  shiftNumber,
  onShiftNumberChange,
  supervisorId,
  onSupervisorIdChange,
  teams,
  users,
  isLoadingTeams,
  isLoadingUsers = false,
  isSubmitting
}) => {
  const { token } = theme.useToken();

  return (
    <Modal
      title={editingGroup ? 'Редактирование группы' : 'Создание новой группы'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText={editingGroup ? 'Сохранить' : 'Создать группу'}
      cancelText="Отменить"
      width={700}
      okButtonProps={{
        disabled: !groupName.trim() || !teamId || !shiftType || !shiftNumber
      }}
    >
      <Form
        form={form}
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        layout="horizontal"
        size="middle"
      >
        <Form.Item 
          name="name"
          label="Название группы" 
          rules={[{ required: true, message: 'Введите название группы' }]}
          className={styles.formItemLarge}
        >
          <Input 
            placeholder="Введите название группы"
            prefix={<TeamOutlined />}
            size="large"
            value={groupName}
            onChange={(e) => {
              onGroupNameChange(e.target.value);
              form.setFieldValue('name', e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item 
          name="team_id"
          label="Отдел" 
          rules={[{ required: true, message: 'Выберите отдел' }]}
          className={styles.formItemLarge}
        >
          <Select
            placeholder="Выберите отдел"
            loading={isLoadingTeams}
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            value={teamId}
            onChange={(value) => {
              onTeamIdChange(value);
              form.setFieldValue('team_id', value);
            }}
          >
            {teams?.map((team) => (
              <Select.Option key={team.id} value={team.id} label={team.name}>
                <div className={styles.optionContent}>
                  <UserOutlined />
                  {team.name}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              name="shift_type"
              label="Тип смены" 
              rules={[{ required: true, message: 'Выберите тип смены' }]}
              className={styles.formItemLarge}
            >
              <Select
                placeholder="Выберите тип смены"
                size="large"
                allowClear
                value={shiftType}
                onChange={(value) => {
                  onShiftTypeChange(value);
                  form.setFieldValue('shift_type', value);
                }}
              >
                <Select.Option value="День">
                  <div className={styles.optionContent}>
                    <span>☀️</span>
                    День
                  </div>
                </Select.Option>
                <Select.Option value="Ночь">
                  <div className={styles.optionContent}>
                    <span>🌙</span>
                    Ночь
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              name="shift_number"
              label="Очередность" 
              rules={[{ required: true, message: 'Выберите очередность' }]}
              className={styles.formItemLarge}
            >
              <Select
                placeholder="Выберите очередность"
                size="large"
                allowClear
                value={shiftNumber}
                onChange={(value) => {
                  onShiftNumberChange(value);
                  form.setFieldValue('shift_number', value);
                }}
              >
                <Select.Option value="Верхняя">
                  <div className={styles.optionContent}>
                    <ClockCircleOutlined />
                    Верхняя
                  </div>
                </Select.Option>
                <Select.Option value="Нижняя">
                  <div className={styles.optionContent}>
                    <CalendarOutlined />
                    Нижняя
                  </div>
                </Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item 
          name="supervisor_id"
          label="Ответственный" 
          className={styles.formItemLarge}
          tooltip="Ответственный за группу будет отображаться первым в графике"
        >
          <Select
            placeholder="Выберите ответственного (необязательно)"
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            value={supervisorId}
            onChange={(value) => {
              onSupervisorIdChange(value);
              form.setFieldValue('supervisor_id', value);
            }}
            loading={isLoadingUsers}
            disabled={!teamId}
            notFoundContent={
              !teamId 
                ? "Сначала выберите отдел" 
                : isLoadingUsers 
                  ? "Загрузка..." 
                  : users && users.length === 0
                    ? "Нет доступных пользователей в этом отделе"
                    : "Нет доступных пользователей"
            }
          >
            {users && users.length > 0 ? users.map((user) => (
              <Select.Option key={user.id} value={user.id} label={`${user.name} ${user.surname || ''}`.trim()}>
                <div className={styles.optionContent}>
                  <CrownOutlined style={{ color: '#faad14', marginRight: 8 }} />
                  {user.name} {user.surname || ''}
                </div>
              </Select.Option>
            )) : null}
          </Select>
          <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            Ответственный будет отображаться первым в графике группы
          </Typography.Text>
        </Form.Item>
      </Form>

      <Divider />

      <div className={styles.infoBox} style={{ 
        background: token.colorSuccessBg, 
        border: `1px solid ${token.colorSuccessBorder}` 
      }}>
        <Text type="secondary" className={styles.infoText}>
          <ExclamationCircleOutlined className={styles.infoIcon} />
          После создания группы можно будет назначить сотрудников и настроить расписание работы
        </Text>
      </div>
    </Modal>
  );
};

export default GroupModal;

