import { useState } from "react";
import { 
  Button, 
  Card, 
  Flex, 
  Spin, 
  Statistic,
  Row,
  Col,
  List,
  Avatar,
  Timeline,
  Typography,
  Tag,
  Empty,
  theme,
  message
} from "antd";
import type { FC } from "react"
import {
  CheckCircleOutlined,
  FireOutlined,
  StarOutlined,
  TrophyOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  EyeOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { UserProfileHeader, UserProfileInfo, UserProfileStats, UserProfileSkills } from '../../components/Users';
import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetShowUserQuery, useDeactivateUserMutation } from "../../api/usersApi";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetQualityMapsQuery } from "../../api/qualityApi";
import { useGetScheduleQuery } from "../../api/scheduleApi";
import { formatDate } from "../../utils/dateUtils";
import dayjs from "dayjs";

const { Text } = Typography;

const UserProfile: FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id) : null;
  const { data: user, isLoading } = useGetShowUserQuery(id ?? skipToken);
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();
  
  // Получаем карточки качества пользователя
  const { data: qualityMapsResponse, isLoading: isLoadingQualityMaps } = useGetQualityMapsQuery(
    { 
      user_id: userId ?? undefined,
      per_page: 5,
      sort_direction: 'desc',
      sort_field: 'created_at'
    },
    { skip: !userId }
  );
  const qualityMaps = qualityMapsResponse?.data || [];

  // Получаем график пользователя
  const currentDate = new Date();
  const { data: schedule, isLoading: isLoadingSchedule } = useGetScheduleQuery(
    {
      month: currentDate.toISOString().slice(0, 7),
      team_id: user?.team_id || null,
      shift_type: "День",
    },
    { skip: !user?.team_id || !userId }
  );

  // Вычисляем статистику по графику
  const userShifts = schedule?.groups
    ?.flatMap(group => group.users || [])
    ?.find(u => u.id === userId)?.shifts || [];
  
  const totalHours = userShifts.reduce((sum, shift) => sum + (shift.duration || 0), 0);
  const totalShifts = userShifts.length;
  
  // Проверяем, есть ли график вообще (даже если у пользователя нет смен)
  const hasSchedule = schedule && schedule.groups && schedule.groups.length > 0;
  
  // Фальшивые данные для демонстрации
  const [userStats] = useState({
    qualityScore: 87,
    completedTasks: 142,
    avgResponseTime: '2.4 мин',
    satisfactionRate: 94,
    workedHours: '1,240',
    currentStreak: 12
  });

  const [recentActivities] = useState([
    { time: '2024-01-15 14:30', action: 'Завершил проверку качества', status: 'success' },
    { time: '2024-01-15 11:20', action: 'Обновил личные данные', status: 'info' },
    { time: '2024-01-14 16:45', action: 'Прошел обучение', status: 'success' },
    { time: '2024-01-14 09:15', action: 'Начал новую смену', status: 'processing' },
  ]);

  const [skills] = useState([
    { name: 'Коммуникация', level: 90 },
    { name: 'Технические знания', level: 85 },
    { name: 'Решение проблем', level: 88 },
    { name: 'Работа в команде', level: 92 },
  ]);


  if (isLoading) {
    return (
      <Flex vertical gap={10} justify="center" align="center" style={{ height: '100vh' }}>
        <Spin size="large" />
        <Text type="secondary">Загрузка профиля пользователя...</Text>
      </Flex>
    );
  }

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <UserProfileHeader
            user={user}
            userId={userId}
            onDeactivate={async () => {
              if (!userId) return;
              try {
                await deactivateUser(userId).unwrap();
                message.success('Пользователь успешно деактивирован');
                navigate('/users');
              } catch {
                message.error('Ошибка при деактивации пользователя');
              }
            }}
            isDeactivating={isDeactivating}
          />
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <UserProfileInfo user={user} />

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <UserProfileStats
                qualityScore={userStats.qualityScore}
                satisfactionRate={userStats.satisfactionRate}
                avgResponseTime={userStats.avgResponseTime}
              />
            </Col>

            <Col xs={24} lg={12}>
              <UserProfileSkills skills={skills} />
            </Col>
          </Row>
        </Col>

        {/* Боковая панель */}
        <Col xs={24} lg={8}>
          {/* Карточки качества */}
          <Card 
            title={
              <span>
                <FileTextOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                Карточки качества
              </span>
            }
            style={{ marginBottom: 24 }}
            loading={isLoadingQualityMaps}
          >
            {qualityMaps.length > 0 ? (
              <List
                dataSource={qualityMaps}
                size="small"
                renderItem={(qualityMap) => {
                  // Используем total_score из API
                  const finalScore = qualityMap.total_score ?? 0;
                  
                  const getScoreColor = (score: number) => {
                    if (score >= 90) return token.colorSuccess;
                    if (score >= 70) return token.colorWarning;
                    return token.colorError;
                  };

                  return (
                    <List.Item
                      style={{
                        padding: '12px',
                        marginBottom: 8,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: 6,
                        backgroundColor: token.colorBgContainer,
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = token.colorFillTertiary;
                        e.currentTarget.style.borderColor = token.colorPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = token.colorBgContainer;
                        e.currentTarget.style.borderColor = token.colorBorderSecondary;
                      }}
                    >
                      <Link to={`/quality/${qualityMap.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                        <Flex vertical gap={8} style={{ width: '100%' }}>
                          <Flex justify="space-between" align="center">
                            <Text strong style={{ fontSize: 13, color: token.colorText }}>
                              Карта #{qualityMap.id}
                            </Text>
                            <Tag 
                              color={qualityMap.status === 'completed' ? 'success' : 'processing'}
                              style={{ margin: 0 }}
                            >
                              {qualityMap.status === 'completed' ? 'Завершена' : 'Активна'}
                            </Tag>
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              <CalendarOutlined style={{ marginRight: 4 }} />
                              {formatDate(qualityMap.start_date)} - {formatDate(qualityMap.end_date)}
                            </Text>
                          </Flex>
                          
                          <Flex justify="space-between" align="center">
                            <Flex align="center" gap={4}>
                              <BarChartOutlined style={{ fontSize: 12, color: getScoreColor(finalScore) }} />
                              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                                Оценка:
                              </Text>
                              <Text strong style={{ fontSize: 14, color: getScoreColor(finalScore) }}>
                                {finalScore}%
                              </Text>
                            </Flex>
                            <Button 
                              type="link" 
                              size="small" 
                              icon={<EyeOutlined />}
                              style={{ padding: 0, height: 'auto' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Просмотр
                            </Button>
                          </Flex>
                        </Flex>
                      </Link>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty 
                description="Нет карточек качества" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            )}
          </Card>

          {/* График работы */}
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: 8, color: token.colorPrimary }} />
                График работы
              </span>
            }
            style={{ marginBottom: 24 }}
            loading={isLoadingSchedule}
          >
            {!user?.team_id ? (
              <Empty 
                description="У пользователя не указана команда" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            ) : hasSchedule ? (
              <Flex vertical gap={12}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Всего смен"
                      value={totalShifts}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ color: token.colorPrimary, fontSize: 20 }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Часов работы"
                      value={totalHours}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: token.colorSuccess, fontSize: 20 }}
                    />
                  </Col>
                </Row>
                
                <div style={{ 
                  padding: '12px',
                  backgroundColor: token.colorFillTertiary,
                  borderRadius: 6,
                  border: `1px solid ${token.colorBorderSecondary}`
                }}>
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Период: {dayjs(currentDate.toISOString().slice(0, 7)).format('MMMM YYYY')}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Тип смен: День
                  </Text>
                </div>

                <Link to="/schedule">
                  <Button type="primary" block icon={<EyeOutlined />}>
                    Посмотреть график
                  </Button>
                </Link>
              </Flex>
            ) : (
              <Empty 
                description="График не сформирован" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '20px 0' }}
              />
            )}
          </Card>

          {/* Статистика в цифрах */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Statistic
                  title="Выполнено задач"
                  value={userStats.completedTasks}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title="Часов работы"
                  value={userStats.workedHours}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title="Текущая серия"
                  value={userStats.currentStreak}
                  suffix="дней"
                  prefix={<FireOutlined />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={12}>
                <Statistic
                  title="Рейтинг"
                  value={4.8}
                  precision={1}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Последние активности */}
          <Card 
            title={
              <span>
                <HistoryOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Последние действия
              </span>
            }
          >
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item
                  key={index}
                  color={
                    activity.status === 'success' ? 'green' :
                    activity.status === 'processing' ? 'blue' : 'gray'
                  }
                >
                  <div>
                    <Text strong>{activity.action}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {activity.time}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>

          {/* Достижения */}
          <Card 
            title={
              <span>
                <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
                Достижения
              </span>
            }
          >
            <Flex vertical gap={12}>
              <Flex align="center" gap={12}>
                <Avatar 
                  size={40} 
                  icon={<TrophyOutlined />} 
                  style={{ backgroundColor: '#ffd666', color: '#d48806' }}
                />
                <div>
                  <Text strong>Лучший сотрудник месяца</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>Декабрь 2023</Text>
                </div>
              </Flex>
              
              <Flex align="center" gap={12}>
                <Avatar 
                  size={40} 
                  icon={<StarOutlined />} 
                  style={{ backgroundColor: '#b7eb8f', color: '#389e0d' }}
                />
                <div>
                  <Text strong>100% качество</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>5 раз подряд</Text>
                </div>
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
};


export default UserProfile;