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
import { usePermissions } from "../../hooks/usePermissions";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import { PERMISSIONS } from "../../constants/permissions";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { Button, theme } from "antd";
import { ScheduleHeader, ScheduleFilters, ScheduleTable } from "../../components/Schedule";
import { RequestShiftModal, EditShiftModal, AddShiftModal } from "../../components/Schedule/Modals";
import PermissionGuard from "../../components/PermissionGuard";
import styles from "../../styles/users/users-page.module.css";
import type { 
  IScheduleFilterForm, 
  IScheduleShift, 
  IScheduleTableRow,
  IScheduleUser 
} from "../../types/schedule.types";
import { CalendarOutlined, PlusOutlined } from "@ant-design/icons";
import { message, Typography } from "antd";

const { Text } = Typography;

/**
 * Оптимизированная страница расписания с поддержкой permissions
 */
// Парсеры для URL фильтров (статичные)
const scheduleFilterParsers = {
  team_id: (val: string) => val ? Number(val) : null,
};

const SchedulePage: FC = () => {
  const { token } = theme.useToken();
  const currentUser = useTypedSelector((state) => state.auth.user);
  const { hasPermission } = usePermissions();
  
  // Мемоизируем defaults чтобы избежать бесконечного цикла
  const scheduleDefaults = useMemo(() => ({
    month: new Date().toISOString().slice(0, 7),
    team_id: currentUser?.team_id ?? null,
    shift_type: "День" as const,
  }), [currentUser?.team_id]);
  
  // Фильтры с сохранением в URL
  const { filters: scheduleFilterForm, setFilters: setScheduleFilterForm } = useUrlFilters<IScheduleFilterForm>({
    defaults: scheduleDefaults,
    parsers: scheduleFilterParsers,
  });

  // API запросы
  const { data: schedule, isLoading, isFetching, refetch: refetchSchedule } = useGetScheduleQuery(scheduleFilterForm);
  const { data: teams, isLoading: isTeamsLoading } = useGetAllTeamsQuery();
  
  // Мутации
  const [createShiftRequest, { isLoading: isCreatingRequest }] = useCreateShiftRequestMutation();
  const [approveShiftRequest] = useApproveShiftRequestMutation();
  const [rejectShiftRequest] = useRejectShiftRequestMutation();
  const [updateShift] = useUpdateShiftMutation();
  const [deleteShift] = useDeleteShiftMutation();
  const [createDirectShift] = useCreateDirectShiftMutation();
  
  // Состояние модалок
  const [requestShiftModalOpen, setRequestShiftModalOpen] = useState(false);
  const [editShiftModalOpen, setEditShiftModalOpen] = useState(false);
  const [addShiftModalOpen, setAddShiftModalOpen] = useState(false);
  const [selectedShiftDate, setSelectedShiftDate] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<IScheduleShift | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const shiftTypeOptions = [
    { label: "День", value: "День" },
    { label: "Ночь", value: "Ночь" },
  ];

  // ============ PERMISSIONS CHECK ============
  const canManageSchedule = hasPermission(PERMISSIONS.SCHEDULE_MANAGE) || hasPermission(PERMISSIONS.SHIFT_REQUESTS_MANAGE);
  // view: смотреть график, создавать запрос себе, удалять свой pending
  const canCreateRequest = canManageSchedule || hasPermission(PERMISSIONS.SCHEDULE_VIEW) || hasPermission(PERMISSIONS.SHIFT_REQUESTS_VIEW);
  // direct/approve/reject/edit/delete (чужие) — только manage
  const canCreateDirect = canManageSchedule;
  const canApprove = canManageSchedule;
  const canReject = canManageSchedule;
  const canUpdate = canManageSchedule;
  const canDelete = canManageSchedule || hasPermission(PERMISSIONS.SCHEDULE_VIEW) || hasPermission(PERMISSIONS.SHIFT_REQUESTS_VIEW);
  const canCreateSchedule = hasPermission(PERMISSIONS.SCHEDULE_MANAGE);

  // ============ HANDLERS ============
  
  const handleSubmitShiftRequest = useCallback(async (values: { duration: number }) => {
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
  }, [selectedShiftDate, createShiftRequest, refetchSchedule]);

  const handleSubmitEditShift = useCallback(async (values: { duration: number }) => {
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
  }, [selectedShift, updateShift, refetchSchedule]);

  const handleSubmitAddShiftDirect = useCallback(async (values: { date: dayjs.Dayjs | string; duration: number; user_id: number }) => {
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
  }, [createDirectShift, refetchSchedule]);

  const handleShiftTypeChange = useCallback((value: string) => {
    setScheduleFilterForm({ shift_type: value });
  }, [setScheduleFilterForm]);

  const handleMonthChange = useCallback((date: dayjs.Dayjs | null) => {
    if (date) {
      setScheduleFilterForm({ month: date.format('YYYY-MM') });
    }
  }, [setScheduleFilterForm]);

  const handleTeamChange = useCallback((teamId: number | null) => {
    setScheduleFilterForm({ team_id: teamId });
  }, [setScheduleFilterForm]);

  // Handlers передаются в таблицу только если есть права
  const handleRequestShift = useMemo(() => {
    if (!canCreateRequest) return undefined;
    return (dayNumber: number) => {
      const selectedDate = dayjs(scheduleFilterForm.month).date(dayNumber).format('YYYY-MM-DD');
      setSelectedShiftDate(selectedDate);
      setRequestShiftModalOpen(true);
    };
  }, [canCreateRequest, scheduleFilterForm.month]);

  const handleAddShiftDirect = useMemo(() => {
    if (!canCreateDirect) return undefined;
    return (dayNumber: number, userId: number) => {
      const selectedDate = dayjs(scheduleFilterForm.month).date(dayNumber).format('YYYY-MM-DD');
      setSelectedShiftDate(selectedDate);
      setSelectedUserId(userId);
      setAddShiftModalOpen(true);
    };
  }, [canCreateDirect, scheduleFilterForm.month]);

  const handleApproveShift = useMemo(() => {
    if (!canApprove) return undefined;
    return async (userShiftId: number) => {
      try {
        await approveShiftRequest(userShiftId).unwrap();
        message.success('Смена успешно одобрена');
        refetchSchedule();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при одобрении смены';
        message.error(errorMessage);
      }
    };
  }, [canApprove, approveShiftRequest, refetchSchedule]);

  const handleRejectShift = useMemo(() => {
    if (!canReject) return undefined;
    return async (userShiftId: number) => {
      try {
        await rejectShiftRequest(userShiftId).unwrap();
        message.success('Смена успешно отклонена');
        refetchSchedule();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при отклонении смены';
        message.error(errorMessage);
      }
    };
  }, [canReject, rejectShiftRequest, refetchSchedule]);

  const handleEditShift = useMemo(() => {
    if (!canUpdate) return undefined;
    return (shift: IScheduleShift) => {
      setSelectedShift(shift);
      setEditShiftModalOpen(true);
    };
  }, [canUpdate]);

  const handleDeleteShift = useMemo(() => {
    if (!canDelete) return undefined;
    return async (userShiftId: number) => {
      try {
        await deleteShift(userShiftId).unwrap();
        message.success('Смена успешно удалена');
        refetchSchedule();
      } catch (error: unknown) {
        const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Ошибка при удалении смены';
        message.error(errorMessage);
      }
    };
  }, [canDelete, deleteShift, refetchSchedule]);

  // ============ MEMOIZED DATA ============

  // Данные таблицы: сортировка с supervisors в начале каждой группы
  const tableData = useMemo((): IScheduleTableRow[] => {
    if (!schedule?.users || !schedule?.groups) return [];
    
    const usersMap = new Map<number, IScheduleUser>();
    for (const user of schedule.users) {
      usersMap.set(user.id, user);
    }
    
    const result: IScheduleTableRow[] = [];
    
    for (const group of schedule.groups) {
      const supervisorId = group.supervisor_id;
      const groupUsers: IScheduleTableRow[] = [];
      
      for (const userId of group.user_ids) {
        const user = usersMap.get(userId);
        if (user) {
          groupUsers.push({
            id: user.id,
            name: user.name,
            surname: user.surname,
            group_id: user.group_id,
            total_hours: user.total_hours,
            is_supervisor: user.id === supervisorId,
          });
        }
      }
      
      groupUsers.sort((a, b) => {
        if (a.is_supervisor) return -1;
        if (b.is_supervisor) return 1;
        return 0;
      });
      
      result.push(...groupUsers);
    }
    
    return result;
  }, [schedule?.users, schedule?.groups]);

  // Пользователи для модалки добавления смены
  const usersForModal = useMemo(() => {
    return tableData.map(u => ({
      id: u.id,
      name: u.name,
      surname: u.surname,
      shifts: [] as never[],
    }));
  }, [tableData]);

  // ============ RENDER ============

  const emptyTableText = (
    <div className={styles.emptyTableContainer}>
      <CalendarOutlined className={styles.emptyTableIcon} style={{ color: token.colorTextTertiary }} />
      <div className={styles.emptyTableTitle} style={{ color: token.colorTextSecondary }}>
        График еще не сформирован
      </div>
      <Text type="secondary" className={styles.emptyTableDescription}>
        На данный момент нет данных о графике смен
      </Text>
      <PermissionGuard permission={PERMISSIONS.SCHEDULE_MANAGE}>
        <Link to="./create">
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            Сгенерировать график
          </Button>
        </Link>
      </PermissionGuard>
    </div>
  );

  return (
    <div className={styles.pageContainer}>
      <ScheduleHeader 
        onRefetch={refetchSchedule} 
        canCreateSchedule={canCreateSchedule}
      />

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
        data={tableData}
        shifts={schedule?.shifts ?? {}}
        daysInMonth={schedule?.days_in_month ?? 0}
        month={scheduleFilterForm.month}
        currentUserId={currentUser?.id}
        canManage={canManageSchedule}
        loading={isLoading || isFetching}
        emptyText={emptyTableText}
        onRequestShift={handleRequestShift}
        onAddShift={handleAddShiftDirect}
        onApprove={handleApproveShift}
        onReject={handleRejectShift}
        onEdit={handleEditShift}
        onDelete={handleDeleteShift}
      />

      {/* Модалки показываются только если есть права */}
      {canCreateRequest && (
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
      )}

      {canUpdate && (
        <EditShiftModal
          open={editShiftModalOpen}
          onCancel={() => {
            setEditShiftModalOpen(false);
            setSelectedShift(null);
          }}
          onSubmit={handleSubmitEditShift}
          selectedShift={selectedShift}
        />
      )}

      {canCreateDirect && (
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
          users={usersForModal}
        />
      )}
    </div>
  );
};

export default SchedulePage;
