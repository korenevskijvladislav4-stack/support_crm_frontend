// pages/SettingsQualityCriteriasPage.tsx
import React, { useState } from 'react';
import { 
  Table,
  Space, 
  message, 
  Card, 
  Typography,
  Badge,
  Tag,
  Tooltip,
  theme,
  Form,
  type TableColumnsType 
} from "antd";
import SettingsPageHeader from "../../components/Settings/SettingsPageHeader";
import SettingsStatsCards from "../../components/Settings/SettingsStatsCards";
import SettingsActionButtons from "../../components/Settings/SettingsActionButtons";
import { QualityCriteriaModal } from "../../components/Settings/Modals";
import styles from "../../styles/settings/settings-pages.module.css";
import {
  StarOutlined,
  TeamOutlined,
  LineChartOutlined,
  GlobalOutlined,
  SettingOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { 
  useCreateQualityCriteriaMutation, 
  useDestroyQualityCriteriaMutation, 
  useGetAllQualityCriteriasQuery,
  useUpdateQualityCriteriaMutation 
} from "../../api/qualityCriteriasApi";
import type { IQualityCriteria, CriterionFormValues, TeamWithPivot } from "../../types/qualityCriterias.types";

const { Text } = Typography;

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
      category_id: criterion.category_id ?? criterion.category?.id ?? null,
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
        category_id: values.category_id || null,
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
        <div className={styles.tableCellContent}>
          <div className={`${styles.tableIcon} ${record.is_global ? styles.tableIconGradientPink : styles.tableIconGradient}`}>
            {record.is_global ? <GlobalOutlined /> : <StarOutlined />}
          </div>
          <div>
            <div className={styles.tableCellText}>{name}</div>
            <Text type="secondary" className={styles.tableCellSecondary}>
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
      title: 'Категория',
      dataIndex: 'category',
      width: 180,
      render: (category: IQualityCriteria['category']) => {
        if (!category) {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              — Без категории
            </Text>
          );
        }
        return (
          <Tag 
            color="cyan" 
            icon={<FolderOutlined />}
            style={{ 
              fontSize: 12,
              fontWeight: 500
            }}
          >
            {category.name}
          </Tag>
        );
      },
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
    <div className={styles.pageContainer}>
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

      <QualityCriteriaModal
        open={isModalOpen}
        editingCriterion={editingCriterion}
        onOk={async (values) => {
          await handleSubmit(values);
        }}
        onCancel={handleCancel}
        form={form}
        teams={teams}
        isLoadingTeams={isTeamsLoading}
        isSubmitting={isCreating || isUpdating}
      />

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
        <Table<IQualityCriteria>
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
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50'],
            responsive: true
          }}
        />
      </Card>
    </div>
  );
};

export default SettingsQualityCriteriasPage;