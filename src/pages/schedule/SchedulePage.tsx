import { useState, useMemo, useCallback, type FC } from "react";
import { useGetScheduleQuery } from "../../api/scheduleApi";
import { useGetAllTeamsQuery } from "../../api/teamsApi";
import { 
  useCreateShiftRequestMutation,
  useApproveShiftRequestMutation,
  useRejectShiftRequestMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useCreateDirectShiftMutation,
} from "../../api/shiftRequestApi";
import { useTypedSelector } from "../../hooks/store";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button,
  Popover,
  Typography,
  Tooltip,
  theme,
  type TableColumnsType,
} from "antd";
import { ScheduleHeader, ScheduleFilters, ScheduleTable, ShiftCell, EmptyShiftCell } from "../../components/Schedule";
import { RequestShiftModal, EditShiftModal, AddShiftModal } from "../../components/Schedule/Modals";
import SchedulePopover from "../../components/SchedulePopover";
import styles from "../../styles/users/users-page.module.css";
import type { IUserWithShifts } from "../../types/user.types";
import type { IScheduleFilterForm } from "../../types/schedule.types";
import type { IShift } from "../../types/shifts.types";
import { CalendarOutlined, PlusOutlined, CrownOutlined } from "@ant-design/icons";
import { message } from "antd";

const { Text } = Typography;

