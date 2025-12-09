import { useMemo, useState, useCallback, type FC } from "react";
import { Card, Tabs, Table, Tag, Space, Button, Typography, theme, message, Badge, type TableColumnsType } from "antd";
import { CheckOutlined, CloseOutlined, FieldTimeOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import dayjs from "dayjs";

import { useGetShiftRequestsQuery, useApproveShiftRequestMutation, useRejectShiftRequestMutation } from "../../api/shiftRequestApi";
import type { IShiftRequest } from "../../types/shift.types";
import type { IShiftRequestFilters, IShiftRequestListResponse } from "../../types/shiftRequest.types";
import { usePermissions } from "../../hooks/usePermissions";
import { PERMISSIONS } from "../../constants/permissions";
import styles from "../../styles/users/users-page.module.css";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useGetAllGroupsQuery } from "../../api/groupsApi";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { ShiftRequestsFilters } from "../../components/ShiftRequests";

const { Title, Text } = Typography;

type TabKey = "unviewed" | "viewed";

const defaultFilterValues: IShiftRequestFilters = {
  page: 1,
  per_page: 20,
  full_name: "",
  team_id: null as number | null,
  group_id: null as number | null,
  date_from: null as string | null,
  date_to: null as string | null,
  status: undefined as 'pending' | 'approved' | 'rejected' | undefined,
};

