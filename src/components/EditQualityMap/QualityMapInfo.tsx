import { useMemo } from 'react';
import { Card, Space, Typography, Row, Col, Flex, theme } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import type { QualityMap } from '../../types/quality.types';
import { formatDate } from '../../utils/dateUtils';

const { Text } = Typography;

interface QualityMapInfoProps {
  qualityMap: QualityMap;
  mode?: 'edit' | 'view';
}

function QualityMapInfo({ qualityMap }: QualityMapInfoProps) {
  const { token } = theme.useToken();

  // Расчёт среднего балла
  const averageScore = useMemo(() => {
    if (typeof qualityMap.score === 'number') {
      return qualityMap.score;
    }
    return 0;
  }, [qualityMap.score]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const infoItems = [
    {
      icon: <UserOutlined style={{ color: token.colorPrimary }} />,
      label: 'Сотрудник',
      value: `${qualityMap.user?.name || ''} ${qualityMap.user?.surname || ''}`.trim() || 'Не указан',
    },
    {
      icon: <TeamOutlined style={{ color: token.colorPrimary }} />,
      label: 'Команда',
      value: qualityMap.team?.name || 'Не указана',
    },
    {
      icon: <CalendarOutlined style={{ color: token.colorPrimary }} />,
      label: 'Период',
      value: `${formatDate(qualityMap.period.start)} — ${formatDate(qualityMap.period.end)}`,
    },
    {
      icon: <CheckCircleOutlined style={{ color: token.colorPrimary }} />,
      label: 'Проверяющий',
      value: qualityMap.checker?.name || 'Не указан',
    },
  ];

  return (
    <Card 
      size="small"
      style={{ 
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <Row gutter={[24, 16]} align="middle">
        {/* Информация о карте */}
        <Col xs={24} lg={18}>
          <Flex gap={24} wrap="wrap">
            {infoItems.map((item, index) => (
              <Space key={index} size={8}>
                {item.icon}
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    {item.label}
                  </Text>
                  <Text strong style={{ fontSize: 13 }}>
                    {item.value}
                  </Text>
                </div>
              </Space>
            ))}
          </Flex>
        </Col>

        {/* Средний балл */}
        <Col xs={24} lg={6}>
          <Flex justify="flex-end">
            <Space size={8} align="center">
              <TrophyOutlined style={{ color: getScoreColor(averageScore), fontSize: 18 }} />
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                  Средний балл
                </Text>
                <Text 
                  strong 
                  style={{ 
                    fontSize: 20, 
                    fontWeight: 700,
                    color: getScoreColor(averageScore)
                  }}
                >
                  {averageScore}%
                </Text>
              </div>
            </Space>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
}

export default QualityMapInfo;
