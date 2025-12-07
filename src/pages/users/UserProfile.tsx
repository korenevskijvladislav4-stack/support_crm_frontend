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
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
  WarningOutlined,
  MessageOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { UserProfileHeader, UserProfileInfo } from "../../components/Users";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useGetUserFullQuery,
  useDeactivateUserMutation,
  useAddUserProfileCommentMutation,
} from "../../api/usersApi";
import { skipToken } from "@reduxjs/toolkit/query";

const { Text } = Typography;

const UserProfile: FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id) : null;

  const { data: profile, isLoading, refetch } = useGetUserFullQuery(id ?? skipToken);
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();
  const [addComment, { isLoading: isAddingComment }] = useAddUserProfileCommentMutation();
  const [newComment, setNewComment] = useState("");

  const currentMonthLabel = useMemo(() => {
    const date = new Date();
    const label = date.toLocaleString("ru-RU", { month: "long", year: "numeric" });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, []);

  const user = profile;
  const deductions = useMemo(() => user?.deductions || [], [user]);
  const penalties = user?.penalties;
  const schedule = user?.schedule;
  const comments = user?.comments || [];
  const penaltiesList = user?.penalties_list || [];
  const qualityMaps = user?.quality_maps || [];

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
            onDeactivate={async () => {
              if (!userId) return;
              try {
                await deactivateUser(userId).unwrap();
                message.success("Пользователь успешно деактивирован");
                navigate("/users");
              } catch {
                message.error("Ошибка при деактивации пользователя");
              }
            }}
            isDeactivating={isDeactivating}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <UserProfileInfo user={user} />

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
                <Flex align="center" gap={8} style={{ color: token.colorTextTertiary, fontSize: 12 }}>
                  <FieldTimeOutlined />
                  <Text type="secondary">Месяц: {currentMonthLabel}</Text>
                </Flex>
                <Flex gap={12} wrap>
                  <Statistic title="Смен" value={schedule?.current_month_shifts ?? 0} suffix="шт" />
                  <Statistic title="Часы за месяц" value={schedule?.current_month_hours ?? 0} suffix="ч" />
                  <Statistic title="Часы всего" value={schedule?.total_hours ?? 0} suffix="ч" />
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
                <Statistic title="Штрафы (шт)" value={penalties?.count ?? 0} suffix="шт" />
                <Statistic title="Штрафы (часы)" value={penalties?.hours ?? 0} suffix="ч" />
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

            <Card
              size="small"
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                  Карты качества
                </span>
              }
              extra={
                <Button type="link" size="small" onClick={() => navigate(`/quality?user_id=${userId || ""}`)}>
                  Открыть все
                </Button>
              }
            >
              {qualityMaps.length > 0 ? (
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  {qualityMaps.map((map) => (
                    <Card key={map.id} size="small" style={{ borderColor: token.colorBorderSecondary }}>
                      <Flex justify="space-between" align="center">
                        <div>
                          <Text strong>Период</Text>
                          <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                            {map.period?.start || "—"} — {map.period?.end || "—"}
                          </div>
                        </div>
                        <Tag color={map.status === "completed" ? "success" : "processing"} style={{ margin: 0 }}>
                          {map.status === "completed" ? "Завершена" : "Активна"}
                        </Tag>
                      </Flex>
                      <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>Средний балл</Text>
                        <Tag color={map.score >= 90 ? "green" : map.score >= 70 ? "orange" : "red"} style={{ margin: 0 }}>
                          {map.score}%
                        </Tag>
                      </Flex>
                      <div style={{ marginTop: 8 }}>
                        <Link to={`/quality/${map.id}`}>Открыть карту</Link>
                      </div>
                    </Card>
                  ))}
                </Space>
              ) : (
                <Empty description="Нет карт качества" />
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;

