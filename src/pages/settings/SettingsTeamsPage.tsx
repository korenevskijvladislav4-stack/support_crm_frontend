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
import { TeamModal } from "../../components/Settings/Modals";
import styles from "../../styles/settings/settings-pages.module.css";
import {
  TeamOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { 
  useCreateTeamMutation, 
  useUpdateTeamMutation,
  useDestroyTeamMutation, 
  useGetAllTeamsQuery 
} from "../../api/teamsApi";
import type { ITeamForm, ITeam } from "../../types/teams.type";
import { useGetAllRolesQuery } from "../../api/rolesApi";
import { theme } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

const SettingsTeamsPage: FC = () => {
  const { token } = useToken();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTeam, setEditingTeam] = useState<ITeam | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [form] = Form.useForm<ITeamForm>();

  const { data: teams, isLoading: isTeamsLoading, isFetching: isTeamsFetching, refetch } = useGetAllTeamsQuery();
  const { data: roles, isLoading: isRolesLoading } = useGetAllRolesQuery();
  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const [destroyTeam, { isLoading: isDestroying }] = useDestroyTeamMutation();

  const onDeleteClick = async (id: number) => {
    try {
      await destroyTeam(id).unwrap();
      message.success('Отдел успешно удален');
    } catch (error) {
      console.error('Error deleting team:', error);
      message.error('Ошибка при удалении отдела');
    }
  };

  const getRoleColor = (roleName: string) => {
    const roleColors: { [key: string]: string } = {
      'admin': 'red',
      'manager': 'blue',
      'user': 'green',
      'supervisor': 'orange',
      'agent': 'purple',
      'moderator': 'cyan'
    };
    return roleColors[roleName.toLowerCase()] || 'default';
  };

  const columns: TableColumnsType<ITeam> = [
    {
      title: 'Название отдела',
      dataIndex: 'name',
      width: 250,
      render: (name: string, record: ITeam) => (
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
      title: 'Роли доступа',
      width: 300,
      render: (_, record: ITeam) => (
        <Space size={[0, 4]} wrap>
          {record.roles.map((role, index) => (
            <Tag 
              key={index}
              color={getRoleColor(role.name)}
              icon={<SafetyCertificateOutlined />}
              className={styles.tag}
            >
              {role.name}
            </Tag>
          ))}
        </Space>
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
        <Badge status="success" text="Активен" />
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
          deleteConfirmTitle="Удаление отдела"
          isDeleting={isDestroying}
          editTooltip="Редактировать отдел"
          deleteTooltip="Удалить отдел"
        />
      )
    }
  ];

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
    const roleIds = team.roles && Array.isArray(team.roles) ? team.roles.map(r => r.id) : [];
    setSelectedRoleIds(roleIds);
    form.resetFields();
    // Используем setTimeout для установки значений после сброса формы
    setTimeout(() => {
      form.setFieldsValue({
        name: team.name,
        role_id: roleIds
      });
    }, 0);
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      // Сначала проверяем значение role_id напрямую
      const roleIdValue = form.getFieldValue('role_id');
      console.log('Role ID value before validation:', roleIdValue);
      
      const roleIds = Array.isArray(roleIdValue) ? roleIdValue : (roleIdValue ? [roleIdValue] : []);
      
      if (roleIds.length === 0) {
        // Устанавливаем ошибку валидации
        form.setFields([
          {
            name: 'role_id',
            errors: ['Выберите хотя бы одну роль'],
          },
        ]);
        message.error('Выберите хотя бы одну роль');
        return;
      }
      
      // Очищаем ошибки валидации
      form.setFields([
        {
          name: 'role_id',
          errors: [],
        },
      ]);
      
      const values = await form.validateFields();
      
      // Убеждаемся, что role_id всегда массив
      const submitData = {
        ...values,
        role_id: Array.isArray(values.role_id) 
          ? values.role_id.filter((id): id is number => id !== null)
          : (values.role_id !== null ? [values.role_id] : [])
      };
      
      console.log('Submitting data:', submitData);
      
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
    } catch (error: unknown) {
      console.error('Error saving team:', error);
      if (error && typeof error === 'object' && 'errorFields' in error) {
        // Ошибки валидации формы
        const errorFields = (error as { errorFields?: Array<{ name: string[]; errors: string[] }> }).errorFields;
        const roleError = errorFields?.find((field) => field.name[0] === 'role_id');
        if (roleError) {
          message.error(roleError.errors[0] || 'Выберите хотя бы одну роль');
        } else {
          message.error('Ошибка валидации формы');
        }
      } else if (error && typeof error === 'object' && 'data' in error) {
        const errorData = (error as { data?: { errors?: { role_id?: string[] } } }).data;
        if (errorData?.errors?.role_id && errorData.errors.role_id.length > 0) {
          message.error(errorData.errors.role_id[0] || 'Выберите хотя бы одну роль');
        } else {
          message.error(editingTeam ? 'Ошибка при обновлении отдела' : 'Ошибка при создании отдела');
        }
      } else {
        message.error(editingTeam ? 'Ошибка при обновлении отдела' : 'Ошибка при создании отдела');
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingTeam(null);
    setTeamName('');
    setSelectedRoleIds([]);
  };

  const totalTeams = teams?.length || 0;
  const totalRoles = roles?.length || 0;

  const stats = [
    {
      title: 'Всего отделов',
      value: totalTeams,
      prefix: <TeamOutlined />,
      valueStyle: { color: token.colorPrimary }
    },
    {
      title: 'Доступные роли',
      value: totalRoles,
      prefix: <SafetyCertificateOutlined />,
      valueStyle: { color: token.colorSuccess }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <SettingsPageHeader
        title="Управление отделами"
        description="Создание и настройка отделов компании"
        icon={<TeamOutlined style={{ color: token.colorPrimary }} />}
        onCreateClick={showCreateModal}
        onRefreshClick={() => refetch()}
        isLoading={isTeamsFetching}
        createButtonText="Создать отдел"
      />

      <SettingsStatsCards stats={stats} />

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

      <Card 
        title={
          <Space size="small">
            <TeamOutlined />
            <span>Список отделов</span>
            <Badge 
              count={totalTeams} 
              showZero 
              style={{ backgroundColor: token.colorPrimary }} 
            />
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isTeamsFetching ? 'Обновление...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
      >
        <Table<ITeam>
          columns={columns} 
          dataSource={teams} 
          rowKey="id"
          loading={isTeamsLoading || isTeamsFetching}
          scroll={{ x: 'max-content' }}
          size="small"
          bordered
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} отделов`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
            responsive: true
          }}
        />
      </Card>
    </div>
  );
};

export default SettingsTeamsPage;
