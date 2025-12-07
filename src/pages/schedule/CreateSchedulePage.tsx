import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Steps,
  Button,
  Space,
  Progress,
  Result,
  message
} from "antd";
import { useState, useEffect, useCallback, type FC } from "react";
import type { FormFieldValue, IScheduleForm, IScheduleGenerationStatus } from "../../types/schedule.types";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { useCreateScheduleMutation, useLazyGetGenerationStatusQuery, scheduleApi } from "../../api/scheduleApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreateScheduleForm } from "../../components/Schedule";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  LoadingOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

const CreateSchedulePage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [getGenerationStatus] = useLazyGetGenerationStatusQuery();
  const [currentStep, setCurrentStep] = useState(0);
  const [generationId, setGenerationId] = useState<number | null>(null);
  const [generationStatus, setGenerationStatus] = useState<IScheduleGenerationStatus | null>(null);
  
  const [createScheduleForm, setCreateScheduleForm] = useState<IScheduleForm>({
    team_id: null as unknown as number,
    top_start: '',
    bottom_start: ''
  });

  const { data: teamsData, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  
  // Нормализуем teams
  const teams = Array.isArray(teamsData) ? teamsData : [];

  // Функция для перехода к графику с нужными параметрами
  const navigateToSchedule = useCallback(() => {
    const params = new URLSearchParams();
    
    // Добавляем team_id
    if (createScheduleForm.team_id) {
      params.set('team_id', String(createScheduleForm.team_id));
    }
    
    // Извлекаем месяц из даты начала (YYYY-MM-DD -> YYYY-MM)
    if (createScheduleForm.top_start) {
      const month = createScheduleForm.top_start.substring(0, 7); // "2024-12-01" -> "2024-12"
      params.set('month', month);
    }
    
    navigate(`/schedule?${params.toString()}`);
  }, [navigate, createScheduleForm.team_id, createScheduleForm.top_start]);

  // Polling для статуса генерации
  useEffect(() => {
    if (!generationId) return;
    
    const pollStatus = async () => {
      try {
        const result = await getGenerationStatus(generationId).unwrap();
        setGenerationStatus(result);
        
        if (result.status === 'completed') {
          // Инвалидируем кэш расписания на фронте
          dispatch(scheduleApi.util.invalidateTags(['Schedule']));
          message.success('График успешно сгенерирован!');
          setTimeout(() => navigateToSchedule(), 2000);
        } else if (result.status === 'failed') {
          message.error(result.error_message || 'Ошибка при генерации графика');
        }
      } catch (error) {
        console.error('Error polling generation status:', error);
      }
    };
    
    // Первый запрос сразу
    pollStatus();
    
    // Затем каждые 2 секунды пока не завершится
    const interval = setInterval(() => {
      if (generationStatus?.status === 'completed' || generationStatus?.status === 'failed') {
        clearInterval(interval);
        return;
      }
      pollStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [generationId, generationStatus?.status, getGenerationStatus, navigateToSchedule]);

  const onSubmitHandler = useCallback(async () => {
    if (!createScheduleForm.team_id || !createScheduleForm.top_start || !createScheduleForm.bottom_start) {
      return;
    }

    try {
      const result = await createSchedule(createScheduleForm).unwrap();
      setGenerationId(result.generation_id);
      setGenerationStatus({
        id: result.generation_id,
        status: 'pending',
        progress: 0,
        total_users: result.total_users,
        processed_users: 0,
      });
      setCurrentStep(4); // Переходим к шагу генерации
      message.info('Генерация графика запущена в фоновом режиме');
    } catch (error) {
      console.error('Error creating schedule:', error);
      message.error('Ошибка при запуске генерации графика');
    }
  }, [createSchedule, createScheduleForm]);

  const handleFormChange = useCallback((field: keyof IScheduleForm, value: FormFieldValue) => {
    setCreateScheduleForm((prev) => ({
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
  }, [currentStep]);

  const isFormValid = (): boolean => {
    return !!(createScheduleForm.team_id && createScheduleForm.top_start && createScheduleForm.bottom_start);
  };

  const steps = [
    {
      title: 'Выбор отдела',
      description: 'Выберите отдел',
      completed: !!createScheduleForm.team_id
    },
    {
      title: 'Верхние смены',
      description: 'Дата начала',
      completed: !!createScheduleForm.top_start
    },
    {
      title: 'Нижние смены',
      description: 'Дата начала',
      completed: !!createScheduleForm.bottom_start
    },
    {
      title: 'Подтверждение',
      description: 'Запуск',
      completed: !!generationId
    },
    {
      title: 'Генерация',
      description: 'Обработка',
      completed: generationStatus?.status === 'completed'
    }
  ];

  // Если идёт генерация - показываем прогресс
  if (generationId && generationStatus) {
    const isProcessing = generationStatus.status === 'pending' || generationStatus.status === 'processing';
    const isCompleted = generationStatus.status === 'completed';
    const isFailed = generationStatus.status === 'failed';

    return (
      <div style={{ padding: 'clamp(12px, 2vw, 24px)', maxWidth: '100%', margin: '0 auto' }}>
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
                <CalendarOutlined style={{ color: '#1890ff', marginRight: 12 }} />
                Генерация графика
              </Title>
            </div>
          </Col>
        </Row>

        <Row justify="center">
          <Col xs={24} lg={12}>
            <Card>
              {isProcessing && (
                <Result
                  icon={<LoadingOutlined style={{ color: '#1890ff' }} />}
                  title="Генерация графика..."
                  subTitle={`Обработано ${generationStatus.processed_users} из ${generationStatus.total_users} сотрудников`}
                  extra={
                    <Progress 
                      percent={generationStatus.progress} 
                      status="active"
                      strokeColor={{ from: '#108ee9', to: '#87d068' }}
                    />
                  }
                />
              )}

              {isCompleted && (
                <Result
                  status="success"
                  title="График успешно сгенерирован!"
                  subTitle={`Обработано ${generationStatus.total_users} сотрудников`}
                  extra={
                    <Button type="primary" onClick={navigateToSchedule}>
                      Перейти к графику
                    </Button>
                  }
                />
              )}

              {isFailed && (
                <Result
                  status="error"
                  icon={<CloseCircleOutlined />}
                  title="Ошибка генерации"
                  subTitle={generationStatus.error_message || 'Произошла неизвестная ошибка'}
                  extra={
                    <Space>
                      <Button type="primary" onClick={() => {
                        setGenerationId(null);
                        setGenerationStatus(null);
                        setCurrentStep(0);
                      }}>
                        Попробовать снова
                      </Button>
                      <Button onClick={() => navigate('/schedule')}>
                        Вернуться к графику
                      </Button>
                    </Space>
                  }
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

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
              level={2} 
              style={{ 
                margin: 0, 
                marginBottom: 8,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 12,
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
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 'clamp(12px, 2vw, 20px)' }}>
        <Steps current={currentStep} size="small" responsive={false}>
          {steps.slice(0, 4).map((step, index) => (
            <Step 
              key={index}
              title={step.title}
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
    </div>
  );
};

export default CreateSchedulePage;