import {
  Button,
  Spin,
  Row,
  Col,
  Typography,
  Steps,
  Statistic,
  Space,
  Card,
} from 'antd';
import { AttemptApproveForm, AttemptPreview, StartDateModal } from '../../components/Attempts';
import styles from '../../styles/attempts/attempt-approve.module.css';
import { useEffect, useState, type FC } from "react";
import { useApproveAttemptMutation, useGetAttemptQuery } from '../../api/attemptsApi';
import { useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import type { IAttemptForm } from '../../types/attempts.types';
import { useGetAllGroupsQuery } from '../../api/groupsApi';
import { useGetAllTeamsQuery } from '../../api/teamsApi';
import { useGetAllRolesQuery } from '../../api/rolesApi';
import { useGetAllScheduleTypesQuery } from '../../api/scheduleTypesApi';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  IdcardOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const AttemptApprovePage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: attempt, isLoading } = useGetAttemptQuery(id ?? skipToken);
  const { data: groups } = useGetAllGroupsQuery();
  const { data: teams } = useGetAllTeamsQuery();
  const { data: allRoles } = useGetAllRolesQuery();
  const { data: scheduleTypes } = useGetAllScheduleTypesQuery();
  const [approveAttempt, { isLoading: isApproving }] = useApproveAttemptMutation();
  
  const [attemptForm, setAttemptForm] = useState<IAttemptForm>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    created_at: new Date(),
    roles: [],
    team_id: null,
    group_id: null,
    schedule_type_id: null,
    start_date: null
  });

  const [showStartDateModal, setShowStartDateModal] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<number | null>(null);

  // Фильтруем роли по выбранному отделу
  const availableRoles = attemptForm.team_id 
    ? teams?.find(t => t.id === attemptForm.team_id)?.roles || []
    : [];

  const [currentStep] = useState(0);

  const onSubmitHandler = async () => {
    if (!id) return;
    
    try {
      await approveAttempt({ body: { ...attemptForm }, id }).unwrap();
      navigate('/attempts');
    } catch (error) {
      console.error('Error approving attempt:', error);
    }
  };

  useEffect(() => {
    if (attempt) {
      setAttemptForm(prev => ({
        ...prev,
        name: attempt.name,
        surname: attempt.surname,
        email: attempt.email,
        phone: attempt.phone || '',
        created_at: attempt.created_at,
        roles: [],
        team_id: null,
        group_id: null,
        schedule_type_id: null
      }));
    }
  }, [attempt]);

  const steps = [
    {
      title: 'Личные данные',
      description: 'Основная информация',
      completed: !!attemptForm.name && !!attemptForm.surname && !!attemptForm.email
    },
    {
      title: 'Организация',
      description: 'Отдел и группа',
      completed: !!attemptForm.team_id && !!attemptForm.group_id
    },
    {
      title: 'Роли и доступ',
      description: 'Права доступа',
      completed: attemptForm.roles.length > 0
    },
    {
      title: 'Расписание',
      description: 'График работы',
      completed: !!attemptForm.schedule_type_id
    }
  ];

  const getRoleColor = (roleId: number) => {
    const role = availableRoles.find(r => r.id === roleId) || allRoles?.find(r => r.id === roleId);
    const roleColors: { [key: string]: string } = {
      'admin': 'red',
      'manager': 'blue',
      'user': 'green',
      'supervisor': 'orange',
      'agent': 'purple'
    };
    return role ? roleColors[role.name.toLowerCase()] || 'default' : 'default';
  };

  const isFormComplete = () => {
    return attemptForm.name && 
           attemptForm.surname && 
           attemptForm.email && 
           attemptForm.roles.length > 0 && 
           attemptForm.team_id && 
           attemptForm.group_id && 
           attemptForm.schedule_type_id &&
           attemptForm.start_date;
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <Text type="secondary">Загрузка данных заявки...</Text>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Заголовок и навигация */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Space style={{ marginBottom: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/attempts')}
            >
              Назад к заявкам
            </Button>
          </Space>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={1} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <IdcardOutlined style={{ color: '#1890ff' }} />
                Рассмотрение заявки
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Заявка #{attempt?.id} • {attempt?.created_at ? new Date(attempt.created_at).toLocaleDateString('ru-RU') : 'Новая заявка'}
              </Text>
            </div>
            
            <Statistic
              title="Статус заявки"
              value="На рассмотрении"
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </div>
        </Col>
      </Row>

      {/* Шаги процесса */}
      <Card style={{ marginBottom: 32 }} bodyStyle={{ padding: 24 }}>
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step 
              key={index}
              title={step.title}
              description={step.description}
              icon={step.completed ? <CheckCircleOutlined /> : undefined}
            />
          ))}
        </Steps>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <AttemptApproveForm
            form={attemptForm}
            onFormChange={(field, value) => {
              if (field === 'team_id') {
                const newTeam = teams?.find(t => t.id === (value as number));
                const newTeamRoleIds = newTeam?.roles.map(r => r.id) || [];
                const validRoles = attemptForm.roles.filter(roleId => newTeamRoleIds.includes(roleId));
                setAttemptForm(prev => ({ ...prev, team_id: value as number | null, roles: validRoles }));
              } else {
                setAttemptForm(prev => ({ ...prev, [field]: value }));
              }
            }}
            teams={teams}
            groups={groups}
            availableRoles={availableRoles}
            scheduleTypes={scheduleTypes}
            getRoleColor={getRoleColor}
            onGroupSelect={(groupId) => {
              if (groupId) {
                setPendingGroupId(groupId);
                setShowStartDateModal(true);
              } else {
                setAttemptForm(prev => ({ ...prev, group_id: null, start_date: null }));
                setPendingGroupId(null);
              }
            }}
          />
        </Col>

        <Col xs={24} lg={8}>
          <AttemptPreview
            form={attemptForm}
            teams={teams}
            groups={groups}
            availableRoles={availableRoles}
            allRoles={allRoles}
            scheduleTypes={scheduleTypes}
            getRoleColor={getRoleColor}
            onApprove={onSubmitHandler}
            isApproving={isApproving}
            isValid={!!isFormComplete()}
          />
        </Col>
      </Row>

      <StartDateModal
        visible={showStartDateModal}
        onCancel={() => {
          setShowStartDateModal(false);
          setPendingGroupId(null);
          setAttemptForm(prev => ({ ...prev, group_id: null, start_date: null }));
        }}
        onConfirm={(startDate) => {
          setAttemptForm(prev => ({ ...prev, group_id: pendingGroupId, start_date: startDate }));
          setShowStartDateModal(false);
          setPendingGroupId(null);
        }}
        employeeName={`${attemptForm.name} ${attemptForm.surname}`}
        groupName={groups?.find(g => g.id === pendingGroupId)?.name}
      />
    </div>
  );
};

export default AttemptApprovePage;