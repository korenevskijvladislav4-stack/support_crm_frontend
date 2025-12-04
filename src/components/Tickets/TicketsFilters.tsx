import React from 'react';
import { Card, Row, Col, Input, Select, Button, Space, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import type { ITicketFilters, ITicketType } from '../../types/ticket.types';
import styles from '../../styles/tickets/tickets-page.module.css';

const { Option } = Select;

interface TicketsFiltersProps {
  filters: ITicketFilters;
  onFiltersChange: (filters: ITicketFilters) => void;
  types?: ITicketType[];
  hasActiveFilters: boolean;
}

const TicketsFilters: React.FC<TicketsFiltersProps> = ({
  filters,
  onFiltersChange,
  types,
  hasActiveFilters
}) => {
  return (
    <Card className={styles.filtersCard}>
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8}>
          <Input
            placeholder="Поиск по заголовку или номеру..."
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            allowClear
          />
        </Col>
        
        <Col xs={24} sm={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Тип тикета"
            value={filters.type_id}
            onChange={(value) => onFiltersChange({ ...filters, type_id: value })}
            allowClear
          >
            {types?.map(type => (
              <Option key={type.id} value={type.id}>{type.name}</Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Приоритет"
            value={filters.priority}
            onChange={(value) => onFiltersChange({ ...filters, priority: value })}
            allowClear
          >
            <Option value="low">Низкий</Option>
            <Option value="medium">Средний</Option>
            <Option value="high">Высокий</Option>
            <Option value="urgent">Срочный</Option>
          </Select>
        </Col>

        <Col xs={24} sm={4}>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => onFiltersChange({})}
              disabled={!hasActiveFilters}
            >
              Сбросить
            </Button>
            {hasActiveFilters && (
              <Tag color="orange">
                <FilterOutlined /> Фильтры активны
              </Tag>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default TicketsFilters;

