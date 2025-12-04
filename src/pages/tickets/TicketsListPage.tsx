import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Badge,
  Typography,
  Tooltip,
  theme,
  Select,
  Button
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useGetTicketsQuery, useGetTicketStatusesQuery, useGetTicketTypesQuery } from '../../api/ticketsApi';
import type { ITicket, ITicketFilters } from '../../types/ticket.types';
import type { TableColumnsType } from 'antd';
import { TicketsPageHeader, TicketsFilters, TicketsStats } from '../../components/Tickets';
import styles from '../../styles/tickets/tickets-page.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const TicketsListPage: React.FC = () => {
  const { token } = theme.useToken();
  const [filters, setFilters] = useState<ITicketFilters>({});
  const { data: tickets, isLoading } = useGetTicketsQuery(filters);
  const { data: statuses } = useGetTicketStatusesQuery();
  const { data: types } = useGetTicketTypesQuery();

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'blue',
      medium: 'orange',
      high: 'red',
      urgent: 'purple'
    };
    return colors[priority as keyof typeof colors] || 'default';
  };

  const columns: TableColumnsType<ITicket> = [
    {
      title: 'Номер',
      dataIndex: 'ticket_number',
      width: 120,
      render: (number: string, record) => (
        <Link to={`/tickets/${record.id}`}>
          <Text strong style={{ color: '#1890ff' }}>
            {number}
          </Text>
        </Link>
      ),
    },
    {
      title: 'Заголовок',
      dataIndex: 'title',
      width: 300,
      render: (title: string, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.type?.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      width: 120,
      render: (status) => (
        <Badge 
          color={status?.color} 
          text={status?.name}
        />
      ),
      filtered: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Select
            style={{ width: 200, marginBottom: 8 }}
            placeholder="Выберите статус"
            value={selectedKeys[0]}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            allowClear
          >
            {statuses?.map(status => (
              <Option key={status.id} value={status.id}>
                <Badge color={status.color} text={status.name} />
              </Option>
            ))}
          </Select>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setFilters(prev => ({ ...prev, status_id: selectedKeys[0] as number }));
                confirm();
              }}
              size="small"
            >
              Применить
            </Button>
            <Button
              onClick={() => {
                setFilters(prev => ({ ...prev, status_id: undefined }));
                clearFilters?.();
              }}
              size="small"
            >
              Сброс
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'low' && 'Низкий'}
          {priority === 'medium' && 'Средний'}
          {priority === 'high' && 'Высокий'}
          {priority === 'urgent' && 'Срочный'}
        </Tag>
      ),
    },
    {
      title: 'Создатель',
      dataIndex: 'creator',
      width: 150,
      render: (creator) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 10,
            fontWeight: 'bold'
          }}>
            {creator?.name?.[0]}{creator?.surname?.[0]}
          </div>
          <Text>{creator?.name} {creator?.surname}</Text>
        </div>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="Просмотр тикета">
          <Link to={`/tickets/${record.id}`}>
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              style={{ color: '#1890ff' }}
            />
          </Link>
        </Tooltip>
      ),
    },
  ];

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  return (
    <div className={styles.pageContainer}>
      <TicketsPageHeader />

      <TicketsFilters
        filters={filters}
        onFiltersChange={setFilters}
        types={types}
        hasActiveFilters={hasActiveFilters}
      />

      <TicketsStats tickets={tickets?.data} />

      {/* Таблица */}
      <Card 
        title={
          <Space size="small">
            <span>Список тикетов</span>
            <Badge count={tickets?.data?.length || 0} showZero style={{ backgroundColor: token.colorPrimary }} />
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isLoading ? 'Загрузка...' : `Обновлено: ${new Date().toLocaleTimeString()}`}
          </Text>
        }
        style={{ background: token.colorBgContainer }}
      >
        <Table<ITicket>
          dataSource={tickets?.data}
          columns={columns}
          loading={isLoading}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            responsive: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} тикетов`,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
        />
      </Card>
    </div>
  );
};

export default TicketsListPage;