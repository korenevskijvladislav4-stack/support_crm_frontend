import { useEffect, useCallback, useMemo, type FC } from "react"
import { useLazyAllUsersQuery, useDeactivateUserMutation, useActivateUserMutation } from "../../api/usersApi"
import { Table } from "antd"
import { 
  Button, 
  Popconfirm, 
  Space, 
  Tag, 
  Card, 
  Tooltip,
  Badge,
  Typography,
  theme,
  Tabs,
  message,
  type TableColumnsType 
} from "antd"
import type { IUser, IUserFilters } from "../../types/user.types"
import { Link } from "react-router-dom"
import {
  EditOutlined,
  EyeOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useGetAllTeamsQuery } from "../../api/teamsApi"
import { useGetAllGroupsQuery } from "../../api/groupsApi"
import { useGetAllRolesQuery } from "../../api/rolesApi"
import { UsersPageHeader, UsersFilters } from "../../components/Users"
import { usePermissions } from "../../hooks/usePermissions"
import { useUrlFilters } from "../../hooks/useUrlFilters"
import { PERMISSIONS } from "../../constants/permissions"
import styles from "../../styles/users/users-page.module.css"

const { Text } = Typography;

// Дефолтные значения фильтров
const defaultFilters: IUserFilters & { page: number; per_page: number; status: 'active' | 'deactivated' } = {
  full_name: null,
  team: [],
  group: [],
  roles: [],
  schedule_type: null,
  phone: null,
  email: null,
  status: 'active',
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров (статичные)
const userFilterParsers = {
  team: (val: string) => val ? val.split(',').map(Number).filter(n => !isNaN(n)) : [],
  group: (val: string) => val ? val.split(',').map(Number).filter(n => !isNaN(n)) : [],
  roles: (val: string) => val ? val.split(',').map(Number).filter(n => !isNaN(n)) : [],
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
  status: (val: string) => (val === 'deactivated' ? 'deactivated' : 'active') as 'active' | 'deactivated',
};

const UsersListPage: FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  
  // Permissions
  const canUpdate = hasPermission(PERMISSIONS.USERS_MANAGE);
  const canDeactivate = hasPermission(PERMISSIONS.USERS_MANAGE);
  const canActivate = hasPermission(PERMISSIONS.USERS_MANAGE);
  
  // Фильтры с сохранением в URL
  const { filters, setFilters, resetFilters: resetUrlFilters } = useUrlFilters({
    defaults: defaultFilters,
    parsers: userFilterParsers,
  });

  const activeTab = filters.status;
  const userFiltersForm = filters;

  const [trigger, { data: usersResponse, isLoading, isFetching }] = useLazyAllUsersQuery()
  
  const users = usersResponse?.data || [];
  const paginationMeta = usersResponse?.meta;
  const { data: teams } = useGetAllTeamsQuery()
  const { data: groups } = useGetAllGroupsQuery()
  const { data: allRoles } = useGetAllRolesQuery()
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation()
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation()

  // Обработчик применения фильтров
  const handleApplyFilters = useCallback((newFilters: IUserFilters) => {
    setFilters({
      ...newFilters,
      page: 1,
    });
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    resetUrlFilters();
  }, [resetUrlFilters]);

  const handleTabChange = useCallback((key: string) => {
    const newStatus = key as 'active' | 'deactivated';
    setFilters({ status: newStatus, page: 1 });
  }, [setFilters]);

  const onDeactivateClick = useCallback(async (id: number) => {
    try {
      await deactivateUser(id).unwrap();
      message.success('Пользователь успешно деактивирован');
      trigger(filters);
    } catch (error) {
      message.error('Ошибка при деактивации пользователя');
      console.error('Error deactivating user:', error);
    }
  }, [deactivateUser, filters, trigger]);

  const onActivateClick = useCallback(async (id: number) => {
    try {
      await activateUser(id).unwrap();
      message.success('Пользователь успешно активирован');
      trigger(filters);
    } catch (error) {
      message.error('Ошибка при активации пользователя');
      console.error('Error activating user:', error);
    }
  }, [activateUser, filters, trigger]);

  // Проверка активных фильтров (без учёта status, page, per_page)
  const hasActiveFilters = useMemo((): boolean => {
    return !!(filters.full_name || 
           (filters.team && filters.team.length > 0) || 
           (filters.group && filters.group.length > 0) || 
           (filters.roles && filters.roles.length > 0) ||
           filters.schedule_type ||
           filters.phone ||
           filters.email);
  }, [filters]);

  const getRoleColor = useCallback((role: string) => {
    const roleColors: { [key: string]: string } = {
      'admin': 'red',
      'manager': 'blue',
      'user': 'green',
      'supervisor': 'orange',
      'agent': 'purple'
    };
    return roleColors[role.toLowerCase()] || 'default';
  }, []);

  const handlePaginationChange = useCallback((page: number, size: number) => {
    setFilters({ page, per_page: size });
  }, [setFilters]);

  const handlePaginationShowSizeChange = useCallback((_current: number, size: number) => {
    setFilters({ page: 1, per_page: size });
  }, [setFilters]);

  const columns: TableColumnsType<IUser> = useMemo(() => [
    {
      title: 'ФИО',
      align: 'center',
      fixed: 'left',
      width: 200,
      render: (_, user) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            {user.name?.[0]}{user.surname?.[0]}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>{user.name} {user.surname}</div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>ID: {user.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Почта',
      dataIndex: 'email',
      align: 'center',
      width: 250,
      render: (email: string) => (
        <Tooltip 
          title={email}
          styles={{ 
            body: {
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <MailOutlined style={{ color: '#1890ff', fontSize: 13 }} />
            <Text style={{ fontSize: 12, lineHeight: 1.4 }} copyable>
              {email}
            </Text>
          </div>
        </Tooltip>
      )
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
      align: 'center',
      width: 180,
      render: (phone: string | undefined) => (
        phone ? (
          <Tooltip 
            title={phone}
            styles={{ 
              body: {
                backgroundColor: token.colorBgElevated,
                color: token.colorText,
                border: `1px solid ${token.colorBorder}`
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <PhoneOutlined style={{ color: '#52c41a', fontSize: 13 }} />
              <Text style={{ fontSize: 12, lineHeight: 1.4 }} copyable>
                {phone}
              </Text>
            </div>
          </Tooltip>
        ) : (
          <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.4 }}>
            Не указан
          </Text>
        )
      )
    },
    {
      title: 'Отдел',
      dataIndex: 'team',
      align: 'center',
      width: 150,
      render: (team: string) => (
        <Tag 
          icon={<TeamOutlined style={{ fontSize: 12 }} />} 
          color="blue"
          style={{ margin: 0, fontSize: 12, lineHeight: 1.4 }}
        >
          {team}
        </Tag>
      ),
    },
    {
      title: 'Роли',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.roles.map((role, index) => (
            <Tag 
              key={index} 
              color={getRoleColor(role)}
              style={{ margin: 2, fontSize: 11, lineHeight: 1.4 }}
            >
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Группа',
      dataIndex: 'group',
      align: 'center',
      width: 150,
      render: (group: string) => (
        <Tag color="green" style={{ margin: 0, fontSize: 12, lineHeight: 1.4 }}>
          {group}
        </Tag>
      ),
    },
    {
      title: 'График',
      dataIndex: 'schedule_type',
      align: 'center',
      width: 120,
      render: (schedule: string) => (
        <Badge 
          status={schedule === 'День' ? 'success' : 'processing'} 
          text={<span style={{ fontSize: 12, lineHeight: 1.4 }}>{schedule}</span>}
        />
      )
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Tooltip 
            title="Просмотр профиля"
            overlayInnerStyle={{ 
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <Link to={`/users/${record.id}`}>
              <Button 
                type="text" 
                size="small" 
                icon={<EyeOutlined />}
                style={{ color: '#1890ff' }}
              />
            </Link>
          </Tooltip>
          
          {canUpdate && (
            <Tooltip 
              title="Редактировать"
              overlayInnerStyle={{ 
                backgroundColor: token.colorBgElevated,
                color: token.colorText,
                border: `1px solid ${token.colorBorder}`
              }}
            >
              <Link to={`/users/${record.id}/edit`}>
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />}
                  style={{ color: '#52c41a' }}
                />
              </Link>
            </Tooltip>
          )}
          
          {activeTab === 'active' && canDeactivate && (
            <Tooltip 
              title="Деактивировать пользователя"
              styles={{ 
                body: {
                  backgroundColor: token.colorBgElevated,
                  color: token.colorText,
                  border: `1px solid ${token.colorBorder}`
                }
              }}
            >
              <Popconfirm
                title="Деактивация пользователя"
                description="Вы уверены, что хотите деактивировать этого пользователя? Все его сессии будут завершены."
                okText="Да, деактивировать"
                cancelText="Отмена"
                okType="danger"
                onConfirm={() => onDeactivateClick(record.id)}
              >
                <Button 
                  type="text" 
                  size="small" 
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={isDeactivating}
                />
              </Popconfirm>
            </Tooltip>
          )}
          
          {activeTab === 'deactivated' && canActivate && (
            <Tooltip 
              title="Активировать пользователя"
              styles={{ 
                body: {
                  backgroundColor: token.colorBgElevated,
                  color: token.colorText,
                  border: `1px solid ${token.colorBorder}`
                }
              }}
            >
              <Popconfirm
                title="Активация пользователя"
                description="Вы уверены, что хотите активировать этого пользователя?"
                okText="Да, активировать"
                cancelText="Отмена"
                okType="primary"
                onConfirm={() => onActivateClick(record.id)}
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckCircleOutlined />}
                  style={{ color: token.colorSuccess }}
                  loading={isActivating}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      )
    }
  ], [token, getRoleColor, activeTab, isActivating, isDeactivating, onActivateClick, onDeactivateClick, canUpdate, canDeactivate, canActivate]);

  // Загрузка данных при изменении фильтров
  useEffect(() => {
    trigger(filters);
  }, [trigger, filters]);



  return (
    <div className={styles.pageContainer}>
      <UsersPageHeader />

      <UsersFilters
        filters={userFiltersForm}
        teams={teams}
        groups={groups}
        roles={allRoles}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        loading={isFetching}
        onRefetch={() => trigger(filters)}
      />

      {/* Таблица */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <SafetyCertificateOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список пользователей</span>
            {hasActiveFilters && (
              <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Фильтры активны</Tag>
            )}
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            {isFetching ? 'Обновление...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
        bodyStyle={{ padding: '12px' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'active',
              label: (
                <Space>
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  <span>Активные</span>
                  {activeTab === 'active' && paginationMeta && (
                    <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorSuccess }} />
                  )}
                </Space>
              ),
            },
            {
              key: 'deactivated',
              label: (
                <Space>
                  <CloseCircleOutlined style={{ color: token.colorError }} />
                  <span>Деактивированные</span>
                  {activeTab === 'deactivated' && paginationMeta && (
                    <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorError }} />
                  )}
                </Space>
              ),
            },
          ]}
          size="small"
          style={{ marginBottom: 12 }}
        />
        <Table<IUser> 
        size="small"
          dataSource={users} 
          columns={columns} 
          rowKey="id"
          loading={isLoading || isDeactivating || isActivating || isFetching}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: paginationMeta?.current_page || 1,
            pageSize: paginationMeta?.per_page || 10,
            total: paginationMeta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ['10', '20', '50', '100'],
            responsive: true,
            onChange: handlePaginationChange,
            onShowSizeChange: handlePaginationShowSizeChange,
          }}
        />
      </Card>
    </div>
  )
}

export default UsersListPage