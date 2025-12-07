import React from 'react';
import { Modal, Form, Input, Select, Typography, Divider } from 'antd';
import { TeamOutlined, SafetyCertificateOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ITeam, ITeamForm } from '../../../types/team.types';
import type { IRole } from '../../../types/role.types';
import { theme } from 'antd';
import styles from '../../../styles/settings/settings-modals.module.css';

const { Text } = Typography;

interface TeamModalProps {
  open: boolean;
  editingTeam: ITeam | null;
  onOk: () => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm<ITeamForm>>[0];
  teamName: string;
  onTeamNameChange: (value: string) => void;
  selectedRoleIds: number[];
  onRoleIdsChange: (value: number[]) => void;
  roles?: IRole[];
  isLoadingRoles: boolean;
  isSubmitting: boolean;
  getRoleColor: (roleName: string) => string;
}

const TeamModal: React.FC<TeamModalProps> = ({
  open,
  editingTeam,
  onOk,
  onCancel,
  form,
  teamName,
  onTeamNameChange,
  selectedRoleIds,
  onRoleIdsChange,
  roles,
  isLoadingRoles,
  isSubmitting,
  getRoleColor
}) => {
  const { token } = theme.useToken();

  return (
    <Modal
      title={
        <div className={styles.modalTitle}>
          {editingTeam ? 'Редактирование отдела' : 'Создание нового отдела'}
        </div>
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText={editingTeam ? 'Сохранить' : 'Создать отдел'}
      cancelText="Отменить"
      width={600}
      okButtonProps={{
        disabled: !teamName.trim() || selectedRoleIds.length === 0
      }}
    >
      <Form
        form={form}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        size="middle"
      >
        <Form.Item 
          name="name"
          label="Название" 
          rules={[{ required: true, message: 'Введите название отдела' }]}
          className={styles.formItem}
        >
          <Input 
            placeholder="Введите название отдела"
            prefix={<TeamOutlined />}
            size="large"
            value={teamName}
            onChange={(e) => {
              onTeamNameChange(e.target.value);
              form.setFieldValue('name', e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item 
          name="role_id"
          label="Роли доступа"
          rules={[
            { 
              validator: (_, value) => {
                if (!value || (Array.isArray(value) && value.length === 0)) {
                  return Promise.reject(new Error('Выберите хотя бы одну роль'));
                }
                return Promise.resolve();
              }
            }
          ]}
          className={styles.formItemSmall}
          initialValue={[]}
        >
          <Select
            mode="multiple"
            placeholder="Выберите роли для отдела"
            loading={isLoadingRoles}
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            value={selectedRoleIds}
            onChange={(value) => {
              const roleIds = value || [];
              onRoleIdsChange(roleIds);
              form.setFieldValue('role_id', roleIds);
            }}
          >
            {roles?.map((role) => (
              <Select.Option key={role.id} value={role.id} label={role.name}>
                <div className={styles.optionContent}>
                  <SafetyCertificateOutlined style={{ color: getRoleColor(role.name) }} />
                  {role.name}
                </div>
              </Select.Option>
            ))}
          </Select>
          <Text type="secondary" className={styles.helpText}>
            Выберите роли, которые будут доступны сотрудникам этого отдела
          </Text>
        </Form.Item>
      </Form>

      <Divider />

      <div className={styles.infoBox} style={{ 
        background: token.colorSuccessBg, 
        border: `1px solid ${token.colorSuccessBorder}` 
      }}>
        <Text type="secondary" className={styles.infoText}>
          <ExclamationCircleOutlined className={styles.infoIcon} />
          После создания отдела можно будет назначить сотрудников и настроить дополнительные параметры
        </Text>
      </div>
    </Modal>
  );
};

export default TeamModal;

