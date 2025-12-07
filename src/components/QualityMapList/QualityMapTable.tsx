import React from 'react';
import { Card, Table, Button, Typography, Empty } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import { theme } from 'antd';
const { Title, Text } = Typography;

import type { TableColumnsType } from 'antd';
import type { IQualityMapListItem } from '../../types/quality.types';

interface QualityMapTableProps {
  columns: TableColumnsType<IQualityMapListItem>;
  data: IQualityMapListItem[];
  loading: boolean;
  filters: { page: number; per_page: number; search?: string; team_id?: number; status: string };
  meta?: { total?: number };
  onTableChange: (pagination: unknown, filters: unknown, sorter: unknown) => void;
  navigate: (path: string) => void;
}

const QualityMapTable: React.FC<QualityMapTableProps> = ({
  columns,
  data,
  loading,
  filters,
  meta,
  onTableChange,
  navigate
}) => {
  const { token } = theme.useToken();

  return (
    <Card
      style={{
        borderRadius: 8,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        border: `1px solid ${token.colorBorderSecondary}`
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        onChange={onTableChange}
        pagination={{
          current: filters.page,
          pageSize: filters.per_page,
          total: meta?.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) =>
            `Показано ${range[0]}-${range[1]} из ${total}`,
          style: { padding: '16px' }
        }}
        locale={{
          emptyText: (
            <Empty
              image={<FileTextOutlined style={{ fontSize: 64, color: token.colorTextTertiary }} />}
              description={
                <div>
                  <Title level={4} style={{ color: token.colorTextSecondary, marginBottom: 8 }}>
                    Карты качества не найдены
                  </Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                    {filters.search || filters.team_id || filters.status !== 'all'
                      ? 'Попробуйте изменить параметры фильтрации'
                      : 'Создайте первую карту качества для начала работы'
                    }
                  </Text>
                  {(!filters.search && !filters.team_id && filters.status === 'all') && (
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate('/quality/create')}
                      size="large"
                    >
                      Создать карту качества
                    </Button>
                  )}
                </div>
              }
            />
          )
        }}
        style={{ backgroundColor: token.colorBgContainer }}
      />
    </Card>
  );
};

export default QualityMapTable;
