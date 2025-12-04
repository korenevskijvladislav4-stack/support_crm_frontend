import React, { useState, type FC } from "react"
import { 
  Table,
  Space, 
  Card, 
  Typography,
  Badge,
  Tag,
  message,
  Form,
  type TableColumnsType 
} from "antd";
import { Link } from "react-router-dom";
import SettingsPageHeader from "../../components/Settings/SettingsPageHeader";
import SettingsStatsCards from "../../components/Settings/SettingsStatsCards";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { GroupModal } from "../../components/Settings/Modals";
import styles from "../../styles/settings/settings-pages.module.css";
import {
  TeamOutlined,
  CrownOutlined,
  UserOutlined
} from '@ant-design/icons';
import { 
  useCreateGroupMutation, 
  useUpdateGroupMutation,
  useDestroyGroupMutation, 
  useGetAllGroupsQuery 
} from "../../api/groupsApi"
import { type IGroup, type IGroupForm } from "../../types/groups.types";
import type { IUser } from "../../types/user.types";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useLazyAllUsersQuery } from "../../api/usersApi";
import { theme } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

const SettingsGroupPage: FC = () => {
  const { token } = useToken();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<IGroup | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [teamId, setTeamId] = useState<number | null>(null);
  const [shiftType, setShiftType] = useState<string | null>(null);
  const [shiftNumber, setShiftNumber] = useState<string | null>(null);
  const [supervisorId, setSupervisorId] = useState<number | null>(null);
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [form] = Form.useForm<IGroupForm>();

  const { data: groups, isLoading: isGroupsLoading, isFetching: isGroupsFetching, refetch } = useGetAllGroupsQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  const [triggerUsers, { isLoading: isLoadingUsers }] = useLazyAllUsersQuery();
  
  // Используем собранных пользователей из состояния для модального окна
  const users = allUsers;
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
  const [destroyGroup, { isLoading: isDestroying }] = useDestroyGroupMutation();

  // Функция для загрузки всех пользователей по отделу (без пагинации)
  const loadUsersByTeam = React.useCallback(async (teamIdValue: number | null) => {
    if (!teamIdValue) {
      setAllUsers([]);
      return;
    }
    
    const collectedUsers: IUser[] = [];
    let currentPage = 1;
    let hasMore = true;
    const perPage = 100; // Максимальное значение, разрешенное сервером
    
    while (hasMore) {
      try {
        const response = await triggerUsers({ 
          team: [teamIdValue], 
          status: 'active',
          page: currentPage,
          per_page: perPage 
        }).unwrap();
        
        if (response.data && response.data.length > 0) {
          collectedUsers.push(...response.data);
          
          // Проверяем, есть ли еще страницы
          if (response.meta && response.meta.last_page) {
            hasMore = currentPage < response.meta.last_page;
            currentPage++;
          } else {
            // Если нет метаданных, проверяем по количеству полученных записей
            hasMore = response.data.length === perPage;
            currentPage++;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error loading users:', error);
        hasMore = false;
      }
    }
    
    // Сохраняем все собранные пользователи в состояние
    setAllUsers(collectedUsers);
  }, [triggerUsers]);

  // Загружаем пользователей при открытии модального окна или изменении отдела
  React.useEffect(() => {
    if (isModalOpen && teamId) {
      loadUsersByTeam(teamId);
    }
  }, [isModalOpen, teamId, loadUsersByTeam]);

  // Обработчик изменения отдела
  const handleTeamIdChange = React.useCallback((value: number | null) => {
    setTeamId(value);
    setSupervisorId(null); // Сбрасываем ответственного при смене отдела
    form.setFieldValue('supervisor_id', null);
    if (isModalOpen && value) {
      loadUsersByTeam(value);
    }
  }, [isModalOpen, loadUsersByTeam, form]);

  const onDeleteClick = async (id: number) => {
    try {
      await destroyGroup(id).unwrap();
      message.success('Группа успешно удалена');
    } catch (error) {
      console.error('Error deleting group:', error);
      message.error('Ошибка при удалении группы');
    }
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'День': return 'green';
      case 'Ночь': return 'purple';
      default: return 'default';
    }
  };

  const getShiftNumberColor = (shiftNumber: string) => {
    switch (shiftNumber) {
      case 'Верхняя': return 'blue';
      case 'Нижняя': return 'orange';
      default: return 'default';
    }
  };

  const getShiftTypeIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'День': return '☀️';
      case 'Ночь': return '🌙';
      default: return '⏰';
    }
  };

  const columns: TableColumnsType<IGroup> = [
    {
      title: 'Название группы',
      dataIndex: 'name',
      width: 200,
      render: (name: string, record: IGroup) => (
        <div className={styles.tableCellContent}>
          <div className={`${styles.tableIcon} ${styles.tableIconGradient}`}>
            <TeamOutlined />
          </div>
          <div>
            <div className={styles.tableCellText} style={{ color: token.colorText }}>{name}</div>
            <Text type="secondary" className={styles.tableCellSecondary}>ID: {record.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Тип смены',
      dataIndex: 'shift_type',
      width: 120,
      render: (shiftType: string) => (
        <Tag 
          color={getShiftTypeColor(shiftType)}
          icon={<span style={{ marginRight: 4 }}>{getShiftTypeIcon(shiftType)}</span>}
          style={{ fontWeight: 500 }}
        >
          {shiftType}
        </Tag>
      )
    },
    {
      title: 'Очередность',
      dataIndex: 'shift_number',
      width: 120,
      render: (shiftNumber: string) => (
        <Tag color={getShiftNumberColor(shiftNumber)} style={{ fontWeight: 500 }}>
          {shiftNumber}
        </Tag>
      )
    },
    {
      title: 'Отдел',
      dataIndex: 'team',
      width: 150,
      render: (team: string) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {team}
        </Tag>
      )
    },
    {
      title: 'Ответственный',
      dataIndex: 'supervisor',
      width: 200,
      render: (supervisor: IGroup['supervisor'], record: IGroup) => {
        if (!supervisor) {
          return <Text type="secondary">Не назначен</Text>;
        }
        
        return (
          <Link to={`/users/${supervisor.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CrownOutlined style={{ color: '#faad14', fontSize: 14 }} />
            <span style={{ color: token.colorPrimary }}>
              {supervisor.fullname}
            </span>
          </Link>
        );
      }
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      width: 120,
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
          deleteConfirmTitle="Удаление группы"
          isDeleting={isDestroying}
          editTooltip="Редактировать группу"
          deleteTooltip="Удалить группу"
        />
      )
    }
  ];

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

  const showEditModal = (group: IGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    const teamIdValue = group.team_id ?? null;
    setTeamId(teamIdValue);
    setShiftType(group.shift_type);
    setShiftNumber(group.shift_number);
    setSupervisorId(group.supervisor?.id ?? null);
    form.setFieldsValue({
      name: group.name,
      team_id: group.team_id,
      shift_type: group.shift_type,
      shift_number: group.shift_number,
      supervisor_id: group.supervisor?.id ?? null
    });
    setIsModalOpen(true);
    // Загружаем пользователей для редактируемой группы
    if (teamIdValue) {
      loadUsersByTeam(teamIdValue);
    }
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
    } catch (error) {
      console.error('Error saving group:', error);
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
    setAllUsers([]); // Очищаем загруженных пользователей
  };

  const totalGroups = groups?.length || 0;
  const dayShiftGroups = groups?.filter(group => group.shift_type === 'День').length || 0;
  const nightShiftGroups = groups?.filter(group => group.shift_type === 'Ночь').length || 0;

  const stats = [
    {
      title: 'Всего групп',
      value: totalGroups,
      prefix: <TeamOutlined />,
      valueStyle: { color: token.colorPrimary }
    },
    {
      title: 'Дневные смены',
      value: dayShiftGroups,
      prefix: <span>☀️</span>,
      valueStyle: { color: token.colorSuccess }
    },
    {
      title: 'Ночные смены',
      value: nightShiftGroups,
      prefix: <span>🌙</span>,
      valueStyle: { color: token.colorWarning }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <SettingsPageHeader
        title="Управление группами"
        description="Создание и настройка рабочих групп сотрудников"
        icon={<TeamOutlined style={{ color: token.colorPrimary }} />}
        onCreateClick={showCreateModal}
        onRefreshClick={() => refetch()}
        isLoading={isGroupsFetching}
        createButtonText="Создать группу"
      />

      <SettingsStatsCards stats={stats} />

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
        users={users}
        isLoadingTeams={isTeamsLoading}
        isLoadingUsers={isLoadingUsers}
        isSubmitting={isCreating || isUpdating}
      />

      <Card 
        title={
          <Space>
            <TeamOutlined />
            <span>Список групп</span>
            <Badge 
              count={totalGroups} 
              showZero 
              style={{ backgroundColor: token.colorPrimary }} 
            />
          </Space>
        }
        extra={
          <Text type="secondary">
            {isGroupsFetching ? 'Обновление...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
      >
        <Table<IGroup>
          columns={columns} 
          dataSource={groups} 
          rowKey="id"
          loading={isGroupsLoading || isGroupsFetching}
          scroll={{ x: 800 }}
          size="small"
          bordered
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} групп`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50']
          }}
        />
      </Card>
    </div>
  );
};

export default SettingsGroupPage;
