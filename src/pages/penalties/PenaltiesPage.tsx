import { useState, useCallback, useMemo, useEffect, type FC } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  Tabs,
  message,
  Popconfirm,
  Tooltip,
  Badge,
  theme,
  Form,
  Button,
  type TableColumnsType
} from "antd";
import {
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  useGetPenaltiesQuery,
  useCreatePenaltyMutation,
  useUpdatePenaltyMutation,
  useApprovePenaltyMutation,
  useRejectPenaltyMutation
} from "../../api/penaltiesApi";
import { useGetAllGroupsQuery } from "../../api/groupsApi";
import { useLazyAllUsersQuery } from "../../api/usersApi";
import type { IPenalty, IPenaltyForm, PenaltyStatus, IPenaltiesFilter } from "../../types/penalty.types";
import type { IUser } from "../../types/user.types";
import { formatDate } from "../../utils/dateUtils";
import { PenaltyModal, PenaltiesPageHeader, PenaltiesFilters } from "../../components/Penalties";
import styles from "../../styles/users/users-page.module.css";

const { Text } = Typography;

const PenaltiesPage: FC = () => {
  const { token } = theme.useToken();
  const [activeTab, setActiveTab] = useState<PenaltyStatus>('all');
  const [filters, setFilters] = useState<IPenaltiesFilter>({
    search: undefined,
    user_id: undefined,
    group_id: undefined,
    created_by: undefined,
    created_at: undefined,
    page: 1,
    per_page: 10,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPenalty, setEditingPenalty] = useState<IPenalty | null>(null);
  const [form] = Form.useForm<IPenaltyForm>();

  // Добавляем статус в фильтры на основе активного таба
  const filtersWithStatus = useMemo(() => ({
    ...filters,
    status: activeTab === 'all' ? undefined : activeTab,
  }), [filters, activeTab]);

  const { data: penaltiesResponse, isLoading, isFetching, refetch } = useGetPenaltiesQuery(filtersWithStatus);
  
  const penalties = penaltiesResponse?.data || [];
  const paginationMeta = penaltiesResponse?.meta;
  
  const { data: groups } = useGetAllGroupsQuery();
  const [getUsers] = useLazyAllUsersQuery();
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  
  // Функция для загрузки всех пользователей (без пагинации)
  const loadAllUsers = useCallback(async () => {
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

  // Получаем список всех пользователей для фильтров
  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  const users = useMemo(() => {
    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
    }));
  }, [allUsers]);

  const creators = useMemo(() => {
    return allUsers.map(user => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
    }));
  }, [allUsers]);

  const [createPenalty, { isLoading: isCreating }] = useCreatePenaltyMutation();
  const [updatePenalty, { isLoading: isUpdating }] = useUpdatePenaltyMutation();
  const [approvePenalty, { isLoading: isApproving }] = useApprovePenaltyMutation();
  const [rejectPenalty, { isLoading: isRejecting }] = useRejectPenaltyMutation();

  const handleTabChange = useCallback((key: string) => {
    const newStatus = key as PenaltyStatus;
    setActiveTab(newStatus);
    setFilters(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleApplyFilters = useCallback((newFilters: IPenaltiesFilter) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    const resetFilters: IPenaltiesFilter = {
      search: undefined,
      user_id: undefined,
      group_id: undefined,
      created_by: undefined,
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
      filters.user_id || 
      filters.group_id || 
      filters.created_by || 
      filters.created_at
    );
  }, [filters]);

  const showCreateModal = useCallback(() => {
    setEditingPenalty(null);
    form.resetFields();
    setIsModalOpen(true);
  }, [form]);

  const showEditModal = useCallback((penalty: IPenalty) => {
    setEditingPenalty(penalty);
    form.setFieldsValue({
      user_id: penalty.user_id,
      hours_to_deduct: penalty.hours_to_deduct,
      comment: penalty.comment,
      status: penalty.status
    });
    setIsModalOpen(true);
  }, [form]);

  const handleOk = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      if (editingPenalty) {
        await updatePenalty({ id: editingPenalty.id, form: values }).unwrap();
        message.success('Штраф успешно обновлен');
      } else {
        await createPenalty(values).unwrap();
        message.success('Штраф успешно создан');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (error) {
      console.error('Error saving penalty:', error);
      message.error('Ошибка при сохранении штрафа');
    }
  }, [editingPenalty, form, createPenalty, updatePenalty, refetch]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingPenalty(null);
  }, [form]);

  const handleApprove = useCallback(async (id: number) => {
    try {
      await approvePenalty(id).unwrap();
      message.success('Штраф одобрен, часы сняты');
      refetch();
    } catch {
      message.error('Ошибка при одобрении штрафа');
    }
  }, [approvePenalty, refetch]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await rejectPenalty(id).unwrap();
      message.success('Штраф отклонен');
      refetch();
    } catch {
      message.error('Ошибка при отклонении штрафа');
    }
  }, [rejectPenalty, refetch]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'orange';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  }, []);

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'approved':
        return 'Одобрен';
      case 'rejected':
        return 'Отклонен';
      default:
        return status;
    }
  }, []);

  const columns: TableColumnsType<IPenalty> = useMemo(() => [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      align: 'center',
      fixed: 'left',
    },
    {
      title: 'Пользователь',
      width: 200,
      align: 'center',
      render: (_, record) => (
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
            {record.user?.name?.[0]}{record.user?.surname?.[0]}
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>
              {record.user?.name} {record.user?.surname}
            </div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
              {record.user?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Кто создал',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <UserOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.4 }}>
              {record.creator?.name} {record.creator?.surname}
            </div>
            <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.3 }}>
              {record.creator?.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Часов к снятию',
      dataIndex: 'hours_to_deduct',
      width: 150,
      align: 'center',
      render: (hours: number) => (
        <Tag color="red" icon={<ClockCircleOutlined />} style={{ fontSize: 12, margin: 0, padding: '4px 10px' }}>
          {hours} ч.
        </Tag>
      ),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      width: 300,
      align: 'center',
      ellipsis: {
        showTitle: false,
      },
      render: (comment: string) => (
        <Tooltip
          title={comment}
          overlayInnerStyle={{
            backgroundColor: token.colorBgElevated,
            color: token.colorText,
            border: `1px solid ${token.colorBorder}`
          }}
        >
          <Text style={{ fontSize: 13 }}>{comment}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: 12, margin: 0 }}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      width: 180,
      align: 'center',
      render: (date: string) => (
        <Text style={{ fontSize: 13 }}>{formatDate(date)}</Text>
      ),
    },
    {
      title: 'Действия',
      width: 200,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
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
              size="small"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          
          {/* Показываем кнопку "Одобрить" для pending и rejected */}
          {(record.status === 'pending' || record.status === 'rejected') && (
            <Popconfirm
              title="Одобрить штраф"
              description={
                record.status === 'rejected' 
                  ? "Вы уверены, что хотите одобрить этот штраф? Часы будут сняты с пользователя."
                  : "Вы уверены, что хотите одобрить этот штраф? Часы будут сняты с пользователя."
              }
              okText="Да, одобрить"
              cancelText="Отмена"
              okType="primary"
              onConfirm={() => handleApprove(record.id)}
            >
              <Tooltip 
                title="Одобрить"
                overlayInnerStyle={{
                  backgroundColor: token.colorBgElevated,
                  color: token.colorText,
                  border: `1px solid ${token.colorBorder}`
                }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  loading={isApproving}
                  style={{ color: token.colorSuccess }}
                />
              </Tooltip>
            </Popconfirm>
          )}
          
          {/* Показываем кнопку "Отклонить" для pending и approved */}
          {(record.status === 'pending' || record.status === 'approved') && (
            <Popconfirm
              title="Отклонить штраф"
              description={
                record.status === 'approved'
                  ? "Вы уверены, что хотите отклонить этот штраф? Это действие нельзя отменить."
                  : "Вы уверены, что хотите отклонить этот штраф?"
              }
              okText="Да, отклонить"
              cancelText="Отмена"
              okType="danger"
              onConfirm={() => handleReject(record.id)}
            >
              <Tooltip 
                title="Отклонить"
                overlayInnerStyle={{
                  backgroundColor: token.colorBgElevated,
                  color: token.colorText,
                  border: `1px solid ${token.colorBorder}`
                }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  loading={isRejecting}
                  style={{ color: token.colorError }}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [showEditModal, handleApprove, handleReject, isApproving, isRejecting, getStatusColor, getStatusText, token]);

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
      key: 'pending',
      label: (
        <Space>
          <ClockCircleOutlined style={{ color: token.colorWarning }} />
          <span>Ожидают</span>
          {activeTab === 'pending' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorWarning }} />
          )}
        </Space>
      ),
    },
    {
      key: 'approved',
      label: (
        <Space>
          <CheckCircleOutlined style={{ color: token.colorSuccess }} />
          <span>Одобрены</span>
          {activeTab === 'approved' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorSuccess }} />
          )}
        </Space>
      ),
    },
    {
      key: 'rejected',
      label: (
        <Space>
          <CloseCircleOutlined style={{ color: token.colorError }} />
          <span>Отклонены</span>
          {activeTab === 'rejected' && paginationMeta && (
            <Badge count={paginationMeta.total} showZero style={{ backgroundColor: token.colorError }} />
          )}
        </Space>
      ),
    },
  ], [activeTab, paginationMeta, token]);

  return (
    <div className={styles.pageContainer}>
      <PenaltiesPageHeader
        onResetFilters={handleResetFilters}
        onRefetch={refetch}
        hasActiveFilters={hasActiveFilters}
        onCreateClick={showCreateModal}
      />

      <PenaltiesFilters
        filters={filters}
        users={users}
        groups={groups || []}
        creators={creators}
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
            <ExclamationCircleOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список штрафов</span>
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
        <Table<IPenalty>
          size="small"
          dataSource={penalties}
          columns={columns}
          loading={isLoading || isApproving || isRejecting || isFetching}
          rowKey="id"
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
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (_, size) => handleTableChange({ current: 1, pageSize: size }),
          }}
        />
      </Card>

      <PenaltyModal
        open={isModalOpen}
        editingPenalty={editingPenalty}
        onOk={handleOk}
        onCancel={handleCancel}
        form={form}
        users={allUsers}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default PenaltiesPage;
