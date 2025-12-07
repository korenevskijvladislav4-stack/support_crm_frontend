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
  type TableColumnsType,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SearchOutlined,
  ReloadOutlined,
  ClearOutlined,
  CheckOutlined,
  FileTextOutlined,
  WarningOutlined,
  FieldTimeOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useGetUserStatsQuery } from "../../api/usersApi";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useGetAllGroupsQuery } from "../../api/groupsApi";
import type { IUserStats, IUserStatsFilters } from "../../types/user.types";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import styles from "../../styles/users/users-page.module.css";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const defaultFilters: IUserStatsFilters = {
  search: undefined,
  team_id: undefined,
  group_id: undefined,
  date_from: undefined,
  date_to: undefined,
  page: 1,
  per_page: 10,
};

const filterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  group_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const UsersStatsPage: FC = () => {
  const { token } = theme.useToken();

  const { filters: urlFilters, setFilters, resetFilters: resetUrlFilters } = useUrlFilters<IUserStatsFilters>({
    defaults: defaultFilters,
    parsers: filterParsers,
  });

  const [localFilters, setLocalFilters] = useState<IUserStatsFilters>(urlFilters);

  useEffect(() => {
    setLocalFilters(urlFilters);
  }, [urlFilters]);

  const normalizedFilters = useMemo(() => {
    const perPage = Number(urlFilters.per_page ?? 10);
    return {
      ...urlFilters,
      per_page: Math.min(Number.isNaN(perPage) ? 10 : perPage, 100),
    };
  }, [urlFilters]);

  const { data: response, isLoading, isFetching, refetch } = useGetUserStatsQuery(normalizedFilters);
  const { data: teams } = useGetAllTeamsQuery();
  const { data: groups } = useGetAllGroupsQuery();

  const data = response?.data || [];
  const meta = response?.meta;

  const handleApplyFilters = useCallback(() => {
    setFilters({ ...localFilters, page: 1 });
  }, [localFilters, setFilters]);

  const handleResetFilters = useCallback(() => {
    setLocalFilters(defaultFilters);
    resetUrlFilters();
  }, [resetUrlFilters]);

  const handleDateChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setLocalFilters(prev => ({
      ...prev,
      date_from: dates?.[0]?.format('YYYY-MM-DD') || undefined,
      date_to: dates?.[1]?.format('YYYY-MM-DD') || undefined,
    }));
  }, []);

  const handleTableChange = useCallback((pagination: { current: number; pageSize: number }) => {
    setFilters({ page: pagination.current, per_page: Math.min(pagination.pageSize, 100) });
  }, [setFilters]);

  const hasActiveFilters = useMemo(() => {
    return !!(urlFilters.search || urlFilters.team_id || urlFilters.group_id || urlFilters.date_from || urlFilters.date_to);
  }, [urlFilters]);

  const teamOptions = useMemo(() => teams?.map(t => (
    <Option key={t.id} value={t.id}>{t.name}</Option>
  )) || [], [teams]);

  const groupOptions = useMemo(() => groups?.map(g => (
    <Option key={g.id} value={g.id}>{g.name}</Option>
  )) || [], [groups]);

  const getQualityLink = useCallback((userId: number) => {
    const params = new URLSearchParams();
    params.set('user_id', String(userId));
    if (urlFilters.date_from) params.set('date_from', String(urlFilters.date_from));
    if (urlFilters.date_to) params.set('date_to', String(urlFilters.date_to));
    return `/quality?${params.toString()}`;
  }, [urlFilters.date_from, urlFilters.date_to]);

  const getPenaltiesLink = useCallback((userId: number) => {
    const params = new URLSearchParams();
    params.set('user_id', String(userId));
    params.set('status', 'approved');
    if (urlFilters.date_from) params.set('date_from', String(urlFilters.date_from));
    if (urlFilters.date_to) params.set('date_to', String(urlFilters.date_to));
    return `/penalties?${params.toString()}`;
  }, [urlFilters.date_from, urlFilters.date_to]);

  const columns: TableColumnsType<IUserStats> = useMemo(() => [
    {
      title: 'Сотрудник',
      key: 'user',
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
            fontSize: 12,
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            <UserOutlined />
          </div>
          <div style={{ minWidth: 0 }}>
            <Link to={`/users/${record.id}`}>
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }}>{record.full_name || `${record.name} ${record.surname || ''}`}</Text>
            </Link>
            <Text type="secondary" style={{ fontSize: 11 }}>ID: {record.id}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Команда',
      key: 'team',
      width: 140,
      align: 'center',
      render: (_, record) => record.team ? (
        <Tag icon={<TeamOutlined />} color="blue" style={{ margin: 0, fontSize: 12 }}>
          {record.team.name}
        </Tag>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
    {
      title: 'Группа',
      key: 'group',
      width: 140,
      align: 'center',
      render: (_, record) => record.group ? (
        <Tag icon={<UserSwitchOutlined />} color="purple" style={{ margin: 0, fontSize: 12 }}>
          {record.group.name}
        </Tag>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
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
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Link to={getQualityLink(record.id)}>
          <Tooltip title="Показать карты качества сотрудника">
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
      title: 'Часы штрафов',
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
      title: 'Штрафов',
      key: 'penalties',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Link to={getPenaltiesLink(record.id)}>
          <Tooltip title="Показать штрафы сотрудника">
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
      <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <Title 
              level={3} 
              className={styles.title}
              style={{ color: token.colorText, marginBottom: 4 }}
            >
              <UserOutlined style={{ color: token.colorPrimary }} />
              Статистика по сотрудникам
            </Title>
            <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
              Показатели качества и штрафов по каждому сотруднику
            </Text>
          </div>
        </div>
      </div>

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
              placeholder="Поиск по имени/фамилии"
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
              style={{ width: 200, minWidth: 150 }}
              value={localFilters.team_id}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, team_id: value || undefined }))}
            >
              {teamOptions}
            </Select>
            <Select
              placeholder="Группа"
              allowClear
              showSearch
              optionFilterProp="label"
              size="middle"
              style={{ width: 200, minWidth: 150 }}
              value={localFilters.group_id}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, group_id: value || undefined }))}
            >
              {groupOptions}
            </Select>
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
            {hasActiveFilters && (
              <Button 
                icon={<ClearOutlined />} 
                onClick={handleResetFilters} 
                size="middle"
              >
                Сбросить
              </Button>
            )}
          </Space>
        </Flex>
      </Card>

      <Card 
        size="small"
        title={
          <Space size="small">
            <UserOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Статистика сотрудников</span>
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
        <Table<IUserStats>
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
        />
      </Card>
    </div>
  );
};

export default UsersStatsPage;


