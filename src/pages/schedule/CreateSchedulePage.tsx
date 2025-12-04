import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Steps,
  Button,
  Space
} from "antd";
import { useState, type FC } from "react";
import { type FormFieldValue, type IScheduleForm } from "../../types/schedule.types";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useCreateScheduleMutation } from "../../api/scheduleApi";
import { useNavigate } from "react-router-dom";
import { CreateScheduleForm } from "../../components/Schedule";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const CreateSchedulePage: FC = () => {
  const navigate = useNavigate();
  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [createScheduleForm, setCreateScheduleForm] = useState<IScheduleForm>({
    team_id: null,
    top_start: '',
    bottom_start: ''
  });

  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();

  const onSubmitHandler = async () => {
    if (!createScheduleForm.team_id || !createScheduleForm.top_start || !createScheduleForm.bottom_start) {
      return;
    }

    try {
      await createSchedule(createScheduleForm).unwrap();
      navigate('/schedule');
    } catch (error) {
      console.error('Error creating schedule:', error);
    }
  };

  const handleFormChange = (field: keyof IScheduleForm, value:FormFieldValue) => {
    setCreateScheduleForm((prev:IScheduleForm) => ({
      ...prev,
      [field]: value
    }));

    // Автоматическое продвижение по шагам
    if (field === 'team_id' && value && currentStep === 0) {
      setCurrentStep(1);
    } else if (field === 'top_start' && value && currentStep === 1) {
      setCurrentStep(2);
    } else if (field === 'bottom_start' && value && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const isFormValid = (): boolean => {
    return !!(createScheduleForm.team_id && createScheduleForm.top_start && createScheduleForm.bottom_start);
  };

  const steps = [
    {
      title: 'Выбор отдела',
      description: 'Выберите отдел для генерации графика',
      completed: !!createScheduleForm.team_id
    },
    {
      title: 'Верхние смены',
      description: 'Укажите начало верхних смен',
      completed: !!createScheduleForm.top_start
    },
    {
      title: 'Нижние смены',
      description: 'Укажите начало нижних смен',
      completed: !!createScheduleForm.bottom_start
    },
    {
      title: 'Подтверждение',
      description: 'Запуск генерации графика',
      completed: false
    }
  ];

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
      {/* Заголовок и навигация */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Space style={{ marginBottom: 16 }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/schedule')}
            >
              Назад к графику
            </Button>
          </Space>
          
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title 
              level={1} 
              style={{ 
                margin: 0, 
                marginBottom: 8,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12,
                fontSize: 'clamp(24px, 3vw, 32px)'
              }}
            >
              <CalendarOutlined style={{ color: '#1890ff' }} />
              Генерация графика смен
            </Title>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Создание автоматического графика работы для сотрудников
            </Text>
          </div>
        </Col>
      </Row>

      {/* Шаги процесса */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 'clamp(16px, 2vw, 24px)' }}>
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

      <Row justify="center">
        <Col xs={24} lg={16} xl={12}>
          <CreateScheduleForm
            form={createScheduleForm}
            onFormChange={handleFormChange}
            teams={teams}
            isLoadingTeams={isTeamsLoading}
            onSubmit={onSubmitHandler}
            isSubmitting={isCreating}
            isValid={isFormValid()}
          />
        </Col>
      </Row>

      {/* Дополнительная информация */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        <Col xs={24} md={12}>
          <Card size="small" title="О верхних сменах">
            <Space direction="vertical" size="small">
              <Text>• Обычно дневные смены</Text>
              <Text>• Начало работы с 08:00 до 20:00</Text>
              <Text>• Стандартная продолжительность: 12 часов</Text>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card size="small" title="О нижних сменах">
            <Space direction="vertical" size="small">
              <Text>• Обычно ночные смены</Text>
              <Text>• Начало работы с 20:00 до 08:00</Text>
              <Text>• Стандартная продолжительность: 12 часов</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CreateSchedulePage;