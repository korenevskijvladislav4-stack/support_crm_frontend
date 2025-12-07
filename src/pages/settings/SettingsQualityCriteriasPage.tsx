import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  Table,
  Space, 
  message, 
  Card, 
  Typography,
  Badge,
  Tag,
  Tooltip,
  theme,
  Form,
  Input,
  Button,
  Flex,
  Select,
  Tabs,
  type TableColumnsType 
} from "antd";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { QualityCriteriaModal } from "../../components/Settings/Modals";
import { usePermissions } from "../../hooks/usePermissions";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { PERMISSIONS } from "../../constants/permissions";
import styles from "../../styles/users/users-page.module.css";
import {
  StarOutlined,
  LineChartOutlined,
  GlobalOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  ClearOutlined,
  FolderOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { 
  useCreateQualityCriteriaMutation, 
  useDestroyQualityCriteriaMutation, 
  useLazyGetQualityCriteriasQuery,
  useUpdateQualityCriteriaMutation 
} from "../../api/qualityCriteriasApi";
import type { IQualityCriteria, ICriterionFormValues, IQualityCriteriaFilters } from "../../types/quality-criteria.types";
import type { ITeamWithPivot } from "../../types/team.types";

const { Text, Title } = Typography;

// Дефолтные значения фильтров
const defaultFilters: IQualityCriteriaFilters = {
  search: '',
  team_id: undefined,
  is_global: undefined,
  status: 'active',
  page: 1,
  per_page: 10,
};

// Парсеры для URL фильтров
const filterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
  status: (val: string) => (val || 'active') as IQualityCriteriaFilters['status'],
};

