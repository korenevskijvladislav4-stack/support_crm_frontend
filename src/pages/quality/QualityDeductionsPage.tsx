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
  Tooltip,
  type TableColumnsType
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { useGetQualityDeductionsQuery, useGetCriteriaQuery } from "../../api/qualityApi";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import type { IQualityDeductionListItem, IQualityDeductionsFilter } from "../../types/quality.types";
import type { IQualityCriteria } from "../../types/quality-criteria.types";
import type { IUserShort } from "../../types/user.types";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { formatDate } from "../../utils/dateUtils";
import styles from "../../styles/users/users-page.module.css";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const defaultFilters: IQualityDeductionsFilter = {
  search: undefined,
  team_id: undefined,
  criteria_id: undefined,
  date_from: undefined,
  date_to: undefined,
  page: 1,
  per_page: 10,
};

const filterParsers = {
  team_id: (val: string) => val ? Number(val) : undefined,
  criteria_id: (val: string) => val ? Number(val) : undefined,
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const QualityDeductionsPage: FC = () => {
  const { token } = theme.useToken();

  const { filters: urlFilters, setFilters } = useUrlFilters({
    defaults: defaultFilters,
    parsers: filterParsers,
  });

  const [localFilters, setLocalFilters] = useState<IQualityDeductionsFilter>(urlFilters);

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

  const { data: response, isLoading, isFetching, refetch } = useGetQualityDeductionsQuery(normalizedFilters);
  const { data: teams } = useGetAllTeamsQuery();
  const { data: criteria } = useGetCriteriaQuery({});

  const data = response?.data || [];
  const meta = response?.meta;

  const handleApplyFilters = useCallback(() => {
    setFilters({ ...localFilters, page: 1 });
  }, [localFilters, setFilters]);

  const handleTableChange = useCallback((pagination: { current: number; pageSize: number }) => {
    setFilters({ page: pagination.current, per_page: Math.min(pagination.pageSize, 100) });
  }, [setFilters]);

  const handleDateChange = useCallback((dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setLocalFilters(prev => ({
      ...prev,
      date_from: dates?.[0]?.format('YYYY-MM-DD') || undefined,
      date_to: dates?.[1]?.format('YYYY-MM-DD') || undefined,
    }));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(urlFilters.search || urlFilters.team_id || urlFilters.criteria_id || urlFilters.date_from || urlFilters.date_to);
  }, [urlFilters]);

  const teamOptions = useMemo(() => teams?.map(t => (
    <Option key={t.id} value={t.id}>{t.name}</Option>
  )) || [], [teams]);

  const criteriaOptions = useMemo(() => {
    const list: IQualityCriteria[] = Array.isArray(criteria)
      ? (criteria as IQualityCriteria[])
      : ((criteria as { data?: IQualityCriteria[] } | undefined)?.data || []);
    return list.map((c) => (
      <Option key={c.id} value={c.id}>{c.name}</Option>
    ));
  }, [criteria]);

  const columns: TableColumnsType<IQualityDeductionListItem> = useMemo(() => [
    {
      title: 'Пользователь',
      key: 'user',
      width: 200,
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
            {record.user?.id ? (
              <Link to={`/users/${record.user.id}`}>
                <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }}>
                  {record.user?.fullname || '-'}
                </Text>
              </Link>
            ) : (
              <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.3 }}>
                {record.user?.fullname || '-'}
              </Text>
            )}
            {record.team && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {record.team.name}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Критерий',
      key: 'criterion',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Text style={{ fontSize: 12 }}>{record.criterion?.name || '-'}</Text>
      ),
    },
    {
      title: 'ID чата',
      dataIndex: 'chat_id',
      width: 140,
      align: 'center',
      render: (chatId: string) => (
        <Text style={{ fontSize: 12, fontFamily: 'monospace' }}>{chatId}</Text>
      ),
    },
    {
      title: 'Снятие',
      dataIndex: 'deduction',
      width: 120,
      align: 'center',
      render: (deduction: number) => (
        <Tag color="red" style={{ margin: 0, fontSize: 12 }}>
          {deduction}
        </Tag>
      ),
    },
    {
      title: 'Комментарий',
      dataIndex: 'comment',
      width: 280,
      align: 'left',
      render: (comment: string) => (
        <Tooltip 
          title={comment || '-'} 
          overlayInnerStyle={{ maxWidth: 700, width: 700, whiteSpace: 'pre-wrap' }}
          placement="topLeft"
        >
          <Text
            style={{
              fontSize: 12,
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.5
            }}
          >
            {comment || '-'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Период карты',
      key: 'period',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <Space size={4} direction="vertical" style={{ lineHeight: 1.2 }}>
          <Text style={{ fontSize: 11 }}>
            <strong>С:</strong> {record.period?.start ? formatDate(record.period.start) : record.period_start ? formatDate(record.period_start) : '-'}
          </Text>
          <Text style={{ fontSize: 11 }}>
            <strong>По:</strong> {record.period?.end ? formatDate(record.period.end) : record.period_end ? formatDate(record.period_end) : '-'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Создал',
      key: 'created_by',
      width: 180,
      align: 'center',
      render: (_, record) => {
        const creator = (record.created?.by || record.createdBy) as (IUserShort & { full_name?: string }) | null | undefined;
        const fullName = creator?.full_name || creator?.fullname || `${creator?.name || ''} ${creator?.surname || ''}`.trim();
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            <InfoCircleOutlined style={{ color: token.colorPrimary }} />
            <Text style={{ fontSize: 12 }}>{fullName || '-'}</Text>
          </div>
        );
      },
    },
    {
      title: 'Создано',
      dataIndex: 'created_at',
      width: 150,
      align: 'center',
      render: (_: string, record) => {
        const date = record.created?.at || record.created_at;
        return <Text style={{ fontSize: 12 }}>{date ? formatDate(date) : '-'}</Text>;
      },
    },
  ], [token]);

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
              <FieldTimeOutlined style={{ color: token.colorPrimary }} />
              Снятия качества
            </Title>
            <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
              Все вычеты по картам качества с фильтрами и поиском
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
              placeholder="Поиск по пользователю или чату"
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
              placeholder="Критерий"
              allowClear
              showSearch
              optionFilterProp="label"
              size="middle"
              style={{ width: 220, minWidth: 160 }}
              value={localFilters.criteria_id}
              onChange={(value) => setLocalFilters(prev => ({ ...prev, criteria_id: value || undefined }))}
            >
              {criteriaOptions}
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
          </Space>
        </Flex>
      </Card>

      <Card 
        size="small"
        title={
          <Space size="small">
            <FieldTimeOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Снятия по картам качества</span>
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
        <Table<IQualityDeductionListItem>
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

export default QualityDeductionsPage;

