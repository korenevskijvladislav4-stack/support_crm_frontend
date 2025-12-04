import React from 'react';
import { Card, Flex, Typography, Badge, Button, Space } from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  CrownOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import type { ITicket } from '../../types/ticket.types';
import { getPriorityConfig } from '../../utils/ticketUtils';

const { Title, Text } = Typography;

interface HeaderSectionProps {
  ticket: ITicket;
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ ticket }) => {
  const navigate = useNavigate();
  const priority = getPriorityConfig(ticket.priority);

  return (
    <Card 
      style={{ 
        background: priority.gradient,
        border: 'none',
        borderRadius: '24px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 32,
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      }}
      bodyStyle={{ padding: '40px' }}
    >
      {/* Декоративные элементы */}
      <FloatingElements />
      
      <Flex justify="space-between" align="flex-start" style={{ position: 'relative', zIndex: 2 }}>
        <Flex align="flex-start" gap={32} style={{ flex: 1 }}>
          <TicketIcon />
          
          <div style={{ flex: 1 }}>
            <TicketTitle title={ticket.title} />
            <TicketMetadata ticket={ticket} priority={priority} />
            <TicketDetails ticket={ticket} />
          </div>
        </Flex>
        
        <ActionButtons ticketId={ticket.id} navigate={navigate} priority={priority} />
      </Flex>

      <FloatingAnimationStyles />
    </Card>
  );
};

// Вспомогательные компоненты
const FloatingElements: React.FC = () => (
  <>
    <div style={floatingElementStyle({ top: -50, right: -50, width: 200, height: 200, animationDelay: '0s' })} />
    <div style={floatingElementStyle({ bottom: -30, left: '10%', width: 120, height: 120, animationDelay: '1s' })} />
    <div style={floatingElementStyle({ top: '30%', right: '20%', width: 80, height: 80, animationDelay: '2s' })} />
  </>
);

const floatingElementStyle = (position: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)',
  animation: 'float 6s ease-in-out infinite',
  ...position
});

const TicketIcon: React.FC = () => (
  <div style={{
    width: 100,
    height: 100,
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    border: '2px solid rgba(255,255,255,0.3)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
    }} />
    <CrownOutlined style={{ position: 'relative', zIndex: 1 }} />
  </div>
);

const TicketTitle: React.FC<{ title: string }> = ({ title }) => (
  <Flex align="center" gap={16} style={{ marginBottom: 20 }}>
    <Title level={1} style={{ 
      margin: 0, 
      fontSize: '42px', 
      fontWeight: 900, 
      lineHeight: 1.1,
      color: 'white',
      textShadow: '0 4px 8px rgba(0,0,0,0.2)',
      background: 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {title}
    </Title>
  </Flex>
);

const TicketMetadata: React.FC<{ ticket: ITicket; priority: any }> = ({ ticket, priority }) => (
  <Flex align="center" gap={24} wrap style={{ marginBottom: 24 }}>
    <MetadataBadge content={`#${ticket.ticket_number}`} />
    <StatusBadge status={ticket.status} />
    <PriorityBadge priority={priority} />
  </Flex>
);

const MetadataBadge: React.FC<{ content: string }> = ({ content }) => (
  <Flex align="center" gap={12}>
    <div style={badgeStyle}>
      <Text strong style={{ color: 'white', fontSize: '18px', letterSpacing: '0.5px' }}>
        {content}
      </Text>
    </div>
  </Flex>
);

const StatusBadge: React.FC<{ status: ITicket['status'] }> = ({ status }) => (
  <Flex align="center" gap={12}>
    <div style={{ ...badgeStyle, border: `2px solid ${status?.color}40` }}>
      <Badge 
        color={status?.color} 
        text={
          <Text strong style={{ color: 'white', fontSize: '16px' }}>
            {status?.name}
          </Text>
        } 
      />
    </div>
  </Flex>
);

const PriorityBadge: React.FC<{ priority: any }> = ({ priority }) => (
  <Flex align="center" gap={12}>
    <div style={badgeStyle}>
      <Text style={{ color: 'white', fontSize: '16px', fontWeight: 600 }}>
        {priority.icon} {priority.text}
      </Text>
    </div>
  </Flex>
);

const badgeStyle: React.CSSProperties = {
  padding: '10px 18px',
  background: 'rgba(255,255,255,0.15)',
  borderRadius: '14px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.3)'
};

const TicketDetails: React.FC<{ ticket: ITicket }> = ({ ticket }) => (
  <Flex align="center" gap={32} wrap>
    <DetailItem 
      icon="user" 
      label="Создатель" 
      value={`${ticket.creator?.name} ${ticket.creator?.surname}`} 
    />
    <DetailItem 
      icon="calendar" 
      label="Создан" 
      value={new Date(ticket.created_at).toLocaleDateString('ru-RU')} 
    />
    <DetailItem 
      icon="team" 
      label="Команда" 
      value={ticket.team?.name || 'Не назначена'} 
    />
    <DetailItem 
      icon="file" 
      label="Тип" 
      value={ticket.type?.name} 
    />
  </Flex>
);

const DetailItem: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => {
  const getIconComponent = () => {
    switch (icon) {
      case 'user': return <UserOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }} />;
      case 'calendar': return <CalendarOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }} />;
      case 'team': return <TeamOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }} />;
      case 'file': return <FileTextOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }} />;
      default: return <UserOutlined style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px' }} />;
    }
  };

  return (
    <Flex align="center" gap={12}>
      <div style={iconStyle}>
        {getIconComponent()}
      </div>
      <div>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', display: 'block' }}>
          {label}
        </Text>
        <Text strong style={{ color: 'white', fontSize: '16px' }}>
          {value}
        </Text>
      </div>
    </Flex>
  );
};

const iconStyle: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(255,255,255,0.2)'
};

const ActionButtons: React.FC<{ ticketId: number; navigate: any; priority: any }> = ({ 
  ticketId, navigate, priority 
}) => (
  <Space direction="vertical" style={{ position: 'relative', zIndex: 2 }}>
    <Button 
      icon={<ArrowLeftOutlined />} 
      onClick={() => navigate('/tickets')}
      style={backButtonStyle}
    >
      Назад к списку
    </Button>
    <Link to={`/tickets/${ticketId}/edit`}>
      <Button 
        type="primary" 
        icon={<EditOutlined />}
        style={{ ...editButtonStyle, color: priority.color }}
      >
        Редактировать
      </Button>
    </Link>
  </Space>
);

const backButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  fontWeight: 600,
  height: 48,
  padding: '0 20px',
  fontSize: '15px'
};

const editButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  fontWeight: 700,
  borderRadius: '12px',
  height: 48,
  padding: '0 24px',
  fontSize: '15px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
};

const FloatingAnimationStyles: React.FC = () => (
  <style>
    {`
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
    `}
  </style>
);