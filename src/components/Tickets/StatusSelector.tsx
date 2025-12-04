import React from 'react';
import { Flex, Select, Typography, Badge } from 'antd';
import { RocketOutlined, SyncOutlined } from '@ant-design/icons';
import type { ITicket, ITicketStatus } from '../../types/ticket.types';

const { Text } = Typography;
const { Option } = Select;

interface StatusSelectorProps {
  ticket: ITicket;
  statuses: ITicketStatus[];
  isChanging: boolean;
  onStatusChange: (statusId: number) => void;
}

export const StatusSelector: React.FC<StatusSelectorProps> = ({
  ticket,
  statuses,
  isChanging,
  onStatusChange
}) => {
  return (
    <Flex vertical gap={8} style={{ width: '100%' }}>
      <Text strong style={{ color: '#666', fontSize: '14px' }}>
        Статус:
      </Text>
      <Select
        value={ticket.status_id}
        onChange={onStatusChange}
        loading={isChanging}
        style={{ width: '100%' }}
        size="middle"
        suffixIcon={isChanging ? <SyncOutlined spin /> : <RocketOutlined />}
      >
        {statuses.map(status => (
          <Option key={status.id} value={status.id}>
            <Flex align="center" gap={8}>
              <Badge color={status.color} />
              <Text>{status.name}</Text>
            </Flex>
          </Option>
        ))}
      </Select>
    </Flex>
  );
};