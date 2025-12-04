import { type FC, memo } from "react";
import { Table, Tooltip, Dropdown, Space, theme, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CalendarOutlined } from "@ant-design/icons";
import type { TableColumnsType, MenuProps } from "antd";
import type { IUserWithShifts } from "../../types/user.types";
import type { IShift } from "../../types/shifts.types";

interface ScheduleTableProps {
  columns: TableColumnsType<IUserWithShifts>;
  data?: IUserWithShifts[];
  loading?: boolean;
  emptyText?: React.ReactNode;
}

export const ScheduleTable: FC<ScheduleTableProps> = ({
  columns,
  data,
  loading,
  emptyText,
}) => {
  const { token } = theme.useToken();

  return (
    <Card 
      size="small"
      title={
        <Space size="small">
          <CalendarOutlined style={{ fontSize: 14 }} />
          <span style={{ fontSize: 14 }}>График смен</span>
        </Space>
      }
      style={{ background: token.colorBgContainer }}
      bodyStyle={{ padding: '12px' }}
    >
        <Table
          size="small"
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{ emptyText }}
          scroll={{ x: 'max-content' }}
          pagination={false}
          rowKey="id"
          bordered
        />
    </Card>
  );
};

// Компонент для отображения ячейки смены
interface ShiftCellProps {
  shift: IShift;
  record: IUserWithShifts;
  currentUser?: { id?: number; roles?: Array<{ name: string }> };
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onEdit?: (shift: IShift) => void;
  onDelete?: (id: number) => void;
}

export const ShiftCell: FC<ShiftCellProps> = memo(({
  shift,
  record,
  currentUser,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  const isCurrentUser = record.id === currentUser?.id;
  const hasUserShiftId = shift.user_shift_id;

  // Определяем стиль в зависимости от статуса с учетом темной темы
  const getShiftStyle = () => {
    if (shift.status === 'pending') {
      return {
        background: isDark ? '#3d2816' : '#fff7e6',
        border: `1px solid ${isDark ? '#8b4513' : '#ffd591'}`,
        color: isDark ? '#ffa940' : '#d46b08',
      };
    }
    if (shift.duration === 12) {
      return {
        background: isDark ? '#162312' : '#f6ffed',
        border: `1px solid ${isDark ? '#3f6600' : '#b7eb8f'}`,
        color: isDark ? '#73d13d' : '#389e0d',
      };
    }
    return {
      background: isDark ? '#111b26' : '#e6f7ff',
      border: `1px solid ${isDark ? '#003a8c' : '#91d5ff'}`,
      color: isDark ? '#69c0ff' : '#0958d9',
    };
  };

  const tooltipTitle = shift.status === 'pending' 
    ? `Запрошенная смена: ${shift.duration}ч (ожидает одобрения)`
    : `Смена: ${shift.duration}ч`;

  // Формируем меню действий
  const menuItems: MenuProps['items'] = [];

  if (shift.status === 'pending' && hasUserShiftId) {
    menuItems.push(
      {
        key: 'approve',
        label: (
          <Space>
            <CheckOutlined style={{ color: '#52c41a' }} />
            <span>Одобрить</span>
          </Space>
        ),
        onClick: () => onApprove?.(shift.user_shift_id!),
      },
      {
        key: 'reject',
        label: (
          <Space>
            <CloseOutlined style={{ color: '#ff4d4f' }} />
            <span>Отклонить</span>
          </Space>
        ),
        onClick: () => onReject?.(shift.user_shift_id!),
      }
    );
    if (isCurrentUser) {
      menuItems.push({
        key: 'delete',
        label: (
          <Space>
            <DeleteOutlined style={{ color: '#ff4d4f' }} />
            <span>Удалить запрос</span>
          </Space>
        ),
        onClick: () => {
          if (!shift.user_shift_id) return;
          onDelete?.(shift.user_shift_id);
        },
      });
    }
  }

  if (shift.status === 'approved' && hasUserShiftId) {
    menuItems.push({
      key: 'edit',
      label: (
        <Space>
          <EditOutlined />
          <span>Редактировать</span>
        </Space>
      ),
      onClick: () => onEdit?.(shift),
    });
    menuItems.push({
      key: 'delete',
      label: (
        <Space>
          <DeleteOutlined style={{ color: '#ff4d4f' }} />
          <span>Удалить</span>
        </Space>
      ),
      onClick: () => {
        if (!shift.user_shift_id) return;
        onDelete?.(shift.user_shift_id);
      },
    });
  }

  const shiftStyle = getShiftStyle();

  if (menuItems.length > 0) {
    return (
      <Dropdown 
        menu={{ items: menuItems }}
        trigger={['click']}
        placement="bottom"
      >
        <Tooltip 
          title={tooltipTitle}
          overlayInnerStyle={{ 
            backgroundColor: token.colorBgElevated,
            color: token.colorText,
            border: `1px solid ${token.colorBorder}`
          }}
        >
          <div
            style={{
              ...shiftStyle,
              padding: '4px 8px',
              borderRadius: 4,
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13,
              textAlign: 'center',
              transition: 'all 0.2s',
              display: 'inline-block',
              minWidth: 32,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {shift.duration}
          </div>
        </Tooltip>
      </Dropdown>
    );
  }

  return (
      <Tooltip 
        title={tooltipTitle}
        overlayInnerStyle={{ 
          backgroundColor: token.colorBgElevated,
          color: token.colorText,
          border: `1px solid ${token.colorBorder}`
        }}
      >
      <div
        style={{
          ...shiftStyle,
          padding: '4px 8px',
          borderRadius: 4,
          fontWeight: 500,
          fontSize: 13,
          textAlign: 'center',
          display: 'inline-block',
          minWidth: 32,
        }}
      >
        {shift.duration}
      </div>
    </Tooltip>
  );
});

ShiftCell.displayName = 'ShiftCell';

// Компонент для пустой ячейки
interface EmptyShiftCellProps {
  dayNumber: number;
  record: IUserWithShifts;
  onRequestShift?: (dayNumber: number) => void;
  onAddShift?: (dayNumber: number, userId?: number) => void;
}

export const EmptyShiftCell: FC<EmptyShiftCellProps> = memo(({
  dayNumber,
  record,
  onRequestShift,
  onAddShift,
}) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  const emptyCellMenuItems: MenuProps['items'] = [];

  if (onAddShift) {
    emptyCellMenuItems.push({
      key: "add-direct",
      label: (
        <Space>
          <PlusOutlined />
          <span>Добавить смену</span>
        </Space>
      ),
      onClick: () => onAddShift?.(dayNumber, record.id),
    });
  }

  if (onRequestShift) {
    emptyCellMenuItems.push({
      key: "request",
      label: (
        <Space>
          <PlusOutlined />
          <span>Запросить смену</span>
        </Space>
      ),
      onClick: () => onRequestShift?.(dayNumber),
    });
  }

  if (emptyCellMenuItems.length === 0) {
    return <div style={{ height: 32 }} />;
  }

  return (
    <Dropdown 
      menu={{ items: emptyCellMenuItems }}
      placement="bottom"
      trigger={['click']}
    >
      <div 
        style={{
          width: '100%',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: 4,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isDark ? token.colorFillTertiary : '#f5f5f5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <PlusOutlined style={{ 
          color: isDark ? token.colorTextTertiary : '#bfbfbf', 
          fontSize: 12 
        }} />
      </div>
    </Dropdown>
  );
});
