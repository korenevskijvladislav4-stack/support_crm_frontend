// components/QualityCallsTableView.tsx
import React, { useMemo } from 'react';
import { 
  Table, 
  Card, 
  Tooltip, 
  Popover,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  theme
} from 'antd';
import { 
  PhoneOutlined,
  TrophyOutlined,
  BarChartOutlined,
  CloseCircleOutlined,
  FolderOutlined
} from '@ant-design/icons';
import type { QualityMap, QualityCriterion, QualityCallDeduction } from '../types/quality.types';
import { useGetCriteriaQuery } from '../api/qualityApi';

const { Text } = Typography;

interface QualityCallsTableViewProps {
  qualityMap: QualityMap;
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

const QualityCallsTableView: React.FC<QualityCallsTableViewProps> = ({ qualityMap }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  
  const { data: allCriteria = [] } = useGetCriteriaQuery(
    { team_id: qualityMap.team_id },
    { skip: !qualityMap?.team_id }
  );

  // Инициализируем звонки если их нет
  const callIds = useMemo(() => qualityMap?.call_ids || Array(qualityMap?.calls_count || 0).fill(''), [qualityMap?.call_ids, qualityMap?.calls_count]);

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

  const filteredCriteria = allCriteria;

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

  // Получение цвета для оценки
  const getScoreColor = (score: number | undefined) => {
    if (score === undefined) return token.colorTextTertiary;
    if (score >= 90) return token.colorSuccess;
    if (score >= 80) return '#73d13d';
    if (score >= 70) return token.colorWarning;
    if (score >= 50) return '#ff9800';
    return token.colorError;
  };

  // Расчет итогов по звонкам
  const callTotals = useMemo(() => {
    const totals: { [key: number]: { score: number; deduction: number } } = {};
    
    callIds.forEach((callId, callIndex) => {
      if (!callId) {
        totals[callIndex] = { score: 0, deduction: 0 };
        return;
      }
      
      let totalDeduction = 0;
      filteredCriteria.forEach(criterion => {
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
  }, [callDeductionsMap, filteredCriteria, callIds]);

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

  const columns = [
    {
      title: 'Критерий качества',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 200,
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
                        color: getScoreColor(callStats?.score)
                      }}>
                        {callStats?.score || 100}%
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
                        {callStats?.deduction || 0}
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
            }}>
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
                    ellipsis 
                    style={{ 
                      fontSize: '10px',
                      fontWeight: 500,
                      color: callId 
                        ? (isDark ? '#73d13d' : '#389e0d')
                        : (isDark ? '#ffa940' : '#cf1322')
                    }}
                  >
                    {callId || `Звонок ${callIndex + 1}`}
                  </Text>
                </div>
              </div>
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

          if (!currentCallId) {
            return (
              <div style={{ 
                padding: '6px 2px',
                color: token.colorTextTertiary,
                fontSize: '10px'
              }}>
                —
              </div>
            );
          }

          const id = record.id as number | undefined;
          if (!id) {
            return (
              <div style={{ 
                padding: '6px 2px',
                color: token.colorTextTertiary,
                fontSize: '10px'
              }}>
                —
              </div>
            );
          }

          const deduction = qualityMap.call_deductions?.find(d => 
            d.criteria_id === id && d.call_id === currentCallId
          );
          
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
              }}
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

  if (!qualityMap || !qualityMap.calls_count || qualityMap.calls_count === 0) {
    return null;
  }

  return (
    <div style={{ padding: 0, marginTop: 24 }}>
      {/* Компактная сводная информация */}
      <Card 
        size="small"
        style={{ marginBottom: 16, backgroundColor: token.colorBgContainer }}
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
            <Space size="small" split={<Divider type="vertical" style={{ height: 16, margin: 0, borderColor: token.colorBorderSecondary }} />}>
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
                <CloseCircleOutlined style={{ color: token.colorError, fontSize: 14 }} />
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
        style={{ marginBottom: 0, backgroundColor: token.colorBgContainer }}
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
          style={{ backgroundColor: token.colorBgContainer }}
          locale={{
            emptyText: filteredCriteria.length === 0 ? 'Нет критериев качества' : 'Нет данных для отображения'
          }}
        />
      </Card>
    </div>
  );
};

export default QualityCallsTableView;

