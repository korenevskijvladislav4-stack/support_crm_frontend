import React, { useState, useCallback, useMemo, useEffect, type FC } from "react"
import { 
  Table,
  Space, 
  Card, 
  Typography,
  Badge,
  Tag,
  message,
  Form,
  Input,
  Button,
  Flex,
  Select,
  type TableColumnsType 
} from "antd";
import { Link } from "react-router-dom";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { GroupModal } from "../../components/Settings/Modals";
import { usePermissions } from "../../hooks/usePermissions";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { PERMISSIONS } from "../../constants/permissions";
import styles from "../../styles/users/users-page.module.css";
import {
  TeamOutlined,
  CrownOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  UserOutlined,
  ClearOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { 
  useCreateGroupMutation, 
  useUpdateGroupMutation,
  useDestroyGroupMutation, 
  useLazyGetGroupsQuery
} from "../../api/groupsApi"
import { type IGroup, type IGroupForm, type IGroupFilters } from "../../types/group.types";
import type { IUser } from "../../types/user.types";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useLazyAllUsersQuery } from "../../api/usersApi";
import { theme } from 'antd';

const { Text, Title } = Typography;

// Дефолтные значения фильтров
const defaultFilters: IGroupFilters = {
  search: '',
  team_id: undefined,
  shift_type: undefined,
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров
const filterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const SettingsGroupPage: FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<IGroup | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [shiftType, setShiftType] = useState<string | null>(null);
  const [shiftNumber, setShiftNumber] = useState<string | null>(null);
  const [supervisorId, setSupervisorId] = useState<number | null>(null);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [form] = Form.useForm<IGroupForm>();

  // Фильтры из URL
  const { filters, setFilters, resetFilters } = useUrlFilters<IGroupFilters>({
    defaults: defaultFilters,
    parsers: filterParsers,
  });

  // Локальное состояние для фильтров (до применения)
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    team_id: filters.team_id,
    shift_type: filters.shift_type,
  });

  // Синхронизация локальных фильтров с URL
  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      team_id: filters.team_id,
      shift_type: filters.shift_type,
    });
  }, [filters.search, filters.team_id, filters.shift_type]);

  // Permissions
  const canCreate = hasPermission(PERMISSIONS.GROUPS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.GROUPS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.GROUPS_DELETE);

  // API запросы с серверной фильтрацией
  const [trigger, { data: groupsResponse, isLoading, isFetching }] = useLazyGetGroupsQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  const [triggerUsers, { isLoading: isLoadingUsers }] = useLazyAllUsersQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
  const [destroyGroup, { isLoading: isDestroying }] = useDestroyGroupMutation();

  const groups = groupsResponse?.data || [];
  const meta = groupsResponse?.meta;
  const hasActiveFilters = !!(filters.search || filters.team_id || filters.shift_type);

  // Загрузка данных при изменении фильтров в URL
  useEffect(() => {
    trigger(filters);
  }, [filters, trigger]);

  // Применить фильтры
  const handleApplyFilters = useCallback(() => {
    setFilters({ ...localFilters, page: 1 });
  }, [localFilters, setFilters]);

  // Сбросить фильтры
  const handleResetFilters = useCallback(() => {
    setLocalFilters({ search: '', team_id: undefined, shift_type: undefined });
    resetFilters();
  }, [resetFilters]);

  // Загрузка пользователей для модального окна
  const loadUsersByTeam = React.useCallback(async (teamIdValue: number | null) => {
    if (!teamIdValue) {
      setAllUsers([]);
      return;
    }
    
    const collectedUsers: IUser[] = [];
    let currentPage = 1;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const response = await triggerUsers({ 
          team: [teamIdValue], 
          status: 'active',
          page: currentPage,
          per_page: 100 
        }).unwrap();
        
        if (response.data && response.data.length > 0) {
          collectedUsers.push(...response.data);
          hasMore = response.meta ? currentPage < response.meta.last_page : response.data.length === 100;
          currentPage++;
        } else {
          hasMore = false;
        }
      } catch {
        hasMore = false;
      }
    }
    
    setAllUsers(collectedUsers);
  }, [triggerUsers]);

  React.useEffect(() => {
    if (isModalOpen && teamId) {
      loadUsersByTeam(teamId);
    }
  }, [isModalOpen, teamId, loadUsersByTeam]);

  const handleTeamIdChange = React.useCallback((value: number | null) => {
    setTeamId(value);
    setSupervisorId(null);
    form.setFieldValue('supervisor_id', null);
    if (isModalOpen && value) {
      loadUsersByTeam(value);
    }
  }, [isModalOpen, loadUsersByTeam, form]);

  const onDeleteClick = useCallback(async (id: number) => {
    try {
      await destroyGroup(id).unwrap();
      message.success('Группа успешно удалена');
      trigger(filters);
    } catch {
      message.error('Ошибка при удалении группы');
    }
  }, [destroyGroup, filters, trigger]);

  const getShiftTypeColor = useCallback((type: string) => {
    return type === 'День' ? 'green' : type === 'Ночь' ? 'purple' : 'default';
  }, []);

  const getShiftNumberColor = useCallback((num: string) => {
    return num === 'Верхняя' ? 'blue' : num === 'Нижняя' ? 'orange' : 'default';
  }, []);

  const showEditModal = useCallback((group: IGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setTeamId(group.team?.id ?? null);
    setShiftType(group.shift?.type ?? null);
    setShiftNumber(group.shift?.number ?? null);
    setSupervisorId(group.supervisor?.id ?? null);
    form.setFieldsValue({
      name: group.name,
      team_id: group.team?.id ?? null,
      shift_type: group.shift?.type ?? null,
      shift_number: group.shift?.number ?? null,
      supervisor_id: group.supervisor?.id ?? null
    });
    setIsModalOpen(true);
    if (group.team?.id) {
      loadUsersByTeam(group.team.id);
    }
  }, [form, loadUsersByTeam]);

  const columns: TableColumnsType<IGroup> = useMemo(() => [
    {
      title: 'Название',
      dataIndex: 'name',
      width: 180,
      render: (name: string, record: IGroup) => (
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
      title: 'Смена',
      width: 180,
      render: (_, record: IGroup) => (
        <Space size={4}>
          <Tag color={getShiftTypeColor(record.shift?.type || '')} style={{ margin: 0, fontSize: 11 }}>
            {record.shift?.type === 'День' ? '☀️' : '🌙'} {record.shift?.type || '—'}
          </Tag>
          <Tag color={getShiftNumberColor(record.shift?.number || '')} style={{ margin: 0, fontSize: 11 }}>
            {record.shift?.number || '—'}
          </Tag>
        </Space>
      )
    },
    {
      title: 'Отдел',
      width: 130,
      render: (_: unknown, record: IGroup) => (
        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
          {record.team?.name || 'Не указан'}
        </Tag>
      )
    },
    {
      title: 'Ответственный',
      width: 180,
      render: (_, record: IGroup) => {
        if (!record.supervisor) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Не назначен</Text>;
        }
        return (
          <Link to={`/users/${record.supervisor.id}`}>
            <Space size={4}>
              <CrownOutlined style={{ color: '#faad14', fontSize: 12 }} />
              <Text style={{ fontSize: 12, color: token.colorPrimary }}>
                {record.supervisor.full_name}
              </Text>
            </Space>
          </Link>
        );
      }
    },
    {
      title: 'Пользователи',
      width: 120,
      align: 'center',
      render: (_, record: IGroup) => (
        <Link to={`/users?group=${record.id}`}>
          <Button type="link" size="small" icon={<UserOutlined />}>
            {record.users?.count ?? 0}
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
          deleteConfirmTitle="Удаление группы"
          isDeleting={isDestroying}
        />
      )
    }
  ], [token, getShiftTypeColor, getShiftNumberColor, canUpdate, canDelete, isDestroying, onDeleteClick, showEditModal]);

  const showCreateModal = () => {
    setEditingGroup(null);
    setGroupName('');
    setTeamId(null);
    setShiftType(null);
    setShiftNumber(null);
    setSupervisorId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingGroup) {
        await updateGroup({ id: editingGroup.id, data: values }).unwrap();
        message.success('Группа успешно обновлена');
      } else {
        await createGroup(values).unwrap();
        message.success('Группа успешно создана');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingGroup(null);
      trigger(filters);
    } catch {
      message.error(editingGroup ? 'Ошибка при обновлении группы' : 'Ошибка при создании группы');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingGroup(null);
    setGroupName('');
    setTeamId(null);
    setShiftType(null);
    setShiftNumber(null);
    setSupervisorId(null);
    setAllUsers([]);
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
              Управление группами
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Настройка рабочих групп сотрудников
            </Text>
          </div>
          
          <Space size="middle">
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                Создать группу
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
          <Flex gap={16} align="center" style={{ flex: 1 }} wrap="wrap">
            <Input
              placeholder="Поиск по названию..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 220 }}
              value={localFilters.search}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
              onPressEnter={handleApplyFilters}
            />
            <Select
              placeholder="Все отделы"
              allowClear
              style={{ width: 180 }}
              value={localFilters.team_id}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, team_id: val }))}
              loading={isTeamsLoading}
              options={teams?.map(t => ({ value: t.id, label: t.name }))}
            />
            <Select
              placeholder="Тип смены"
              allowClear
              style={{ width: 140 }}
              value={localFilters.shift_type}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, shift_type: val }))}
              options={[
                { value: 'День', label: '☀️ День' },
                { value: 'Ночь', label: '🌙 Ночь' },
              ]}
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

      <GroupModal
        open={isModalOpen}
        editingGroup={editingGroup}
        onOk={handleOk}
        onCancel={handleCancel}
        form={form}
        groupName={groupName}
        onGroupNameChange={setGroupName}
        teamId={teamId}
        onTeamIdChange={handleTeamIdChange}
        shiftType={shiftType}
        onShiftTypeChange={setShiftType}
        shiftNumber={shiftNumber}
        onShiftNumberChange={setShiftNumber}
        supervisorId={supervisorId}
        onSupervisorIdChange={setSupervisorId}
        teams={teams}
        users={allUsers}
        isLoadingTeams={isTeamsLoading}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Table */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <TeamOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список групп</span>
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
        <Table<IGroup>
          columns={columns} 
          dataSource={groups} 
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

export default SettingsGroupPage;
