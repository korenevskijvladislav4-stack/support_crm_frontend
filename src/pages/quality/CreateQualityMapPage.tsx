import React, { useState } from 'react';
import { Card, Row, Col, Steps, Form, message } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { useCreateQualityMapMutation, useGetTeamsQuery, useGetUsersByTeamQuery, useGetCriteriaQuery } from '../../api/qualityApi';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { CreateQualityMapForm, QualityMapPreview } from '../../components/Quality';
import styles from '../../styles/quality/create-quality-map.module.css';

const { Step } = Steps;

interface CreateQualityMapProps {
  onSuccess: (mapId: number) => void;
  onCancel?: () => void;
}

interface QualityMapFormValues {
  user_id: number;
  team_id: number;
  dates: [dayjs.Dayjs, dayjs.Dayjs];
  chat_count: number;
  calls_count?: number;
}

const CreateQualityMap: React.FC<CreateQualityMapProps> = ({  onCancel }) => {
  const [form] = Form.useForm<QualityMapFormValues>();
  const [createQualityMap, { isLoading }] = useCreateQualityMapMutation();
  const { data: teams } = useGetTeamsQuery();
  const { data: criteria = [] } = useGetCriteriaQuery({});
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersByTeamQuery(selectedTeam, {
    skip: !selectedTeam,
  });
  
  // Убеждаемся, что users это массив
  const users = React.useMemo(() => {
    return Array.isArray(usersData) ? usersData : [];
  }, [usersData]);

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current < dayjs().startOf('day');
  };
  const navigate = useNavigate();

  const handleSubmit = async (values: QualityMapFormValues) => {
    try {
      const result = await createQualityMap({
        user_id: values.user_id,
        team_id: values.team_id,
        start_date: values.dates[0].format('YYYY-MM-DD'),
        end_date: values.dates[1].format('YYYY-MM-DD'),
        chat_count: values.chat_count,
        calls_count: values.calls_count || 0,
      }).unwrap();
      navigate(`/quality/${result.data.id}/edit`);
    } catch (error) {
      console.error('Error creating quality map:', error);
      message.error('Ошибка при создании карты качества');
    }
  };

  const handleTeamChange = (teamId: number) => {
    setSelectedTeam(teamId);
    form.setFieldValue('user_id', undefined);
    if (teamId) {
      setCurrentStep(1);
    }
  };

  const handleUserSelect = () => {
    setCurrentStep(2);
  };


  const formValues = Form.useWatch([], form) as QualityMapFormValues | undefined;
  const selectedUser = Array.isArray(users) ? users.find(user => user.id === formValues?.user_id) : undefined;
  const selectedTeamData = Array.isArray(teams) ? teams.find(team => team.id === formValues?.team_id) : undefined;

  // Получаем критерии для выбранной команды
  const teamCriteria = criteria.filter(criterion => 
    criterion.is_global || 
    (criterion.teams && criterion.teams.some(team => team.id === selectedTeam))
  );

  const steps = [
    {
      title: 'Выбор команды',
      description: 'Выберите команду для проверки',
      completed: !!formValues?.team_id
    },
    {
      title: 'Выбор сотрудника',
      description: 'Выберите проверяемого сотрудника',
      completed: !!formValues?.user_id
    },
    {
      title: 'Период проверки',
      description: 'Укажите даты проверки',
      completed: !!formValues?.dates
    },
    {
      title: 'Настройка проверки',
      description: 'Укажите количество чатов и звонков',
      completed: !!formValues?.chat_count
    },
    {
      title: 'Подтверждение',
      description: 'Создание карты качества',
      completed: false
    }
  ];

  const isFormComplete = (): boolean => {
    return !!(formValues?.team_id && 
           formValues?.user_id && 
           formValues?.dates && 
           formValues?.chat_count);
  };

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.stepsCard} bodyStyle={{ padding: 'clamp(16px, 2vw, 24px)' }}>
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
          <CreateQualityMapForm
            form={form}
            onFinish={handleSubmit}
            teams={teams}
            users={users}
            selectedTeam={selectedTeam}
            onTeamChange={handleTeamChange}
            onUserSelect={handleUserSelect}
            disabledDate={disabledDate}
            isLoading={isLoading}
            isLoadingUsers={isLoadingUsers}
            isValid={isFormComplete()}
            onCancel={onCancel}
          />
        </Col>

        <Col xs={24} lg={8}>
          <QualityMapPreview
            selectedTeamData={selectedTeamData}
            selectedUser={selectedUser}
            formValues={formValues}
            selectedTeam={selectedTeam}
            teamCriteria={teamCriteria}
          />
        </Col>
      </Row>
    </div>
  );
};

export default CreateQualityMap;