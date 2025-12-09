import { useState, useCallback, useMemo, type FC } from "react";
import {
  Button,
  Card,
  Flex,
  Spin,
  Statistic,
  Row,
  Col,
  Typography,
  Tag,
  Empty,
  theme,
  message,
  Space,
  Input,
  Table,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
  WarningOutlined,
  MessageOutlined,
  PlusCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { UserProfileHeader, UserProfileInfo } from "../../components/Users";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetUserFullQuery,
  useDeactivateUserMutation,
  useActivateUserMutation,
  useAddUserProfileCommentMutation,
} from "../../api/usersApi";
import { useGetQualityMapsQuery } from "../../api/qualityApi";
import { skipToken } from "@reduxjs/toolkit/query";
import type { TableColumnsType } from "antd";
import type { IQualityMapListItem } from "../../types/quality.types";
import { formatDate } from "../../utils/dateUtils";

const { Text } = Typography;

const UserProfile: FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id) : null;

  const { data: profile, isLoading, refetch } = useGetUserFullQuery(id ?? skipToken);
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddUserProfileCommentMutation();
  const [newComment, setNewComment] = useState("");
  const [mapsPage, setMapsPage] = useState({ page: 1, per_page: 3 });

  const {
    data: qualityMapsResponse,
    isFetching: isQualityMapsLoading,
  } = useGetQualityMapsQuery(
    userId
      ? {
          user_id: userId,
          page: mapsPage.page,
          per_page: mapsPage.per_page,
        }
      : skipToken
  );

  const currentMonthLabel = useMemo(() => {
    const date = new Date();
    const label = date.toLocaleString("ru-RU", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, []);

  const user = profile;
  const isDeactivated = user?.status === "deactivated";
  const deductions = useMemo(() => user?.deductions || [], [user]);
  const penalties = user?.penalties;
  const schedule = user?.schedule;
  const comments = user?.comments || [];
  const qualityMaps = qualityMapsResponse?.data || [];
  const qualityMeta = qualityMapsResponse?.meta;
  const penaltiesList = user?.penalties_list || [];

  const handleAddComment = useCallback(async () => {
    if (!userId || !newComment.trim()) return;
    try {
      await addComment({ userId, comment: newComment.trim() }).unwrap();
      setNewComment("");
      message.success("Комментарий добавлен");
      refetch();
    } catch {
      message.error("Не удалось добавить комментарий");
    }
  }, [addComment, newComment, userId, refetch]);

  const handleChangeStatus = useCallback(async () => {
    if (!userId) return;
    try {
      if (isDeactivated) {
        await activateUser(userId).unwrap();
        message.success("Пользователь успешно активирован");
      } else {
        await deactivateUser(userId).unwrap();
        message.success("Пользователь успешно деактивирован");
      }
      navigate("/users");
    } catch {
      message.error(isDeactivated ? "Ошибка при активации пользователя" : "Ошибка при деактивации пользователя");
    }
  }, [activateUser, deactivateUser, isDeactivated, navigate, userId]);

  const getScoreColor = useCallback((score: number) => {
    if (score >= 90) return "#52c41a";
    if (score >= 80) return "#73d13d";
    if (score >= 70) return "#95de64";
    if (score >= 60) return "#bae637";
    if (score >= 50) return "#ffec3d";
    if (score >= 40) return "#ffc53d";
    if (score >= 30) return "#ffa940";
    if (score >= 20) return "#ff7a45";
    if (score >= 10) return "#ff4d4f";
    return "#cf1322";
  }, []);

  const qualityColumns: TableColumnsType<IQualityMapListItem> = useMemo(
    () => [
      {
        title: "Период проверки",
        key: "period",
        align: "center",
        width: 180,
        render: (_: unknown, record) => (
          <Text style={{ fontSize: 13 }}>
            {formatDate(record.period.start)} - {formatDate(record.period.end)}
          </Text>
        ),
      },
      {
        title: "Проверяющий",
        dataIndex: "checker",
        key: "checker",
        align: "center",
        width: 180,
        render: (_: unknown, record) => {
          const fullName = `${record.checker.name}${record.checker.surname ? ` ${record.checker.surname}` : ""}`;
          return (
            <Flex align="center" justify="center" gap={6}>
              <FileTextOutlined style={{ color: token.colorPrimary }} />
              <Text style={{ fontSize: 13 }}>{fullName}</Text>
            </Flex>
          );
        },
      },
      {
        title: "Статус",
        key: "status",
        align: "center",
        width: 130,
        render: (_: unknown, record) => (
          <Tag
            color={record.status === "active" ? "processing" : "success"}
            style={{ fontSize: 12, margin: 0 }}
          >
            {record.status === "active" ? "Активна" : "Завершена"}
          </Tag>
        ),
      },
      {
        title: "Проверено",
        key: "checked",
        align: "center",
        width: 150,
        render: (_: unknown, record) => (
          <Space direction="vertical" size={2} style={{ margin: 0 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Чаты:{" "}
              </Text>
              <Text strong style={{ fontSize: 12 }}>
                {record.progress.chats.checked}/{record.progress.chats.total}
              </Text>
            </div>
            {record.progress.calls.total > 0 && (
              <div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Звонки:{" "}
                </Text>
                <Text strong style={{ fontSize: 12 }}>
                  {record.progress.calls.checked}/{record.progress.calls.total}
                </Text>
              </div>
            )}
          </Space>
        ),
      },
      {
        title: "Оценка",
        dataIndex: "score",
        key: "score",
        align: "center",
        width: 90,
        render: (score: number) => (
          <Tag
            color={getScoreColor(score)}
            style={{
              margin: 0,
              fontSize: 11,
              padding: "2px 8px",
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
        title: "Действия",
        key: "actions",
        align: "center",
        width: 110,
        render: (_: unknown, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/quality/${record.id}`)}
            style={{ paddingInline: 4 }}
          >
            Открыть
          </Button>
        ),
      },
    ],
    [getScoreColor, navigate, token.colorPrimary]
  );

  if (isLoading) {
    return (
      <Flex vertical gap={10} justify="center" align="center" style={{ height: "100vh" }}>
        <Spin size="large" />
        <Text type="secondary">Загрузка профиля пользователя...</Text>
      </Flex>
    );
  }

  return (
    <div style={{ padding: "clamp(12px, 2vw, 24px)", maxWidth: "100%", margin: "0 auto" }}>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <UserProfileHeader
            user={user}
            userId={userId}
            onChangeStatus={handleChangeStatus}
            isChangingStatus={isDeactivating || isActivating}
            isDeactivated={!!isDeactivated}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <UserProfileInfo user={user} />

            <Card
              size="small"
              title={
                <Space align="center">
                  <FileTextOutlined style={{ color: token.colorPrimary }} />
                  <span>Карты качества</span>
                </Space>
              }
              bodyStyle={{ padding: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <Table<IQualityMapListItem>
                columns={qualityColumns}
                dataSource={qualityMaps}
                rowKey="id"
                size="small"
                loading={isQualityMapsLoading}
                pagination={{
                  current: mapsPage.page,
                  pageSize: mapsPage.per_page,
                  total: qualityMeta?.total,
                  pageSizeOptions: [3, 5, 10],
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (page, pageSize) => setMapsPage({ page, per_page: pageSize || 10 }),
                  showTotal: (total, range) => `Показано ${range[0]}-${range[1]} из ${total}`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>

            {/* Комментарии под основной информацией */}
            <Card
              size="small"
              title={
                <span>
                  <MessageOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                  Комментарии
                </span>
              }
              extra={
                <Space>
                  <Input.TextArea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Оставьте комментарий..."
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    maxLength={1000}
                    style={{ width: 420, background: token.colorFillTertiary }}
                  />
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    loading={isAddingComment}
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                  >
                    Добавить
                  </Button>
                </Space>
              }
              bodyStyle={{ paddingTop: 12 }}
            >
              {comments.length > 0 ? (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {comments.map((comment) => (
                    <Card key={comment.id} size="small" style={{ borderColor: token.colorBorderSecondary }}>
                      <Flex justify="space-between" align="center">
                        <Text strong>
                          {comment.author?.full_name || `${comment.author?.name || ""} ${comment.author?.surname || ""}`}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {comment.created_at?.slice(0, 16).replace("T", " ")}
                        </Text>
                      </Flex>
                      <div style={{ marginTop: 8, fontSize: 13 }}>{comment.comment}</div>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="Комментариев нет" />
              )}
            </Card>
          </Space>
        </Col>

        {/* Сайдбар справа */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card
              size="small"
              title={
                <span>
                  <ClockCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                  График за месяц
                </span>
              }
              extra={
                <Button type="link" size="small" onClick={() => navigate(`/schedule`)}>
                  Открыть график
                </Button>
              }
            >
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Flex align="center" gap={8} wrap>
                  <FieldTimeOutlined style={{ color: token.colorTextTertiary }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>Текущий месяц</Text>
                  <Tag color="blue" style={{ margin: 0 }}>{currentMonthLabel}</Tag>
                </Flex>

                <Flex gap={12} wrap>
                  <Card
                    size="small"
                    bordered
                    style={{ flex: '1 1 140px', minWidth: 140, background: token.colorFillSecondary }}
                    bodyStyle={{ padding: 12, textAlign: 'center' }}
                  >
                    <Statistic
                      title="Смен в месяц"
                      value={schedule?.current_month_shifts ?? 0}
                      suffix="шт"
                      valueStyle={{ color: token.colorText }}
                    />
                  </Card>
                  <Card
                    size="small"
                    bordered
                    style={{ flex: '1 1 160px', minWidth: 160, background: token.colorFillSecondary }}
                    bodyStyle={{ padding: 12, textAlign: 'center' }}
                  >
                    <Statistic
                      title="Часы за месяц"
                      value={schedule?.current_month_hours ?? 0}
                      suffix="ч"
                      valueStyle={{ color: token.colorPrimary }}
                    />
                  </Card>
                  <Card
                    size="small"
                    bordered
                    style={{ flex: '1 1 160px', minWidth: 160, background: token.colorFillSecondary }}
                    bodyStyle={{ padding: 12, textAlign: 'center' }}
                  >
                    <Statistic
                      title="Часы всего"
                      value={schedule?.total_hours ?? 0}
                      suffix="ч"
                      valueStyle={{ color: token.colorText }}
                    />
                  </Card>
                  <Card
                    size="small"
                    bordered
                    style={{ flex: '1 1 160px', minWidth: 160, background: token.colorFillSecondary }}
                    bodyStyle={{ padding: 12, textAlign: 'center' }}
                  >
                    <Statistic
                      title="Смен всего"
                      value={schedule?.total_shifts ?? 0}
                      suffix="шт"
                      valueStyle={{ color: token.colorText }}
                    />
                  </Card>
                </Flex>
              </Space>
            </Card>

            <Card
              size="small"
              title={
                <span>
                  <WarningOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                  Штрафы
                </span>
              }
              extra={
                <Button type="link" size="small" onClick={() => navigate(`/penalties?user_id=${userId || ""}`)}>
                  Все штрафы
                </Button>
              }
            >
              <Flex gap={12} wrap>
                <Card
                  size="small"
                  bordered
                  style={{ flex: '1 1 160px', minWidth: 150, background: token.colorFillSecondary }}
                  bodyStyle={{ padding: 12, textAlign: 'center' }}
                >
                  <Statistic
                    title="Штрафы (шт)"
                    value={penalties?.count ?? 0}
                    suffix="шт"
                    valueStyle={{ color: token.colorText }}
                  />
                </Card>
                <Card
                  size="small"
                  bordered
                  style={{ flex: '1 1 180px', minWidth: 160, background: token.colorFillSecondary }}
                  bodyStyle={{ padding: 12, textAlign: 'center' }}
                >
                  <Statistic
                    title="Штрафы (часы)"
                    value={penalties?.hours ?? 0}
                    suffix="ч"
                    valueStyle={{ color: token.colorError }}
                  />
                </Card>
              </Flex>
              <div style={{ marginTop: 12 }}>
                {penaltiesList.length > 0 ? (
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    {penaltiesList.map((p) => (
                      <Card key={p.id} size="small" style={{ borderColor: token.colorBorderSecondary }}>
                        <Flex justify="space-between" align="center">
                          <Text strong style={{ fontSize: 12 }}>
                            {p.violation_date?.slice(0, 10) || "—"}
                          </Text>
                          <Tag color={p.status === "approved" ? "green" : p.status === "pending" ? "orange" : "red"} style={{ margin: 0 }}>
                            {p.status}
                          </Tag>
                        </Flex>
                        <Flex justify="space-between" align="center" style={{ marginTop: 4 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Часы к снятию</Text>
                          <Tag color="volcano" style={{ margin: 0, fontSize: 12 }}>
                            {p.hours_to_deduct ?? 0} ч
                          </Tag>
                        </Flex>
                      </Card>
                    ))}
                  </Space>
                ) : (
                  <Empty description="Нет штрафов" />
                )}
              </div>
            </Card>

            <Card
              size="small"
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                  Снятия по критериям
                </span>
              }
            >
              {deductions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deductions.map((item) => (
                    <Flex
                      key={item.criterion.id}
                      align="center"
                      justify="space-between"
                      style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: 6, padding: 10 }}
                    >
                      <div>
                        <Text strong>{item.criterion.name || "Критерий"}</Text>
                      </div>
                      <Space size={8}>
                        <Tag icon={<FieldTimeOutlined />} color="volcano" style={{ margin: 0, fontSize: 12 }}>
                          {item.total_deduction} б.
                        </Tag>
                        <Tag icon={<CheckCircleOutlined />} color="blue" style={{ margin: 0, fontSize: 12 }}>
                          {item.count} шт
                        </Tag>
                      </Space>
                    </Flex>
                  ))}
                </div>
              ) : (
                <Empty description="Нет данных по снятиям" />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;

