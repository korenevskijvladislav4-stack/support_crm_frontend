import { useState, useCallback, useMemo, useEffect, type FC } from "react"
import { 
  Table,
  Space, 
  Tag, 
  Card, 
  Typography,
  Badge,
  message,
  Form,
  Input,
  Button,
  Flex,
  type TableColumnsType 
} from "antd";
import { Link } from "react-router-dom";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { RoleModal } from "../../components/Settings/Modals";
import { usePermissions } from "../../hooks/usePermissions";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { PERMISSIONS } from "../../constants/permissions";
import styles from "../../styles/users/users-page.module.css";
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  ClearOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { 
  useCreateRoleMutation, 
  useUpdateRoleMutation,
  useDestroyRoleMutation, 
  useLazyGetRolesQuery
} from "../../api/rolesApi";
import type { ICreateRoleForm, IRole, IRoleFilters } from "../../types/role.types";
import { useGetAllPermissionsQuery } from "../../api/permissionsApi";
import { theme } from 'antd';

const { Text, Title } = Typography;

// Дефолтные значения фильтров
const defaultFilters: IRoleFilters = {
  search: '',
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров
const filterParsers = {
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const SettingsRolesPage: FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState<string>('');
  const [form] = Form.useForm<ICreateRoleForm>();

  // Фильтры из URL
  const { filters, setFilters, resetFilters } = useUrlFilters({
    defaults: defaultFilters,
    parsers: filterParsers,
  });

  // Локальное состояние для фильтров (до применения)
  const [localFilters, setLocalFilters] = useState({ search: filters.search || '' });

  // Синхронизация локальных фильтров с URL
  useEffect(() => {
    setLocalFilters({ search: filters.search || '' });
  }, [filters.search]);

  // Permissions
  const canCreate = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const canUpdate = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const canDelete = hasPermission(PERMISSIONS.ROLES_MANAGE);

  // API запросы с серверной фильтрацией
  const [trigger, { data: rolesResponse, isLoading, isFetching }] = useLazyGetRolesQuery();
  const { data: permissions, isLoading: isPermissionsLoading } = useGetAllPermissionsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [destroyRole, { isLoading: isDestroying }] = useDestroyRoleMutation();

  const roles = rolesResponse?.data || [];
  const meta = rolesResponse?.meta;
  const hasActiveFilters = !!filters.search;

  // Загрузка данных при изменении фильтров в URL
  useEffect(() => {
    trigger(filters);
  }, [filters, trigger]);

  // Применить фильтры
  const handleApplyFilters = useCallback(() => {
    setFilters({ search: localFilters.search, page: 1 });
  }, [localFilters, setFilters]);

  // Сбросить фильтры
  const handleResetFilters = useCallback(() => {
    setLocalFilters({ search: '' });
    resetFilters();
  }, [resetFilters]);

  const onDeleteClick = async (id: number) => {
    try {
      await destroyRole(id).unwrap();
      message.success('Роль успешно удалена');
      trigger(filters);
    } catch (error) {
      message.error('Ошибка при удалении роли');
    }
  };

  const getPermissionColor = useCallback((permission: string) => {
    const colors: Record<string, string> = {
      'view': 'blue', 'create': 'green', 'update': 'orange',
      'delete': 'red', 'admin': 'purple', 'manage': 'volcano'
    };
    for (const [key, color] of Object.entries(colors)) {
      if (permission.toLowerCase().includes(key)) return color;
    }
    return 'default';
  }, []);

  const columns: TableColumnsType<IRole> = useMemo(() => [
    {
      title: 'Название',
      dataIndex: 'name',
      width: 180,
      render: (name: string, record: IRole) => (
        <Space>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
          }}>
            <SafetyCertificateOutlined />
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>ID: {record.id}</Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Права доступа',
      width: 350,
      render: (_, record: IRole) => (
        <Space size={[4, 4]} wrap>
          {record.permissions.slice(0, 4).map((permission, index) => (
            <Tag 
              key={index}
              color={getPermissionColor(permission)}
              style={{ fontSize: 10, margin: 0 }}
            >
              {permission}
            </Tag>
          ))}
          {record.permissions.length > 4 && (
            <Tag style={{ fontSize: 10, margin: 0, cursor: 'pointer' }}>
              +{record.permissions.length - 4}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Прав',
      width: 70,
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
      title: 'Пользователи',
      width: 120,
      align: 'center',
      render: (_, record: IRole) => (
        <Link to={`/users?roles=${record.id}`}>
          <Button type="link" size="small" icon={<UserOutlined />}>
            {record.users_count ?? 0}
          </Button>
        </Link>
      )
    },
    {
      title: 'Статус',
      width: 90,
      align: 'center',
      render: () => <Badge status="success" text="Активна" />
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <SettingsActionButtons
          onEdit={canUpdate ? () => showEditModal(record) : undefined}
          onDelete={canDelete ? () => onDeleteClick(record.id) : undefined}
          recordName={record.name}
          deleteConfirmTitle="Удаление роли"
          deleteConfirmDescription={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Это может повлиять на права доступа пользователей
            </Text>
          }
          isDeleting={isDestroying}
        />
      )
    }
  ], [token, getPermissionColor, canUpdate, canDelete, isDestroying]);

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
    form.setFieldsValue({ name: role.name, permissions: role.permissions });
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
      trigger(filters);
    } catch (error) {
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

  const handleTableChange = useCallback((pagination: { current?: number; pageSize?: number }) => {
    setFilters({
      page: pagination.current || 1,
      per_page: pagination.pageSize || 10,
    });
  }, [setFilters]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <Title level={3} className={styles.title} style={{ color: token.colorText, marginBottom: 4 }}>
              <SafetyCertificateOutlined style={{ color: token.colorWarning }} />
              Управление ролями
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Настройка прав доступа и ролевой модели
            </Text>
          </div>
          
          <Space size="middle">
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                Создать роль
              </Button>
            )}
          </Space>
        </div>
      </div>

      {/* Filters */}
      <Card 
        size="small" 
        style={{ marginBottom: 12, background: token.colorBgContainer }}
        bodyStyle={{ padding: 12 }}
      >
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <Flex gap={16} align="center" style={{ flex: 1 }}>
            <Input
              placeholder="Поиск по названию..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
              value={localFilters.search}
              onChange={(e) => setLocalFilters({ search: e.target.value })}
              onPressEnter={handleApplyFilters}
            />
          </Flex>
          <Space>
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleApplyFilters}
              loading={isFetching}
            >
              Применить
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => trigger(filters)} 
              loading={isFetching}
            >
              Обновить
            </Button>
            {hasActiveFilters && (
              <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                Сбросить
              </Button>
            )}
          </Space>
        </Flex>
      </Card>

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

      {/* Table */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <SafetyCertificateOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список ролей</span>
            {hasActiveFilters && (
              <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Фильтры активны</Tag>
            )}
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            Всего: {meta?.total ?? 0}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
        bodyStyle={{ padding: 12 }}
      >
        <Table<IRole>
          columns={columns} 
          dataSource={roles} 
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 'max-content' }}
          size="small"
          pagination={{
            current: meta?.current_page || 1,
            pageSize: meta?.per_page || 10,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={(pagination) => handleTableChange(pagination)}
        />
      </Card>
    </div>
  );
};

export default SettingsRolesPage;
