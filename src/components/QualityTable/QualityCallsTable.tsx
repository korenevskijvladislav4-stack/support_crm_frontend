// components/QualityCallsTable.tsx
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Dropdown, 
  Tooltip, 
  Popover,
  type MenuProps,
  Space,
  Typography,
  Row,
  Col,
  Input,
  Form,
  message,
  Button,
  Divider,
  theme
} from 'antd';
import { 
  EditOutlined, 
  MoreOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  PhoneOutlined,
  BarChartOutlined,
  SearchOutlined,
  TrophyOutlined,
  CloseCircleOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { useGetCriteriaQuery, useCreateCallDeductionMutation, useUpdateQualityMapCallIdsMutation } from '../../api/qualityApi';
import type { QualityMap, QualityCriterion, QualityCallDeduction } from '../../types/quality.types';
import { formatDate } from '../../utils/dateUtils';
import DeductionModal from './DeductionModal';
import EditCallModal from './EditCallModal';

const { Text } = Typography;

interface QualityCallsTableProps {
  qualityMap: QualityMap;
}

interface SelectedCell {
  criteriaId: number;
  callIndex: number;
  existingDeduction?: QualityCallDeduction;
}

interface DeductionFormValues {
  deduction: number;
  comment: string;
}

interface EditCallModalValues {
  callName: string;
}

interface QualityCallsTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal?: boolean;
  categoryId?: number | null;
  categoryName?: string;
  isFirstInCategory?: boolean;
  isLastInCategory?: boolean;
  isLastCategory?: boolean;
  [key: string]: unknown;
}

