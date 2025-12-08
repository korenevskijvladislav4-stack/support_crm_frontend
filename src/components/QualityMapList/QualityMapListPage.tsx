import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  message, 
  Space, 
  Typography, 
  Tooltip, 
  Button, 
  Tag, 
  Popconfirm,
  Badge,
  theme,
  Tabs,
  Card,
  type TableColumnsType,
  Table
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ReloadOutlined, 
  TeamOutlined, 
  UserOutlined, 
  ExclamationCircleOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { 
  useGetQualityMapsQuery, 
  useDeleteQualityMapMutation, 
  useGetTeamsQuery 
} from '../../api/qualityApi';
import { useGetAllGroupsQuery } from '../../api/groupsApi';
import { useLazyAllUsersQuery } from '../../api/usersApi';
import { usePermissions } from '../../hooks/usePermissions';
import { useUrlFilters } from '../../hooks/useUrlFilters';
import { PERMISSIONS } from '../../constants/permissions';
import type { IQualityMapListItem, IQualityMapsFilter } from '../../types/quality.types';
import type { IUser } from '../../types/user.types';
import { formatDate } from '../../utils/dateUtils';
import { handleApiError } from '../../utils/errorHandler';
import QualityMapFilters from './QualityMapFilters';
import QualityMapPageHeader from './QualityMapPageHeader';
import styles from '../../styles/users/users-page.module.css';

const { Text } = Typography;

type QualityMapTab = 'all' | 'active' | 'completed';

// Дефолтные значения фильтров
const defaultFilters = {
  search: undefined as string | undefined,
  team_id: undefined as number | undefined,
  user_id: undefined as number | undefined,
  group_id: undefined as number | undefined,
  checker_id: undefined as number | undefined,
  start_date: undefined as string | undefined,
  status: 'all' as QualityMapTab,
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров (статичные)
const qualityMapFilterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  user_id: (val: string) => val ? Number(val) : undefined,
  group_id: (val: string) => val ? Number(val) : undefined,
  checker_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
  status: (val: string) => (val || 'all') as QualityMapTab,
};

