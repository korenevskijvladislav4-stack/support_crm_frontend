import { type FC, memo, useMemo } from "react";
import { Table, Tooltip, Dropdown, Space, theme, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined, CalendarOutlined, CrownOutlined } from "@ant-design/icons";
import type { TableColumnsType, MenuProps } from "antd";
import type { IScheduleTableRow, IScheduleShift, ShiftsMap } from "../../types/schedule.types";
import dayjs from "dayjs";
import styles from "../../styles/schedule/schedule-cells.module.css";

// ============ SHIFT CELL ============
interface ShiftCellProps {
  shift: IScheduleShift;
  userId: number;
  currentUserId?: number;
  canManage?: boolean;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onEdit?: (shift: IScheduleShift) => void;
  onDelete?: (id: number) => void;
}

const ShiftCellComponent: FC<ShiftCellProps> = ({
  shift,
  userId,
  currentUserId,
  canManage = false,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) => {
  const { token } = theme.useToken();
  const isCurrentUser = userId === currentUserId;
  const hasUserShiftId = shift.user_shift_id;

  const cellClassName = useMemo(() => {
    if (shift.status === 'pending') return styles.shiftPending;
    if (shift.duration === 12) return styles.shiftApproved;
    return styles.shiftApprovedShort;
  }, [shift.status, shift.duration]);

  const tooltipTitle = shift.status === 'pending' 
    ? `Запрошенная смена: ${shift.duration}ч (ожидает одобрения)`
    : `Смена: ${shift.duration}ч`;

  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];

    if (shift.status === 'pending' && hasUserShiftId) {
      if (canManage && onApprove) {
        items.push({
          key: 'approve',
          label: <Space><CheckOutlined style={{ color: '#52c41a' }} /><span>Одобрить</span></Space>,
          onClick: () => onApprove?.(shift.user_shift_id!),
        });
      }
      if (canManage && onReject) {
        items.push({
          key: 'reject',
          label: <Space><CloseOutlined style={{ color: '#ff4d4f' }} /><span>Отклонить</span></Space>,
          onClick: () => onReject?.(shift.user_shift_id!),
        });
      }
      if (isCurrentUser && onDelete) {
        items.push({
          key: 'delete',
          label: <Space><DeleteOutlined style={{ color: '#ff4d4f' }} /><span>Удалить запрос</span></Space>,
          onClick: () => onDelete?.(shift.user_shift_id!),
        });
      }
    }

    if (shift.status === 'approved' && hasUserShiftId && canManage) {
      if (onEdit) {
        items.push({
          key: 'edit',
          label: <Space><EditOutlined /><span>Редактировать</span></Space>,
          onClick: () => onEdit?.(shift),
        });
      }
      if (onDelete) {
        items.push({
          key: 'delete',
          label: <Space><DeleteOutlined style={{ color: '#ff4d4f' }} /><span>Удалить</span></Space>,
          onClick: () => onDelete?.(shift.user_shift_id!),
        });
      }
    }

    return items;
  }, [shift, hasUserShiftId, isCurrentUser, canManage, onApprove, onReject, onEdit, onDelete]);

  const content = (
    <div className={`${styles.shiftCell} ${cellClassName}`}>
      {shift.duration}
    </div>
  );

  if (menuItems.length > 0) {
    return (
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottom">
        <Tooltip 
          title={tooltipTitle}
          overlayInnerStyle={{ 
            backgroundColor: token.colorBgElevated,
            color: token.colorText,
            border: `1px solid ${token.colorBorder}`
          }}
        >
          {content}
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
      {content}
    </Tooltip>
  );
};

export const ShiftCell = memo(ShiftCellComponent);

// ============ EMPTY CELL ============
interface EmptyCellProps {
  dayNumber: number;
  userId: number;
  currentUserId?: number;
  /** Запросить смену (только для своей строки) */
  onRequestShift?: (dayNumber: number) => void;
  /** Добавить смену напрямую (для любой строки, если есть права) */
  onAddShift?: (dayNumber: number, userId: number) => void;
}

const EmptyCellComponent: FC<EmptyCellProps> = ({
  dayNumber,
  userId,
  currentUserId,
  onRequestShift,
  onAddShift,
}) => {
  const isCurrentUser = userId === currentUserId;

  const menuItems: MenuProps['items'] = useMemo(() => {
    const items: MenuProps['items'] = [];
    
    // Добавить смену напрямую - доступно для любого пользователя (если есть права)
    if (onAddShift) {
      items.push({
        key: "add-direct",
        label: <Space><PlusOutlined /><span>Добавить смену</span></Space>,
        onClick: () => onAddShift(dayNumber, userId),
      });
    }

    // Запросить смену - только для своей строки
    if (onRequestShift && isCurrentUser) {
      items.push({
        key: "request",
        label: <Space><PlusOutlined /><span>Запросить смену</span></Space>,
        onClick: () => onRequestShift(dayNumber),
      });
    }

    return items;
  }, [dayNumber, userId, onRequestShift, onAddShift, isCurrentUser]);

  if (menuItems.length === 0) {
    return <div style={{ height: 32 }} />;
  }

  return (
    <Dropdown menu={{ items: menuItems }} placement="bottom" trigger={['click']}>
      <div className={styles.emptyCell}>
        <PlusOutlined className={styles.emptyCellIcon} />
      </div>
    </Dropdown>
  );
};

