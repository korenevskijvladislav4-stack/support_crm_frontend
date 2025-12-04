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
  Card,
  Table,
  Badge,
  theme,
  Tabs,
  type TableColumnsType
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
import type { QualityMapListItem, QualityMapsFilter } from '../../types/quality.types';
import type { IUser } from '../../types/user.types';
import { formatDate } from '../../utils/dateUtils';
import QualityMapFilters from './QualityMapFilters';
import QualityMapPageHeader from './QualityMapPageHeader';
import styles from '../../styles/users/users-page.module.css';

const { Text } = Typography;

const QualityMapsListPage: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');
  const [filters, setFilters] = useState<QualityMapsFilter>({
    search: undefined,
    team_id: undefined,
    group_id: undefined,
    checker_id: undefined,
    start_date: undefined,
    page: 1,
    per_page: 10,
  });

  // Добавляем статус в фильтры на основе активного таба
  const filtersWithStatus = useMemo(() => ({
    ...filters,
    status: activeTab === 'all' ? undefined : activeTab,
  }), [filters, activeTab]);

  const { data: qualityMapsResponse, isLoading, isFetching, refetch } = useGetQualityMapsQuery(filtersWithStatus);
  const { data: teams } = useGetTeamsQuery();
  const { data: groups } = useGetAllGroupsQuery();
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
    
    while (hasMore) {
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

  const checkers = useMemo(() => {
    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
    }));
  }, [allUsers]);

  const handleApplyFilters = useCallback((newFilters: QualityMapsFilter) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const handleTabChange = useCallback((key: string) => {
    const newStatus = key as 'all' | 'active' | 'completed';
    setActiveTab(newStatus);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleResetFilters = useCallback(() => {
    const resetFilters: QualityMapsFilter = {
      search: undefined,
      team_id: undefined,
      group_id: undefined,
      checker_id: undefined,
      start_date: undefined,
      page: 1,
      per_page: filters.per_page || 10,
    };
    setFilters(resetFilters);
  }, [filters.per_page]);

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

  const handleTableChange = useCallback((pagination: { current: number; pageSize: number }) => {
    setFilters(prev => ({
      ...prev,
      page: pagination.current,
      per_page: pagination.pageSize,
    }));
  }, []);

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

  const columns: TableColumnsType<QualityMapListItem> = useMemo(() => [
    {
      title: 'Сотрудник',
      dataIndex: 'user_name',
      key: 'user_name',
      align: 'center',
      fixed: 'left',
      width: 200,
      render: (name: string, record: QualityMapListItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
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
            {name?.[0]?.toUpperCase()}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
              <TeamOutlined style={{ marginRight: 4 }} />
              {record.team_name}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Период проверки',
      key: 'period',
      align: 'center',
      width: 200,
      render: (_: unknown, record: QualityMapListItem) => (
        <Text style={{ fontSize: 13 }}>
          {formatDate(record.start_date)} - {formatDate(record.end_date)}
        </Text>
      ),
    },
    {
      title: 'Проверяющий',
      dataIndex: 'checker_name',
      key: 'checker_name',
      align: 'center',
      width: 180,
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <UserOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
          <Text style={{ fontSize: 13 }}>{name}</Text>
        </div>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      align: 'center',
      width: 130,
      render: (_: unknown, record: QualityMapListItem) => (
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
      render: (_: unknown, record: QualityMapListItem) => (
        <Space direction="vertical" size={2} style={{ margin: 0 }}>
          <div>
            <Text type="secondary" style={{ fontSize: 11 }}>Чаты: </Text>
            <Text strong style={{ fontSize: 12 }}>
              {record.checked_chats}/{record.total_chats}
            </Text>
          </div>
          {record.total_calls > 0 && (
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>Звонки: </Text>
              <Text strong style={{ fontSize: 12 }}>
                {record.checked_calls}/{record.total_calls}
              </Text>
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Общий балл',
      dataIndex: 'total_score',
      key: 'total_score',
      align: 'center',
      width: 120,
      render: (score: number) => (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px 10px',
          borderRadius: 6,
          backgroundColor: getScoreColor(score) + '15',
          border: `1px solid ${getScoreColor(score)}40`
        }}>
          <Text strong style={{ 
            fontSize: 14, 
            color: getScoreColor(score),
            fontWeight: 600
          }}>
            {score}%
          </Text>
        </div>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 150,
      render: (_: unknown, record: QualityMapListItem) => (
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
        </Space>
      ),
    },
  ], [navigate, handleDelete, getScoreColor, token]);

  return (
    <div className={styles.pageContainer}>
      <QualityMapPageHeader
        onResetFilters={handleResetFilters}
        onRefetch={refetch}
        hasActiveFilters={hasActiveFilters}
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

      {/* Таблица */}
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
        <Table<QualityMapListItem>
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