const QualityMapsListPage: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  // Permissions (view/manage scheme)
  const canManage = hasPermission(PERMISSIONS.QUALITY_MAPS_MANAGE);
  const canCreate = canManage;
  const canUpdate = canManage;
  const canDelete = canManage;

  // Фильтры с сохранением в URL
  const { filters: urlFilters, setFilters, resetFilters: resetUrlFilters } = useUrlFilters({
    defaults: defaultFilters,
    parsers: qualityMapFilterParsers,
  });

  const activeTab = urlFilters.status;
  const filters: IQualityMapsFilter = urlFilters;

  // Добавляем статус в фильтры на основе активного таба
  const filtersWithStatus = useMemo(() => ({
    ...filters,
    status: activeTab === 'all' ? undefined : activeTab,
  }), [filters, activeTab]);

  const { data: qualityMapsResponse, isLoading, isFetching, refetch, isError: isMapsError, error: mapsError } = useGetQualityMapsQuery(filtersWithStatus);
  const { data: teamsData } = useGetTeamsQuery();
  const { data: groupsData } = useGetAllGroupsQuery();
  
  // Нормализуем данные (на случай если API вернул объект с data)
  const teams = Array.isArray(teamsData) ? teamsData : (teamsData as unknown as { data: typeof teamsData })?.data || [];
  const groups = Array.isArray(groupsData) ? groupsData : (groupsData as unknown as { data: typeof groupsData })?.data || [];
  const [getUsers] = useLazyAllUsersQuery();
  const [deleteQualityMap] = useDeleteQualityMapMutation();
  const [allUsers, setAllUsers] = useState<IUser[]>([]);

  const qualityMaps = qualityMapsResponse?.data || [];
  const meta = qualityMapsResponse?.meta;

  // Функция для загрузки всех пользователей (без пагинации)
  const loadAllUsers = React.useCallback(async () => {
    const collectedUsers: IUser[] = [];
    let currentPage = 1;
    let hasMore = true;
    const perPage = 100; // Максимальное значение, разрешенное сервером
    const MAX_PAGES = 10; // Чтобы не блокировать UI при большом количестве пользователей
    
    while (hasMore) {
      if (currentPage > MAX_PAGES) {
        message.warning('Загружены первые 1000 пользователей. Уточните фильтры для списка проверяющих.');
        break;
      }
      try {
        const response = await getUsers({ 
          full_name: null,
          team: [],
          group: [],
          roles: [],
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
        handleApiError(error, 'Не удалось загрузить список проверяющих');
        hasMore = false;
      }
    }
    
    // Сохраняем все собранные пользователи в состояние
    setAllUsers(collectedUsers);
  }, [getUsers]);

  // Получаем список всех пользователей для фильтра проверяющих
  React.useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  React.useEffect(() => {
    if (isMapsError) {
      handleApiError(mapsError, 'Не удалось загрузить карты качества');
    }
  }, [isMapsError, mapsError]);

  const checkers = useMemo(() => {
    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
    }));
  }, [allUsers]);

  const handleApplyFilters = useCallback((newFilters: IQualityMapsFilter) => {
    setFilters({ ...newFilters, page: 1 });
  }, [setFilters]);

  const handleTabChange = useCallback((key: string) => {
    const newStatus = key as QualityMapTab;
    setFilters({ status: newStatus, page: 1 });
  }, [setFilters]);

  const handleResetFilters = useCallback(() => {
    resetUrlFilters();
  }, [resetUrlFilters]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteQualityMap(id).unwrap();
      message.success('Карта качества удалена');
      refetch();
    } catch (error) {
      console.error('Error deleting quality map:', error);
      message.error('Ошибка при удалении карты качества');
    }
  }, [deleteQualityMap, refetch]);

  const handleTableChange = useCallback((pagination: { current?: number; pageSize?: number }) => {
    setFilters({ page: pagination.current || 1, per_page: pagination.pageSize || filters.per_page || 10 });
  }, [setFilters, filters.per_page]);

  const hasActiveFilters = useMemo((): boolean => {
    return !!(
      filters.search || 
      filters.team_id || 
      filters.group_id || 
      filters.checker_id || 
      filters.start_date
    );
  }, [filters]);

  // Получение цвета для оценки
  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#73d13d';
    if (score >= 70) return '#95de64';
    if (score >= 60) return '#bae637';
    if (score >= 50) return '#ffec3d';
    if (score >= 40) return '#ffc53d';
    if (score >= 30) return '#ffa940';
    if (score >= 20) return '#ff7a45';
    if (score >= 10) return '#ff4d4f';
    return '#cf1322';
  }, []);

  const columns: TableColumnsType<IQualityMapListItem> = useMemo(() => [
    {
      title: 'Сотрудник',
      dataIndex: 'user',
      key: 'user',
      fixed: 'left',
      width: 200,
      render: (_: unknown, record: IQualityMapListItem) => {
        const fullName = `${record.user.name}${record.user.surname ? ` ${record.user.surname}` : ''}`;
        return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32,
            height: 32,
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
            {fullName?.[0]?.toUpperCase()}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>{fullName}</div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
              <TeamOutlined style={{ marginRight: 4 }} />
              {record.team.name}
            </Text>
          </div>
        </div>
        );
      },
    },
    {
      title: 'Период проверки',
      key: 'period',
      align: 'center',
      width: 200,
      render: (_: unknown, record: IQualityMapListItem) => (
        <Text style={{ fontSize: 13 }}>
          {formatDate(record.period.start)} - {formatDate(record.period.end)}
        </Text>
      ),
    },
    {
      title: 'Проверяющий',
      dataIndex: 'checker',
      key: 'checker',
      align: 'center',
      width: 180,
      render: (_: unknown, record: IQualityMapListItem) => {
        const fullName = `${record.checker.name}${record.checker.surname ? ` ${record.checker.surname}` : ''}`;
        return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <UserOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
          <Text style={{ fontSize: 13 }}>{fullName}</Text>
        </div>
        );
      },
    },
    {
      title: 'Статус',
      key: 'status',
      align: 'center',
      width: 130,
      render: (_: unknown, record: IQualityMapListItem) => (
        <Tag 
          color={record.status === 'active' ? 'processing' : 'success'}
          icon={record.status === 'active' ? <ReloadOutlined /> : <ExclamationCircleOutlined />}
          style={{ fontSize: 12, margin: 0 }}
        >
          {record.status === 'active' ? 'Активна' : 'Завершена'}
        </Tag>
      ),
    },
    {
      title: 'Проверено',
      key: 'checked',
      align: 'center',
      width: 150,
      render: (_: unknown, record: IQualityMapListItem) => (
        <Space direction="vertical" size={2} style={{ margin: 0 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Чаты: </Text>
            <Text strong style={{ fontSize: 12 }}>
              {record.progress.chats.checked}/{record.progress.chats.total}
            </Text>
          </div>
          {record.progress.calls.total > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Звонки: </Text>
              <Text strong style={{ fontSize: 12 }}>
                {record.progress.calls.checked}/{record.progress.calls.total}
              </Text>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Оценка',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
      width: 90,
      render: (score: number) => (
        <Tag 
          color={getScoreColor(score)}
          style={{ 
            margin: 0, 
            fontSize: 11, 
            padding: '2px 8px',
            borderRadius: 6,
            border: `1px solid ${getScoreColor(score)}33`,
            background: `${getScoreColor(score)}15`,
          }}
        >
          {score ?? 0}%
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 150,
      render: (_: unknown, record: IQualityMapListItem) => (
        <Space size="small">
          <Tooltip 
            title="Просмотр"
            overlayInnerStyle={{ 
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <Button 
              type="text"
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => navigate(`/quality/${record.id}`)}
              style={{ color: '#1890ff' }}
            />
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
              <Button 
                type="text"
                icon={<EditOutlined />} 
                size="small" 
                onClick={() => navigate(`/quality/${record.id}/edit`)}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          )}
          {canDelete && (
            <Popconfirm
              title="Удаление карты качества"
              description="Вы уверены, что хотите удалить эту карту качества?"
              onConfirm={() => handleDelete(record.id)}
              okText="Да"
              cancelText="Отмена"
            >
              <Tooltip 
                title="Удалить"
                overlayInnerStyle={{ 
                  backgroundColor: token.colorBgElevated,
                  color: token.colorText,
                  border: `1px solid ${token.colorBorder}`
                }}
              >
                <Button 
                  type="text"
                  icon={<DeleteOutlined />} 
                  size="small" 
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [navigate, handleDelete, getScoreColor, token, canUpdate, canDelete]);

  return (
    <div className={styles.pageContainer}>
      <QualityMapPageHeader
        canCreate={canCreate}
      />

      <QualityMapFilters
        filters={filters}
        teams={teams || []}
        groups={groups || []}
        checkers={checkers}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        loading={isFetching}
        onRefetch={refetch}
      />

      <Card 
        size="small"
        title={
          <Space size="small">
            <LineChartOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список карт качества</span>
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
              key: 'all',
              label: (
                <Space>
                  <LineChartOutlined style={{ color: token.colorPrimary }} />
                  <span>Все</span>
                  {activeTab === 'all' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorPrimary }} />
                  )}
                </Space>
              ),
            },
            {
              key: 'active',
              label: (
                <Space>
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  <span>Активные</span>
                  {activeTab === 'active' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorSuccess }} />
                  )}
                </Space>
              ),
            },
            {
              key: 'completed',
              label: (
                <Space>
                  <CloseCircleOutlined style={{ color: token.colorWarning }} />
                  <span>Завершенные</span>
                  {activeTab === 'completed' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorWarning }} />
                  )}
                </Space>
              ),
            },
          ]}
          size="small"
          style={{ marginBottom: 12 }}
        />

        <Table<IQualityMapListItem>
          size="small"
          dataSource={qualityMaps} 
          columns={columns} 
          rowKey="id"
          loading={isLoading || isFetching}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: meta?.current_page || 1,
            pageSize: meta?.per_page || 10,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ['10', '20', '50', '100'],
            responsive: true,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (_, size) => handleTableChange({ current: 1, pageSize: size }),
          }}
        />
      </Card>
    </div>
  );
};

export default QualityMapsListPage;
