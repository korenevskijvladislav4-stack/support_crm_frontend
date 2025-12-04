// pages/SettingsQualityCriteriasPage.tsx
import React, { useState } from 'react';
import { 
  Table,
  Button,
  Form, 
  Input, 
  Modal, 
  Select, 
  Space, 
  message, 
  Card, 
  Typography,
  Badge,
  Tag,
  Divider,
  Alert,
  Switch,
  InputNumber,
  Tooltip,
  theme,
  type TableColumnsType 
} from "antd";
import SettingsPageHeader from "../components/Settings/SettingsPageHeader";
import SettingsStatsCards from "../components/Settings/SettingsStatsCards";
import SettingsActionButtons from "../components/Settings/SettingsActionButtons";
import {
  StarOutlined,
  TeamOutlined,
  LineChartOutlined,
  GlobalOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useGetAllTeamsQuery } from "../api/teamsApi";
import { 
  useCreateQualityCriteriaMutation, 
  useDestroyQualityCriteriaMutation, 
  useGetAllQualityCriteriasQuery,
  useUpdateQualityCriteriaMutation 
} from "../api/qualityCriteriasApi";
import type { IQualityCriteria, CriterionFormValues, TeamWithPivot } from "../types/qualityCriterias.types";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const SettingsQualityCriteriasPage: React.FC = () => {
  const { token } = theme.useToken();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCriterion, setEditingCriterion] = useState<IQualityCriteria | null>(null);
  const [form] = Form.useForm<CriterionFormValues>();

  const { data: qualityCriterias, isLoading: isQualityCriteriasLoading, isFetching, refetch } = useGetAllQualityCriteriasQuery();
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  const [createQualityCriteria, { isLoading: isCreating }] = useCreateQualityCriteriaMutation();
  const [updateQualityCriteria, { isLoading: isUpdating }] = useUpdateQualityCriteriaMutation();
  const [destroyQualityCriteria, { isLoading: isDestroying }] = useDestroyQualityCriteriaMutation();

  const handleDelete = async (id: number) => {
    try {
      await destroyQualityCriteria(id).unwrap();
      message.success('Критерий успешно удален');
    } catch (error) {
      console.error('Error deleting criterion:', error);
      message.error('Ошибка при удалении критерия');
    }
  };

  // Исправленная функция для получения названий команд
  const getTeamNames = (criterionTeams: TeamWithPivot[] | undefined) => {
    if (!criterionTeams || criterionTeams.length === 0) return [];
    return criterionTeams.map(team => team.name);
  };

  // Функция для получения ID команд из pivot
  const getTeamIds = (criterionTeams: TeamWithPivot[] | undefined): number[] => {
    if (!criterionTeams || criterionTeams.length === 0) return [];
    return criterionTeams.map(team => team.id);
  };

  const showCreateModal = () => {
    setEditingCriterion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (criterion: IQualityCriteria) => {
    setEditingCriterion(criterion);
    
    // Получаем ID команд из pivot данных
    const teamIds = criterion.teams ? getTeamIds(criterion.teams as TeamWithPivot[]) : [];
    
    form.setFieldsValue({
      name: criterion.name,
      description: criterion.description || '',
      max_score: criterion.max_score || 100,
      team_ids: teamIds,
      is_global: criterion.is_global || false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: CriterionFormValues) => {
    try {
      const submitData = {
        name: values.name,
        description: values.description,
        max_score: values.max_score,
        team_ids: values.is_global ? [] : values.team_ids,
        is_global: values.is_global,
      };

      if (editingCriterion) {
        await updateQualityCriteria({
          id: editingCriterion.id,
          ...submitData
        }).unwrap();
        message.success('Критерий успешно обновлен');
      } else {
        await createQualityCriteria(submitData).unwrap();
        message.success('Критерий успешно создан');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingCriterion(null);
    } catch (error) {
      console.error('Error saving criterion:', error);
      message.error('Ошибка при сохранении критерия');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingCriterion(null);
  };

  const columns: TableColumnsType<IQualityCriteria> = [
    {
      title: 'Название критерия',
      dataIndex: 'name',
      width: 250,
      render: (name: string, record: IQualityCriteria) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '8px',
            background: record.is_global 
              ? 'linear-gradient(135deg, #722ed1 0%, #eb2f96 100%)'
              : 'linear-gradient(135deg, #ffd666 0%, #faad14 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 14,
            fontWeight: 'bold'
          }}>
            {record.is_global ? <GlobalOutlined /> : <StarOutlined />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Макс. баллы: {record.max_score || 100}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      width: 200,
      render: (description: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {description || '—'}
        </Text>
      ),
    },
    {
      title: 'Применение',
      width: 250,
      render: (_, record: IQualityCriteria) => {
        // Используем teams из записи критерия (с pivot)
        const teamNames = getTeamNames(record.teams as TeamWithPivot[]);
        const teamCount = record.teams?.length || 0;
        
        if (record.is_global) {
          return (
            <Tag color="purple" icon={<GlobalOutlined />}>
              Глобальный (все команды)
            </Tag>
          );
        }

        return (
          <Space direction="vertical" size={4}>
            <div>
              {teamNames.slice(0, 3).map((teamName, index) => (
                <Tag 
                  key={index}
                  color="blue"
                  icon={<TeamOutlined />}
                  style={{ 
                    margin: 2,
                    fontSize: 11,
                    fontWeight: 500
                  }}
                >
                  {teamName}
                </Tag>
              ))}
              {teamNames.length > 3 && (
                <Tooltip 
                  title={
                    <div>
                      {teamNames.slice(3).map((teamName, idx) => (
                        <div key={idx}>{teamName}</div>
                      ))}
                    </div>
                  }
                >
                  <Tag style={{ cursor: 'pointer', fontSize: 11 }}>
                    +{teamNames.length - 3} еще
                  </Tag>
                </Tooltip>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {teamCount} команд
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Макс. баллы',
      dataIndex: 'max_score',
      width: 120,
      align: 'center',
      render: (score: number) => (
        <Badge 
          count={score || 100} 
          showZero 
          style={{ 
            backgroundColor: '#52c41a',
            fontSize: '12px'
          }} 
        />
      )
    },
    {
      title: 'Статус',
      width: 100,
      render: (record: IQualityCriteria) => (
        <Badge 
          status={record.is_active ? "success" : "default"} 
          text={record.is_active ? "Активен" : "Неактивен"} 
        />
      )
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      width: 150,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {new Date(date).toLocaleDateString('ru-RU')}
        </Text>
      )
    },
    {
      title: 'Действия',
      align: 'center',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <SettingsActionButtons
          onEdit={() => showEditModal(record)}
          onDelete={() => handleDelete(record.id)}
          recordName={record.name}
          deleteConfirmTitle="Удаление критерия"
          isDeleting={isDestroying}
          editTooltip="Редактировать критерий"
          deleteTooltip="Удалить критерий"
        />
      )
    }
  ];

  const totalCriterias = qualityCriterias?.length || 0;
  const globalCriterias = qualityCriterias?.filter(c => c.is_global).length || 0;
  const teamCriterias = totalCriterias - globalCriterias;

  const stats = [
    {
      title: 'Всего критериев',
      value: totalCriterias,
      prefix: <LineChartOutlined />,
      valueStyle: { color: token.colorWarning }
    },
    {
      title: 'Глобальные',
      value: globalCriterias,
      prefix: <GlobalOutlined />,
      valueStyle: { color: token.colorWarning }
    },
    {
      title: 'Командные',
      value: teamCriterias,
      prefix: <TeamOutlined />,
      valueStyle: { color: token.colorPrimary }
    },
    {
      title: 'Доступные команды',
      value: teams?.length || 0,
      prefix: <TeamOutlined />,
      valueStyle: { color: token.colorSuccess }
    }
  ];

  return (
    <div style={{ padding: 'clamp(12px, 2vw, 24px)' }}>
      <SettingsPageHeader
        title="Критерии качества"
        description="Управление критериями оценки качества работы сотрудников"
        icon={<SettingOutlined style={{ color: token.colorWarning }} />}
        onCreateClick={showCreateModal}
        onRefreshClick={() => refetch()}
        isLoading={isFetching}
        createButtonText="Создать критерий"
      />

      <SettingsStatsCards stats={stats} />

      <Modal
        title={editingCriterion ? 'Редактирование критерия' : 'Создание нового критерия качества'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            max_score: 100,
            is_global: false,
            team_ids: [],
            description: '',
          }}
        >
          <Form.Item
            name="name"
            label="Название критерия"
            rules={[{ required: true, message: 'Введите название критерия' }]}
          >
            <Input 
              placeholder="Введите название критерия качества"
              prefix={<StarOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание критерия"
          >
            <TextArea 
              rows={3}
              placeholder="Введите описание критерия (необязательно)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="max_score"
            label="Максимальное количество баллов"
            rules={[{ required: true, message: 'Введите максимальное количество баллов' }]}
          >
            <InputNumber 
              min={1}
              max={100}
              style={{ width: '100%' }}
              placeholder="От 1 до 100"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="is_global"
            label="Тип критерия"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Глобальный"
              unCheckedChildren="Для команд"
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.is_global !== currentValues.is_global}
          >
            {({ getFieldValue }) => 
              !getFieldValue('is_global') && (
                <Form.Item
                  name="team_ids"
                  label="Команды для применения"
                  rules={[{ required: true, message: 'Выберите хотя бы одну команду' }]}
                  help="Критерий будет доступен только для выбранных команд"
                >
                  <Select 
                    mode="multiple" 
                    placeholder="Выберите команды"
                    loading={isTeamsLoading}
                    optionFilterProp="label"
                    showSearch
                    allowClear
                    size="large"
                  >
                    {teams?.map((team) => (
                      <Option key={team.id} value={team.id} label={team.name}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <TeamOutlined style={{ color: '#1890ff' }} />
                          {team.name}
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>

          <Divider />

          <Alert
            message="Информация о типах критериев"
            description={
              <div>
                <Text>
                  <strong>Глобальные критерии</strong> - применяются ко всем командам автоматически.
                  <br />
                  <strong>Командные критерии</strong> - применяются только к выбранным командам.
                </Text>
              </div>
            }
            type="info"
            showIcon
          />

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isCreating || isUpdating}
                size="large"
              >
                {editingCriterion ? 'Обновить критерий' : 'Создать критерий'}
              </Button>
              <Button 
                onClick={handleCancel}
                size="large"
              >
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card 
        title={
          <Space size="small">
            <LineChartOutlined />
            <span>Список критериев</span>
            <Badge 
              count={totalCriterias} 
              showZero 
              style={{ backgroundColor: token.colorWarning }} 
            />
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isFetching ? 'Обновление...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
      >
        <Table 
          columns={columns} 
          dataSource={qualityCriterias} 
          rowKey="id"
          loading={isQualityCriteriasLoading || isFetching}
          scroll={{ x: 'max-content' }}
          size="small"
          bordered
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total}`,
            pageSizeOptions: ['10', '20', '50'],
            responsive: true
          }}
        />
      </Card>
    </div>
  );
};

export default SettingsQualityCriteriasPage;