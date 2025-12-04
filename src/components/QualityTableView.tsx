// components/QualityTableView.tsx
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
  MessageOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  BarChartOutlined,
  CloseCircleOutlined,
  FolderOutlined
} from '@ant-design/icons';
import type { QualityMap, QualityCriterion, QualityDeduction } from '../types/quality.types';
import { formatDate } from '../utils/dateUtils';
import { useGetCriteriaQuery } from '../api/qualityApi';

const { Text } = Typography;

interface QualityTableViewProps {
  qualityMap: QualityMap;
}

interface QualityTableRow {
  key: string;
  id?: number;
  name: string;
  description?: string;
  isTotal?: boolean;
  isCategory?: boolean;
  categoryId?: number | null;
  categoryName?: string;
  isFirstInCategory?: boolean;
  isLastInCategory?: boolean;
  isLastCategory?: boolean;
  [key: string]: unknown;
}

const QualityTableView: React.FC<QualityTableViewProps> = ({ qualityMap }) => {
  const { token } = theme.useToken();
  const isDark = token.colorBgBase === '#0d1117';
  
  const { data: allCriteria = [] } = useGetCriteriaQuery(
    { team_id: qualityMap.team_id },
    { skip: !qualityMap?.team_id }
  );

  // Инициализируем 15 чатов если их нет
  const chatIds = useMemo(() => qualityMap?.chat_ids || Array(15).fill(''), [qualityMap?.chat_ids]);

  // Группируем снятия по критериям и чатам для быстрого доступа
  const deductionsMap = useMemo(() => {
    const map = new Map<string, QualityDeduction>();
    
    qualityMap?.deductions?.forEach(deduction => {
      if (deduction?.criteria_id && deduction?.chat_id) {
        const key = `${deduction.criteria_id}_${deduction.chat_id}`;
        map.set(key, deduction);
      }
    });
    
    return map;
  }, [qualityMap?.deductions]);

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

  // Расчет итогов по чатам (как в QualityTable)
  const chatTotals = useMemo(() => {
    const totals: { [key: number]: { score: number; deduction: number } } = {};
    
    chatIds.forEach((chatId, chatIndex) => {
      if (!chatId) {
        totals[chatIndex] = { score: 0, deduction: 0 };
        return;
      }
      
      let totalDeduction = 0;
      filteredCriteria.forEach(criterion => {
        const deductionKey = `${criterion.id}_${chatId}`;
        const deduction = deductionsMap.get(deductionKey);
        if (deduction && typeof deduction.deduction === 'number') {
          totalDeduction += deduction.deduction;
        }
      });
      // Итоговый балл = 100 - сумма снятий (если снято 100 баллов = 0%)
      const finalScore = Math.max(0, 100 - totalDeduction);
      
      totals[chatIndex] = {
        score: finalScore,
        deduction: totalDeduction
      };
    });
    
    return totals;
  }, [deductionsMap, filteredCriteria, chatIds]);

  // Общая статистика (как в QualityTable)
  const qualityStats = useMemo(() => {
    const filledChats = chatIds.filter(id => id).length;
    
    if (filledChats === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        totalDeducted: 0,
        filledChats: 0
      };
    }

    let totalScore = 0;
    let totalDeducted = 0;

    Object.values(chatTotals).forEach(chat => {
      totalScore += chat.score;
      totalDeducted += chat.deduction;
    });

    const averageScore = Math.round(totalScore / filledChats);

    return {
      totalScore,
      averageScore,
      totalDeducted,
      filledChats
    };
  }, [chatTotals, chatIds]);

  const columns = [
    {
      title: 'Критерий качества',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 200,
      render: (name: string, record: QualityTableRow) => {
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
    ...chatIds.map((chatId, chatIndex) => {
      const chatStats = chatTotals[chatIndex];
      const deductionsForChat = qualityMap.deductions?.filter(d => d.chat_id === chatId) || [];
      const commentsCount = deductionsForChat.filter(d => d.comment).length;

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
                    Чат {chatIndex + 1}
                  </div>
                  <div style={{ 
                    fontSize: '12px',
                    color: token.colorTextSecondary,
                    marginBottom: 4
                  }}>
                    ID: <Text strong style={{ color: token.colorText }}>{chatId || 'не указан'}</Text>
                  </div>
                </div>
                
                {chatId && chatStats && (
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
                        color: getScoreColor(chatStats?.score)
                      }}>
                        {chatStats?.score || 100}%
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
                        {chatStats?.deduction || 0}
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

                {!chatId && (
                  <div style={{ 
                    fontSize: '12px',
                    color: token.colorTextSecondary,
                    fontStyle: 'italic'
                  }}>
                    ID чата не указан
                  </div>
                )}
              </div>
            }
            title="Обзор чата"
            trigger="hover"
            placement="top"
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '2px 4px',
              minHeight: 28,
              backgroundColor: chatId 
                ? (isDark ? '#162312' : '#f6ffed')
                : (isDark ? '#3d2816' : '#fff2f0'),
              borderRadius: 4,
              border: `1px solid ${chatId 
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
                <MessageOutlined style={{ 
                  fontSize: 10, 
                  color: chatId ? (isDark ? '#73d13d' : '#52c41a') : (isDark ? '#ffa940' : '#ff4d4f')
                }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text 
                    ellipsis 
                    style={{ 
                      fontSize: '10px',
                      fontWeight: 500,
                      color: chatId 
                        ? (isDark ? '#73d13d' : '#389e0d')
                        : (isDark ? '#ffa940' : '#cf1322')
                    }}
                  >
                    {chatId || `Чат ${chatIndex + 1}`}
                  </Text>
                </div>
              </div>
            </div>
          </Popover>
        ),
        dataIndex: `chat_${chatIndex}`,
        key: `chat_${chatIndex}`,
        width: 80,
        minWidth: 80,
        align: 'center' as const,
        render: (_: unknown, record: QualityTableRow) => {
        const currentChatId = chatIds[chatIndex];
        
        // Ячейка итогов
        if (record.isTotal) {
          if (!currentChatId) {
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

          const totalScore = chatTotals[chatIndex]?.score;
          const totalDeduction = chatTotals[chatIndex]?.deduction || 0;
          
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

        if (!currentChatId) {
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

        const deduction = qualityMap.deductions?.find(d => 
          d.criteria_id === id && d.chat_id === currentChatId
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

        // Если нет комментария, просто возвращаем ячейку
        return cellContent;
      },
      };
    }),
  ];

  const dataSourceWithTotals = useMemo(() => {
    const rows: QualityTableRow[] = [];

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
            chatIds.map((_, index) => [`chat_${index}`, null])
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
        chatIds.map((_, index) => [`chat_${index}`, null])
      ),
    };

    return [...rows, totalRow];
  }, [groupedCriteria, filteredCriteria, chatIds]);

  if (!qualityMap) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: 'center', 
        color: token.colorTextTertiary,
        fontSize: '14px'
      }}>
        Карта качества не найдена
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
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
                <TeamOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {qualityMap.team?.name || 'Неизвестная команда'}
                </Text>
              </Space>
              
              <Divider type="vertical" style={{ height: 16, margin: 0, borderColor: token.colorBorderSecondary }} />
              
              <Space size="small">
                <CalendarOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {formatDate(qualityMap.start_date)} - {formatDate(qualityMap.end_date)}
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
                <MessageOutlined style={{ color: token.colorTextTertiary, fontSize: 14 }} />
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  {qualityStats.filledChats}/15
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

export default QualityTableView;
