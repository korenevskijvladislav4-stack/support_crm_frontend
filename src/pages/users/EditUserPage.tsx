import {
  Button,
  Spin,
  Card,
  Row,
  Col,
  Typography,
  Steps,
  Statistic,
  Space,
  message
} from 'antd';
import { EditUserForm, UserPreview, TransferGroupModal } from '../../components/Users';
import styles from '../../styles/users/edit-user.module.css';
import { useEffect, useState, type FC } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { useGetAllGroupsQuery } from '../../api/groupsApi';
import { useGetAllTeamsQuery } from '../../api/teamsApi';
import { useGetAllRolesQuery } from '../../api/rolesApi';
import { useGetAllScheduleTypesQuery } from '../../api/scheduleTypesApi';
import { useGetUserQuery, useUpdateUserMutation, useTransferUserGroupMutation } from '../../api/usersApi';
import type { IUserForm } from '../../types/user.types';
import {
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EditOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const EditUserPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetUserQuery(id ?? skipToken);
  const { data: groups } = useGetAllGroupsQuery();
  const { data: teams } = useGetAllTeamsQuery();
  const { data: allRoles } = useGetAllRolesQuery();
  const { data: scheduleTypes } = useGetAllScheduleTypesQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [transferUserGroup] = useTransferUserGroupMutation();
  
  const [userForm, setUserForm] = useState<IUserForm>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    roles: [],
    team_id: null,
    group_id: null,
    schedule_type_id: null
  });

  const [originalGroupId, setOriginalGroupId] = useState<number | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<number | null>(null);

  // Фильтруем роли по выбранному отделу
  const availableRoles = userForm.team_id 
    ? teams?.find(t => t.id === userForm.team_id)?.roles || []
    : [];

  const [currentStep] = useState(0);

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

  const handleGroupChange = (newGroupId: number | null) => {
    // Если группа изменилась и была выбрана новая группа (и была старая группа)
    if (newGroupId !== null && newGroupId !== originalGroupId && originalGroupId !== null) {
      // Сохраняем текущее значение группы в форме, чтобы показать в модальном окне
      setPendingGroupId(newGroupId);
      setShowTransferModal(true);
    } else {
      // Если группа просто очищена или это первое назначение, обновляем форму
      setUserForm(prev => ({ ...prev, group_id: newGroupId }));
      // Обновляем originalGroupId, если это первое назначение
      if (newGroupId !== null && originalGroupId === null) {
        setOriginalGroupId(newGroupId);
      }
    }
  };

  const handleTransferConfirm = async (transferDate: string) => {
    if (!id || !pendingGroupId) return;
    
    try {
      await transferUserGroup({
        userId: parseInt(id),
        newGroupId: pendingGroupId,
        transferDate
      }).unwrap();
      
      // Обновляем форму с новой группой
      setUserForm(prev => ({ ...prev, group_id: pendingGroupId }));
      setOriginalGroupId(pendingGroupId);
      setShowTransferModal(false);
      setPendingGroupId(null);
    } catch (error) {
      console.error('Transfer error:', error);
      throw error; // Пробрасываем ошибку, чтобы модальное окно могло её обработать
    }
  };

  const handleTransferCancel = () => {
    // Возвращаем исходную группу
    setUserForm(prev => ({ ...prev, group_id: originalGroupId }));
    setShowTransferModal(false);
    setPendingGroupId(null);
  };

  const onSubmitHandler = async () => {
    if (!id) return;
    
    try {
      await updateUser({ form: userForm, id: id }).unwrap();
      message.success('Данные пользователя успешно обновлены');
      navigate('/users');
    } catch (error) {
      message.error('Ошибка при обновлении данных пользователя');
      console.error('Update user error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Извлекаем ID ролей (поддерживаем как объекты, так и ID)
      const userRoleIds = user.roles?.map(role => {
        if (typeof role === 'object' && role !== null && 'id' in role) {
          return role.id;
        }
        return typeof role === 'number' ? role : null;
      }).filter((id): id is number => id !== null) || [];
      
      // Если команды загружены, фильтруем роли по ролям отдела
      let finalRoleIds = userRoleIds;
      if (teams && user.team_id) {
        const userTeam = teams.find(t => t.id === user.team_id);
        const teamRoleIds = userTeam?.roles?.map(r => r.id) || [];
        // Оставляем только те роли, которые есть в отделе
        finalRoleIds = userRoleIds.filter(roleId => teamRoleIds.includes(roleId));
      }
      
      const groupId = user.group_id ?? null;
      setUserForm({
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',
        phone: user.phone || '',
        roles: finalRoleIds,
        team_id: user.team_id ?? null,
        group_id: groupId,
        schedule_type_id: user.schedule_type_id ?? null
      });
      setOriginalGroupId(groupId);
    }
  }, [user, teams]);

  const steps = [
    {
      title: 'Личные данные',
      description: 'Основная информация',
      completed: !!userForm.name && !!userForm.surname && !!userForm.email
    },
    {
      title: 'Организация',
      description: 'Отдел и группа',
      completed: !!userForm.team_id && !!userForm.group_id
    },
    {
      title: 'Роли и доступ',
      description: 'Права доступа',
      completed: userForm.roles.length > 0
    },
    {
      title: 'Расписание',
      description: 'График работы',
      completed: !!userForm.schedule_type_id
    }
  ];

  const isFormValid = (): boolean => {
    return !!(userForm.name && 
           userForm.surname && 
           userForm.email && 
           userForm.roles.length > 0 && 
           userForm.team_id && 
           userForm.group_id && 
           userForm.schedule_type_id);
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
        <Text type="secondary">Загрузка данных пользователя...</Text>
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
              onClick={() => navigate('/users')}
            >
              Назад к списку
            </Button>
          </Space>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title level={1} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                <EditOutlined style={{ color: '#1890ff' }} />
                Редактирование пользователя
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                Пользователь #{user?.id} • {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Неизвестно'}
              </Text>
            </div>
            
            <Statistic
              title="Статус"
              value="Активен"
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </div>
        </Col>
      </Row>

      <Card className={styles.stepsCard} bodyStyle={{ padding: 24 }}>
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
          <EditUserForm
            form={userForm}
            onFormChange={(field, value) => {
              if (field === 'team_id') {
                const newTeam = teams?.find(t => t.id === value);
                const newTeamRoleIds = newTeam?.roles?.map(r => r.id) || [];
                const validRoles = userForm.roles.filter(roleId => newTeamRoleIds.includes(roleId));
                setUserForm(prev => ({ ...prev, team_id: value as number | null, roles: validRoles }));
              } else if (field === 'group_id') {
                handleGroupChange(value as number | null);
              } else {
                setUserForm(prev => ({ ...prev, [field]: value }));
              }
            }}
            teams={teams}
            groups={groups}
            availableRoles={availableRoles}
            scheduleTypes={scheduleTypes}
            onCancel={() => navigate('/users')}
            onSubmit={onSubmitHandler}
            isSubmitting={isUpdating}
            isValid={isFormValid()}
          />
        </Col>

        <Col xs={24} lg={8}>
          <UserPreview
            form={userForm}
            teams={teams}
            groups={groups}
            availableRoles={availableRoles}
            allRoles={allRoles}
            scheduleTypes={scheduleTypes}
            getRoleColor={getRoleColor}
          />

          <Card title="Статистика изменений" size="small" className={styles.statsCard}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Изменено полей:</Text>
                <Text strong>0</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Последнее обновление:</Text>
                <Text type="secondary">Сейчас</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <TransferGroupModal
        visible={showTransferModal}
        onCancel={handleTransferCancel}
        onConfirm={handleTransferConfirm}
        userName={`${userForm.name} ${userForm.surname}`}
        oldGroupName={groups?.find(g => g.id === originalGroupId)?.name}
        newGroupName={groups?.find(g => g.id === pendingGroupId)?.name}
      />
    </div>
  );
};

export default EditUserPage;