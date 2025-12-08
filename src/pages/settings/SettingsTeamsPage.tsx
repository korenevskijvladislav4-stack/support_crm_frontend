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
import { TeamModal } from "../../components/Settings/Modals";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { usePermissions } from "../../hooks/usePermissions";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { PERMISSIONS } from "../../constants/permissions";
import styles from "../../styles/users/users-page.module.css";
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  ClearOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { 
  useCreateTeamMutation, 
  useUpdateTeamMutation,
  useDestroyTeamMutation, 
  useLazyGetTeamsQuery
} from "../../api/teamsApi";
import type { ITeamForm, ITeam, ITeamFilters } from "../../types/team.types";
import { useGetAllRolesQuery } from "../../api/rolesApi";
import { theme } from 'antd';

const { Text, Title } = Typography;

// Дефолтные значения фильтров
const defaultFilters: ITeamFilters = {
  search: '',
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров
const filterParsers = {
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const SettingsTeamsPage: FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [form] = Form.useForm<ITeamForm>();

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
  const canCreate = hasPermission(PERMISSIONS.TEAMS_MANAGE);
  const canUpdate = hasPermission(PERMISSIONS.TEAMS_MANAGE);
  const canDelete = hasPermission(PERMISSIONS.TEAMS_MANAGE);

  // API запросы с серверной фильтрацией
  const [trigger, { data: teamsResponse, isLoading, isFetching }] = useLazyGetTeamsQuery();
  const { data: roles, isLoading: isRolesLoading } = useGetAllRolesQuery();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const [destroyTeam, { isLoading: isDestroying }] = useDestroyTeamMutation();

  const teams = teamsResponse?.data || [];
  const meta = teamsResponse?.meta;
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
      await destroyTeam(id).unwrap();
      message.success('Отдел успешно удален');
      trigger(filters);
    } catch (error) {
      message.error('Ошибка при удалении отдела');
    }
  };

  const getRoleColor = useCallback((roleName: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'red',
      'manager': 'blue',
      'user': 'green',
      'supervisor': 'orange',
      'agent': 'purple',
      'moderator': 'cyan'
    };
    return roleColors[roleName.toLowerCase()] || 'default';
  }, []);

  const columns: TableColumnsType<ITeam> = useMemo(() => [
    {
      title: 'Название',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record: ITeam) => (
        <Space>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
          }}>
            <TeamOutlined />
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
      title: 'Роли доступа',
      width: 300,
      render: (_, record: ITeam) => (
        <Space size={[4, 4]} wrap>
          {record.roles?.slice(0, 3).map((role, index) => (
            <Tag 
              key={index}
              color={getRoleColor(role.name)}
              icon={<SafetyCertificateOutlined />}
              style={{ fontSize: 11, margin: 0 }}
            >
              {role.name}
            </Tag>
          ))}
          {record.roles && record.roles.length > 3 && (
            <Tag style={{ fontSize: 11, margin: 0 }}>
              +{record.roles.length - 3}
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Пользователи',
      width: 130,
      align: 'center',
      render: (_, record: ITeam) => (
        <Link to={`/users?team=${record.id}`}>
          <Button type="link" size="small" icon={<UserOutlined />}>
            {record.users_count ?? 0}
          </Button>
        </Link>
      )
    },
    {
      title: 'Статус',
      width: 100,
      align: 'center',
      render: () => (
        <Badge status="success" text="Активен" />
      )
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
          deleteConfirmTitle="Удаление отдела"
          isDeleting={isDestroying}
        />
      )
    }
  ], [getRoleColor, canUpdate, canDelete, isDestroying]);

  const showCreateModal = () => {
    setEditingTeam(null);
    setTeamName('');
    setSelectedRoleIds([]);
    form.resetFields();
    form.setFieldsValue({ role_id: [] });
    setIsModalOpen(true);
  };

  const showEditModal = (team: ITeam) => {
    setEditingTeam(team);
    setTeamName(team.name);
    const roleIds = team.roles?.map(r => r.id) || [];
    setSelectedRoleIds(roleIds);
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue({ name: team.name, role_id: roleIds });
    }, 0);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const roleIdValue = form.getFieldValue('role_id');
      const roleIds = Array.isArray(roleIdValue) ? roleIdValue : (roleIdValue ? [roleIdValue] : []);
      
      if (roleIds.length === 0) {
        form.setFields([{ name: 'role_id', errors: ['Выберите хотя бы одну роль'] }]);
        return;
      }
      
      form.setFields([{ name: 'role_id', errors: [] }]);
      const values = await form.validateFields();
      
      const submitData = {
        ...values,
        role_id: Array.isArray(values.role_id) 
          ? values.role_id.filter((id): id is number => id !== null)
          : (values.role_id !== null ? [values.role_id] : [])
      };
      
      if (editingTeam) {
        await updateTeam({ id: editingTeam.id, data: submitData }).unwrap();
        message.success('Отдел успешно обновлен');
      } else {
        await createTeam(submitData).unwrap();
        message.success('Отдел успешно создан');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingTeam(null);
      setTeamName('');
      setSelectedRoleIds([]);
      trigger(filters);
    } catch (error) {
      message.error(editingTeam ? 'Ошибка при обновлении отдела' : 'Ошибка при создании отдела');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingTeam(null);
    setTeamName('');
    setSelectedRoleIds([]);
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
              <TeamOutlined style={{ color: token.colorPrimary }} />
              Управление отделами
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Настройка отделов и ролей доступа
            </Text>
          </div>
          
          <Space size="middle">
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                Создать отдел
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

      <TeamModal
        open={isModalOpen}
        editingTeam={editingTeam}
        onOk={handleOk}
        onCancel={handleCancel}
        form={form}
        teamName={teamName}
        onTeamNameChange={setTeamName}
        selectedRoleIds={selectedRoleIds}
        onRoleIdsChange={setSelectedRoleIds}
        roles={roles}
        isLoadingRoles={isRolesLoading}
        isSubmitting={isCreating || isUpdating}
        getRoleColor={getRoleColor}
      />

      {/* Table */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <TeamOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список отделов</span>
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
        <Table<ITeam>
          columns={columns} 
          dataSource={teams} 
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

export default SettingsTeamsPage;
