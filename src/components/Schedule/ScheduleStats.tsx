import type { FC } from "react";
import { Card, Row, Col, Typography, theme } from "antd";
import { CalendarOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ScheduleStatsProps {
  totalShifts: number;
  totalHours: number;
  activeUsers: number;
  shiftType: string;
}

export const ScheduleStats: FC<ScheduleStatsProps> = ({
  totalShifts,
  totalHours,
  activeUsers,
  shiftType,
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';

  const stats = [
    {
      label: 'Всего смен',
      value: totalShifts,
      icon: <CalendarOutlined style={{ fontSize: 18, color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      label: 'Часов работы',
      value: totalHours,
      icon: <ClockCircleOutlined style={{ fontSize: 18, color: '#52c41a' }} />,
      color: '#52c41a',
    },
    {
      label: 'Сотрудников',
      value: activeUsers,
      icon: <UserOutlined style={{ fontSize: 18, color: '#722ed1' }} />,
      color: '#722ed1',
    },
    {
      label: 'Тип смен',
      value: shiftType,
      icon: null,
      color: '#fa8c16',
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
      {stats.map((stat, index) => (
        <Col xs={12} sm={6} key={index}>
          <Card
            bordered={false}
            style={{
              borderRadius: 8,
              boxShadow: isDark 
                ? '0 1px 3px rgba(0, 0, 0, 0.3)' 
                : '0 1px 2px rgba(0, 0, 0, 0.03)',
              border: `1px solid ${token.colorBorderSecondary}`,
              height: '100%',
              background: token.colorBgContainer,
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              {stat.icon && (
                <div style={{ 
                  padding: 8,
                  borderRadius: 6,
                  background: isDark 
                    ? `${stat.color}20` 
                    : `${stat.color}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {stat.icon}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 12,
                    display: 'block',
                    marginBottom: 4,
                    color: token.colorTextSecondary
                  }}
                >
                  {stat.label}
                </Text>
                <div style={{ 
                  fontSize: 20,
                  fontWeight: 600,
                  color: stat.color,
                  lineHeight: 1.2
                }}>
                  {stat.value}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
