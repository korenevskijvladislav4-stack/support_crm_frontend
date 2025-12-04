import { useState, type FC } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Progress,
  List,
  Avatar,
  Typography,
  Badge,
  Button,
  Space,
  Select,
  Rate,
  type BadgeProps,
} from "antd";
import {
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined,
  StarOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  PhoneOutlined,
  CrownOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';

import type { Group, GroupMember } from '../types/groups.types';

const { Title, Text } = Typography;
const { Option } = Select;

const GroupsPage: FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Фейковые данные групп технической поддержки
  const groups: Group[] = [
    {
      id: 1,
      name: "Первая линия поддержки",
      description: "Обработка входящих обращений и первичная консультация клиентов",
      supervisor: "Анна Петрова",
      memberCount: 12,
      onlineMembers: 10,
      totalCalls: 1247,
      resolvedCalls: 1189,
      avgSatisfaction: 4.7,
      avgResponseTime: "00:45",
      createdAt: "2024-01-15",
      status: "high-performance",
      shift: "day",
      specializations: ["Первичная консультация", "Базовая диагностика", "Навигация по услугам"],
      members: [
        { id: 1, name: "Екатерина", surname: "Смирнова", position: "Старший оператор", avatarColor: "#1890ff", callsHandled: 156, satisfaction: 4.8, avgResponseTime: "00:38", status: "online" },
        { id: 2, name: "Дмитрий", surname: "Иванов", position: "Оператор", avatarColor: "#52c41a", callsHandled: 142, satisfaction: 4.6, avgResponseTime: "00:42", status: "busy" },
        { id: 3, name: "Ольга", surname: "Козлова", position: "Оператор", avatarColor: "#faad14", callsHandled: 128, satisfaction: 4.7, avgResponseTime: "00:47", status: "online" },
        { id: 4, name: "Артем", surname: "Васильев", position: "Младший оператор", avatarColor: "#f759ab", callsHandled: 98, satisfaction: 4.5, avgResponseTime: "00:52", status: "online" },
      ]
    },
    {
      id: 2,
      name: "Вторая линия поддержки",
      description: "Решение сложных технических вопросов и эскалация проблем",
      supervisor: "Сергей Сидоров",
      memberCount: 8,
      onlineMembers: 7,
      totalCalls: 645,
      resolvedCalls: 612,
      avgSatisfaction: 4.8,
      avgResponseTime: "02:15",
      createdAt: "2024-01-10",
      status: "active",
      shift: "mixed",
      specializations: ["Техническая диагностика", "Решение инцидентов", "Эскалация проблем"],
      members: [
        { id: 1, name: "Андрей", surname: "Павлов", position: "Технический специалист", avatarColor: "#722ed1", callsHandled: 89, satisfaction: 4.9, avgResponseTime: "01:58", status: "online" },
        { id: 2, name: "Мария", surname: "Николаева", position: "Старший техник", avatarColor: "#fa8c16", callsHandled: 94, satisfaction: 4.8, avgResponseTime: "02:05", status: "busy" },
        { id: 3, name: "Иван", surname: "Белов", position: "Технический специалист", avatarColor: "#13c2c2", callsHandled: 76, satisfaction: 4.7, avgResponseTime: "02:25", status: "online" },
      ]
    },
    {
      id: 3,
      name: "Ночная смена",
      description: "Обеспечение поддержки в нерабочее время и экстренные случаи",
      supervisor: "Виктор Ковалев",
      memberCount: 6,
      onlineMembers: 4,
      totalCalls: 432,
      resolvedCalls: 398,
      avgSatisfaction: 4.5,
      avgResponseTime: "01:20",
      createdAt: "2024-02-01",
      status: "active",
      shift: "night",
      specializations: ["Экстренная поддержка", "Мониторинг систем", "Ночная консультация"],
      members: [
        { id: 1, name: "Наталья", surname: "Орлова", position: "Ночной оператор", avatarColor: "#eb2f96", callsHandled: 67, satisfaction: 4.6, avgResponseTime: "01:15", status: "online" },
        { id: 2, name: "Алексей", surname: "Морозов", position: "Техник ночной смены", avatarColor: "#a0d911", callsHandled: 58, satisfaction: 4.4, avgResponseTime: "01:28", status: "online" },
        { id: 3, name: "Светлана", surname: "Захарова", position: "Оператор", avatarColor: "#1890ff", callsHandled: 52, satisfaction: 4.5, avgResponseTime: "01:22", status: "offline" },
      ]
    },
    {
      id: 4,
      name: "Тренинг-группа",
      description: "Обучение новых сотрудников и стажеров",
      supervisor: "Елена Новикова",
      memberCount: 5,
      onlineMembers: 3,
      totalCalls: 234,
      resolvedCalls: 198,
      avgSatisfaction: 4.2,
      avgResponseTime: "03:45",
      createdAt: "2024-01-20",
      status: "training",
      shift: "day",
      specializations: ["Обучение", "Стажировка", "Контроль качества"],
      members: [
        { id: 1, name: "Павел", surname: "Кузнецов", position: "Тренер", avatarColor: "#fa541c", callsHandled: 45, satisfaction: 4.7, avgResponseTime: "02:30", status: "online" },
        { id: 2, name: "Юлия", surname: "Волкова", position: "Стажер", avatarColor: "#389e0d", callsHandled: 28, satisfaction: 4.1, avgResponseTime: "04:20", status: "online" },
        { id: 3, name: "Михаил", surname: "Федоров", position: "Стажер", avatarColor: "#722ed1", callsHandled: 32, satisfaction: 4.0, avgResponseTime: "04:05", status: "busy" },
      ]
    }
  ];

  const getStatusColor = (status: Group['status']) => {
    switch (status) {
      case 'high-performance': return 'success';
      case 'active': return 'processing';
      case 'training': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: Group['status']) => {
    switch (status) {
      case 'high-performance': return 'Высокая эффективность';
      case 'active': return 'Активна';
      case 'training': return 'Обучение';
      default: return 'Неизвестно';
    }
  };

  const getShiftColor = (shift: Group['shift']) => {
    switch (shift) {
      case 'day': return 'blue';
      case 'night': return 'purple';
      case 'mixed': return 'orange';
      default: return 'default';
    }
  };

  const getShiftText = (shift: Group['shift']) => {
    switch (shift) {
      case 'day': return 'Дневная смена';
      case 'night': return 'Ночная смена';
      case 'mixed': return 'Смешанный график';
      default: return 'Неизвестно';
    }
  };

  const getMemberStatusColor = (status: GroupMember['status']) => {
    switch (status) {
      case 'online': return 'success';
      case 'busy': return 'processing';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const filteredGroups = groups.filter(group => 
    filterStatus === 'all' || group.status === filterStatus
  );

  const selectedGroupData = selectedGroup 
    ? groups.find(group => group.id === selectedGroup)
    : groups[0];

  const resolutionRate = selectedGroupData 
    ? Math.round((selectedGroupData.resolvedCalls / selectedGroupData.totalCalls) * 100)
    : 0;

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
      {/* Заголовок и фильтры */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <TeamOutlined style={{ color: '#1890ff' }} />
                Группы технической поддержки
              </Title>
              <Text type="secondary">
                Управление группами поддержки и мониторинг качества обслуживания
              </Text>
            </div>
            
            <Space>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 200 }}
                placeholder="Фильтр по статусу"
              >
                <Option value="all">Все группы</Option>
                <Option value="high-performance">Высокая эффективность</Option>
                <Option value="active">Активные</Option>
                <Option value="training">Обучение</Option>
              </Select>
              <Button type="primary" icon={<PlusOutlined />}>
                Создать группу
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Список групп */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Список групп</span>
                <Badge count={filteredGroups.length} showZero />
              </Space>
            }
            style={{ height: 'fit-content' }}
          >
            <List
              dataSource={filteredGroups}
              renderItem={(group) => (
                <List.Item 
                  style={{ 
                    cursor: 'pointer',
                    padding: '16px',
                    border: selectedGroup === group.id ? '2px solid #1890ff' : '1px solid #f0f0f0',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    background: selectedGroup === group.id ? '#f0f8ff' : 'white'
                  }}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>{group.name}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Badge 
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            status={getStatusColor(group.status) as any} 
                            text={getStatusText(group.status)} 
                            style={{ marginRight: 8 }}
                          />
                          <Tag color={getShiftColor(group.shift)}>
                            {getShiftText(group.shift)}
                          </Tag>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UserOutlined style={{ color: '#52c41a' }} />
                          <Text strong>{group.onlineMembers}</Text>
                          <Text type="secondary">/</Text>
                          <Text>{group.memberCount}</Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: 12 }}>онлайн</Text>
                      </div>
                    </div>
                    
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                      {group.description}
                    </Text>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space size={[0, 4]} wrap>
                        {group.specializations.slice(0, 2).map((spec, index) => (
                          <Tag key={index} color="blue" style={{ fontSize: 10 }}>{spec}</Tag>
                        ))}
                        {group.specializations.length > 2 && (
                          <Tag style={{ fontSize: 10 }}>+{group.specializations.length - 2}</Tag>
                        )}
                      </Space>
                      <div style={{ textAlign: 'right' }}>
                        <Rate 
                          disabled 
                          value={group.avgSatisfaction} 
                          style={{ fontSize: 12 }} 
                        />
                        <div style={{ fontSize: 10, color: '#999' }}>
                          {group.avgSatisfaction}/5
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Детальная информация о группе */}
        <Col xs={24} lg={16}>
          {selectedGroupData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Заголовок и статистика группы */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {selectedGroupData.name}
                      {selectedGroupData.status === 'high-performance' && (
                        <CrownOutlined style={{ color: '#faad14' }} />
                      )}
                    </Title>
                    <Text type="secondary">{selectedGroupData.description}</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text strong>Руководитель: </Text>
                      <Text>{selectedGroupData.supervisor}</Text>
                    </div>
                  </div>
                  <Space>
                    <Button icon={<EyeOutlined />}>Детали</Button>
                    <Button type="primary" icon={<EditOutlined />}>
                      Редактировать
                    </Button>
                  </Space>
                </div>

                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Операторы"
                      value={selectedGroupData.memberCount}
                      prefix={<UserOutlined />}
                      suffix={`/ ${selectedGroupData.onlineMembers} онлайн`}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Обработано звонков"
                      value={selectedGroupData.totalCalls}
                      prefix={<PhoneOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Удовлетворенность"
                      value={selectedGroupData.avgSatisfaction}
                      prefix={<StarOutlined />}
                      suffix="/5"
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Col>
                  <Col xs={12} sm={6}>
                    <Statistic
                      title="Среднее время"
                      value={selectedGroupData.avgResponseTime}
                      prefix={<ClockCircleOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Col>
                </Row>
              </Card>

              {/* Показатели эффективности */}
              <Card title="Ключевые показатели эффективности">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center' }}>
                      <Progress 
                        type="circle" 
                        percent={resolutionRate}
                        strokeColor={resolutionRate > 90 ? '#52c41a' : resolutionRate > 80 ? '#faad14' : '#ff4d4f'}
                        format={percent => (
                          <div>
                            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{percent}%</div>
                            <Text type="secondary">Решение проблем</Text>
                          </div>
                        )}
                      />
                    </div>
                  </Col>
                  <Col xs={24} md={16}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text>Успешные обращения</Text>
                          <Text strong>
                            {selectedGroupData.resolvedCalls} / {selectedGroupData.totalCalls}
                          </Text>
                        </div>
                        <Progress 
                          percent={resolutionRate}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text>Средняя оценка клиентов</Text>
                          <Rate disabled value={selectedGroupData.avgSatisfaction} />
                        </div>
                        <Text type="secondary">
                          На основе отзывов клиентов
                        </Text>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text>Среднее время ответа</Text>
                          <Text strong>{selectedGroupData.avgResponseTime}</Text>
                        </div>
                        <Text type="secondary">
                          Время от получения звонка до начала помощи
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Операторы группы */}
              <Card 
                title={
                  <Space>
                    <UserOutlined />
                    <span>Операторы группы</span>
                    <Badge 
                      count={selectedGroupData.onlineMembers} 
                      showZero 
                      style={{ backgroundColor: '#52c41a' }} 
                    />
                    <Text type="secondary">из {selectedGroupData.memberCount}</Text>
                  </Space>
                }
              >
                <Row gutter={[16, 16]}>
                  {selectedGroupData.members.map((member) => (
                    <Col xs={24} sm={12} md={8} key={member.id}>
                      <Card size="small">
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ position: 'relative' }}>
                            <Avatar 
                              size={48} 
                              style={{ 
                                backgroundColor: member.avatarColor,
                              }}
                            >
                              {member.name[0]}{member.surname[0]}
                            </Avatar>
                            <Badge 
                              status={getMemberStatusColor(member.status) as BadgeProps['status']} 
                              style={{ 
                                position: 'absolute',
                                bottom: 2,
                                right: 2
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                              {member.name} {member.surname}
                            </div>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {member.position}
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <Text>Звонки:</Text>
                                <Text strong>{member.callsHandled}</Text>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <Text>Оценка:</Text>
                                <Rate disabled value={member.satisfaction} style={{ fontSize: 12 }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                <Text>Время ответа:</Text>
                                <Text strong>{member.avgResponseTime}</Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>

              {/* Специализации группы */}
              <Card title="Специализации и направления">
                <Space size={[8, 8]} wrap>
                  {selectedGroupData.specializations.map((spec, index) => (
                    <Tag 
                      key={index} 
                      icon={<SafetyCertificateOutlined />}
                      color="blue"
                      style={{ fontSize: 14, padding: '6px 12px' }}
                    >
                      {spec}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default GroupsPage;