const SchedulePage: FC = () => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  const currentDate = new Date();
  const currentUser = useTypedSelector((state) => state.auth.user);
  
  const [scheduleFilterForm, setScheduleFilterForm] = useState<IScheduleFilterForm>({
    month: currentDate.toISOString().slice(0, 7),
    team_id: currentUser?.team_id,
    shift_type: "День",
  });

  const { data: schedule, isLoading, isFetching, refetch: refetchSchedule } = useGetScheduleQuery(scheduleFilterForm);
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  const [createShiftRequest, { isLoading: isCreatingRequest }] = useCreateShiftRequestMutation();
  const [approveShiftRequest] = useApproveShiftRequestMutation();
  const [rejectShiftRequest] = useRejectShiftRequestMutation();
  const [updateShift] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();
  const [createDirectShift] = useCreateDirectShiftMutation();
  
  const [requestShiftModalOpen, setRequestShiftModalOpen] = useState(false);
  const [editShiftModalOpen, setEditShiftModalOpen] = useState(false);
  const [addShiftModalOpen, setAddShiftModalOpen] = useState(false);
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<IShift | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const shiftTypeOptions = [
    { label: "День", value: "День" },
    { label: "Ночь", value: "Ночь" },
  ];

  // Handlers (старые версии удалены, используются мемоизированные)

  const handleSubmitShiftRequest = async (values: { duration: number }) => {
    if (!selectedShiftDate) return;
    
    try {
      await createShiftRequest({
        date: selectedShiftDate,
        duration: values.duration,
      }).unwrap();

      message.success('Запрос на дополнительную смену успешно создан');
      setRequestShiftModalOpen(false);
      setSelectedShiftDate(null);
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при создании запроса на смену';
      message.error(errorMessage);
    }
  };


  const handleSubmitEditShift = async (values: { duration: number }) => {
    if (!selectedShift?.user_shift_id) return;
    
    try {
      await updateShift({
        id: selectedShift.user_shift_id,
        duration: values.duration,
      }).unwrap();

      message.success('Смена успешно отредактирована');
      setEditShiftModalOpen(false);
      setSelectedShift(null);
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при редактировании смены';
      message.error(errorMessage);
    }
  };


  const handleSubmitAddShiftDirect = async (values: { date: dayjs.Dayjs | string; duration: number; user_id: number }) => {
    try {
      const dateString = typeof values.date === 'string' 
        ? values.date 
        : dayjs(values.date).format('YYYY-MM-DD');
      
      await createDirectShift({
        date: dateString,
        duration: values.duration,
        user_id: values.user_id,
      }).unwrap();

      message.success('Смена успешно добавлена');
      setAddShiftModalOpen(false);
      setSelectedShiftDate(null);
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при добавлении смены';
      message.error(errorMessage);
    }
  };

  const handleShiftTypeChange = (value: string) => {
    setScheduleFilterForm((prev) => ({ ...prev, shift_type: value }));
  };

  const handleMonthChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const monthValue = date.format('YYYY-MM'); // Формат Y-m для API
      setScheduleFilterForm((prev) => ({ ...prev, month: monthValue }));
    }
  };

  const handleTeamChange = (teamId: number | null) => {
    setScheduleFilterForm((prev) => ({ ...prev, team_id: teamId }));
  };

  // Мемоизация обработчиков для предотвращения лишних ререндеров
  const handleRequestShiftMemo = useCallback((dayNumber: number) => {
    const selectedDate = dayjs(scheduleFilterForm.month).date(dayNumber).format('YYYY-MM-DD');
    setSelectedShiftDate(selectedDate);
    setRequestShiftModalOpen(true);
  }, [scheduleFilterForm.month]);

  const handleAddShiftDirectMemo = useCallback((dayNumber: number, userId?: number) => {
    const selectedDate = dayjs(scheduleFilterForm.month).date(dayNumber).format('YYYY-MM-DD');
    setSelectedShiftDate(selectedDate);
    setSelectedUserId(userId || null);
    setAddShiftModalOpen(true);
  }, [scheduleFilterForm.month]);

  const handleApproveShiftMemo = useCallback(async (userShiftId: number) => {
    try {
      await approveShiftRequest(userShiftId).unwrap();
      message.success('Смена успешно одобрена');
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при одобрении смены';
      message.error(errorMessage);
    }
  }, [approveShiftRequest, refetchSchedule]);

  const handleRejectShiftMemo = useCallback(async (userShiftId: number) => {
    try {
      await rejectShiftRequest(userShiftId).unwrap();
      message.success('Смена успешно отклонена');
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при отклонении смены';
      message.error(errorMessage);
    }
  }, [rejectShiftRequest, refetchSchedule]);

  const handleEditShiftMemo = useCallback((shift: IShift) => {
    setSelectedShift(shift);
    setEditShiftModalOpen(true);
  }, []);

  const handleDeleteShiftMemo = useCallback(async (userShiftId: number | undefined) => {
    if (!userShiftId) {
      message.error('Не указан ID смены для удаления');
      return;
    }
    
    try {
      await deleteShift(userShiftId).unwrap();
      message.success('Смена успешно удалена');
      refetchSchedule();
    } catch (error: unknown) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при удалении смены';
      message.error(errorMessage);
    }
  }, [deleteShift, refetchSchedule]);

  // Оптимизация: создаем Map для быстрого поиска смен по дате
  const shiftsByUserAndDate = useMemo(() => {
    if (!schedule?.groups) return new Map<string, IShift>();
    
    const map = new Map<string, IShift>();
    schedule.groups.forEach(group => {
      group.users.forEach(user => {
        user.shifts.forEach(shift => {
          const key = `${user.id}-${new Date(shift.date).getDate()}`;
          map.set(key, shift);
        });
      });
    });
    return map;
  }, [schedule]);

  // Генерация колонок с датами (мемоизировано)
  const dateColumns = useMemo((): TableColumnsType<IUserWithShifts> => {
    const daysInMonth = schedule?.days_in_month ?? 0;
    
    return Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const dayNumber = dayIndex + 1;
      const currentDay = dayjs(scheduleFilterForm.month).date(dayNumber);
      const isWeekend = currentDay.day() === 0 || currentDay.day() === 6;
      const isToday = currentDay.isSame(dayjs(), 'day');
      const dateString = currentDay.format('DD.MM.YYYY');
      
      return {
        id: dayNumber,
        key: `day_${dayNumber}`,
        title: (
          <Tooltip 
            title={dateString}
            overlayInnerStyle={{ 
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <div style={{
              padding: '6px 4px',
              background: isToday 
                ? token.colorPrimary 
                : isWeekend 
                  ? (isDark ? '#3d2816' : '#fff7e6')
                  : 'transparent',
              color: isToday 
                ? '#ffffff' 
                : isWeekend 
                  ? (isDark ? '#ffa940' : '#d46b08')
                  : token.colorText,
              borderRadius: 4,
              fontWeight: isToday ? 600 : isWeekend ? 500 : 400,
              fontSize: 13,
            }}>
              {dayNumber}
            </div>
          </Tooltip>
        ),
        width: 50,
        align: "center" as const,
        render: (_: number, record: IUserWithShifts) => {
          const key = `${record.id}-${dayNumber}`;
          const shift = shiftsByUserAndDate.get(key);

          if (!shift) {
            return (
              <EmptyShiftCell
                dayNumber={dayNumber}
                record={record}
                onRequestShift={handleRequestShiftMemo}
                onAddShift={handleAddShiftDirectMemo}
              />
            );
          }

          return (
            <ShiftCell
              shift={shift}
              record={record}
              currentUser={currentUser || undefined}
              onApprove={handleApproveShiftMemo}
              onReject={handleRejectShiftMemo}
              onEdit={handleEditShiftMemo}
              onDelete={handleDeleteShiftMemo}
            />
          );
        },
      };
    });
  }, [schedule?.days_in_month, scheduleFilterForm.month, shiftsByUserAndDate, token, isDark, currentUser, handleRequestShiftMemo, handleAddShiftDirectMemo, handleApproveShiftMemo, handleRejectShiftMemo, handleEditShiftMemo, handleDeleteShiftMemo]);

  // Мемоизация данных таблицы с сортировкой: сначала ответственный, затем остальные
  const tableData = useMemo(() => {
    if (!schedule?.groups) return [];
    
    return schedule.groups.flatMap((group) => {
      if (!group.users || group.users.length === 0) return [];
      
      // Если есть ответственный, сортируем: сначала ответственный, затем остальные
      if (group.supervisor?.id) {
        const supervisor = group.users.find(user => user.id === group.supervisor?.id);
        const subordinates = group.users.filter(user => user.id !== group.supervisor?.id);
        
        return supervisor 
          ? [supervisor, ...subordinates]
          : group.users;
      }
      
      return group.users;
    });
  }, [schedule?.groups]);

  // Мемоизация карты ответственных по группам
  const supervisorMap = useMemo(() => {
    const map = new Map<number, boolean>();
    if (!schedule?.groups) return map;
    
    schedule.groups.forEach(group => {
      if (group.supervisor?.id && group.users) {
        group.users.forEach(user => {
          map.set(user.id, user.id === group.supervisor?.id);
        });
      }
    });
    
    return map;
  }, [schedule?.groups]);

  // Мемоизация расчета часов для каждого пользователя
  const userHoursMap = useMemo(() => {
    if (!tableData) return new Map<number, number>();
    
    const map = new Map<number, number>();
    tableData.forEach(user => {
      const totalHours = user.shifts.reduce((sum, shift) => sum + shift.duration, 0);
      map.set(user.id, totalHours);
    });
    return map;
  }, [tableData]);

  // Основные колонки таблицы (мемоизировано)
  const tableColumns = useMemo((): TableColumnsType<IUserWithShifts> => [
    {
      title: "Сотрудник",
      dataIndex: "name",
      fixed: "left",
      width: 200,
      render: (_: number, record: IUserWithShifts) => (
        <Popover
          content={<SchedulePopover email={record.email} group={record.group} />}
          title={`Сотрудник #${record.id}`}
          trigger="hover"
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            cursor: 'pointer',
            padding: '4px 0'
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0
            }}>
              {record.name?.[0]}{record.surname?.[0]}
            </div>
            <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500, 
                fontSize: 14, 
                color: token.colorText,
                lineHeight: 1.4,
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap' 
              }}>
                {supervisorMap.get(record.id) && (
                  <CrownOutlined style={{ color: '#faad14', fontSize: 14, flexShrink: 0 }} />
                )}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {record.name} {record.surname}
                </span>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.group}</Text>
            </div>
          </div>
        </Popover>
      ),
    },
    ...dateColumns,
    {
      title: "Часов",
      align: "center",
      fixed: 'right',
      width: 80,
      render: (_: number, record: IUserWithShifts) => {
        const totalHours = userHoursMap.get(record.id) || 0;
        return (
          <div style={{ 
            fontSize: 15,
            fontWeight: 600,
            color: totalHours >= 160 ? '#52c41a' : totalHours >= 120 ? '#faad14' : '#8c8c8c'
          }}>
            {totalHours}
          </div>
        );
      },
    },
  ], [dateColumns, userHoursMap, token.colorText, supervisorMap]);


  const emptyTableText = (
    <div className={styles.emptyTableContainer}>
      <CalendarOutlined className={styles.emptyTableIcon} style={{ color: token.colorTextTertiary }} />
      <div className={styles.emptyTableTitle} style={{ color: token.colorTextSecondary }}>
        График еще не сформирован
      </div>
      <Text type="secondary" className={styles.emptyTableDescription}>
        На данный момент нет данных о графике смен
      </Text>
      <Link to="./create">
        <Button type="primary" size="large" icon={<PlusOutlined />}>
          Сгенерировать график
        </Button>
      </Link>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <ScheduleHeader onRefetch={refetchSchedule} />

      <ScheduleFilters
        filterForm={scheduleFilterForm}
        teams={teams}
        isLoadingTeams={isTeamsLoading}
        isFetching={isFetching}
        shiftTypeOptions={shiftTypeOptions}
        onShiftTypeChange={handleShiftTypeChange}
        onTeamChange={handleTeamChange}
        onMonthChange={handleMonthChange}
        onRefresh={refetchSchedule}
      />

      <ScheduleTable
        columns={tableColumns}
        data={tableData}
        loading={isLoading || isFetching}
        emptyText={emptyTableText}
      />

        <RequestShiftModal
          open={requestShiftModalOpen}
          onCancel={() => {
            setRequestShiftModalOpen(false);
            setSelectedShiftDate(null);
          }}
          onSubmit={handleSubmitShiftRequest}
          selectedDate={selectedShiftDate}
          loading={isCreatingRequest}
        />

        <EditShiftModal
          open={editShiftModalOpen}
          onCancel={() => {
            setEditShiftModalOpen(false);
            setSelectedShift(null);
          }}
          onSubmit={handleSubmitEditShift}
          selectedShift={selectedShift}
        />

        <AddShiftModal
          open={addShiftModalOpen}
          onCancel={() => {
            setAddShiftModalOpen(false);
            setSelectedShiftDate(null);
            setSelectedUserId(null);
          }}
          onSubmit={handleSubmitAddShiftDirect}
          selectedDate={selectedShiftDate}
          selectedUserId={selectedUserId}
          users={tableData}
        />
    </div>
  );
};

export default SchedulePage;
