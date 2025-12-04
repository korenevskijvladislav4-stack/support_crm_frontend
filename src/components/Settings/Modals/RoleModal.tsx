import React from 'react';
import { Modal, Form, Input, Select, Typography, Divider, Alert, Space, Tag } from 'antd';
import { SafetyCertificateOutlined, KeyOutlined } from '@ant-design/icons';
import type { IRole } from '../../../types/role.types';
import type { ICreateRoleForm } from '../../../types/role.types';
import { theme } from 'antd';
import styles from '../../../styles/settings/settings-modals.module.css';

const { Text } = Typography;

interface RoleModalProps {
  open: boolean;
  editingRole: IRole | null;
  onOk: () => Promise<void>;
  onCancel: () => void;
  form: ReturnType<typeof Form.useForm<ICreateRoleForm>>[0];
  roleName: string;
  onRoleNameChange: (value: string) => void;
  selectedPermissions: string[];
  onPermissionsChange: (value: string[]) => void;
  permissions?: string[];
  isLoadingPermissions: boolean;
  isSubmitting: boolean;
  getPermissionColor: (permission: string) => string;
}

const RoleModal: React.FC<RoleModalProps> = ({
  open,
  editingRole,
  onOk,
  onCancel,
  form,
  roleName,
  onRoleNameChange,
  selectedPermissions,
  onPermissionsChange,
  permissions,
  isLoadingPermissions,
  isSubmitting,
  getPermissionColor
}) => {
  const { token } = theme.useToken();

  return (
    <Modal
      title={editingRole ? 'Редактирование роли' : 'Создание новой роли'}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      confirmLoading={isSubmitting}
      okText={editingRole ? 'Сохранить' : 'Создать роль'}
      cancelText="Отменить"
      width={700}
      okButtonProps={{
        disabled: !roleName.trim() || selectedPermissions.length === 0
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
          label="Название роли" 
          rules={[{ required: true, message: 'Введите название роли' }]}
          className={styles.formItem}
        >
          <Input 
            placeholder="Введите название роли"
            prefix={<SafetyCertificateOutlined />}
            size="large"
            value={roleName}
            onChange={(e) => {
              onRoleNameChange(e.target.value);
              form.setFieldValue('name', e.target.value);
            }}
          />
        </Form.Item>

        <Form.Item 
          name="permissions"
          label="Права доступа"
          rules={[{ required: true, message: 'Выберите хотя бы одно право' }]}
          className={styles.formItemSmall}
        >
          <div className={styles.permissionsHeader}>
            <Text strong>Выбрано прав: {selectedPermissions.length}</Text>
          </div>
          
          <Select
            mode="multiple"
            placeholder="Выберите права доступа для роли"
            loading={isLoadingPermissions}
            optionFilterProp="label"
            showSearch
            allowClear
            size="large"
            style={{ width: '100%' }}
            value={selectedPermissions}
            onChange={(value) => {
              onPermissionsChange(value);
              form.setFieldValue('permissions', value);
            }}
          >
            {permissions?.map((permission) => (
              <Select.Option key={permission} value={permission} label={permission}>
                <div className={styles.optionContent}>
                  <KeyOutlined style={{ color: getPermissionColor(permission) }} />
                  {permission}
                </div>
              </Select.Option>
            ))}
          </Select>
          <Text type="secondary" className={styles.helpText}>
            Выберите права, которые будут назначены этой роли
          </Text>
        </Form.Item>
      </Form>

      <Divider />

      <Alert
        message="Рекомендации по созданию ролей"
        description="Создавайте роли с минимально необходимыми правами для выполнения конкретных задач. Избегайте назначения избыточных прав."
        type="info"
        showIcon
        className={styles.alert}
      />

      {selectedPermissions.length > 0 && (
        <div>
          <Text strong className={styles.selectedTitle}>Выбранные права:</Text>
          <div className={styles.permissionsList} style={{ 
            border: `1px solid ${token.colorBorder}` 
          }}>
            <Space size={[4, 4]} wrap>
              {selectedPermissions.map((permission: string, index: number) => (
                <Tag 
                  key={index}
                  color={getPermissionColor(permission)}
                  closable
                  onClose={() => {
                    const newPermissions = selectedPermissions.filter((p: string) => p !== permission);
                    onPermissionsChange(newPermissions);
                    form.setFieldValue('permissions', newPermissions);
                  }}
                  className={styles.permissionTag}
                >
                  {permission}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RoleModal;