const SettingsQualityCriteriasPage: React.FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCriterion, setEditingCriterion] = useState<IQualityCriteria | null>(null);
  const [form] = Form.useForm<ICriterionFormValues>();

  // Фильтры из URL
  const { filters, setFilters, resetFilters } = useUrlFilters({
    defaults: defaultFilters,
    parsers: filterParsers,
  });
  const activeTab = filters.status || 'active';

  // Локальное состояние для фильтров (до применения)
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    team_id: filters.team_id,
    is_global: filters.is_global,
    status: filters.status || 'active',
  });

  // Синхронизация локальных фильтров с URL
  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      team_id: filters.team_id,
      is_global: filters.is_global,
      status: filters.status || 'active',
    });
  }, [filters.search, filters.team_id, filters.is_global, filters.status]);

  // Permissions
  const canCreate = hasPermission(PERMISSIONS.QUALITY_CRITERIA_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.QUALITY_CRITERIA_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.QUALITY_CRITERIA_DELETE);

  // API запросы с серверной фильтрацией
  const [trigger, { data: criteriasResponse, isLoading, isFetching }] = useLazyGetQualityCriteriasQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  const [createQualityCriteria, { isLoading: isCreating }] = useCreateQualityCriteriaMutation();
  const [updateQualityCriteria, { isLoading: isUpdating }] = useUpdateQualityCriteriaMutation();
  const [destroyQualityCriteria, { isLoading: isDestroying }] = useDestroyQualityCriteriaMutation();

  const criterias = criteriasResponse?.data || [];
  const meta = criteriasResponse?.meta;
  const hasActiveFilters = !!(filters.search || filters.team_id || filters.is_global || (filters.status && filters.status !== 'active'));

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
    setLocalFilters({ search: '', team_id: undefined, is_global: undefined, status: 'active' });
    resetFilters();
  }, [resetFilters]);

  const handleTabChange = useCallback((key: string) => {
    setFilters({ status: key as IQualityCriteriaFilters['status'], page: 1 });
  }, [setFilters]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await destroyQualityCriteria(id).unwrap();
      message.success('Критерий успешно удален');
      trigger(filters);
    } catch {
      message.error('Ошибка при удалении критерия');
    }
  }, [destroyQualityCriteria, filters, trigger]);

  const getTeamIds = useCallback((criterionTeams: ITeamWithPivot[] | undefined): number[] => {
    return criterionTeams?.map(team => team.id) || [];
  }, []);

  const handleActivate = useCallback(async (criterion: IQualityCriteria) => {
    try {
      await updateQualityCriteria({
        id: criterion.id,
        name: criterion.name,
        description: criterion.description,
        max_score: criterion.max_score,
        team_ids: getTeamIds(criterion.teams),
        is_global: criterion.is_global,
        category_id: criterion.category?.id ?? null,
        is_active: true,
      } as any).unwrap();
      message.success('Критерий активирован');
      trigger(filters);
    } catch {
      message.error('Ошибка при активации критерия');
    }
  }, [updateQualityCriteria, filters, trigger, getTeamIds]);

  const getTeamNames = (criterionTeams: ITeamWithPivot[] | undefined) => {
    return criterionTeams?.map(team => team.name) || [];
  };

  const showCreateModal = () => {
    setEditingCriterion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = useCallback((criterion: IQualityCriteria) => {
    setEditingCriterion(criterion);
    const teamIds = criterion.teams ? getTeamIds(criterion.teams as ITeamWithPivot[]) : [];
    form.setFieldsValue({
      name: criterion.name,
      description: criterion.description || '',
      max_score: criterion.max_score || 100,
      team_ids: teamIds,
      is_global: criterion.is_global || false,
      category_id: criterion.category?.id ?? null,
    });
    setIsModalOpen(true);
  }, [form, getTeamIds]);

  const handleSubmit = async (values: ICriterionFormValues) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        max_score: values.max_score,
        team_ids: values.is_global ? [] : values.team_ids,
        is_global: values.is_global,
        category_id: values.category_id || null,
      };

      if (editingCriterion) {
        await updateQualityCriteria({ id: editingCriterion.id, ...submitData }).unwrap();
        message.success('Критерий успешно обновлен');
      } else {
        await createQualityCriteria(submitData).unwrap();
        message.success('Критерий успешно создан');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingCriterion(null);
      trigger(filters);
    } catch {
      message.error('Ошибка при сохранении критерия');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingCriterion(null);
  };

  const handleTableChange = useCallback((pagination: { current?: number; pageSize?: number }) => {
    setFilters({
      page: pagination.current || 1,
      per_page: pagination.pageSize || 10,
    });
  }, [setFilters]);

  const columns: TableColumnsType<IQualityCriteria> = useMemo(() => [
    {
      title: 'Название',
      dataIndex: 'name',
      width: 220,
      render: (name: string, record: IQualityCriteria) => (
        <Space>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: record.is_global 
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 12,
          }}>
            {record.is_global ? <GlobalOutlined /> : <StarOutlined />}
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>{name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Макс: {record.max_score || 100} баллов
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      width: 180,
      render: (desc: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {desc || '—'}
        </Text>
      ),
    },
    {
      title: 'Категория',
      dataIndex: 'category',
      width: 150,
      render: (category: IQualityCriteria['category']) => {
        if (!category) return <Text type="secondary" style={{ fontSize: 11 }}>—</Text>;
        return (
          <Tag color="cyan" icon={<FolderOutlined />} style={{ fontSize: 11, margin: 0 }}>
            {category.name}
          </Tag>
        );
      },
    },
    {
      title: 'Применение',
      width: 220,
      render: (_, record: IQualityCriteria) => {
        const teamNames = getTeamNames(record.teams as ITeamWithPivot[]);
        
        if (record.is_global) {
          return <Tag color="purple" icon={<GlobalOutlined />} style={{ fontSize: 11, margin: 0 }}>Глобальный</Tag>;
        }

        return (
          <Space size={4} wrap>
            {teamNames.slice(0, 2).map((name, idx) => (
              <Tag key={idx} color="blue" style={{ fontSize: 10, margin: 0 }}>{name}</Tag>
            ))}
            {teamNames.length > 2 && (
              <Tooltip title={teamNames.slice(2).join(', ')}>
                <Tag style={{ fontSize: 10, margin: 0, cursor: 'pointer' }}>+{teamNames.length - 2}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Баллы',
      dataIndex: 'max_score',
      width: 80,
      align: 'center',
      render: (score: number) => (
        <Badge count={score || 100} showZero style={{ backgroundColor: '#52c41a' }} />
      )
    },
    {
      title: 'Статус',
      width: 90,
      align: 'center',
      render: (_, record: IQualityCriteria) => (
        <Badge 
          status={record.is_active ? "success" : "error"} 
          text={record.is_active ? "Активен" : "Удалён"} 
        />
      )
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 100,
      render: (_, record) => {
        if (record.is_active) {
          return (
            <SettingsActionButtons
              onEdit={canUpdate ? () => showEditModal(record) : undefined}
              onDelete={canDelete ? () => handleDelete(record.id) : undefined}
              recordName={record.name}
              deleteConfirmTitle="Удаление критерия"
              isDeleting={isDestroying}
            />
          );
        }

        return (
          <Space size="small">
            {canUpdate && (
              <Button type="link" size="small" onClick={() => showEditModal(record)}>
                Редактировать
              </Button>
            )}
            {canUpdate && (
              <Button 
                type="link" 
                size="small" 
                icon={<CheckOutlined />} 
                onClick={() => handleActivate(record)}
              >
                Активировать
              </Button>
            )}
          </Space>
        );
      }
    }
  ], [canUpdate, canDelete, isDestroying, showEditModal, handleDelete, handleActivate]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <Title level={3} className={styles.title} style={{ color: token.colorText, marginBottom: 4 }}>
              <LineChartOutlined style={{ color: token.colorWarning }} />
              Критерии качества
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Управление критериями оценки качества
            </Text>
          </div>
          
          <Space size="middle">
            {canCreate && filters.status !== 'deleted' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>
                Создать критерий
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
              placeholder="Тип"
              allowClear
              style={{ width: 150 }}
              value={localFilters.is_global}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, is_global: val }))}
              options={[
                { value: 'global', label: '🌐 Глобальные' },
                { value: 'team', label: '👥 Командные' },
              ]}
            />
            <Select
              placeholder="Команда"
              allowClear
              style={{ width: 180 }}
              value={localFilters.team_id}
              onChange={(val) => setLocalFilters(prev => ({ ...prev, team_id: val }))}
              loading={isTeamsLoading}
              options={teams?.map(t => ({ value: t.id, label: t.name }))}
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

      <QualityCriteriaModal
        open={isModalOpen}
        editingCriterion={editingCriterion}
        onOk={handleSubmit}
        onCancel={handleCancel}
        form={form}
        teams={teams}
        isLoadingTeams={isTeamsLoading}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Table */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <LineChartOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Список критериев</span>
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
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'active',
              label: (
                <Space>
                  <CheckOutlined style={{ color: token.colorSuccess }} />
                  <span>Активные</span>
                  {activeTab === 'active' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorSuccess }} />
                  )}
                </Space>
              ),
            },
            {
              key: 'deleted',
              label: (
                <Space>
                  <ClearOutlined style={{ color: token.colorError }} />
                  <span>Удалённые</span>
                  {activeTab === 'deleted' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorError }} />
                  )}
                </Space>
              ),
            },
            {
              key: 'all',
              label: (
                <Space>
                  <ReloadOutlined style={{ color: token.colorWarning }} />
                  <span>Все</span>
                  {activeTab === 'all' && meta && (
                    <Badge count={meta.total} showZero style={{ backgroundColor: token.colorWarning }} />
                  )}
                </Space>
              ),
            },
          ]}
          size="small"
          style={{ marginBottom: 12 }}
        />
        <Table<IQualityCriteria>
          columns={columns} 
          dataSource={criterias} 
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

export default SettingsQualityCriteriasPage;