const ShiftRequestsPage: FC = () => {
  const { token } = theme.useToken();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabKey>("unviewed");
  const { data: teams } = useGetAllTeamsQuery();
  const { data: groups } = useGetAllGroupsQuery();

  const { filters, setFilters, resetFilters } = useUrlFilters<IShiftRequestFilters>({
    defaults: defaultFilterValues,
    parsers: {
      page: (v: string) => Number(v) || 1,
      per_page: (v: string) => Number(v) || 20,
      team_id: (v: string) => v ? Number(v) : null,
      group_id: (v: string) => v ? Number(v) : null,
      status: (v: string) => (v === 'pending' || v === 'approved' || v === 'rejected') ? v : undefined,
      full_name: (v: string) => v || "",
      date_from: (v: string) => v || null,
      date_to: (v: string) => v || null,
    }
  });

  const canManage = hasPermission(PERMISSIONS.SHIFT_REQUESTS_MANAGE) || hasPermission(PERMISSIONS.SCHEDULE_MANAGE);

  const isViewed = activeTab === "viewed";
  const { data: response, isLoading, isFetching, refetch } = useGetShiftRequestsQuery({
    is_viewed: isViewed,
    status: filters.status,
    page: filters.page,
    per_page: filters.per_page,
    full_name: filters.full_name || undefined,
    team_id: filters.team_id || undefined,
    group_id: filters.group_id || undefined,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
  });

  const requests = (response as IShiftRequestListResponse | undefined)?.data ?? [];
  const meta = (response as IShiftRequestListResponse | undefined)?.meta;
  const counters = meta?.counters ?? { unviewed: 0, viewed: 0 };
  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.full_name ||
        filters.team_id ||
        filters.group_id ||
        filters.status ||
        filters.date_from ||
        filters.date_to
      ),
    [filters],
  );

  const [approveShift, { isLoading: isApproving }] = useApproveShiftRequestMutation();
  const [rejectShift, { isLoading: isRejecting }] = useRejectShiftRequestMutation();

  const handleApprove = useCallback(async (id: number) => {
    try {
      await approveShift(id).unwrap();
      message.success("Смена одобрена");
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Не удалось одобрить смену");
    }
  }, [approveShift, refetch]);

  const handleReject = useCallback(async (id: number) => {
    try {
      await rejectShift(id).unwrap();
      message.success("Смена отклонена");
      refetch();
    } catch (error) {
      console.error(error);
      message.error("Не удалось отклонить смену");
    }
  }, [rejectShift, refetch]);

  const columns: TableColumnsType<IShiftRequest> = useMemo(() => {
    const cols: TableColumnsType<IShiftRequest> = [
      {
        title: "Пользователь",
        dataIndex: "user",
        width: 220,
        fixed: "left",
        render: (_: unknown, record: IShiftRequest) => {
          const initials = record.user?.fullname?.split(" ").map(n => n[0]).join("") || "?";
          return (
            <Link to={`/users/${record.user?.id ?? ""}`}>
              <Space size={8} align="center">
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: 12,
                }}>
                  {initials}
                </div>
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0, textAlign: "left" }}>
                  <Text strong style={{ fontSize: 13, lineHeight: 1.3, whiteSpace: "nowrap" }}>{record.user?.fullname || "—"}</Text>
                  <Text type="secondary" style={{ fontSize: 11, lineHeight: 1.2 }}>ID: {record.user?.id}</Text>
                </div>
              </Space>
            </Link>
          );
        }
      },
      {
        title: "Дата смены",
        width: 140,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => (
          <Text style={{ fontSize: 13 }}>{record.shift?.date ? dayjs(record.shift.date).format("DD.MM.YYYY") : "—"}</Text>
        )
      },
      {
        title: "Часы",
        width: 90,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => (
          <Tag color="blue" style={{ margin: 0 }}>{record.duration}</Tag>
        )
      },
      {
        title: "Кол-во с той же ролью",
        width: 170,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => (
          <Tag color="geekblue" style={{ margin: 0 }}>{record.role_peer_count ?? "—"}</Tag>
        )
      },
      {
        title: "Статус",
        width: 140,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => {
          const statusText = record.status === "approved" ? "Одобрено" : record.status === "rejected" ? "Отклонено" : "Ожидает";
          const statusColor = record.status === "approved" ? "success" : record.status === "rejected" ? "error" : "warning";
          return <Badge status={statusColor as "success" | "warning" | "error"} text={statusText} />;
        }
      },
      {
        title: "Просмотр",
        width: 150,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => {
          const viewedIcon = record.is_viewed ? <EyeOutlined style={{ color: token.colorSuccess }} /> : <EyeInvisibleOutlined style={{ color: token.colorWarning }} />;
          const viewedText = record.is_viewed ? "Просмотрено" : "Не просмотрено";
          return (
            <Space size={6} align="center">
              {viewedIcon}
              <Text style={{ fontSize: 12 }}>{viewedText}</Text>
            </Space>
          );
        }
      },
      {
        title: "Действия",
        width: 220,
        align: "center" as const,
        render: (_: unknown, record: IShiftRequest) => {
          if (record.is_viewed) {
            return <Text type="secondary" style={{ fontSize: 12 }}>Действия недоступны</Text>;
          }

          const disabled = record.status !== "pending" || !canManage;
          return (
            <Space>
              <Button
                type="text"
                icon={<CheckOutlined />}
                size="small"
                disabled={disabled}
                loading={isApproving}
                style={{ color: token.colorSuccess, paddingInline: 4 }}
                onClick={() => handleApprove(record.id)}
              >
              </Button>
              <Button
                type="text"
                icon={<CloseOutlined />}
                size="small"
                disabled={disabled}
                loading={isRejecting}
                onClick={() => handleReject(record.id)}
                danger
                style={{ paddingInline: 4 }}
              >
              </Button>
            </Space>
          );
        }
      }
    ];
    return cols;
  }, [canManage, handleApprove, handleReject, isApproving, isRejecting]);

  const tabItems = [
    { key: "unviewed", label: <> <EyeInvisibleOutlined /> Не просмотрено ({counters.unviewed ?? 0})</> },
    { key: "viewed", label: <> <EyeOutlined /> Просмотрено ({counters.viewed ?? 0})</> },
  ];

  const handleApplyFilters = useCallback(
    (newFilters: IShiftRequestFilters) => {
      setFilters({ ...newFilters, page: 1 });
    },
    [setFilters],
  );

  const handleResetFilters = useCallback(() => {
    setActiveTab("unviewed");
    resetFilters();
  }, [resetFilters]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer} style={{ marginBottom: 12 }}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitleSection}>
            <Title level={3} className={styles.title} style={{ color: token.colorText, marginBottom: 4 }}>
              Запросы смен
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Управление запросами на смены
            </Text>
          </div>
        </div>
      </div>

      <ShiftRequestsFilters
        filters={filters}
        defaults={defaultFilterValues}
        teams={teams}
        groups={groups}
        loading={isFetching}
        hasActiveFilters={hasActiveFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onRefetch={refetch}
      />

      <Card 
        size="small" 
        style={{ background: token.colorBgContainer }} 
        bodyStyle={{ padding: 12 }}
        title={
          <Space size="small">
            <FieldTimeOutlined style={{ fontSize: 14 }} />
            <span style={{ fontSize: 14 }}>Запросы смен</span>
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 11 }}>
            Всего: {meta?.total ?? 0}
          </Text>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={tabItems}
          style={{ marginBottom: 12 }}
        />

        <Table<IShiftRequest>
          rowKey="id"
          dataSource={requests || []}
          columns={columns}
          loading={isLoading || isFetching}
          pagination={{
            current: meta?.current_page,
            pageSize: meta?.per_page,
            total: meta?.total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (page, pageSize) => setFilters({ ...filters, page, per_page: pageSize }),
          }}
          size="small"
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default ShiftRequestsPage;

