import { useEffect, useState, useCallback, useMemo, type FC } from "react"
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
import styles from "../../styles/users/users-page.module.css"

const { Text } = Typography;

const UsersListPage: FC = () => {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState<'active' | 'deactivated'>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userFiltersForm, setUserFiltersForm] = useState<IUserFilters>({
    full_name: null,
    team: [],
    group: [],
    roles: [],
    schedule_type: null,
    phone: null,
    email: null,
    status: 'active'
  })

  const [trigger, { data: usersResponse, isLoading, isFetching }] = useLazyAllUsersQuery()
  
  const users = usersResponse?.data || [];
  const paginationMeta = usersResponse?.meta;
  const { data: teams } = useGetAllTeamsQuery()
  const { data: groups } = useGetAllGroupsQuery()
  const { data: allRoles } = useGetAllRolesQuery()
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation()
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation()

  // Обработчик применения фильтров
  const handleApplyFilters = useCallback((filters: IUserFilters) => {
    const newFilters = {
      ...filters,
      status: activeTab,
    };
    setUserFiltersForm(newFilters);
    setCurrentPage(1);
    trigger({ 
      ...newFilters, 
      page: 1,
      per_page: pageSize
    });
  }, [activeTab, pageSize, trigger]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      full_name: null,
      team: [],
      group: [],
      roles: [],
      schedule_type: null,
      phone: null,
      email: null,
      status: activeTab
    };
    setUserFiltersForm(resetFilters);
    setCurrentPage(1);
    trigger({ ...resetFilters, page: 1, per_page: pageSize });
  }, [activeTab, pageSize, trigger]);

  const handleTabChange = useCallback((key: string) => {
    const newStatus = key as 'active' | 'deactivated';
    setActiveTab(newStatus);
    setCurrentPage(1);
    const newFilters = { ...userFiltersForm, status: newStatus };
    setUserFiltersForm(newFilters);
    trigger({ ...newFilters, page: 1, per_page: pageSize });
  }, [userFiltersForm, pageSize, trigger]);

  const onDeactivateClick = useCallback(async (id: number) => {
    try {
      await deactivateUser(id).unwrap();
      message.success('Пользователь успешно деактивирован');
      trigger({ ...userFiltersForm, status: activeTab, page: currentPage, per_page: pageSize });
    } catch (error) {
      message.error('Ошибка при деактивации пользователя');
      console.error('Error deactivating user:', error);
    }
  }, [deactivateUser, userFiltersForm, activeTab, currentPage, pageSize, trigger]);

  const onActivateClick = useCallback(async (id: number) => {
    try {
      await activateUser(id).unwrap();
      message.success('Пользователь успешно активирован');
      trigger({ ...userFiltersForm, status: activeTab, page: currentPage, per_page: pageSize });
    } catch (error) {
      message.error('Ошибка при активации пользователя');
      console.error('Error activating user:', error);
    }
  }, [activateUser, userFiltersForm, activeTab, currentPage, pageSize, trigger]);

  const hasActiveFilters = useMemo((): boolean => {
    return !!(userFiltersForm.full_name || 
           userFiltersForm.team?.length > 0 || 
           userFiltersForm.group?.length > 0 || 
           userFiltersForm.roles?.length > 0 ||
           userFiltersForm.schedule_type ||
           userFiltersForm.phone ||
           userFiltersForm.email);
  }, [userFiltersForm]);

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
    setCurrentPage(page);
    setPageSize(size);
    trigger({ 
      ...userFiltersForm, 
      status: activeTab,
      page,
      per_page: size
    });
  }, [userFiltersForm, activeTab, trigger]);

  const handlePaginationShowSizeChange = useCallback((_current: number, size: number) => {
    setCurrentPage(1);
    setPageSize(size);
    trigger({ 
      ...userFiltersForm, 
      status: activeTab,
      page: 1,
      per_page: size
    });
  }, [userFiltersForm, activeTab, trigger]);

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
          
          {activeTab === 'active' ? (
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
          ) : (
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
  ], [token, getRoleColor, activeTab, isActivating, isDeactivating, onActivateClick, onDeactivateClick]);

  useEffect(() => {
    const loadUsers = () => trigger({
      full_name: null,
      team: [],
      group: [],
      roles: [],
      schedule_type: null,
      phone: null,
      email: null,
      status: activeTab,
      page: currentPage,
      per_page: pageSize
    })
    loadUsers()
  }, [trigger, activeTab, currentPage, pageSize])



  return (
    <div className={styles.pageContainer}>
      <UsersPageHeader
        onResetFilters={handleResetFilters}
        onRefetch={() => trigger({ ...userFiltersForm, status: activeTab, page: currentPage, per_page: pageSize })}
        hasActiveFilters={hasActiveFilters}
      />

      <UsersFilters
        filters={userFiltersForm}
        teams={teams}
        groups={groups}
        roles={allRoles}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        loading={isFetching}
        onRefetch={() => trigger({ ...userFiltersForm, status: activeTab, page: currentPage, per_page: pageSize })}
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