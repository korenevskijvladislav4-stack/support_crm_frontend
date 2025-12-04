import { useState, type FC } from "react"
import { 
  Table,
  Space, 
  Tag, 
  Card, 
  Typography,
  Badge,
  message,
  Form,
  type TableColumnsType 
} from "antd";
import SettingsPageHeader from "../../components/Settings/SettingsPageHeader";
import SettingsStatsCards from "../../components/Settings/SettingsStatsCards";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { RoleModal } from "../../components/Settings/Modals";
import styles from "../../styles/settings/settings-pages.module.css";
import {
  SafetyCertificateOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { 
  useCreateRoleMutation, 
  useUpdateRoleMutation,
  useDestroyRoleMutation, 
  useGetAllRolesQuery 
} from "../../api/rolesApi";
import type { ICreateRoleForm, IRole } from "../../types/role.types";
import { useGetAllPermissionsQuery } from "../../api/permissionsApi";
import { theme } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

const SettingsRolesPage: FC = () => {
  const { token } = useToken();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState<string>('');
  const [form] = Form.useForm<ICreateRoleForm>();

  const { data: roles, isLoading: isRolesLoading, isFetching: isRolesFetching, refetch } = useGetAllRolesQuery();
  const { data: permissions, isLoading: isPermissionsLoading } = useGetAllPermissionsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [destroyRole, { isLoading: isDestroying }] = useDestroyRoleMutation();

  const onDeleteClick = async (id: number) => {
    try {
      await destroyRole(id).unwrap();
      message.success('Роль успешно удалена');
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Ошибка при удалении роли');
    }
  };

  const getPermissionColor = (permission: string) => {
    const permissionColors: { [key: string]: string } = {
      'read': 'blue',
      'write': 'green',
      'delete': 'red',
      'create': 'cyan',
      'update': 'orange',
      'admin': 'purple',
      'manage': 'volcano',
      'view': 'geekblue'
    };
    
    for (const [key, color] of Object.entries(permissionColors)) {
      if (permission.toLowerCase().includes(key)) {
        return color;
      }
    }
    return 'default';
  };

  const columns: TableColumnsType<IRole> = [
    {
      title: 'Название роли',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record: IRole) => (
        <div className={styles.tableCellContent}>
          <div className={`${styles.tableIcon} ${styles.tableIconGradientPink}`}>
            <SafetyCertificateOutlined />
          </div>
          <div>
            <div className={styles.tableCellText} style={{ color: token.colorText }}>{name}</div>
            <Text type="secondary" className={styles.tableCellSecondary}>ID: {record.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Права доступа',
      width: 400,
      render: (_, record: IRole) => (
        <Space size={[0, 4]} wrap>
          {record.permissions.slice(0, 4).map((permission, index) => (
            <Tag 
              key={index}
              color={getPermissionColor(permission)}
              className={styles.tag}
            >
              {permission}
            </Tag>
          ))}
          {record.permissions.length > 4 && (
            <Tag style={{ cursor: 'pointer', fontSize: 11 }}>
              +{record.permissions.length - 4} еще
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Кол-во прав',
      width: 100,
      align: 'center',
      render: (_, record: IRole) => (
        <Badge 
          count={record.permissions.length} 
          showZero 
          style={{ backgroundColor: token.colorSuccess }} 
        />
      )
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      width: 150,
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString('ru-RU')}
        </Text>
      )
    },
    {
      title: 'Статус',
      width: 100,
      render: () => (
        <Badge status="success" text="Активна" />
      )
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <SettingsActionButtons
          onEdit={() => showEditModal(record)}
          onDelete={() => onDeleteClick(record.id)}
          recordName={record.name}
          deleteConfirmTitle="Удаление роли"
          deleteConfirmDescription={
            <div>
              <div>Вы уверены, что хотите удалить роль <Text strong>"{record.name}"</Text>?</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Это может повлиять на права доступа пользователей
              </Text>
            </div>
          }
          isDeleting={isDestroying}
          editTooltip="Редактировать роль"
          deleteTooltip="Удалить роль"
        />
      )
    }
  ];

  const showCreateModal = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    setRoleName('');
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (role: IRole) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions);
    setRoleName(role.name);
    form.setFieldsValue({
      name: role.name,
      permissions: role.permissions
    });
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingRole) {
        await updateRole({ id: editingRole.id, data: values }).unwrap();
        message.success('Роль успешно обновлена');
      } else {
        await createRole(values).unwrap();
        message.success('Роль успешно создана');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingRole(null);
    } catch (error) {
      console.error('Error saving role:', error);
      message.error(editingRole ? 'Ошибка при обновлении роли' : 'Ошибка при создании роли');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingRole(null);
    setSelectedPermissions([]);
    setRoleName('');
  };

  const totalRoles = roles?.length || 0;
  const totalPermissions = permissions?.length || 0;

  const stats = [
    {
      title: 'Всего ролей',
      value: totalRoles,
      prefix: <SafetyCertificateOutlined />,
      valueStyle: { color: token.colorWarning }
    },
    {
      title: 'Доступные права',
      value: totalPermissions,
      prefix: <KeyOutlined />,
      valueStyle: { color: token.colorInfo }
    },
    {
      title: 'Системные роли',
      value: roles?.filter(role => role.name.toLowerCase().includes('admin')).length || 0,
      valueStyle: { color: token.colorError }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <SettingsPageHeader
        title="Управление ролями"
        description="Настройка прав доступа и ролевой модели системы"
        icon={<SafetyCertificateOutlined style={{ color: token.colorWarning }} />}
        onCreateClick={showCreateModal}
        onRefreshClick={() => refetch()}
        isLoading={isRolesFetching}
        createButtonText="Создать роль"
      />

      <SettingsStatsCards stats={stats} />

      <RoleModal
        open={isModalOpen}
        editingRole={editingRole}
        onOk={handleOk}
        onCancel={handleCancel}
        form={form}
        roleName={roleName}
        onRoleNameChange={setRoleName}
        selectedPermissions={selectedPermissions}
        onPermissionsChange={setSelectedPermissions}
        permissions={permissions}
        isLoadingPermissions={isPermissionsLoading}
        isSubmitting={isCreating || isUpdating}
        getPermissionColor={getPermissionColor}
      />

      <Card 
        title={
          <Space size="small">
            <SafetyCertificateOutlined />
            <span>Список ролей</span>
            <Badge 
              count={totalRoles} 
              showZero 
              style={{ backgroundColor: token.colorWarning }} 
            />
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isRolesFetching ? 'Обновление...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
      >
        <Table<IRole>
          columns={columns} 
          dataSource={roles} 
          rowKey="id"
          loading={isRolesLoading || isRolesFetching}
          scroll={{ x: 'max-content' }}
          size="small"
          bordered
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} ролей`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
            responsive: true
          }}
        />
      </Card>
    </div>
  );
};

export default SettingsRolesPage;