const QualityCallsTable: React.FC<QualityCallsTableProps> = ({ qualityMap }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  const { data: allCriteria = [] } = useGetCriteriaQuery(
    { team_id: qualityMap.team_id },
    { skip: !qualityMap?.team_id }
  );
  const [createCallDeduction, { isLoading: isCreatingDeduction }] = useCreateCallDeductionMutation();
  const [updateCallIds, { isLoading: isUpdatingCalls }] = useUpdateQualityMapCallIdsMutation();
  
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [editingCallIndex, setEditingCallIndex] = useState<number | null>(null);
  const [deductionModalVisible, setDeductionModalVisible] = useState<boolean>(false);
  const [editCallModalVisible, setEditCallModalVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const [deductionForm] = Form.useForm<DeductionFormValues>();
  const [editCallForm] = Form.useForm<EditCallModalValues>();

  // Инициализируем звонки если их нет
  const callIds = qualityMap?.call_ids || Array(qualityMap?.calls_count || 0).fill('');

  // Группируем снятия по критериям и звонкам для быстрого доступа
  const callDeductionsMap = useMemo(() => {
    const map = new Map<string, QualityCallDeduction>();
    
    qualityMap?.call_deductions?.forEach(deduction => {
      if (deduction?.criteria_id && deduction?.call_id) {
        const key = `${deduction.criteria_id}_${deduction.call_id}`;
        map.set(key, deduction);
      }
    });
    
    return map;
  }, [qualityMap?.call_deductions]);

  // Фильтрация критериев по поиску
  const filteredCriteria = useMemo(() => {
    if (!searchTerm) return allCriteria;
    
    return allCriteria.filter(criterion => 
      criterion.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      criterion.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCriteria, searchTerm]);

  // Группируем критерии по категориям
  const groupedCriteria = useMemo(() => {
    const groups = new Map<string, QualityCriterion[]>();
    
    filteredCriteria.forEach((criterion: QualityCriterion) => {
      const categoryKey = criterion.category?.id?.toString() || 'no_category';
      
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, []);
      }
      groups.get(categoryKey)!.push(criterion);
    });

    return groups;
  }, [filteredCriteria]);

  // Расчет итогов по звонкам
  const callTotals = useMemo(() => {
    const totals: { [key: number]: { score: number; deduction: number } } = {};
    
    callIds.forEach((callId, callIndex) => {
      if (!callId) {
        totals[callIndex] = { score: 0, deduction: 0 };
        return;
      }
      
      let totalDeduction = 0;
      allCriteria.forEach(criterion => {
        const deductionKey = `${criterion.id}_${callId}`;
        const deduction = callDeductionsMap.get(deductionKey);
        if (deduction && typeof deduction.deduction === 'number') {
          totalDeduction += deduction.deduction;
        }
      });
      const finalScore = Math.max(0, 100 - totalDeduction);
      
      totals[callIndex] = {
        score: finalScore,
        deduction: totalDeduction
      };
    });
    
    return totals;
  }, [callDeductionsMap, allCriteria, callIds]);

  // Общая статистика
  const qualityStats = useMemo(() => {
    const filledCalls = callIds.filter(id => id).length;
    
    if (filledCalls === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        totalDeducted: 0,
        filledCalls: 0
      };
    }

    let totalScore = 0;
    let totalDeducted = 0;

    Object.values(callTotals).forEach(call => {
      totalScore += call.score;
      totalDeducted += call.deduction;
    });

    const averageScore = Math.round(totalScore / filledCalls);

    return {
      totalScore,
      averageScore,
      totalDeducted,
      filledCalls
    };
  }, [callTotals, callIds]);

  // Получение цвета для оценки
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#73d13d';
    if (score >= 70) return '#95de64';
    if (score >= 60) return '#bae637';
    if (score >= 50) return '#ffec3d';
    if (score >= 40) return '#ffc53d';
    if (score >= 30) return '#ffa940';
    if (score >= 20) return '#ff7a45';
    if (score >= 10) return '#ff4d4f';
    return '#cf1322';
  };

  const handleEditCall = (callIndex: number) => {
    setEditingCallIndex(callIndex);
    editCallForm.setFieldValue('callName', callIds[callIndex] || '');
    setEditCallModalVisible(true);
  };

  const handleSaveCallName = async (values: EditCallModalValues) => {
    if (editingCallIndex === null || !qualityMap?.id) return;

    try {
      const newCallIds = [...callIds];
      newCallIds[editingCallIndex] = values.callName.trim();

      await updateCallIds({
        id: qualityMap.id,
        data: { call_ids: newCallIds }
      }).unwrap();

      message.success('ID звонка обновлен');
      setEditCallModalVisible(false);
      setEditingCallIndex(null);
      editCallForm.resetFields();
    } catch (error) {
      console.error('Error updating call name:', error);
      message.error('Ошибка при обновлении ID звонка');
    }
  };

  const getColumnTitleDropdownItems = (callIndex: number): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Изменить ID',
      icon: <EditOutlined />,
      onClick: () => handleEditCall(callIndex),
    },
  ];

  const columns = [
    {
      title: (
        <Space size="small" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space size="small">
            <BarChartOutlined style={{ color: '#1890ff', fontSize: 12 }} />
            <Text strong style={{ fontSize: '12px' }}>Критерий качества</Text>
          </Space>
          <Tooltip 
            title="Поиск по критериям"
            overlayInnerStyle={{ 
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <Input
              size="small"
              placeholder="Поиск..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 120, fontSize: '11px' }}
              onClick={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 250,
      minWidth: 250,
      render: (name: string, record: QualityCallsTableRow) => {
        if (record.isTotal) {
          return (
            <div style={{ 
              padding: '4px 6px',
              backgroundColor: isDark ? token.colorFillTertiary : '#fafafa',
              borderRadius: '4px',
              border: `1px solid ${token.colorBorder}`
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                fontWeight: 600,
                fontSize: '12px',
                color: token.colorText
              }}>
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>ИТОГ</span>
              </div>
            </div>
          );
        }

        return (
          <Tooltip 
            title={
              <div>
                {record.categoryName && (
                  <div style={{ 
                    fontSize: '11px', 
                    color: token.colorTextSecondary, 
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <FolderOutlined style={{ fontSize: 10 }} />
                    {record.categoryName}
                  </div>
                )}
                <div style={{ fontWeight: 500, marginBottom: 4, color: token.colorText }}>{name}</div>
                {record.description && (
                  <div style={{ fontSize: '12px', color: token.colorTextSecondary }}>{record.description}</div>
                )}
              </div>
            } 
            placement="right"
            overlayStyle={{ maxWidth: 400 }}
            overlayInnerStyle={{ 
              backgroundColor: token.colorBgElevated,
              color: token.colorText,
              border: `1px solid ${token.colorBorder}`
            }}
          >
            <div style={{ 
              padding: '6px 4px',
              cursor: 'help',
              borderLeft: `3px solid ${record.description ? token.colorPrimary : token.colorBorder}`,
              background: record.isFirstInCategory 
                ? (isDark ? token.colorFillTertiary : '#f5f5f5')
                : token.colorBgContainer,
              borderTop: record.isFirstInCategory 
                ? `1px solid ${token.colorBorderSecondary}` 
                : 'none',
              paddingTop: record.isFirstInCategory ? '8px' : '6px',
              paddingLeft: record.categoryName ? '12px' : '4px',
              position: 'relative'
            }}>
              {record.isFirstInCategory && record.categoryName && (
                <div style={{ 
                  position: 'absolute',
                  left: 4,
                  top: 8,
                  fontSize: '10px',
                  color: token.colorTextTertiary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <FolderOutlined style={{ fontSize: 9 }} />
                  <span style={{ fontWeight: 500 }}>{record.categoryName}</span>
                </div>
              )}
              <div style={{ 
                fontWeight: 500, 
                fontSize: '11px',
                lineHeight: '1.3',
                color: token.colorText,
                marginTop: record.isFirstInCategory && record.categoryName ? '14px' : 0
              }}>
                {name || 'Неизвестный критерий'}
              </div>
            </div>
          </Tooltip>
        );
      },
    },
    ...callIds.map((callId, callIndex) => {
      const callStats = callTotals[callIndex];
      const deductionsForCall = qualityMap.call_deductions?.filter(d => d.call_id === callId) || [];
      const commentsCount = deductionsForCall.filter(d => d.comment).length;
      const totalDeductions = deductionsForCall.reduce((sum, d) => 
        sum + (typeof d.deduction === 'number' ? d.deduction : 0), 0
      );

      return {
        title: (
          <Popover
            content={
              <div style={{ maxWidth: 280 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    fontSize: '14px',
                    color: token.colorTextHeading,
                    marginBottom: 8
                  }}>
                    Звонок {callIndex + 1}
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    color: token.colorTextSecondary,
                    marginBottom: 4
                  }}>
                    ID: <Text strong style={{ color: token.colorText }}>{callId || 'не указан'}</Text>
                  </div>
                </div>
                
                {callId && callStats && (
                  <div style={{ 
                    padding: '8px 12px',
                    backgroundColor: isDark ? token.colorFillTertiary : token.colorFillQuaternary,
                    borderRadius: 6,
                    marginBottom: 8
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6
                    }}>
                      <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>Оценка:</span>
                      <Text strong style={{ 
                        fontSize: '16px',
                        color: getScoreColor(callStats.score)
                      }}>
                        {callStats.score}%
                      </Text>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 4
                    }}>
                      <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>Снято баллов:</span>
                      <Text style={{ fontSize: '13px', color: token.colorText }}>
                        {totalDeductions}
                      </Text>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>Комментариев:</span>
                      <Text style={{ fontSize: '13px', color: token.colorText }}>
                        {commentsCount}
                      </Text>
                    </div>
                  </div>
                )}

                {!callId && (
                  <div style={{ 
                    fontSize: '12px',
                    color: token.colorTextSecondary,
                    fontStyle: 'italic'
                  }}>
                    ID звонка не указан
                  </div>
                )}
              </div>
            }
            title="Обзор звонка"
            trigger="hover"
            placement="top"
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '2px 4px',
              minHeight: 28,
              backgroundColor: callId 
                ? (isDark ? '#162312' : '#f6ffed')
                : (isDark ? '#3d2816' : '#fff2f0'),
              borderRadius: 4,
              border: `1px solid ${callId 
                ? (isDark ? '#3f6600' : '#b7eb8f')
                : (isDark ? '#8b4513' : '#ffa39e')}`,
              cursor: 'pointer'
            }}
            onClick={() => handleEditCall(callIndex)}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 4, 
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <PhoneOutlined style={{ 
                  fontSize: 10, 
                  color: callId ? (isDark ? '#73d13d' : '#52c41a') : (isDark ? '#ffa940' : '#ff4d4f')
                }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text 
                    strong={!!callId}
                    type={callId ? undefined : "secondary"}
                    style={{ 
                      fontSize: '10px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      color: callId 
                        ? (isDark ? '#73d13d' : '#389e0d')
                        : (isDark ? '#ffa940' : '#cf1322')
                    }}
                  >
                    {callId || `Звонок ${callIndex + 1}`}
                  </Text>
                </div>
              </div>
              <Dropdown 
                menu={{ items: getColumnTitleDropdownItems(callIndex) }} 
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  size="small"
                  icon={<MoreOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ 
                    padding: '2px 4px',
                    minWidth: 'auto',
                    height: 'auto',
                    color: token.colorText
                  }}
                />
              </Dropdown>
            </div>
          </Popover>
        ),
        dataIndex: `call_${callIndex}`,
        key: `call_${callIndex}`,
        width: 80,
        minWidth: 80,
        align: 'center' as const,
        render: (_: unknown, record: QualityCallsTableRow) => {
          const currentCallId = callIds[callIndex];
          
          // Ячейка итогов
          if (record.isTotal) {
            if (!currentCallId) {
              return (
                <div style={{ 
                  padding: '4px 2px',
                  color: token.colorTextTertiary,
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  —
                </div>
              );
            }

            const totalScore = callTotals[callIndex]?.score;
            const totalDeduction = callTotals[callIndex]?.deduction || 0;
            
            return (
              <Popover
                content={
                  <div style={{ maxWidth: 250 }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ fontSize: '14px', color: token.colorText }}>
                        Итоговая оценка
                      </Text>
                    </div>
                    <div style={{ 
                      padding: '8px 12px',
                      backgroundColor: isDark ? token.colorFillTertiary : token.colorFillQuaternary,
                      borderRadius: 6,
                      marginBottom: 8
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6
                      }}>
                        <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>Оценка:</span>
                        <Text strong style={{ 
                          fontSize: '18px',
                          color: getScoreColor(totalScore)
                        }}>
                          {totalScore}%
                        </Text>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '12px', color: token.colorTextSecondary }}>Снято баллов:</span>
                        <Text style={{ fontSize: '13px', color: token.colorError }}>
                          {totalDeduction}
                        </Text>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: token.colorTextSecondary, fontStyle: 'italic' }}>
                      Максимальная оценка: 100%
                    </div>
                  </div>
                }
                title="Детали итоговой оценки"
                trigger="hover"
                placement="top"
              >
                <div style={{ 
                  padding: '4px 2px',
                  backgroundColor: token.colorBgContainer,
                  borderRadius: '4px',
                  border: `1px solid ${getScoreColor(totalScore)}`,
                  margin: '0 1px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    color: getScoreColor(totalScore),
                    textAlign: 'center'
                  }}>
                    {totalScore}%
                  </div>
                </div>
              </Popover>
            );
          }

          // Обычная ячейка критерия
          if (!currentCallId) {
            return (
              <div 
                style={{ 
                  padding: '6px 2px',
                  borderRadius: '3px',
                  border: `1px dashed ${isDark ? '#8b4513' : '#ffa39e'}`,
                  backgroundColor: isDark ? '#3d2816' : '#fff2f0',
                  color: isDark ? '#ffa940' : '#cf1322',
                  fontSize: '10px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleEditCall(callIndex)}
              >
                <EditOutlined style={{ fontSize: 10 }} />
              </div>
            );
          }

          // Ячейка с баллом снятия/0
          const id = record.id as number | undefined;
          if (!id) {
            return (
              <div 
                style={{ 
                  padding: '6px 2px',
                  borderRadius: '3px',
                  border: `1px dashed ${isDark ? '#8b4513' : '#ffa39e'}`,
                  backgroundColor: isDark ? '#3d2816' : '#fff2f0',
                  color: isDark ? '#ffa940' : '#cf1322',
                  fontSize: '10px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleEditCall(callIndex)}
              >
                <EditOutlined style={{ fontSize: 10 }} />
              </div>
            );
          }
          const deductionKey = `${id}_${currentCallId}`;
          const deduction = callDeductionsMap.get(deductionKey);
          const hasDeduction = deduction && typeof deduction.deduction === 'number' && deduction.deduction > 0;
          const deductionValue = hasDeduction ? deduction!.deduction : 0;
          const comment = deduction?.comment || null;
          
          const cellContent = (
            <div 
              style={{ 
                backgroundColor: token.colorBgContainer,
                padding: '6px 2px',
                borderRadius: '3px',
                border: `1px solid ${hasDeduction 
                  ? (isDark ? '#8b4513' : '#ffccc7')
                  : (isDark ? '#30363d' : '#d9d9d9')}`,
                transition: 'all 0.2s',
                margin: '0 1px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
              }}
              onClick={() => id && handleCellClick(id, callIndex, deduction)}
            >
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 'bold',
                color: hasDeduction 
                  ? token.colorError
                  : token.colorTextTertiary
              }}>
                {hasDeduction ? `-${deductionValue}` : '0'}
              </div>
              {/* Индикатор наличия комментария */}
              {comment && (
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: token.colorPrimary,
                    border: `1px solid ${token.colorBgContainer}`,
                    boxShadow: `0 0 0 1px ${token.colorBgContainer}`
                  }}
                />
              )}
            </div>
          );

          // Если есть комментарий, оборачиваем в Popover
          if (comment) {
            return (
              <Popover
                content={
                  <div style={{ maxWidth: 300 }}>
                    <div style={{ 
                      color: token.colorText,
                      fontSize: '13px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {comment}
                    </div>
                  </div>
                }
                title="Комментарий"
                trigger="hover"
                placement="top"
              >
                {cellContent}
              </Popover>
            );
          }

          return cellContent;
        },
      };
    }),
  ];

  // Добавляем строку с итогами и группируем по категориям
  const dataSourceWithTotals = useMemo(() => {
    const rows: QualityCallsTableRow[] = [];

    // Сортируем категории: сначала с категориями (по имени), потом без категории
    const sortedCategories = Array.from(groupedCriteria.entries()).sort((a, b) => {
      if (a[0] === 'no_category') return 1;
      if (b[0] === 'no_category') return -1;
      const categoryA = filteredCriteria.find(c => c.category?.id?.toString() === a[0])?.category;
      const categoryB = filteredCriteria.find(c => c.category?.id?.toString() === b[0])?.category;
      return (categoryA?.name || '').localeCompare(categoryB?.name || '');
    });

    sortedCategories.forEach(([, criteria], categoryIndex) => {
      const firstCriterion = criteria[0];
      const categoryName = firstCriterion.category?.name || 'Без категории';

      // Добавляем критерии этой категории с информацией о категории
      criteria.forEach((criterion: QualityCriterion, criterionIndex) => {
        const isFirstInCategory = criterionIndex === 0;
        const isLastInCategory = criterionIndex === criteria.length - 1;
        const isLastCategory = categoryIndex === sortedCategories.length - 1;
        
        rows.push({
          key: `criteria_${criterion.id}`,
          id: criterion.id,
          name: criterion.name || 'Неизвестный критерий',
          description: criterion.description ?? undefined,
          isTotal: false,
          categoryId: criterion.category_id ?? null,
          categoryName: categoryName,
          isFirstInCategory,
          isLastInCategory,
          isLastCategory,
          ...Object.fromEntries(
            callIds.map((_, index) => [`call_${index}`, null])
          ),
        });
      });
    });

    // Добавляем строку итогов
    const totalRow = {
      key: 'total_row',
      name: 'ИТОГ',
      isTotal: true,
      ...Object.fromEntries(
        callIds.map((_, index) => [`call_${index}`, null])
      ),
    };

    return [...rows, totalRow];
  }, [groupedCriteria, filteredCriteria, callIds]);

  const handleCellClick = (criteriaId: number, callIndex: number, existingDeduction?: QualityCallDeduction) => {
    const currentCallId = callIds[callIndex];
    if (!currentCallId) {
      message.warning('Сначала укажите ID звонка в заголовке столбца');
      return;
    }

    setSelectedCell({ criteriaId, callIndex, existingDeduction });
    
    if (existingDeduction && typeof existingDeduction.deduction === 'number') {
      deductionForm.setFieldsValue({
        deduction: existingDeduction.deduction,
        comment: existingDeduction.comment || '',
      });
    } else {
      deductionForm.setFieldsValue({
        deduction: 0,
        comment: '',
      });
    }
    
    setDeductionModalVisible(true);
  };

  const handleAddDeduction = async (values: DeductionFormValues) => {
    if (!selectedCell || !qualityMap?.id) return;

    const currentCallId = callIds[selectedCell.callIndex];
    if (!currentCallId) {
      message.error('Сначала укажите ID звонка в заголовке столбца');
      return;
    }

    try {
      await createCallDeduction({
        quality_map_id: qualityMap.id,
        criteria_id: selectedCell.criteriaId,
        call_id: currentCallId,
        deduction: values.deduction || 0,
        comment: values.comment || '',
      }).unwrap();

      message.success(values.deduction > 0 ? 'Снятие добавлено' : 'Снятие обновлено');
      setDeductionModalVisible(false);
      setSelectedCell(null);
      deductionForm.resetFields();
    } catch (error) {
      console.error('Error adding call deduction:', error);
      message.error('Ошибка при добавлении снятия');
    }
  };

  const getSelectedCallName = () => {
    if (!selectedCell) return '';
    return callIds[selectedCell.callIndex] || `Звонок ${selectedCell.callIndex + 1}`;
  };

  const getSelectedCriterionName = () => {
    if (!selectedCell) return '';
    const criterion = allCriteria.find(c => c.id === selectedCell.criteriaId);
    return criterion?.name || 'Неизвестный критерий';
  };

  if (!qualityMap || !qualityMap.calls_count || qualityMap.calls_count === 0) {
    return null;
  }

  return (
    <div style={{ padding: 0, marginTop: 24 }}>
      {/* Компактная сводная информация */}
      <Card 
        size="small"
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: '12px 16px' }}
      >
        <Row gutter={[16, 0]} align="middle" justify="space-between">
          <Col>
            <Space size="middle" wrap>
              <Space size="small">
                <PhoneOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  Звонки
                </Text>
              </Space>
            </Space>
          </Col>
          
          <Col>
            <Space size="small" split={<Divider type="vertical" style={{ height: 16, margin: 0 }} />}>
              <Space size={4}>
                <BarChartOutlined style={{ color: getScoreColor(qualityStats.averageScore), fontSize: 14 }} />
                <Text strong style={{ fontSize: '14px', color: getScoreColor(qualityStats.averageScore) }}>
                  {qualityStats.averageScore}%
                </Text>
              </Space>
              
              <Space size={4}>
                <PhoneOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {qualityStats.filledCalls}/{callIds.length}
                </Text>
              </Space>
              
              <Space size={4}>
                <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {qualityStats.totalDeducted}
                </Text>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Таблица */}
      <Card
        style={{ marginBottom: 0 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={dataSourceWithTotals}
          scroll={{ x: 'max-content', y: 500 }}
          pagination={false}
          size="middle"
          loading={!qualityMap}
          bordered
          locale={{
            emptyText: filteredCriteria.length === 0 ? 'Нет критериев качества' : 'Нет данных для отображения'
          }}
        />
      </Card>

      {/* Модальное окно снятия */}
      <DeductionModal
        open={deductionModalVisible}
        onCancel={() => {
          setDeductionModalVisible(false);
          setSelectedCell(null);
          deductionForm.resetFields();
        }}
        onSubmit={handleAddDeduction}
        form={deductionForm}
        loading={isCreatingDeduction}
        selectedCell={selectedCell}
        getSelectedChatName={getSelectedCallName}
        getSelectedCriterionName={getSelectedCriterionName}
      />

      {/* Модальное окно редактирования звонка */}
      <EditCallModal
        open={editCallModalVisible}
        onCancel={() => {
          setEditCallModalVisible(false);
          setEditingCallIndex(null);
          editCallForm.resetFields();
        }}
        onSubmit={handleSaveCallName}
        form={editCallForm}
        loading={isUpdatingCalls}
        editingCallIndex={editingCallIndex}
      />
    </div>
  );
};

export default QualityCallsTable;