export const EmptyShiftCell = memo(EmptyCellComponent);

// ============ SCHEDULE TABLE ============
interface ScheduleTableProps {
  data: IScheduleTableRow[];
  shifts: ShiftsMap;
  daysInMonth: number;
  month: string;
  currentUserId?: number;
  canManage?: boolean;
  loading?: boolean;
  emptyText?: React.ReactNode;
  onRequestShift?: (dayNumber: number) => void;
  onAddShift?: (dayNumber: number, userId: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onEdit?: (shift: IScheduleShift) => void;
  onDelete?: (id: number) => void;
}

export const ScheduleTable: FC<ScheduleTableProps> = memo(({
  data,
  shifts,
  daysInMonth,
  month,
  currentUserId,
  canManage = false,
  loading,
  emptyText,
  onRequestShift,
  onAddShift,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) => {
  const { token } = theme.useToken();

  // Генерация колонок дней - максимально оптимизировано
  const dayColumns = useMemo((): TableColumnsType<IScheduleTableRow> => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const dayNumber = i + 1;
      const currentDay = dayjs(month).date(dayNumber);
      const isWeekend = currentDay.day() === 0 || currentDay.day() === 6;
      const isToday = currentDay.isSame(dayjs(), 'day');

      let headerClass = styles.dayHeader;
      if (isToday) headerClass += ` ${styles.dayHeaderToday}`;
      else if (isWeekend) headerClass += ` ${styles.dayHeaderWeekend}`;

      return {
        key: `day_${dayNumber}`,
        title: (
          <Tooltip title={currentDay.format('DD.MM.YYYY')}>
            <div className={headerClass}>{dayNumber}</div>
          </Tooltip>
        ),
        width: 50,
        align: 'center' as const,
        render: (_: unknown, record: IScheduleTableRow) => {
          const shiftKey = `${record.id}_${dayNumber}`;
          const shift = shifts[shiftKey];

          if (!shift) {
            return (
              <EmptyShiftCell
                dayNumber={dayNumber}
                userId={record.id}
                currentUserId={currentUserId}
                onRequestShift={onRequestShift}
                onAddShift={onAddShift}
              />
            );
          }

          return (
            <ShiftCell
              shift={shift}
              userId={record.id}
              currentUserId={currentUserId}
              canManage={canManage}
              onApprove={onApprove}
              onReject={onReject}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        },
      };
    });
  }, [daysInMonth, month, shifts, currentUserId, canManage, onRequestShift, onAddShift, onApprove, onReject, onEdit, onDelete]);

  // Колонка сотрудника
  const employeeColumn = useMemo(() => ({
    title: "Сотрудник",
    dataIndex: "name",
    fixed: "left" as const,
    width: 200,
    render: (_: unknown, record: IScheduleTableRow) => (
      <div className={styles.employeeCell}>
        <div className={styles.employeeAvatar}>
          {record.name?.[0]}{record.surname?.[0]}
        </div>
        <div className={styles.employeeInfo}>
          <div className={styles.employeeName} style={{ color: token.colorText }}>
            {record.is_supervisor && <CrownOutlined className={styles.supervisorIcon} />}
            <span>{record.name} {record.surname}</span>
          </div>
        </div>
      </div>
    ),
  }), [token.colorText]);

  // Колонка часов
  const hoursColumn = useMemo(() => ({
    title: "Часов",
    align: "center" as const,
    fixed: 'right' as const,
    width: 80,
    render: (_: unknown, record: IScheduleTableRow) => {
      let hoursClass = styles.hoursCell;
      if (record.total_hours >= 160) hoursClass += ` ${styles.hoursHigh}`;
      else if (record.total_hours >= 120) hoursClass += ` ${styles.hoursMedium}`;
      else hoursClass += ` ${styles.hoursLow}`;

      return <div className={hoursClass}>{record.total_hours}</div>;
    },
  }), []);

  // Собираем все колонки
  const columns = useMemo((): TableColumnsType<IScheduleTableRow> => [
    employeeColumn,
    ...dayColumns,
    hoursColumn,
  ], [employeeColumn, dayColumns, hoursColumn]);

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
      styles={{ body: { padding: '12px' } }}
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
        virtual
      />
    </Card>
  );
});

ScheduleTable.displayName = 'ScheduleTable';
