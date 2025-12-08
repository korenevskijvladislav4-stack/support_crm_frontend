import { useCallback, useMemo, useState, useEffect, type FC } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  theme,
  Button,
  Input,
  Select,
  DatePicker,
  Flex,
  Progress,
  Tooltip,
  Badge,
  type TableColumnsType
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  SunOutlined,
  MoonOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CrownOutlined,
  FileTextOutlined,
  WarningOutlined,
  FieldTimeOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import { useGetGroupStatsQuery } from "../../api/groupsApi";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useLazyAllUsersQuery } from "../../api/usersApi";
import type { IGroupStats, IGroupStatsFilters } from "../../types/group.types";
import type { IUser } from "../../types/user.types";
import { GroupsPageHeader } from "../../components/Groups";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import dayjs from "dayjs";
import styles from "../../styles/users/users-page.module.css";

const { Text } = Typography;
const { RangePicker } = DatePicker;

// Дефолтные значения фильтров
  const defaultFilters: IGroupStatsFilters = {
    search: undefined,
    team_id: undefined,
    shift_type: undefined,
    shift_number: undefined,
    supervisor_id: undefined,
    date_from: undefined,
    date_to: undefined,
    page: 1,
    per_page: 10,
  };

// Парсеры для URL фильтров
const filterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  supervisor_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const GroupsStatsPage: FC = () => {
  const { token } = theme.useToken();

  // Фильтры с сохранением в URL
  const { filters: urlFilters, setFilters } = useUrlFilters<IGroupStatsFilters>({
    defaults: defaultFilters,
    parsers: filterParsers,
  });

  // Локальные фильтры для формы
  const [localFilters, setLocalFilters] = useState<IGroupStatsFilters>(urlFilters);

  useEffect(() => {
    setLocalFilters(urlFilters);
  }, [urlFilters]);

  // Загрузка данных
  const { data: response, isLoading, isFetching, refetch } = useGetGroupStatsQuery(urlFilters);
  const { data: teams } = useGetAllTeamsQuery();
  const [getUsers] = useLazyAllUsersQuery();
  const [supervisors, setSupervisors] = useState<IUser[]>([]);

  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const result = await getUsers({ 
          status: 'active', page: 1, per_page: 100,
          full_name: null, team: [], group: [], roles: []
        }).unwrap();
        setSupervisors(result.data || []);
      } catch (e) {
        console.error('Failed to load supervisors', e);
      }
    };
    loadSupervisors();
  }, [getUsers]);

  const data = response?.data || [];
  const meta = response?.meta;

  const handleApplyFilters = useCallback(() => {
    setFilters({ ...localFilters, page: 1 });
  }, [localFilters, setFilters]);

  const handleTableChange = useCallback((pagination: { current: number; pageSize: number }) => {
    setFilters({ page: pagination.current, per_page: pagination.pageSize });
  }, [setFilters]);

  const handleDateChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setLocalFilters(prev => ({
      ...prev,
      date_from: dates?.[0]?.format('YYYY-MM-DD') || undefined,
      date_to: dates?.[1]?.format('YYYY-MM-DD') || undefined,
    }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(urlFilters.search || urlFilters.team_id || urlFilters.shift_type || 
      urlFilters.shift_number || urlFilters.supervisor_id || urlFilters.date_from || urlFilters.date_to);
  }, [urlFilters]);

  // Формирование ссылки на карты качества
  const getQualityLink = useCallback((groupId: number) => {
    const params = new URLSearchParams();
    params.set('group_id', String(groupId));
    if (urlFilters.date_from) params.set('date_from', String(urlFilters.date_from));
    if (urlFilters.date_to) params.set('date_to', String(urlFilters.date_to));
    return `/quality?${params.toString()}`;
  }, [urlFilters.date_from, urlFilters.date_to]);

  // Формирование ссылки на штрафы
  const getPenaltiesLink = useCallback((groupId: number) => {
    const params = new URLSearchParams();
    params.set('group_id', String(groupId));
    params.set('status', 'approved');
    return `/penalties?${params.toString()}`;
  }, []);

  const getQualityLinkByUser = useCallback((userId: number) => {
    const params = new URLSearchParams();
    params.set('user_id', String(userId));
    if (urlFilters.date_from) params.set('date_from', String(urlFilters.date_from));
    if (urlFilters.date_to) params.set('date_to', String(urlFilters.date_to));
    return `/quality?${params.toString()}`;
  }, [urlFilters.date_from, urlFilters.date_to]);

  const getPenaltiesLinkByUser = useCallback((userId: number) => {
    const params = new URLSearchParams();
    params.set('user_id', String(userId));
    params.set('status', 'approved');
    if (urlFilters.date_from) params.set('date_from', String(urlFilters.date_from));
    if (urlFilters.date_to) params.set('date_to', String(urlFilters.date_to));
    return `/penalties?${params.toString()}`;
  }, [urlFilters.date_from, urlFilters.date_to]);

  const userColumns: TableColumnsType<NonNullable<IGroupStats['users']['items']>[number]> = useMemo(() => [
    {
      title: 'Сотрудник',
      key: 'user',
      width: 200,
      render: (_, user) => (
        <Link to={`/users/${user.id}`}>
          <Space size={6}>
            <UserOutlined />
            <Text strong style={{ fontSize: 12 }}>{user.full_name || `${user.name || ''} ${user.surname || ''}`}</Text>
          </Space>
        </Link>
      ),
    },
    {
      title: 'Качество',
      key: 'quality',
      width: 120,
      align: 'center',
      render: (_, user) => user.quality.avg !== null ? (
        <Space size={6}>
          <Badge color={(user.quality.avg ?? 0) >= 90 ? 'green' : (user.quality.avg ?? 0) >= 70 ? 'orange' : 'red'} />
          <Text style={{ fontSize: 12 }}>{user.quality.avg}%</Text>
        </Space>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Проверок',
      key: 'checks',
      width: 90,
      align: 'center',
      render: (_, user) => (
        <Link to={getQualityLinkByUser(user.id)}>
          <Tag icon={<FileTextOutlined />} color={user.quality.checks_count > 0 ? 'cyan' : 'default'} style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}>
            {user.quality.checks_count}
          </Tag>
        </Link>
      ),
    },
    {
      title: 'Штрафы (часы)',
      key: 'penalties_hours',
      width: 120,
      align: 'center',
      render: (_, user) => (
        <Link to={getPenaltiesLinkByUser(user.id)}>
          <Tag icon={<FieldTimeOutlined />} color={user.penalties.hours > 0 ? 'volcano' : 'default'} style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}>
            {user.penalties.hours}
          </Tag>
        </Link>
      ),
    },
    {
      title: 'Штрафы (шт)',
      key: 'penalties_count',
      width: 110,
      align: 'center',
      render: (_, user) => (
        <Link to={getPenaltiesLinkByUser(user.id)}>
          <Tag icon={<WarningOutlined />} color={user.penalties.count > 0 ? 'red' : 'default'} style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}>
            {user.penalties.count}
          </Tag>
        </Link>
      ),
    },
  ], [getQualityLinkByUser, getPenaltiesLinkByUser]);

  // Колонки таблицы
  const columns: TableColumnsType<IGroupStats> = useMemo(() => [
    {
      title: 'Группа',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 11,
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            <TeamOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }}>{record.name}</Text>
            {record.team && (
              <Text type="secondary" style={{ fontSize: 11 }}>{record.team.name}</Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Смена',
      key: 'shift',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size={4}>
          <Tag 
            icon={record.shift?.type === 'День' ? <SunOutlined /> : <MoonOutlined />}
            color={record.shift?.type === 'День' ? 'orange' : 'purple'}
            style={{ margin: 0, fontSize: 11 }}
          >
            {record.shift?.type === 'День' ? 'День' : 'Ночь'}
          </Tag>
          <Tag 
            icon={record.shift?.number === 'Верхняя' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            color={record.shift?.number === 'Верхняя' ? 'green' : 'blue'}
            style={{ margin: 0, fontSize: 11 }}
          >
            {record.shift?.number === 'Верхняя' ? 'Верх' : 'Низ'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Ответственный',
      key: 'supervisor',
      width: 180,
      align: 'center',
      render: (_, record) => record.supervisor ? (
        <Link to={`/users/${record.supervisor.id}`}>
          <Tooltip title="Перейти в профиль">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <CrownOutlined style={{ color: '#faad14', fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{record.supervisor.full_name}</Text>
            </div>
          </Tooltip>
        </Link>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>Не назначен</Text>
      ),
    },
    {
      title: 'Сотрудников',
      key: 'users_count',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Link to={`/users?group=${record.id}`}>
          <Tooltip title="Показать сотрудников группы">
            <Tag 
              icon={<UserOutlined />} 
              color="blue" 
              style={{ margin: 0, fontSize: 12, cursor: 'pointer' }}
            >
              {record.users.count}
            </Tag>
          </Tooltip>
        </Link>
      ),
    },
    {
      title: 'Качество',
      key: 'quality',
      width: 140,
      align: 'center',
      render: (_, record) => record.quality.avg !== null ? (
        <Tooltip title={`Проверок: ${record.quality.checks_count}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <Progress 
              type="circle" 
              percent={record.quality.avg ?? 0} 
              size={26}
              strokeWidth={8}
              strokeColor={(record.quality.avg ?? 0) >= 90 ? token.colorSuccess : (record.quality.avg ?? 0) >= 70 ? token.colorWarning : token.colorError}
              format={() => null}
            />
            <Text strong style={{ fontSize: 12 }}>{record.quality.avg}%</Text>
          </div>
        </Tooltip>
      ) : (
        <Text type="secondary" style={{ fontSize: 12 }}>—</Text>
      ),
    },
    {
      title: 'Проверок',
      key: 'checks',
      width: 90,
      align: 'center',
      render: (_, record) => (
        <Link to={getQualityLink(record.id)}>
          <Tooltip title="Показать карты качества группы">
            <Tag 
              icon={<FileTextOutlined />} 
              color={record.quality.checks_count > 0 ? 'cyan' : 'default'}
              style={{ margin: 0, fontSize: 12, cursor: 'pointer' }}
            >
              {record.quality.checks_count}
            </Tag>
          </Tooltip>
        </Link>
      ),
    },
    {
      title: 'Штрафы (часы)',
      key: 'penalties_hours',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Tag 
          icon={<FieldTimeOutlined />} 
          color={record.penalties.hours > 0 ? 'volcano' : 'default'}
          style={{ margin: 0, fontSize: 12 }}
        >
          {record.penalties.hours ?? 0}
        </Tag>
      ),
    },
    {
      title: 'Штрафы (шт)',
      key: 'penalties_count',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <Link to={getPenaltiesLink(record.id)}>
          <Tooltip title="Показать штрафы группы">
            <Tag 
              icon={<WarningOutlined />} 
              color={record.penalties.count > 0 ? 'red' : 'default'}
              style={{ margin: 0, fontSize: 12, cursor: 'pointer' }}
            >
              {record.penalties.count}
            </Tag>
          </Tooltip>
        </Link>
      ),
    },
  ], [token, getQualityLink, getPenaltiesLink]);

  return (
    <div className={styles.pageContainer}>
      <GroupsPageHeader
        title="Статистика групп"
        description="Сводные показатели по группам: качество, проверки и штрафы"
      />

      {/* Фильтры */}
      <Card 
        size="small" 
        style={{ 
          marginBottom: 12, 
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`
        }} 
        bodyStyle={{ padding: 12 }}
      >
        <Flex justify="space-between" align="center" gap={16} wrap>
          <Flex gap={16} align="center" style={{ flex: 1 }} wrap>
            <Input
              placeholder="Название"
              allowClear
              size="middle"
              style={{ width: 250, minWidth: 180 }}
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value || undefined }))}
              prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
            />
            <Select
              placeholder="Команда"
              allowClear
              showSearch
              optionFilterProp="label"
              size="middle"
              style={{ width: 180, minWidth: 130 }}
              value={localFilters.team_id}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, team_id: value }))}
              options={teams?.map(t => ({ value: t.id, label: t.name }))}
            />
            <Select
              placeholder="Тип смены"
              allowClear
              size="middle"
              style={{ width: 150, minWidth: 120 }}
              value={localFilters.shift_type}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, shift_type: value }))}
              options={[
                { value: 'День', label: 'День' },
                { value: 'Ночь', label: 'Ночь' },
              ]}
            />
            <Select
              placeholder="Номер смены"
              allowClear
              size="middle"
              style={{ width: 150, minWidth: 120 }}
              value={localFilters.shift_number}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, shift_number: value }))}
              options={[
                { value: 'Верхняя', label: 'Верхняя' },
                { value: 'Нижняя', label: 'Нижняя' },
              ]}
            />
            <Select
              placeholder="Ответственный"
              allowClear
              showSearch
              optionFilterProp="label"
              size="middle"
              style={{ width: 200, minWidth: 150 }}
              value={localFilters.supervisor_id}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, supervisor_id: value }))}
              options={supervisors.map(u => ({ value: u.id, label: `${u.name} ${u.surname}` }))}
            />
            <RangePicker
              value={[
                localFilters.date_from ? dayjs(localFilters.date_from) : null,
                localFilters.date_to ? dayjs(localFilters.date_to) : null
              ]}
              onChange={handleDateChange}
              size="middle"
              style={{ width: 240, minWidth: 200 }}
              placeholder={['От', 'До']}
              format="DD.MM.YY"
            />
          </Flex>
          <Space>
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleApplyFilters} 
              loading={isFetching}
              size="middle"
            >
              Применить
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()} 
              loading={isFetching} 
              size="middle"
            >
              Обновить
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Таблица */}
      <Card 
        size="small"
        title={
          <Space size="small">
            <TeamOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Статистика групп</span>
            {hasActiveFilters && <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Фильтры активны</Tag>}
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            {isFetching ? 'Загрузка...' : `Всего: ${meta?.total || 0}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
        bodyStyle={{ padding: 12 }}
      >
        <Table<IGroupStats>
          size="small"
          dataSource={data}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            current: meta?.current_page || 1,
            pageSize: meta?.per_page || 10,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ['10', '20', '50', '100'],
            responsive: true,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (_, size) => handleTableChange({ current: 1, pageSize: size }),
          }}
          expandable={{
            rowExpandable: (record) => (record.users.items?.length || 0) > 0,
            expandedRowRender: (record) => (
              <Table
                size="small"
                dataSource={record.users.items || []}
                columns={userColumns}
                pagination={false}
                rowKey="id"
                scroll={{ x: 'max-content' }}
                style={{ marginLeft: 48 }}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default GroupsStatsPage;
