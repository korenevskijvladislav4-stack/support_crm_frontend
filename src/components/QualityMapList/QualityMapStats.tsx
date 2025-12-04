import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { FileTextOutlined, ReloadOutlined, ExclamationCircleOutlined, FilterOutlined } from '@ant-design/icons';

interface QualityMapStatsProps {
  totalMaps: number;
  activeMaps: number;
  totalDeductions: number;
  perPage: number;
}

const QualityMapStats: React.FC<QualityMapStatsProps> = ({ totalMaps, activeMaps, totalDeductions, perPage }) => (
  <Row gutter={[24, 24]} style={{ marginBottom: 8 }}>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic title="Всего карт" value={totalMaps} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic title="Активные проверки" value={activeMaps} prefix={<ReloadOutlined />} valueStyle={{ color: '#52c41a' }} />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic title="Общие снятия" value={totalDeductions} prefix={<ExclamationCircleOutlined />} valueStyle={{ color: '#ff4d4f' }} />
      </Card>
    </Col>
    <Col xs={24} sm={8} md={6}>
      <Card>
        <Statistic title="Записей на странице" value={perPage} prefix={<FilterOutlined />} valueStyle={{ color: '#722ed1' }} />
      </Card>
    </Col>
  </Row>
);

export default QualityMapStats;
