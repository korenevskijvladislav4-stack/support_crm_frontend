import { useState, useCallback, useMemo, useEffect, type FC } from "react";
import type { IAttempt, IAttemptsFilter } from "../../types/attempts.types";
import { 
  Table,
  Button, 
  Popconfirm, 
  Space, 
  Card, 
  Typography, 
  Tooltip, 
  Badge,
  Tag,
  theme,
  Tabs,
  type TableColumnsType 
} from "antd";
import { useLazyAllAttemptsQuery, useDestroyAttemptMutation } from "../../api/attemptsApi";
import { Link } from "react-router-dom";
import { AttemptsPageHeader, AttemptsFilters } from "../../components/Attempts";
import styles from "../../styles/users/users-page.module.css";
import {
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { formatDateTime } from "../../utils/dateUtils";

const { Text } = Typography;

type AttemptTab = 'all' | 'viewed' | 'not_viewed';

const AttemptsListPage: FC = () => {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState<AttemptTab>('all');
  const [filters, setFilters] = useState<IAttemptsFilter>({
    search: undefined,
    email: undefined,
    phone: undefined,
    created_at: undefined,
    page: 1,
    per_page: 10,
  });
  const [trigger, { data: attemptsResponse, isLoading, isFetching }] = useLazyAllAttemptsQuery();
  const [destroyAttempt, { isLoading: destroyLoading }] = useDestroyAttemptMutation();

  // Добавляем is_viewed в фильтры на основе активного таба
  const filtersWithStatus = useMemo(() => ({
    ...filters,
    is_viewed: activeTab === 'all' ? undefined : activeTab === 'viewed',
  }), [filters, activeTab]);

  const attempts = attemptsResponse?.data || [];
  const paginationMeta = attemptsResponse?.meta;

  const handleTabChange = useCallback((key: string) => {
    const newTab = key as AttemptTab;
    setActiveTab(newTab);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleApplyFilters = useCallback((newFilters: IAttemptsFilter) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    const resetFilters: IAttemptsFilter = {
      search: undefined,
      email: undefined,
      phone: undefined,
      created_at: undefined,
      page: 1,
      per_page: filters.per_page || 10,
    };
    setFilters(resetFilters);
  }, [filters.per_page]);

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
      filters.email || 
      filters.phone || 
      filters.created_at
    );
  }, [filters]);

  // Загружаем данные при изменении фильтров
  useEffect(() => {
    trigger(filtersWithStatus);
  }, [filtersWithStatus, trigger]);

  const handleDeleteAttempt = useCallback(async (id: number) => {
    try {
      await destroyAttempt(id).unwrap();
      trigger(filtersWithStatus);
    } catch (error) {
      console.error('Error deleting attempt:', error);
    }
  }, [destroyAttempt, trigger, filtersWithStatus]);

  const getStatus = useCallback((createdAt: Date) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { status: 'success', text: 'Новая', color: 'green' };
    if (diffHours < 24) return { status: 'processing', text: 'В ожидании', color: 'blue' };
    return { status: 'default', text: 'Просрочена', color: 'red' };
  }, []);

  const columns: TableColumnsType<IAttempt> = useMemo(() => [
    {
      title: 'Кандидат',
      align: 'center',
      width: 200,
      fixed: 'left',
      render: (_, record: IAttempt) => (
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
            {record.name?.[0]}{record.surname?.[0]}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>
              {record.name} {record.surname}
            </div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
              ID: {record.id}
            </Text>
          </div>
        </div>
      )
    },
    {
      title: 'Контактная информация',
      align: 'center',
      width: 220,
      render: (_, record: IAttempt) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MailOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
            <Text style={{ fontSize: 13 }}>{record.email}</Text>
          </div>
          {record.phone ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />
              <Text style={{ fontSize: 13 }}>{record.phone}</Text>
            </div>
          ) : (
            <Text type="secondary" style={{ fontSize: 11 }}>
              Телефон не указан
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Дата заявки',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginBottom: 4 }}>
            <CalendarOutlined style={{ color: token.colorWarning, fontSize: 14 }} />
            <Text strong style={{ fontSize: 13 }}>
              {formatDateTime(record.created_at).split(' ')[0]}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {formatDateTime(record.created_at).split(' ')[1]}
          </Text>
        </div>
      )
    },
    {
      title: 'Статус',
      align: 'center',
      width: 120,
      render: (_, record) => {
        const status = getStatus(record.created_at);
        return (
          <Badge 
            status={status.status as 'success' | 'processing' | 'default'} 
            text={
              <Text style={{ fontSize: 12, color: status.color }}>
                {status.text}
              </Text>
            } 
          />
        );
      }
    },
    {
      title: 'Время ожидания',
      align: 'center',
      width: 130,
      render: (_, record) => {
        const created = new Date(record.created_at);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
        
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
              <ClockCircleOutlined style={{ color: diffHours > 24 ? token.colorError : token.colorSuccess, fontSize: 14 }} />
              <Text strong style={{ fontSize: 13 }}>
                {diffHours} ч
              </Text>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              с момента подачи
            </Text>
          </div>
        );
      }
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip 
            title="Просмотр заявки"
            overlayInnerStyle={{
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <Link to={`/attempts/${record.id}`}>
              <Button 
                type="text" 
                size="small" 
                icon={<EyeOutlined />}
                style={{ color: '#1890ff' }}
              />
            </Link>
          </Tooltip>
          
          <Tooltip 
            title="Отклонить заявку"
            overlayInnerStyle={{
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <Popconfirm
              title="Отклонение заявки"
              description={
                <div>
                  <div>Вы уверены, что хотите отклонить заявку от <Text strong>"{record.name} {record.surname}"</Text>?</div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Это действие нельзя отменить
                  </Text>
                </div>
              }
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              onConfirm={() => handleDeleteAttempt(record.id)}
              okText="Да, отклонить"
              cancelText="Отмена"
              okType="danger"
            >
              <Button 
                type="text" 
                size="small" 
                danger
                icon={<DeleteOutlined />}
                loading={destroyLoading}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ], [getStatus, handleDeleteAttempt, destroyLoading, token]);

  const tabItems = useMemo(() => [
    {
      key: 'all',
      label: (
        <Space>
          <FileTextOutlined style={{ color: token.colorPrimary }} />
          <span>Все</span>
          {activeTab === 'all' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorPrimary }} />
          )}
        </Space>
      ),
    },
    {
      key: 'viewed',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: token.colorSuccess }} />
          <span>Просмотрено</span>
          {activeTab === 'viewed' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorSuccess }} />
          )}
        </Space>
      ),
    },
    {
      key: 'not_viewed',
      label: (
        <Space>
          <CloseCircleOutlined style={{ color: token.colorWarning }} />
          <span>Не просмотрено</span>
          {activeTab === 'not_viewed' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorWarning }} />
          )}
        </Space>
      ),
    },
  ], [activeTab, paginationMeta, token]);

  return (
    <div className={styles.pageContainer}>
      <AttemptsPageHeader
        onResetFilters={handleResetFilters}
        onRefetch={() => trigger(filtersWithStatus)}
        hasActiveFilters={hasActiveFilters}
      />

      <AttemptsFilters
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
        loading={isFetching}
        onRefetch={() => trigger(filtersWithStatus)}
      />

      {/* Таблица */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <UserOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список заявок</span>
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
          items={tabItems}
          size="small"
          style={{ marginBottom: 12 }}
        />
        <Table<IAttempt>
          size="small"
          dataSource={attempts} 
          columns={columns} 
          rowKey="id"
          loading={isLoading || destroyLoading || isFetching}
          scroll={{ x: 'max-content' }}
          bordered
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
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (_, size) => handleTableChange({ current: 1, pageSize: size }),
          }}
        />
      </Card>
    </div>
  );
};

export default AttemptsListPage;
