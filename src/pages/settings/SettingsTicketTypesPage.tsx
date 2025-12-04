import React, { useState } from 'react';
import { 
  Table,
  Card, 
  Space, 
  Typography, 
  Tag,
  message,
  Form,
  type TableColumnsType 
} from 'antd';
import SettingsPageHeader from '../../components/Settings/SettingsPageHeader';
import SettingsStatsCards from '../../components/Settings/SettingsStatsCards';
import SettingsActionButtons from '../../components/Settings/SettingsActionButtons';
import { TicketTypeModal } from '../../components/Settings/Modals';
import styles from '../../styles/settings/settings-pages.module.css';
import { 
  SettingOutlined
} from '@ant-design/icons';
import { 
  useGetTicketTypesQuery, 
  useCreateTicketTypeMutation, 
  useUpdateTicketTypeMutation,
  useDeleteTicketTypeMutation
} from '../../api/ticketsApi';
import type { ITicketType, ITicketField } from '../../types/ticket.types';
import { theme } from 'antd';

const { Text } = Typography;
const { useToken } = theme;

const SettingsTicketTypesPage: React.FC = () => {
  const { token } = useToken();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<ITicketType | null>(null);
  const [form] = Form.useForm();
  
  const { data: types, isLoading, isFetching, refetch } = useGetTicketTypesQuery();
  const [createType, { isLoading: isCreating }] = useCreateTicketTypeMutation();
  const [updateType, { isLoading: isUpdating }] = useUpdateTicketTypeMutation();
  const [deleteType, { isLoading: isDeleting }] = useDeleteTicketTypeMutation();

  const showCreateModal = () => {
    setEditingType(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (type: ITicketType) => {
    setEditingType(type);
    form.setFieldsValue({
      ...type,
      fields: type.fields || [],
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteType(id).unwrap();
      message.success('Тип тикета успешно удален');
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      message.error('Ошибка при удалении типа тикета');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingType) {
        await updateType({
          id: editingType.id,
          data: values,
        }).unwrap();
        message.success('Тип тикета успешно обновлен');
      } else {
        await createType(values).unwrap();
        message.success('Тип тикета успешно создан');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingType(null);
    } catch (error) {
      console.error('Validation failed:', error);
      message.error(editingType ? 'Ошибка при обновлении типа тикета' : 'Ошибка при создании типа тикета');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingType(null);
  };

  const columns: TableColumnsType<ITicketType> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <Text strong style={{ color: token.colorText }}>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Поля',
      dataIndex: 'fields',
      key: 'fields',
      render: (fields: ITicketField[]) => (
        <Space size={[0, 4]} wrap>
          {fields?.map((field, index) => (
            <Tag key={index} color="blue" style={{ fontSize: 11 }}>
              {field.label} ({field.type})
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <SettingsActionButtons
          onEdit={() => showEditModal(record)}
          onDelete={() => handleDelete(record.id)}
          recordName={record.name}
          deleteConfirmTitle="Удаление типа тикета"
          isDeleting={isDeleting}
          editTooltip="Редактировать"
          deleteTooltip="Удалить"
        />
      ),
    },
  ];

  const totalTypes = types?.length || 0;
  const activeTypes = types?.filter(t => t.is_active).length || 0;

  const stats = [
    {
      title: 'Всего типов',
      value: totalTypes,
      prefix: <SettingOutlined />,
      valueStyle: { color: token.colorPrimary }
    },
    {
      title: 'Активных',
      value: activeTypes,
      valueStyle: { color: token.colorSuccess }
    }
  ];

  return (
    <div className={styles.pageContainer}>
      <SettingsPageHeader
        title="Типы тикетов"
        description="Управление типами запросов и их полями"
        icon={<SettingOutlined style={{ color: token.colorPrimary }} />}
        onCreateClick={showCreateModal}
        onRefreshClick={() => refetch()}
        isLoading={isFetching}
        createButtonText="Добавить тип"
      />

      <SettingsStatsCards stats={stats} />

      <Card>
        <Table<ITicketType>
          columns={columns}
          dataSource={types}
          rowKey="id"
          loading={isLoading || isFetching}
          size="small"
          bordered
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Всего типов: ${total}`,
          }}
        />
      </Card>

      <TicketTypeModal
        open={isModalVisible}
        editingType={editingType}
        onOk={handleOk}
        onCancel={handleCancel}
        form={form}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
};

export default SettingsTicketTypesPage;
