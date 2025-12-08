import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import {
  Card,
  Table,
  Tag,
  Space,
  Typography,
  theme,
  Button,
  Input,
  DatePicker,
  Flex,
  Progress,
  Tooltip,
  type TableColumnsType,
} from "antd";
import {
  TeamOutlined,
  ApartmentOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  FileTextOutlined,
  WarningOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useGetTeamStatsQuery } from "../../api/teamsApi";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import type { ITeamStats, ITeamStatsFilters } from "../../types/team.types";
import styles from "../../styles/users/users-page.module.css";

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const defaultFilters: ITeamStatsFilters = {
  search: undefined,
  date_from: undefined,
  date_to: undefined,
  page: 1,
  per_page: 10,
};

const filterParsers = {
  page: (val: string) => Number(val) || 1,
  per_page: (val: string) => Number(val) || 10,
};

const TeamsStatsPage: FC = () => {
  const { token } = theme.useToken();

  const { filters: urlFilters, setFilters } =
    useUrlFilters<ITeamStatsFilters>({
      defaults: defaultFilters,
      parsers: filterParsers,
    });

  const [localFilters, setLocalFilters] = useState<ITeamStatsFilters>(urlFilters);

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

  const { data: response, isLoading, isFetching, refetch } =
    useGetTeamStatsQuery(normalizedFilters);

  const data = response?.data || [];
  const meta = response?.meta;

  const handleApplyFilters = useCallback(() => {
    setFilters({ ...localFilters, page: 1 });
  }, [localFilters, setFilters]);

  const handleDateChange = useCallback(
    (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      setLocalFilters((prev) => ({
        ...prev,
        date_from: dates?.[0]?.format("YYYY-MM-DD") || undefined,
        date_to: dates?.[1]?.format("YYYY-MM-DD") || undefined,
      }));
    },
    []
  );

  const handleTableChange = useCallback(
    (pagination: { current: number; pageSize: number }) => {
      setFilters({ page: pagination.current, per_page: Math.min(pagination.pageSize, 100) });
    },
    [setFilters]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(urlFilters.search || urlFilters.date_from || urlFilters.date_to);
  }, [urlFilters]);

  const getQualityLinkByTeam = useCallback(
    (teamId: number) => {
      const params = new URLSearchParams();
      params.set("team_id", String(teamId));
      if (urlFilters.date_from) params.set("date_from", String(urlFilters.date_from));
      if (urlFilters.date_to) params.set("date_to", String(urlFilters.date_to));
      return `/quality?${params.toString()}`;
    },
    [urlFilters.date_from, urlFilters.date_to]
  );

  const getQualityLinkByGroup = useCallback(
    (groupId: number) => {
      const params = new URLSearchParams();
      params.set("group_id", String(groupId));
      if (urlFilters.date_from) params.set("date_from", String(urlFilters.date_from));
      if (urlFilters.date_to) params.set("date_to", String(urlFilters.date_to));
      return `/quality?${params.toString()}`;
    },
    [urlFilters.date_from, urlFilters.date_to]
  );

  const getPenaltiesLinkByGroup = useCallback((groupId: number) => {
    const params = new URLSearchParams();
    params.set("group_id", String(groupId));
    params.set("status", "approved");
    return `/penalties?${params.toString()}`;
  }, []);

  const groupColumns: TableColumnsType<NonNullable<ITeamStats["groups"]["items"]>[number]> =
    useMemo(
      () => [
        {
          title: "Группа",
          key: "group",
          width: 200,
          render: (_, group) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #5b86e5 0%, #36d1dc 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                  flexShrink: 0,
                }}
              >
                <ApartmentOutlined />
              </div>
              <div style={{ minWidth: 0 }}>
                <Text strong style={{ fontSize: 12, display: "block", lineHeight: 1.3 }}>
                  {group.name}
                </Text>
                {group.supervisor && (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {group.supervisor.full_name}
                  </Text>
                )}
              </div>
            </div>
          ),
        },
        {
          title: "Смена",
          key: "shift",
          width: 130,
          align: "center",
          render: (_, group) => (
            <Space size={4}>
              {group.shift?.type && (
                <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>
                  {group.shift.type}
                </Tag>
              )}
              {group.shift?.number && (
                <Tag color="geekblue" style={{ margin: 0, fontSize: 11 }}>
                  {group.shift.number}
                </Tag>
              )}
            </Space>
          ),
        },
        {
          title: "Сотрудников",
          key: "users_count",
          width: 110,
          align: "center",
          render: (_, group) => (
            <Tag icon={<UserOutlined />} color="blue" style={{ margin: 0, fontSize: 11 }}>
              {group.users.count}
            </Tag>
          ),
        },
        {
          title: "Качество",
          key: "quality",
          width: 140,
          align: "center",
          render: (_, group) =>
            group.quality.avg !== null ? (
              <Tooltip title={`Проверок: ${group.quality.checks_count}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                  <Progress
                    type="circle"
                    percent={group.quality.avg ?? 0}
                    size={24}
                    strokeWidth={8}
                    strokeColor={
                      (group.quality.avg ?? 0) >= 90
                        ? token.colorSuccess
                        : (group.quality.avg ?? 0) >= 70
                          ? token.colorWarning
                          : token.colorError
                    }
                    format={() => null}
                  />
                  <Text strong style={{ fontSize: 12 }}>
                    {group.quality.avg}%
                  </Text>
                </div>
              </Tooltip>
            ) : (
              <Text type="secondary" style={{ fontSize: 12 }}>
                —
              </Text>
            ),
        },
        {
          title: "Проверок",
          key: "checks",
          width: 100,
          align: "center",
          render: (_, group) => (
            <Link to={getQualityLinkByGroup(group.id)}>
              <Tooltip title="Показать карты качества группы">
                <Tag
                  icon={<FileTextOutlined />}
                  color={group.quality.checks_count > 0 ? "cyan" : "default"}
                  style={{ margin: 0, fontSize: 11, cursor: "pointer" }}
                >
                  {group.quality.checks_count}
                </Tag>
              </Tooltip>
            </Link>
          ),
        },
        {
          title: "Штрафы (часы)",
          key: "penalties_hours",
          width: 120,
          align: "center",
          render: (_, group) => (
            <Tag
              icon={<FieldTimeOutlined />}
              color={group.penalties.hours > 0 ? "volcano" : "default"}
              style={{ margin: 0, fontSize: 11 }}
            >
              {group.penalties.hours}
            </Tag>
          ),
        },
        {
          title: "Штрафы (шт)",
          key: "penalties_count",
          width: 110,
          align: "center",
          render: (_, group) => (
            <Link to={getPenaltiesLinkByGroup(group.id)}>
              <Tooltip title="Показать штрафы группы">
                <Tag
                  icon={<WarningOutlined />}
                  color={group.penalties.count > 0 ? "red" : "default"}
                  style={{ margin: 0, fontSize: 11, cursor: "pointer" }}
                >
                  {group.penalties.count}
                </Tag>
              </Tooltip>
            </Link>
          ),
        },
      ],
      [getPenaltiesLinkByGroup, getQualityLinkByGroup, token.colorError, token.colorSuccess, token.colorWarning]
    );

  const columns: TableColumnsType<ITeamStats> = useMemo(
    () => [
      {
        title: "Команда",
        key: "team",
        width: 220,
        fixed: "left",
        render: (_, team) => (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 14,
                fontWeight: "bold",
                flexShrink: 0,
              }}
            >
              <TeamOutlined />
            </div>
            <div style={{ minWidth: 0 }}>
              <Text strong style={{ fontSize: 13, display: "block", lineHeight: 1.3 }}>
                {team.name}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                ID: {team.id}
              </Text>
            </div>
          </div>
        ),
      },
      {
        title: "Групп",
        key: "groups",
        width: 100,
        align: "center",
        render: (_, team) => (
          <Tag icon={<ApartmentOutlined />} color="blue" style={{ margin: 0, fontSize: 12 }}>
            {team.groups.count}
          </Tag>
        ),
      },
      {
        title: "Сотрудников",
        key: "users",
        width: 120,
        align: "center",
        render: (_, team) => (
          <Tag icon={<UserOutlined />} color="geekblue" style={{ margin: 0, fontSize: 12 }}>
            {team.users.count}
          </Tag>
        ),
      },
      {
        title: "Качество",
        key: "quality",
        width: 150,
        align: "center",
        render: (_, team) =>
          team.quality.avg !== null ? (
            <Tooltip title={`Проверок: ${team.quality.checks_count}`}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                <Progress
                  type="circle"
                  percent={team.quality.avg ?? 0}
                  size={28}
                  strokeWidth={8}
                  strokeColor={
                    (team.quality.avg ?? 0) >= 90
                      ? token.colorSuccess
                      : (team.quality.avg ?? 0) >= 70
                        ? token.colorWarning
                        : token.colorError
                  }
                  format={() => null}
                />
                <Text strong style={{ fontSize: 12 }}>
                  {team.quality.avg}%
                </Text>
              </div>
            </Tooltip>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              —
            </Text>
          ),
      },
      {
        title: "Проверок",
        key: "checks",
        width: 110,
        align: "center",
        render: (_, team) => (
          <Link to={getQualityLinkByTeam(team.id)}>
            <Tooltip title="Показать карты качества команды">
              <Tag
                icon={<FileTextOutlined />}
                color={team.quality.checks_count > 0 ? "cyan" : "default"}
                style={{ margin: 0, fontSize: 12, cursor: "pointer" }}
              >
                {team.quality.checks_count}
              </Tag>
            </Tooltip>
          </Link>
        ),
      },
      {
        title: "Штрафы (часы)",
        key: "penalties_hours",
        width: 130,
        align: "center",
        render: (_, team) => (
          <Tag
            icon={<FieldTimeOutlined />}
            color={team.penalties.hours > 0 ? "volcano" : "default"}
            style={{ margin: 0, fontSize: 12 }}
          >
            {team.penalties.hours ?? 0}
          </Tag>
        ),
      },
      {
        title: "Штрафы (шт)",
        key: "penalties_count",
        width: 120,
        align: "center",
        render: (_, team) => (
          <Tag
            icon={<WarningOutlined />}
            color={team.penalties.count > 0 ? "red" : "default"}
            style={{ margin: 0, fontSize: 12 }}
          >
            {team.penalties.count ?? 0}
          </Tag>
        ),
      },
    ],
    [getQualityLinkByTeam, token.colorError, token.colorSuccess, token.colorWarning]
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <Title level={3} className={styles.title} style={{ color: token.colorText, marginBottom: 4 }}>
              <TeamOutlined style={{ color: token.colorPrimary }} /> Статистика по командам
            </Title>
            <Text type="secondary" className={styles.description} style={{ fontSize: 12 }}>
              Сводные показатели качества и штрафов по командам
            </Text>
          </div>
        </div>
      </div>

      <Card
        size="small"
        style={{
          marginBottom: 12,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: 12 }}
      >
        <Flex justify="space-between" align="center" gap={16} wrap>
          <Flex gap={16} align="center" style={{ flex: 1 }} wrap>
            <Input
              placeholder="Название команды"
              allowClear
              size="middle"
              style={{ width: 260, minWidth: 180 }}
              value={localFilters.search || ""}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value || undefined }))}
              prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
            />
            <RangePicker
              value={[localFilters.date_from ? dayjs(localFilters.date_from) : null, localFilters.date_to ? dayjs(localFilters.date_to) : null]}
              onChange={handleDateChange}
              size="middle"
              style={{ width: 240, minWidth: 200 }}
              placeholder={["От", "До"]}
              format="DD.MM.YY"
            />
          </Flex>
          <Space>
            <Button type="primary" icon={<CheckOutlined />} onClick={handleApplyFilters} loading={isFetching} size="middle">
              Применить
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} size="middle">
              Обновить
            </Button>
          </Space>
        </Flex>
      </Card>

      <Card
        size="small"
        title={
          <Space size="small">
            <TeamOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Статистика команд</span>
            {hasActiveFilters && <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>Фильтры активны</Tag>}
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            {isFetching ? "Загрузка..." : `Всего: ${meta?.total || 0}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
        bodyStyle={{ padding: 12 }}
      >
        <Table<ITeamStats>
          size="small"
          dataSource={data}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          scroll={{ x: "max-content" }}
          pagination={{
            current: meta?.current_page || 1,
            pageSize: meta?.per_page || 10,
            total: meta?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ["10", "20", "50", "100"],
            responsive: true,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize }),
            onShowSizeChange: (_, size) => handleTableChange({ current: 1, pageSize: size }),
          }}
          expandable={{
            rowExpandable: (record) => (record.groups.items?.length || 0) > 0,
            expandedRowRender: (record) => (
              <Table
                size="small"
                dataSource={record.groups.items || []}
                columns={groupColumns}
                pagination={false}
                rowKey="id"
                scroll={{ x: "max-content" }}
                style={{ marginLeft: 48 }}
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default TeamsStatsPage;

